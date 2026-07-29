import { cn } from "@/lib/utils";
import { SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/constants";

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  draft: "border-line-strong text-slate",
  submitted: "border-silver/60 text-ivory",
  initial_review: "border-warm-metal/60 text-warm-metal",
  screener_review: "border-warm-metal/60 text-warm-metal",
  needs_information: "border-danger/50 text-danger",
  meeting_requested: "border-forest-soft/70 text-forest-soft",
  declined: "border-danger/60 text-danger bg-danger/10",
  offer_considered: "border-forest-soft/70 text-forest-soft",
  agreement_sent: "border-success/60 text-success",
  signed: "border-success/70 text-success bg-success/10",
  onboarding: "border-success/60 text-success",
  released: "border-success/70 text-success bg-success/10",
  archived: "border-line-strong text-slate",
};

export function StatusBadge({
  status,
  className,
}: {
  status: SubmissionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap border px-2.5 py-1 text-[0.65rem] tracking-[0.08em] uppercase",
        STATUS_STYLES[status] ?? "border-line-strong text-slate",
        className,
      )}
    >
      {SUBMISSION_STATUS_LABELS[status] ?? status}
    </span>
  );
}
