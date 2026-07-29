"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInCalendarDays } from "date-fns";
import {
  Archive,
  CalendarClock,
  Download,
  FileDown,
  Handshake,
  Loader2,
  Mail,
  Sparkles,
  XCircle,
} from "lucide-react";
import { StatusUpdater, type StatusHistoryItem } from "@/components/admin/StatusUpdater";
import { ReviewerAssign } from "@/components/admin/ReviewerAssign";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { INTERNAL_TAG_OPTIONS, type SubmissionStatus } from "@/lib/constants";
import {
  updateStatus,
  updateTriageFields,
  markPotentialAcquisition,
  archiveSubmission,
  convertSubmissionToFilm,
  saveOfferSummary,
} from "@/lib/actions/admin";
import { buildOfferSummaryDraft } from "@/lib/admin/offer-summary";
import { SELECT_TEMPLATE_EVENT } from "@/components/admin/EmailTemplatePanel";
import type { ReviewerOption } from "@/lib/admin/data";
import type { ReleaseEconomics } from "@/types/database";

export interface SubmissionSidebarFile {
  id: string;
  file_name: string;
  signedUrl: string | null;
}

export interface SubmissionSidebarProps {
  submissionId: string;
  referenceNumber: string;
  filmTitle: string;
  isDemo: boolean;
  currentStatus: SubmissionStatus;
  statusHistory: StatusHistoryItem[];
  currentReviewerId: string | null;
  reviewers: ReviewerOption[];
  internalScore: number | null;
  recommendation: string | null;
  submittedAt: string | null;
  lastContactAt: string | null;
  nextAction: string | null;
  followUpDate: string | null;
  meetingDate: string | null;
  rightsAvailableDate: string | null;
  internalTags: string[];
  revenueLow: number | null;
  revenueBase: number | null;
  revenueHigh: number | null;
  investmentCap: number | null;
  economics: ReleaseEconomics | null;
  files: SubmissionSidebarFile[];
}

function dateInputValue(value: string | null): string {
  if (!value) return "";
  try {
    return value.slice(0, 10);
  } catch {
    return "";
  }
}

function datetimeInputValue(value: string | null): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

function scrollToEmailPanel(templateSlug?: string) {
  if (templateSlug) {
    window.dispatchEvent(new CustomEvent(SELECT_TEMPLATE_EVENT, { detail: { slug: templateSlug } }));
  }
  document.getElementById("email-templates")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function SubmissionSidebar({
  submissionId,
  referenceNumber,
  filmTitle,
  isDemo,
  currentStatus,
  statusHistory,
  currentReviewerId,
  reviewers,
  internalScore,
  recommendation,
  submittedAt,
  lastContactAt,
  nextAction,
  followUpDate,
  meetingDate,
  rightsAvailableDate,
  internalTags,
  revenueLow,
  revenueBase,
  revenueHigh,
  investmentCap,
  economics,
  files,
}: SubmissionSidebarProps) {
  const router = useRouter();

  const [nextActionValue, setNextActionValue] = useState(nextAction ?? "");
  const [followUpDateValue, setFollowUpDateValue] = useState(dateInputValue(followUpDate));
  const [meetingDateValue, setMeetingDateValue] = useState(datetimeInputValue(meetingDate));
  const [lastContactValue, setLastContactValue] = useState(datetimeInputValue(lastContactAt));
  const [tags, setTags] = useState<string[]>(internalTags);

  const [isTriagePending, startTriageTransition] = useTransition();
  const [triageFeedback, setTriageFeedback] = useState<string | null>(null);

  const [isActionPending, startActionTransition] = useTransition();
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const submissionAgeDays = useMemo(() => {
    if (!submittedAt) return null;
    return Math.max(0, differenceInCalendarDays(new Date(), new Date(submittedAt)));
  }, [submittedAt]);

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag]));
  }

  function handleSaveTriage() {
    setTriageFeedback(null);
    startTriageTransition(async () => {
      const result = await updateTriageFields(submissionId, {
        next_action: nextActionValue.trim() || null,
        follow_up_date: followUpDateValue || null,
        meeting_date: meetingDateValue ? new Date(meetingDateValue).toISOString() : null,
        last_contact_at: lastContactValue ? new Date(lastContactValue).toISOString() : null,
        internal_tags: tags,
      });
      setTriageFeedback(result.success ? "Saved." : (result.message ?? "Unable to save."));
    });
  }

  function handleRequestInformation() {
    setActionFeedback(null);
    startActionTransition(async () => {
      const result = await updateStatus({
        submissionId,
        status: "needs_information",
        note: "Requested more information from the submission sidebar.",
      });
      setActionFeedback(
        result.success
          ? { type: "success", message: "Status set to Needs Information." }
          : { type: "error", message: result.message ?? "Unable to update status." },
      );
      if (result.success) scrollToEmailPanel("additional_information_requested");
    });
  }

  function handleRequestMeeting() {
    setActionFeedback(null);
    startActionTransition(async () => {
      const result = await updateStatus({
        submissionId,
        status: "meeting_requested",
        note: "Requested a meeting from the submission sidebar.",
      });
      setActionFeedback(
        result.success
          ? { type: "success", message: "Status set to Meeting Requested." }
          : { type: "error", message: result.message ?? "Unable to update status." },
      );
      if (result.success) scrollToEmailPanel("meeting_requested");
    });
  }

  function handleDecline() {
    const reason = window.prompt("Decline reason (required, stored on the submission record):");
    if (reason === null) return;
    if (!reason.trim()) {
      setActionFeedback({ type: "error", message: "A decline reason is required." });
      return;
    }

    setActionFeedback(null);
    startActionTransition(async () => {
      const result = await updateStatus({
        submissionId,
        status: "declined",
        declineReason: reason.trim(),
        note: "Declined from the submission sidebar.",
      });
      setActionFeedback(
        result.success
          ? { type: "success", message: "Submission declined." }
          : { type: "error", message: result.message ?? "Unable to decline this submission." },
      );
      if (result.success) scrollToEmailPanel("respectful_decline");
    });
  }

  function handleMarkPotential() {
    setActionFeedback(null);
    startActionTransition(async () => {
      const result = await markPotentialAcquisition(submissionId);
      setActionFeedback(
        result.success
          ? { type: "success", message: "Marked as a potential acquisition." }
          : { type: "error", message: result.message ?? "Unable to update status." },
      );
    });
  }

  function handleGenerateOfferSummary() {
    setActionFeedback(null);
    startActionTransition(async () => {
      const draft = buildOfferSummaryDraft({
        filmTitle,
        referenceNumber,
        recommendation,
        revenueLow,
        revenueBase,
        revenueHigh,
        investmentCap,
        economics,
      });
      const result = await saveOfferSummary(submissionId, draft);
      setActionFeedback(
        result.success
          ? { type: "success", message: "Draft generated — see Offer Summary section below." }
          : { type: "error", message: result.message ?? "Unable to generate a draft." },
      );
      if (result.success) {
        document.getElementById("offer-summary")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function handleConvertToFilm() {
    const confirmed = window.confirm("Convert this submission into a film record?");
    if (!confirmed) return;

    setActionFeedback(null);
    startActionTransition(async () => {
      const result = await convertSubmissionToFilm(submissionId);
      if (result.success && result.filmId) {
        setActionFeedback({ type: "success", message: "Film record created. Redirecting…" });
        router.push(`/admin/films/${result.filmId}`);
      } else {
        setActionFeedback({ type: "error", message: result.message ?? "Unable to convert to a film record." });
      }
    });
  }

  function handleArchive() {
    const confirmed = window.confirm("Archive this submission? It can still be found via status filters.");
    if (!confirmed) return;

    setActionFeedback(null);
    startActionTransition(async () => {
      const result = await archiveSubmission(submissionId);
      setActionFeedback(
        result.success
          ? { type: "success", message: "Submission archived." }
          : { type: "error", message: result.message ?? "Unable to archive this submission." },
      );
    });
  }

  return (
    <div className="space-y-8">
      {isDemo ? (
        <div className="border border-warm-metal/50 bg-warm-metal/10 px-4 py-2.5 text-center text-xs tracking-[0.1em] text-warm-metal uppercase">
          Demo Record
        </div>
      ) : null}

      <div className="border border-line-strong bg-surface p-6">
        <StatusUpdater submissionId={submissionId} currentStatus={currentStatus} history={statusHistory} />
      </div>

      <div className="border border-line-strong bg-surface p-6">
        <ReviewerAssign submissionId={submissionId} currentReviewerId={currentReviewerId} reviewers={reviewers} />
      </div>

      <div className="border border-line-strong bg-surface p-6">
        <h3 className="font-display text-lg text-ivory">At a Glance</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate">Score</dt>
            <dd className="font-display text-lg text-warm-metal">
              {internalScore ?? "—"}
              <span className="text-xs text-slate">/100</span>
            </dd>
          </div>
          {recommendation ? (
            <div>
              <dt className="text-xs tracking-[0.08em] text-slate uppercase">Recommendation</dt>
              <dd className="mt-1 line-clamp-3 text-ivory">{recommendation}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate">Submission Age</dt>
            <dd className="text-ivory">
              {submissionAgeDays === null ? "—" : `${submissionAgeDays} day${submissionAgeDays === 1 ? "" : "s"}`}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate">Rights Available</dt>
            <dd className="text-ivory">
              {rightsAvailableDate ? format(new Date(rightsAvailableDate), "MMM d, yyyy") : "—"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4 border border-line-strong bg-surface p-6">
        <h3 className="font-display text-lg text-ivory">Follow-up & Tags</h3>

        <Textarea
          label="Next action"
          rows={2}
          value={nextActionValue}
          onChange={(event) => setNextActionValue(event.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Follow-up date"
            type="date"
            value={followUpDateValue}
            onChange={(event) => setFollowUpDateValue(event.target.value)}
          />
          <Input
            label="Meeting date"
            type="datetime-local"
            value={meetingDateValue}
            onChange={(event) => setMeetingDateValue(event.target.value)}
          />
        </div>

        <Input
          label="Last contact"
          type="datetime-local"
          value={lastContactValue}
          onChange={(event) => setLastContactValue(event.target.value)}
        />

        <div>
          <p className="mb-2 block text-xs tracking-[0.14em] text-slate uppercase">Internal Tags</p>
          <div className="flex flex-wrap gap-2">
            {INTERNAL_TAG_OPTIONS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "border px-2.5 py-1 text-xs tracking-[0.05em] uppercase transition-colors",
                    active
                      ? "border-warm-metal bg-warm-metal/15 text-warm-metal"
                      : "border-line-strong text-slate hover:border-silver hover:text-ivory",
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {triageFeedback ? (
          <p className="text-sm text-slate" role="status">
            {triageFeedback}
          </p>
        ) : null}

        <Button type="button" size="sm" variant="secondary" onClick={handleSaveTriage} disabled={isTriagePending}>
          {isTriagePending ? "Saving…" : "Save Follow-up Details"}
        </Button>
      </div>

      <div className="space-y-3 border border-line-strong bg-surface p-6">
        <h3 className="font-display text-lg text-ivory">Actions</h3>

        {actionFeedback ? (
          <p
            className={actionFeedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"}
            role="status"
          >
            {actionFeedback.message}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRequestInformation}
            disabled={isActionPending}
          >
            <Mail size={13} strokeWidth={1.75} />
            Request Information
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleRequestMeeting} disabled={isActionPending}>
            <CalendarClock size={13} strokeWidth={1.75} />
            Request Meeting
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleMarkPotential} disabled={isActionPending}>
            <Handshake size={13} strokeWidth={1.75} />
            Mark Potential Acquisition
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGenerateOfferSummary}
            disabled={isActionPending}
          >
            <Sparkles size={13} strokeWidth={1.75} />
            Generate Offer-Summary Draft
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleConvertToFilm} disabled={isActionPending}>
            {isActionPending ? <Loader2 size={13} className="animate-spin" /> : <Handshake size={13} strokeWidth={1.75} />}
            Convert to Film Record
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={handleDecline} disabled={isActionPending}>
            <XCircle size={13} strokeWidth={1.75} />
            Decline
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleArchive} disabled={isActionPending}>
            <Archive size={13} strokeWidth={1.75} />
            Archive
          </Button>
        </div>
      </div>

      <div className="space-y-3 border border-line-strong bg-surface p-6">
        <h3 className="font-display text-lg text-ivory">Export & Files</h3>
        <a
          href={`/api/admin/export-html?id=${submissionId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 text-xs tracking-[0.12em] text-ivory uppercase no-underline transition-colors hover:border-silver"
        >
          <FileDown size={13} strokeWidth={1.75} />
          Export PDF-ready HTML
        </a>

        {files.length > 0 ? (
          <div className="pt-2">
            <p className="mb-2 text-xs tracking-[0.08em] text-slate uppercase">Download Attachments</p>
            <ul className="space-y-1.5">
              {files.map((file) => (
                <li key={file.id}>
                  {file.signedUrl ? (
                    <a
                      href={file.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-warm-metal no-underline hover:text-ivory"
                    >
                      <Download size={12} strokeWidth={1.75} />
                      {file.file_name}
                    </a>
                  ) : (
                    <span className="text-sm text-slate/60">{file.file_name} (unavailable)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
