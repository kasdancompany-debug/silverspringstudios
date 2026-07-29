"use client";

import { useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import {
  SCORECARD_CRITERIA,
  COMMERCIAL_OUTLOOK,
  STRATEGIC_FIT,
  RIGHTS_READINESS_LEVELS,
  TECHNICAL_READINESS_LEVELS,
  type CommercialOutlook,
  type StrategicFit,
  type RightsReadinessLevel,
  type TechnicalReadiness,
} from "@/lib/constants";
import type { Scorecard } from "@/types/database";
import { saveScorecard } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";

const DEFAULT_SCORECARD: Scorecard = {
  concept_hook: 0,
  execution: 0,
  technical_quality: 0,
  audience_clarity: 0,
  key_art_potential: 0,
  trailer_potential: 0,
  cast_subject_value: 0,
  rights_readiness: 0,
  filmmaker_collaboration: 0,
  commercial_fit: 0,
};

function numberOrEmpty(value: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

export function ScorecardForm({
  submissionId,
  initialScorecard,
  initialRecommendation,
  initialRevenueLow,
  initialRevenueBase,
  initialRevenueHigh,
  initialInvestmentCap,
  initialKeyConcerns,
  initialFollowUp,
  initialDecision,
  initialCommercialOutlook,
  initialStrategicFit,
  initialRightsReadiness,
  initialTechnicalReadiness,
}: {
  submissionId: string;
  initialScorecard: Scorecard | null;
  initialRecommendation: string | null;
  initialRevenueLow: number | null;
  initialRevenueBase: number | null;
  initialRevenueHigh: number | null;
  initialInvestmentCap: number | null;
  initialKeyConcerns: string | null;
  initialFollowUp: string | null;
  initialDecision: string | null;
  initialCommercialOutlook?: string | null;
  initialStrategicFit?: string | null;
  initialRightsReadiness?: string | null;
  initialTechnicalReadiness?: string | null;
}) {
  const [scores, setScores] = useState<Scorecard>(initialScorecard ?? DEFAULT_SCORECARD);
  const [recommendation, setRecommendation] = useState(initialRecommendation ?? "");
  const [revenueLow, setRevenueLow] = useState(numberOrEmpty(initialRevenueLow));
  const [revenueBase, setRevenueBase] = useState(numberOrEmpty(initialRevenueBase));
  const [revenueHigh, setRevenueHigh] = useState(numberOrEmpty(initialRevenueHigh));
  const [investmentCap, setInvestmentCap] = useState(numberOrEmpty(initialInvestmentCap));
  const [keyConcerns, setKeyConcerns] = useState(initialKeyConcerns ?? "");
  const [followUp, setFollowUp] = useState(initialFollowUp ?? "");
  const [decision, setDecision] = useState(initialDecision ?? "");
  const [commercialOutlook, setCommercialOutlook] = useState<CommercialOutlook | "">(
    (initialCommercialOutlook as CommercialOutlook) ?? "",
  );
  const [strategicFit, setStrategicFit] = useState<StrategicFit | "">(
    (initialStrategicFit as StrategicFit) ?? "",
  );
  const [rightsReadiness, setRightsReadiness] = useState<RightsReadinessLevel | "">(
    (initialRightsReadiness as RightsReadinessLevel) ?? "",
  );
  const [technicalReadiness, setTechnicalReadiness] = useState<TechnicalReadiness | "">(
    (initialTechnicalReadiness as TechnicalReadiness) ?? "",
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);

  function updateScore(key: keyof Scorecard, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await saveScorecard(submissionId, {
        scorecard: scores,
        recommendation: recommendation.trim() || null,
        estimated_revenue_low: revenueLow ? Number(revenueLow) : null,
        estimated_revenue_base: revenueBase ? Number(revenueBase) : null,
        estimated_revenue_high: revenueHigh ? Number(revenueHigh) : null,
        proposed_investment_cap: investmentCap ? Number(investmentCap) : null,
        key_concerns: keyConcerns.trim() || null,
        required_follow_up: followUp.trim() || null,
        acquisition_decision: decision.trim() || null,
        commercial_outlook: commercialOutlook || null,
        strategic_fit: strategicFit || null,
        rights_readiness_level: rightsReadiness || null,
        technical_readiness: technicalReadiness || null,
      });

      setFeedback(
        result.success
          ? { type: "success", message: "Evaluation saved." }
          : { type: "error", message: result.message ?? "Unable to save evaluation." },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-start gap-3 border border-warm-metal/40 bg-warm-metal/5 p-4">
        <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warm-metal" />
        <p className="text-sm leading-relaxed text-warm-metal">
          Score informs judgment — it is never an automatic acquisition decision.
        </p>
      </div>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs tracking-[0.1em] text-slate uppercase">10 criteria, scored 0–10 each</p>
          <p className="font-display text-3xl text-warm-metal">
            {total}
            <span className="text-sm text-slate">/100</span>
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SCORECARD_CRITERIA.map((criterion) => {
            const key = criterion.key as keyof Scorecard;
            return (
              <div key={criterion.key} className="border border-line-strong bg-ink p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label htmlFor={criterion.key} className="text-xs tracking-[0.06em] text-slate uppercase">
                    {criterion.label}
                  </label>
                  <span className="font-display text-lg text-ivory">{scores[key]}/10</span>
                </div>
                <input
                  id={criterion.key}
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={scores[key]}
                  onChange={(event) => updateScore(key, Number(event.target.value))}
                  className="w-full accent-[var(--warm-metal)]"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-5 border-t border-line pt-6">
        <h3 className="font-display text-lg text-ivory">Triage Outlook</h3>
        <p className="text-sm text-slate">
          Categorical read on the title, separate from the numeric scorecard above — used for filtering
          and reporting, not for scoring.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Commercial Outlook"
            placeholder="Not assessed"
            value={commercialOutlook}
            onChange={(event) => setCommercialOutlook(event.target.value as CommercialOutlook)}
            options={COMMERCIAL_OUTLOOK.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Select
            label="Strategic Fit"
            placeholder="Not assessed"
            value={strategicFit}
            onChange={(event) => setStrategicFit(event.target.value as StrategicFit)}
            options={STRATEGIC_FIT.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Select
            label="Rights Readiness"
            placeholder="Not assessed"
            value={rightsReadiness}
            onChange={(event) => setRightsReadiness(event.target.value as RightsReadinessLevel)}
            options={RIGHTS_READINESS_LEVELS.map((option) => ({ value: option.value, label: option.label }))}
          />
          <Select
            label="Technical Readiness"
            placeholder="Not assessed"
            value={technicalReadiness}
            onChange={(event) => setTechnicalReadiness(event.target.value as TechnicalReadiness)}
            options={TECHNICAL_READINESS_LEVELS.map((option) => ({ value: option.value, label: option.label }))}
          />
        </div>
      </div>

      <div className="space-y-5 border-t border-line pt-6">
        <h3 className="font-display text-lg text-ivory">Internal Recommendation</h3>
        <Textarea
          label="Recommendation"
          rows={3}
          value={recommendation}
          onChange={(event) => setRecommendation(event.target.value)}
          hint="Your overall read on the title — why pursue, pass, or wait."
        />

        <div className="border border-warm-metal/30 bg-warm-metal/5 p-4">
          <p className="mb-3 text-xs tracking-[0.1em] text-warm-metal uppercase">
            Internal estimates — not promises made to the filmmaker
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Revenue — Low"
              type="number"
              min={0}
              value={revenueLow}
              onChange={(event) => setRevenueLow(event.target.value)}
            />
            <Input
              label="Revenue — Base"
              type="number"
              min={0}
              value={revenueBase}
              onChange={(event) => setRevenueBase(event.target.value)}
            />
            <Input
              label="Revenue — High"
              type="number"
              min={0}
              value={revenueHigh}
              onChange={(event) => setRevenueHigh(event.target.value)}
            />
          </div>
          {revenueBase ? (
            <p className="mt-3 text-xs text-slate">
              Base case: {formatCurrency(Number(revenueBase) || 0)} — internal planning figure only.
            </p>
          ) : null}
        </div>

        <Input
          label="Proposed Release-Investment Cap"
          type="number"
          min={0}
          value={investmentCap}
          onChange={(event) => setInvestmentCap(event.target.value)}
          hint="Maximum studio spend recommended for packaging and release."
        />

        <Textarea
          label="Key Concerns"
          rows={3}
          value={keyConcerns}
          onChange={(event) => setKeyConcerns(event.target.value)}
        />
        <Textarea
          label="Required Follow-up"
          rows={3}
          value={followUp}
          onChange={(event) => setFollowUp(event.target.value)}
        />
        <Textarea
          label="Acquisition Decision"
          rows={3}
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
        />
      </div>

      {feedback ? (
        <p
          className={feedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"}
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Scorecard & Evaluation"}
      </Button>
    </form>
  );
}
