import { ButtonLink } from "@/components/ui/ButtonLink";

const PREP = [
  {
    title: "Submission checklist",
    body: "Rights, screener, deliverables, and release expectations — reviewed before you apply.",
    href: "/checklist",
    cta: "View Checklist",
  },
  {
    title: "What we look for",
    body: "Genre focus, craft, and commercial clarity — and what does not decide an acquisition alone.",
    href: "/what-we-look-for",
    cta: "Read Criteria",
  },
  {
    title: "For filmmakers",
    body: "How packaging investment, recoupment, and participation work under our distribution model.",
    href: "/filmmakers",
    cta: "Read More",
  },
] as const;

export function PrepareGateway() {
  return (
    <section id="prepare" className="relative bg-ink py-20 md:py-28">
      <div className="container-page">
        <div className="mb-12 max-w-2xl">
          <p className="credit text-signal">Resources</p>
          <h2 className="mt-4 font-impact text-[clamp(2.5rem,7vw,4rem)] leading-[0.92] text-ivory">
            Prepare a
            <br />
            complete submission.
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-slate">
            Filmmakers who arrive with clear rights, a finished picture, and realistic release goals
            receive a faster and more serious review.
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
            Completed feature, documentary, or limited series with clear rights and a private
            screener.
          </p>
          <ButtonLink href="/submit" variant="signal" size="lg">
            Submit a Film
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
