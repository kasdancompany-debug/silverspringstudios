import { ButtonLink } from "@/components/ui/ButtonLink";
import { STUDIO_ADVISOR } from "@/lib/studio-advisor";

const AFTER_SUBMIT = [
  {
    title: "Confirmation",
    body: "You receive a reference number confirming receipt of your materials.",
  },
  {
    title: "Review",
    body: "Acquisitions evaluates the screener, rights position, materials, and suitability for digital release.",
  },
  {
    title: "Response",
    body: "We follow with a decline, a request for information, a meeting, or continued consideration.",
  },
  {
    title: "No assurances",
    body: "Submission does not guarantee acceptance, platform placement, press, or revenue.",
  },
] as const;

export function ExpectationsBand() {
  return (
    <section className="border-y border-line bg-surface py-16 md:py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.3fr] lg:gap-16">
          <div>
            <p className="credit text-signal">After Submission</p>
            <h2 className="mt-4 font-impact text-[clamp(2rem,5vw,3.25rem)] leading-[0.95] text-ivory">
              What to expect.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-slate">
              {STUDIO_ADVISOR.responseAimLabel}. Timing may vary with volume and the complexity of
              review.
            </p>
            <div className="mt-8">
              <ButtonLink href="/what-we-look-for" variant="secondary">
                Acquisition Criteria
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
