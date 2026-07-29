import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
}) {
  const toneStyles: Record<typeof tone, string> = {
    default: "text-ivory",
    success: "text-success",
    warning: "text-warm-metal",
    danger: "text-danger",
  };

  return (
    <div
      className={cn(
        "flex flex-col justify-between border border-line-strong bg-surface p-5 md:p-6",
        className,
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <p className="text-xs tracking-[0.14em] text-slate uppercase">{label}</p>
        {icon ? <span className="text-slate/70">{icon}</span> : null}
      </div>
      <p className={cn("font-display text-4xl leading-none", toneStyles[tone])}>{value}</p>
      {hint ? <p className="mt-3 text-xs leading-relaxed text-slate">{hint}</p> : null}
    </div>
  );
}
