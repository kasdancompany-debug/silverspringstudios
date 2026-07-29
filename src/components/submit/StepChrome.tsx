"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { StepMeta } from "@/lib/constants";

/* ---------------------------------------------------------------------- */
/* RequiredMark / OptionalBadge                                            */
/* ---------------------------------------------------------------------- */

/** Inline asterisk for field labels that aren't already handled by the
 * Input/Textarea/Select components' built-in `required` styling — used on
 * custom label elements (radio groups, checkbox groups, section headings). */
export function RequiredMark() {
  return (
    <span className="text-warm-metal" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function OptionalBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded-full border border-line-strong px-2 py-0.5 text-[10px] font-medium tracking-[0.08em] uppercase text-slate",
        className,
      )}
    >
      Optional
    </span>
  );
}

/* ---------------------------------------------------------------------- */
/* StepHeader                                                              */
/* ---------------------------------------------------------------------- */

export function StepHeader({
  step,
  total = 6,
  title,
  description,
  estimate,
}: {
  step: number;
  total?: number;
  title: string;
  description?: string;
  estimate?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs tracking-[0.22em] uppercase text-warm-metal">
        Step {step} of {total}
      </p>
      <h2 className="font-display text-2xl text-ivory md:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate">{description}</p>
      ) : null}
      {estimate ? (
        <p className="flex items-center gap-2 text-xs text-slate/80">
          <span className="h-1 w-1 rounded-full bg-warm-metal" aria-hidden="true" />
          {estimate}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* StepNav                                                                 */
/* ---------------------------------------------------------------------- */

export function StepNav({
  onBack,
  backLabel = "Back",
  onContinue,
  continueLabel = "Continue",
  submittingLabel = "Submitting…",
  isSubmitting = false,
  secondaryAction,
  disabled = false,
}: {
  onBack?: () => void;
  backLabel?: string;
  /** If provided, the continue button becomes type="button" and calls this
   * handler directly. Otherwise it renders as type="submit" so it triggers
   * the enclosing form's validation via handleSubmit(). */
  onContinue?: () => void;
  continueLabel?: string;
  submittingLabel?: string;
  isSubmitting?: boolean;
  secondaryAction?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div>
        {onBack ? (
          <Button type="button" variant="secondary" size="lg" onClick={onBack} disabled={isSubmitting}>
            {backLabel}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {secondaryAction}
        <Button
          type={onContinue ? "button" : "submit"}
          size="lg"
          onClick={onContinue}
          disabled={isSubmitting || disabled}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {submittingLabel}
            </>
          ) : (
            continueLabel
          )}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SaveStatus                                                              */
/* ---------------------------------------------------------------------- */

export function SaveStatus({
  isSaving,
  lastSavedAt,
  isDirty = false,
  draftUrl,
}: {
  isSaving: boolean;
  lastSavedAt: Date | null;
  isDirty?: boolean;
  draftUrl?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    if (!draftUrl) return;
    try {
      await navigator.clipboard.writeText(draftUrl);
      setCopied(true);
    } catch {
      // Clipboard access can fail (permissions, insecure context, etc.) —
      // the URL is still visible and selectable, so this is non-fatal.
    }
  }

  return (
    <div className="flex flex-col gap-3 border border-line-strong bg-surface px-4 py-3 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
      <span className="inline-flex items-center gap-1.5">
        {isSaving ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Saving…
          </>
        ) : lastSavedAt ? (
          <>
            <Check className="h-3 w-3 text-success" aria-hidden="true" />
            Saved at{" "}
            {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {isDirty ? " · unsaved changes since" : ""}
          </>
        ) : (
          "Your progress will be saved automatically."
        )}
      </span>

      {draftUrl ? (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 self-start text-warm-metal underline underline-offset-4 transition-colors hover:text-ivory sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" aria-hidden="true" />
              Link copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" />
              Copy return link
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ProgressRail                                                            */
/* ---------------------------------------------------------------------- */

export function ProgressRail({
  currentStep,
  total,
  percent,
  steps,
  orientation = "horizontal",
}: {
  currentStep: number;
  total: number;
  percent: number;
  steps?: readonly StepMeta[];
  orientation?: "horizontal" | "vertical";
}) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  if (orientation === "vertical") {
    return (
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-baseline justify-between text-xs text-slate">
            <span className="tracking-[0.14em] uppercase">Progress</span>
            <span className="text-ivory">{Math.round(clampedPercent)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden bg-line">
            <motion.div
              className="h-1 bg-warm-metal"
              initial={false}
              animate={{ width: `${clampedPercent}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </div>

        {steps ? (
          <ol className="space-y-1">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isComplete = stepNumber < currentStep;
              const isActive = stepNumber === currentStep;
              return (
                <li
                  key={step.key}
                  className={cn(
                    "flex items-center gap-3 border-l-2 py-2 pl-4 text-sm transition-colors",
                    isActive
                      ? "border-warm-metal text-ivory"
                      : isComplete
                        ? "border-silver/60 text-slate"
                        : "border-line text-slate/70",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                      isComplete
                        ? "border-warm-metal bg-warm-metal text-ink"
                        : isActive
                          ? "border-ivory text-ivory"
                          : "border-line-strong text-slate",
                    )}
                  >
                    {isComplete ? <Check className="h-3 w-3" aria-hidden="true" /> : stepNumber}
                  </span>
                  <span>{step.name}</span>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        {(steps ?? Array.from({ length: total })).map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const label = steps ? (step as StepMeta).shortLabel : undefined;

          return (
            <div
              key={steps ? (step as StepMeta).key : stepNumber}
              className="flex flex-1 flex-col items-center gap-2 text-center last:flex-none"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs transition-colors",
                  isComplete
                    ? "border-warm-metal bg-warm-metal text-ink"
                    : isActive
                      ? "border-ivory text-ivory"
                      : "border-line-strong text-slate",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : stepNumber}
              </div>
              {label ? (
                <span
                  className={cn(
                    "hidden text-[10px] tracking-[0.08em] uppercase sm:block",
                    isActive ? "text-ivory" : "text-slate",
                  )}
                >
                  {label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-4 h-1 w-full bg-line">
        <motion.div
          className="h-1 bg-warm-metal"
          initial={false}
          animate={{ width: `${clampedPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-right text-[11px] text-slate">{Math.round(clampedPercent)}% complete</p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* DirtyLeaveGuard                                                         */
/* ---------------------------------------------------------------------- */

/** Renders nothing — purely wires up a `beforeunload` prompt while
 * `isDirty` is true, so a filmmaker can't accidentally lose in-progress
 * edits by closing the tab before an autosave lands. */
export function DirtyLeaveGuard({ isDirty }: { isDirty: boolean }) {
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Legacy browsers require returnValue to be set to show the prompt.
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return null;
}
