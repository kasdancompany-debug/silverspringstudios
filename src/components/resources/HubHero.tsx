import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function HubHero({
  eyebrow = "Resource hub",
  title,
  description,
  longDescription,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  longDescription?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "grain relative overflow-hidden border-b border-line bg-ink pt-28 pb-16 md:pt-36 md:pb-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 0% 0%, rgba(196, 184, 168, 0.08) 0%, transparent 55%)",
        }}
      />
      <div className="container-page relative z-[2] max-w-3xl">
        <p className="mb-4 text-xs tracking-[0.22em] uppercase text-warm-metal">{eyebrow}</p>
        <h1 className="font-display text-4xl text-balance text-ivory md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mt-6 text-base leading-relaxed text-slate md:text-lg">{description}</p>
        {longDescription ? (
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.75] text-slate/90 md:text-base">
            {longDescription}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
