import { ButtonLink } from "@/components/ui/ButtonLink";

const PREP = [
  {
    title: "Readiness checklist",
    body: "Rights, screener, deliverables and expectations — audit before you apply.",
    href: "/checklist",
    cta: "Open Checklist",
  },
  {
    title: "What we look for",
    body: "Genre lanes, craft signals and what does not decide an acquisition alone.",
    href: "/what-we-look-for",
    cta: "Self-Qualify",
  },
  {
    title: "How the money works",
    body: "Investment, recoupment and the split — in plain language before you submit.",
    href: "/filmmakers",
    cta: "Filmmaker Economics",
  },
] as const;

export function PrepareGateway() {
  return (
    <section id="prepare" className="relative bg-ink py-20 md:py-28">
      <div className="container-page">
        <div className="mb-12 max-w-2xl">
          <p className="credit text-flare">Prepare</p>
          <h2 className="mt-4 font-impact text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.92] text-ivory">
            Come ready.
            <br />
            <span className="text-signal">Move faster.</span>
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-slate">
            Strong submissions are complete submissions. Use these before you hit send — fewer
            delays, clearer conversations, better odds of a serious look.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PREP.map((item) => (
            <article
              key={item.href}
              className="flex flex-col border border-line bg-void/60 p-7 transition-colors hover:border-signal"
            >
              <h3 className="font-impact text-2xl tracking-[0.03em] text-ivory">{item.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">{item.body}</p>
              <div className="mt-8">
                <ButtonLink href={item.href} variant="ghost" className="!px-0 hover:text-signal">
                  {item.cta} →
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-slate">
            Ready with a finished feature, clear rights and a private screener?
          </p>
          <ButtonLink href="/submit" variant="signal" size="lg">
            Submit Your Film
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
