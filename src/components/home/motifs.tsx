import { cn } from "@/lib/utils";

/** Crop-mark corners — release documentation / title-card motif */
export function CropMarks({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const mark = tone === "light" ? "border-ivory/25" : "border-ink/25";

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-3 md:inset-5", className)}>
      <span className={cn("absolute left-0 top-0 h-4 w-4 border-l border-t", mark)} />
      <span className={cn("absolute right-0 top-0 h-4 w-4 border-r border-t", mark)} />
      <span className={cn("absolute bottom-0 left-0 h-4 w-4 border-b border-l", mark)} />
      <span className={cn("absolute bottom-0 right-0 h-4 w-4 border-b border-r", mark)} />
    </div>
  );
}

/** Thin frame used for title-card / documentation panels */
export function DocFrame({
  children,
  className,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "relative border",
        tone === "light" ? "border-line-strong" : "border-line-ink-strong",
        className,
      )}
    >
      <CropMarks tone={tone === "light" ? "light" : "dark"} />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

export function CreditLine({
  children,
  className,
  light = false,
}: {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <p className={cn("credit", light ? "text-signal-dim" : "text-signal", className)}>
      {children}
    </p>
  );
}

export function PullQuote({
  children,
  attribution,
  light = false,
  className,
}: {
  children: React.ReactNode;
  attribution?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <blockquote className={cn("relative max-w-3xl", className)}>
      <p
        className={cn(
          "font-display text-3xl leading-[1.15] text-balance md:text-4xl lg:text-[2.75rem]",
          light ? "text-ink" : "text-ivory",
        )}
      >
        {children}
      </p>
      {attribution ? (
        <footer
          className={cn(
            "mt-6 credit",
            light ? "text-ink/50" : "text-slate",
          )}
        >
          — {attribution}
        </footer>
      ) : null}
    </blockquote>
  );
}

export function SectionRule({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(light ? "editorial-rule-ink" : "editorial-rule", className)}
    />
  );
}
