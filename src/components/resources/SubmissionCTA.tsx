import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn } from "@/lib/utils";

function buildSubmitHref(query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) return "/submit";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `/submit?${qs}` : "/submit";
}

export function SubmissionCTA({
  query,
  className,
  eyebrow = "Acquisitions",
  title = "Ready to share a completed film?",
  description = "If you have a finished feature, documentary or limited series with clear rights and a private screener, we welcome a selective review. Submission does not guarantee acceptance.",
}: {
  query?: Record<string, string>;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const href = buildSubmitHref(query);

  return (
    <section
      className={cn(
        "relative overflow-hidden border-y border-line bg-surface py-16 md:py-20",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 70% at 100% 50%, rgba(73, 90, 80, 0.16) 0%, transparent 70%)",
        }}
      />
      <div className="container-page relative z-[2] max-w-3xl">
        <p className="credit text-warm-metal">{eyebrow}</p>
        <h2 className="mt-4 font-display text-[2.25rem] leading-[1.05] text-balance text-ivory md:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
        <p className="mt-5 max-w-xl text-[0.95rem] leading-[1.75] text-slate">{description}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href={href} size="lg" className="min-w-[12rem]">
            Submit Your Film
          </ButtonLink>
          <ButtonLink href="/how-it-works" variant="ghost" size="lg">
            How It Works
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
