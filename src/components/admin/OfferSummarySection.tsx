"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { saveOfferSummary } from "@/lib/actions/admin";
import { buildOfferSummaryDraft } from "@/lib/admin/offer-summary";
import type { ReleaseEconomics } from "@/types/database";

export function OfferSummarySection({
  submissionId,
  filmTitle,
  referenceNumber,
  initialDraft,
  recommendation,
  revenueLow,
  revenueBase,
  revenueHigh,
  investmentCap,
  economics,
}: {
  submissionId: string;
  filmTitle: string;
  referenceNumber: string;
  initialDraft: string | null;
  recommendation: string | null;
  revenueLow: number | null;
  revenueBase: number | null;
  revenueHigh: number | null;
  investmentCap: number | null;
  economics: ReleaseEconomics | null;
}) {
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const dirtyRef = useRef(false);

  // Picks up drafts generated elsewhere (e.g. the sidebar's "Generate
  // offer-summary draft" shortcut) once the page revalidates, as long as
  // this editor has not been hand-edited locally yet.
  useEffect(() => {
    if (!dirtyRef.current && initialDraft !== null && initialDraft !== draft) {
      setDraft(initialDraft ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDraft]);

  function handleGenerate() {
    dirtyRef.current = true;
    setDraft(
      buildOfferSummaryDraft({
        filmTitle,
        referenceNumber,
        recommendation,
        revenueLow,
        revenueBase,
        revenueHigh,
        investmentCap,
        economics,
      }),
    );
    setFeedback(null);
  }

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveOfferSummary(submissionId, draft);
      setFeedback(
        result.success
          ? { type: "success", message: "Offer summary draft saved." }
          : { type: "error", message: result.message ?? "Unable to save the draft." },
      );
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 border border-warm-metal/40 bg-warm-metal/5 p-4">
        <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warm-metal" />
        <p className="text-sm leading-relaxed text-warm-metal">
          Internal draft only — never an offer or promise made to the filmmaker until a signed agreement
          exists.
        </p>
      </div>

      <Textarea
        label="Offer summary draft"
        rows={10}
        value={draft}
        onChange={(event) => {
          dirtyRef.current = true;
          setDraft(event.target.value);
        }}
        placeholder="Generate a starting point from the evaluation and economics above, or write your own."
      />

      {feedback ? (
        <p className={feedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"} role="status">
          {feedback.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" size="sm" onClick={handleGenerate}>
          Generate from Evaluation
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving…" : "Save Draft"}
        </Button>
      </div>
    </div>
  );
}
