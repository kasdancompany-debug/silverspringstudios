import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailSection({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-line-strong bg-surface p-6 md:p-8", className)}>
      {title || action ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {title ? <h2 className="font-display text-xl text-ivory">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function DetailField({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-xs tracking-[0.08em] text-slate uppercase">{label}</p>
      <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-ivory">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>;
}
