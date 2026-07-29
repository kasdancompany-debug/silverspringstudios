import { ButtonLink } from "@/components/ui/ButtonLink";
import { STUDIO_ADVISOR } from "@/lib/studio-advisor";

const AFTER_SUBMIT = [
  {
    title: "Confirmation",
    body: "You get a reference number and a receipt of what you sent. Submission still creates no relationship.",
  },
  {
    title: "Human review",
    body: `${STUDIO_ADVISOR.deskLabel} watches the screener and reads rights, materials and release fit.`,
  },
  {
    title: "A clear next step",
    body: "Decline, request for information, meeting invite or continued consideration — not silence as a strategy.",
  },
  {
    title: "No guarantees",
    body: "We never promise acceptance, platform placement, reviews or revenue. Honesty is the product.",
  },
] as const;

export function ExpectationsBand() {
  return (
    <section className="border-y border-line bg-surface py-16 md:py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.3fr] lg:gap-16">
          <div>
            <p className="credit text-signal">After You Submit</p>
            <h2 className="mt-4 font-impact text-[clamp(2rem,5vw,3.25rem)] leading-[0.95] text-ivory">
              Know what happens next.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-slate">
              {STUDIO_ADVISOR.responseAimLabel}. That is an operational aim — not a contractual
              promise. If capacity changes, we update this page.
            </p>
            <div className="mt-8">
              <ButtonLink href="/what-we-look-for" variant="secondary">
                What We Look For
              </ButtonLink>
            </div>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2">
            {AFTER_SUBMIT.map((item, i) => (
              <li key={item.title} className="border-t border-line pt-5">
                <p className="credit text-signal/70">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-impact text-xl tracking-[0.03em] text-ivory">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
