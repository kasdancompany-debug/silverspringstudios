"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DocFrame } from "@/components/home/motifs";
import { SUBMISSION_SUMMARY_STORAGE_PREFIX, safeStringify } from "./form-utils";

/**
 * The minimal, public-safe summary of a submission — the same shape
 * returned by POST /api/submissions on success and by
 * GET /api/submissions/receipt. Never add internal fields (scorecard,
 * screener credentials, notes, etc.) to this type.
 */
export interface SubmissionSummary {
  referenceNumber: string;
  submittedAt: string | null;
  filmTitle: string;
  filmmakerEmail: string;
  status: string;
}

/** Shape written to sessionStorage by SubmissionForm's storePrintSafeSummary
 * right after a successful submit — a richer, print-safe snapshot of the
 * whole form (minus screener_password), keyed by reference number. Used
 * here purely as an offline-friendly fallback when the receipt API is
 * unavailable (e.g. demo mode without Supabase configured). */
interface StoredAggregateSummary {
  referenceNumber: string;
  submittedAt?: string;
  status?: string;
  filmmaker?: { email?: string };
  film?: { title?: string };
}

const PUBLIC_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted — awaiting review",
  initial_review: "In initial review",
  screener_review: "Screener under review",
  needs_information: "Additional information requested",
  meeting_requested: "Meeting requested",
  declined: "Not moving forward at this time",
  offer_considered: "Offer under consideration",
  agreement_sent: "Agreement sent",
  signed: "Signed",
  onboarding: "Onboarding",
  released: "Released",
  archived: "Archived",
};

function publicStatusLabel(status: string): string {
  return PUBLIC_STATUS_LABELS[status] ?? "Received";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMMM d, yyyy 'at' h:mm a");
  } catch {
    return "—";
  }
}

function readStoredSummary(reference: string | null): SubmissionSummary | null {
  if (typeof window === "undefined" || !reference) return null;
  try {
    const raw = window.sessionStorage.getItem(`${SUBMISSION_SUMMARY_STORAGE_PREFIX}${reference}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAggregateSummary;
    if (!parsed.film?.title || !parsed.filmmaker?.email) return null;

    return {
      referenceNumber: parsed.referenceNumber ?? reference,
      submittedAt: parsed.submittedAt ?? null,
      filmTitle: parsed.film.title,
      filmmakerEmail: parsed.filmmaker.email,
      status: parsed.status ?? "submitted",
    };
  } catch {
    return null;
  }
}

/** Refreshes the stored summary with authoritative data from the receipt
 * API, so a later reload/print still works even if the API becomes
 * unreachable (rate limited, offline, etc). */
function writeStoredSummary(summary: SubmissionSummary): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      `${SUBMISSION_SUMMARY_STORAGE_PREFIX}${summary.referenceNumber}`,
      safeStringify({
        referenceNumber: summary.referenceNumber,
        submittedAt: summary.submittedAt,
        status: summary.status,
        filmmaker: { email: summary.filmmakerEmail },
        film: { title: summary.filmTitle },
      }),
    );
  } catch {
    // Ignore private-mode/quota errors — this is a convenience layer only.
  }
}

/**
 * Fetches the receipt for `reference` from the public receipt API and
 * renders it, falling back to the same-session snapshot written right
 * after submit (see SubmissionForm's storePrintSafeSummary) whenever the
 * API is slow, unreachable, or unavailable (e.g. demo mode without
 * Supabase configured). Also renders a print-only, chrome-free summary for
 * the "Print submission summary" button.
 */
export function SubmissionReceipt({ reference }: { reference: string | null }) {
  const [summary, setSummary] = useState<SubmissionSummary | null>(() => readStoredSummary(reference));
  const [isLoading, setIsLoading] = useState(Boolean(reference));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `/api/submissions/receipt?reference=${encodeURIComponent(reference as string)}`,
          { signal: controller.signal },
        );
        window.clearTimeout(timeout);
        const json = await response.json().catch(() => null);

        if (cancelled) return;

        if (response.ok && json?.success && json.data) {
          const next: SubmissionSummary = {
            referenceNumber: json.data.referenceNumber,
            submittedAt: json.data.submittedAt,
            filmTitle: json.data.filmTitle,
            filmmakerEmail: json.data.filmmakerEmail,
            status: json.data.status,
          };
          setSummary(next);
          writeStoredSummary(next);
        } else {
          setError((prev) => prev ?? json?.error ?? "We couldn't load your submission summary.");
        }
      } catch {
        if (!cancelled) {
          setError((prev) => prev ?? "We couldn't load your submission summary. Please check your connection.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  function handlePrint() {
    window.print();
  }

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center gap-3 border border-line-strong bg-surface px-6 py-10 text-sm text-slate print:hidden">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading your submission summary…
      </div>
    );
  }

  if (!summary) {
    // Even without a full receipt (demo mode / missing session snapshot),
    // always surface the reference the filmmaker was given.
    if (reference) {
      return (
        <div className="space-y-6 print:hidden">
          <DocFrame className="bg-surface px-6 py-6 md:px-8 md:py-8">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <ReceiptRow label="Reference number" value={reference} emphasize />
              <ReceiptRow label="Current status" value="Submitted — awaiting review" />
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-slate">
              {error
                ? "We could not load the full summary just now. Please save this reference number for your records."
                : "Please save this reference number for correspondence about your submission."}
            </p>
          </DocFrame>
        </div>
      );
    }

    return (
      <div className="border border-line-strong bg-surface px-6 py-8 text-sm leading-relaxed text-slate print:hidden">
        {error ??
          "We don't have a submission reference to show here. If you just submitted a film, please check the confirmation email for your reference number."}
      </div>
    );
  }

  return (
    <>
      {/* On-screen summary — hidden entirely when printing */}
      <div className="space-y-6 print:hidden">
        <DocFrame className="bg-surface px-6 py-6 md:px-8 md:py-8">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ReceiptRow label="Film title" value={summary.filmTitle} />
            <ReceiptRow label="Reference number" value={summary.referenceNumber} emphasize />
            <ReceiptRow label="Submission date" value={formatDate(summary.submittedAt)} />
            <ReceiptRow label="Current status" value={publicStatusLabel(summary.status)} />
            <ReceiptRow label="Filmmaker email" value={summary.filmmakerEmail} />
          </dl>
        </DocFrame>

        <div className="flex flex-wrap gap-4">
          <Button type="button" variant="secondary" onClick={handlePrint}>
            <Printer size={14} strokeWidth={1.75} aria-hidden="true" />
            Print submission summary
          </Button>
        </div>
      </div>

      {/* Print-only summary — chrome-free, no internal fields */}
      <div className="hidden print:block">
        <div className="border border-black/50 p-8 text-black">
          <p className="text-xs tracking-[0.2em] uppercase">Silver Spring Studios — Submission Receipt</p>
          <h2 className="mt-4 text-2xl">{summary.filmTitle}</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <PrintRow label="Reference number" value={summary.referenceNumber} />
            <PrintRow label="Submission date" value={formatDate(summary.submittedAt)} />
            <PrintRow label="Current status" value={publicStatusLabel(summary.status)} />
            <PrintRow label="Filmmaker email" value={summary.filmmakerEmail} />
          </dl>
          <p className="mt-8 text-xs leading-relaxed">
            This receipt confirms that a submission was received. It is not a distribution agreement,
            an acceptance, or a promise of release.
          </p>
        </div>
      </div>
    </>
  );
}

function ReceiptRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs tracking-[0.1em] uppercase text-slate">{label}</dt>
      <dd
        className={cn(
          "mt-1.5 break-words",
          emphasize ? "font-display text-xl tracking-wide text-ivory" : "text-sm text-ivory",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function PrintRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-4 border-b border-black/15 pb-2">
      <dt className="tracking-[0.1em] uppercase">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
