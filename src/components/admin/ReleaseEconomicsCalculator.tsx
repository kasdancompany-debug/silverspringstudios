"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { RELEASE_INVESTMENT } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { computeEconomics, type EconomicsCase } from "@/lib/admin/economics";
import { saveEconomics } from "@/lib/actions/admin";
import type { ReleaseEconomics } from "@/types/database";

function numberOrEmpty(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function CaseCard({ result, accent = false }: { result: EconomicsCase; accent?: boolean }) {
  return (
    <div className={cn("border p-4", accent ? "border-warm-metal/50 bg-warm-metal/5" : "border-line-strong bg-ink")}>
      <p className="mb-3 text-xs tracking-[0.1em] text-slate uppercase">{result.label}</p>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate">Gross</dt>
          <dd className="text-ivory">{formatCurrency(result.grossReceipts)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate">After platform deductions</dt>
          <dd className="text-ivory">{formatCurrency(result.netAfterPlatform)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate">After direct expenses</dt>
          <dd className="text-ivory">{formatCurrency(result.afterExpenses)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
          <dt className="text-slate">Distributable (post-investment)</dt>
          <dd className="font-display text-lg text-warm-metal">{formatCurrency(result.distributable)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate">Filmmaker share</dt>
          <dd className="text-ivory">{formatCurrency(result.filmmakerShare)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate">Studio share</dt>
          <dd className="text-ivory">{formatCurrency(result.studioShare)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ReleaseEconomicsCalculator({
  submissionId,
  initialEconomics,
}: {
  submissionId: string;
  initialEconomics: ReleaseEconomics | null;
}) {
  const [expectedGross, setExpectedGross] = useState(numberOrEmpty(initialEconomics?.expected_gross ?? null));
  const [platformDeductions, setPlatformDeductions] = useState(
    numberOrEmpty(initialEconomics?.platform_deductions ?? null),
  );
  const [directExpenses, setDirectExpenses] = useState(numberOrEmpty(initialEconomics?.direct_expenses ?? null));
  const [releaseInvestment, setReleaseInvestment] = useState(
    numberOrEmpty(initialEconomics?.release_investment ?? RELEASE_INVESTMENT.total),
  );
  const [filmmakerPercent, setFilmmakerPercent] = useState(
    numberOrEmpty(initialEconomics?.filmmaker_percent ?? RELEASE_INVESTMENT.filmmakerSharePercent),
  );
  const [studioPercent, setStudioPercent] = useState(
    numberOrEmpty(initialEconomics?.studio_percent ?? RELEASE_INVESTMENT.studioSharePercent),
  );
  const [caseLowGross, setCaseLowGross] = useState(numberOrEmpty(initialEconomics?.case_low_gross ?? null));
  const [caseHighGross, setCaseHighGross] = useState(numberOrEmpty(initialEconomics?.case_high_gross ?? null));
  const [notes, setNotes] = useState(initialEconomics?.notes ?? "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const economics: ReleaseEconomics = useMemo(
    () => ({
      expected_gross: toNumber(expectedGross),
      platform_deductions: toNumber(platformDeductions),
      direct_expenses: toNumber(directExpenses),
      release_investment: toNumber(releaseInvestment),
      filmmaker_percent: toNumber(filmmakerPercent),
      studio_percent: toNumber(studioPercent),
      case_low_gross: caseLowGross ? toNumber(caseLowGross) : undefined,
      case_high_gross: caseHighGross ? toNumber(caseHighGross) : undefined,
      notes: notes.trim() || undefined,
    }),
    [
      expectedGross,
      platformDeductions,
      directExpenses,
      releaseInvestment,
      filmmakerPercent,
      studioPercent,
      caseLowGross,
      caseHighGross,
      notes,
    ],
  );

  const summary = useMemo(() => computeEconomics(economics), [economics]);

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveEconomics(submissionId, economics);
      setFeedback(
        result.success
          ? { type: "success", message: "Release economics saved." }
          : { type: "error", message: result.message ?? "Unable to save release economics." },
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 border border-warm-metal/40 bg-warm-metal/5 p-4">
        <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warm-metal" />
        <p className="text-sm leading-relaxed text-warm-metal">
          Internal planning estimate — not a filmmaker promise. Actual recoupment and shares are governed
          only by a signed distribution agreement.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Expected Gross (base case)"
          type="number"
          min={0}
          value={expectedGross}
          onChange={(event) => setExpectedGross(event.target.value)}
        />
        <Input
          label="Platform Deductions"
          type="number"
          min={0}
          value={platformDeductions}
          onChange={(event) => setPlatformDeductions(event.target.value)}
        />
        <Input
          label="Direct Expenses"
          type="number"
          min={0}
          value={directExpenses}
          onChange={(event) => setDirectExpenses(event.target.value)}
        />
        <Input
          label="Release Investment"
          type="number"
          min={0}
          value={releaseInvestment}
          onChange={(event) => setReleaseInvestment(event.target.value)}
          hint={`Default ${formatCurrency(RELEASE_INVESTMENT.total)} (poster + trailer/publicity).`}
        />
        <Input
          label="Filmmaker Share %"
          type="number"
          min={0}
          max={100}
          value={filmmakerPercent}
          onChange={(event) => setFilmmakerPercent(event.target.value)}
        />
        <Input
          label="Studio Share %"
          type="number"
          min={0}
          max={100}
          value={studioPercent}
          onChange={(event) => setStudioPercent(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Low-Case Gross (optional)"
          type="number"
          min={0}
          value={caseLowGross}
          onChange={(event) => setCaseLowGross(event.target.value)}
        />
        <Input
          label="High-Case Gross (optional)"
          type="number"
          min={0}
          value={caseHighGross}
          onChange={(event) => setCaseHighGross(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CaseCard result={summary.cases.low} />
        <CaseCard result={summary.cases.base} accent />
        <CaseCard result={summary.cases.high} />
      </div>

      <div className="grid grid-cols-1 gap-4 border border-line-strong bg-ink p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Recoupment Threshold</p>
          <p className="mt-1 font-display text-xl text-ivory">{formatCurrency(summary.recoupmentThreshold)}</p>
          <p className="mt-1 text-xs text-slate">Release investment must be recouped before shares are paid.</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Estimated Break-even Gross</p>
          <p className="mt-1 font-display text-xl text-ivory">
            {summary.breakEvenReceipts !== null ? formatCurrency(summary.breakEvenReceipts) : "—"}
          </p>
          <p className="mt-1 text-xs text-slate">
            Gross receipts needed to recoup the release investment and direct expenses, given the implied
            platform take-rate — an internal planning figure, not a contractual recoupment schedule.
          </p>
        </div>
      </div>

      <Textarea
        label="Notes"
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        hint="Assumptions, comparable performance, or caveats behind these numbers."
      />

      {feedback ? (
        <p className={feedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"} role="status">
          {feedback.message}
        </p>
      ) : null}

      <Button type="button" onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save Release Economics"}
      </Button>
    </div>
  );
}
