import { ButtonLink } from "@/components/ui/ButtonLink";

const BENEFITS = [
  "We invest in professional packaging for selected titles — key art, trailer support, and positioning — scoped with the filmmaker.",
  "We do not charge an upfront invoice for the packaging investment we agree to make.",
  "Agreed packaging costs are recouped from revenue earned by the film.",
  "Remaining distributable receipts are shared according to the signed agreement.",
  "We provide clear reporting as defined in that agreement.",
  "We are selective. We only take films we believe we can present well for digital and streaming release.",
  "There is no guarantee that every platform will accept your film. Platforms are curated.",
  "Submission does not create a distribution relationship. A release begins only after a signed agreement.",
] as const;

/** Indie Rights distribution-page pattern: direct question + benefit bullets + submit. */
export function DistributionPitch() {
  return (
    <section id="distribution" className="border-y border-line bg-ink py-20 md:py-28">
      <div className="container-page max-w-3xl">
        <h2 className="font-impact text-[clamp(2.5rem,6vw,4rem)] tracking-[0.04em] text-ivory">
          Distribution
        </h2>
        <p className="mt-4 text-lg text-signal md:text-xl">
          Looking for distribution for your feature film or series?
        </p>
        <div className="mt-8 space-y-5 text-base leading-[1.75] text-silver">
          <p>
            Silver Spring Studios offers selective digital and streaming distribution with a
            filmmaker-friendly approach to packaging and economics. We work directly with
            independent filmmakers who have finished ambitious work and want their films presented
            with care.
          </p>
          <p>
            Submit now — and if we offer you distribution, we will support the release with the
            packaging and attention your film deserves.
          </p>
        </div>

        <div className="mt-10">
          <ButtonLink href="/submit" variant="signal" size="lg">
            Submit Now
          </ButtonLink>
        </div>

        <ul className="mt-14 space-y-4 border-t border-line pt-10">
          {BENEFITS.map((item) => (
            <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed text-silver">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-signal" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-slate">
          <ButtonLink href="/filmmakers" variant="ghost" className="!px-0 text-signal hover:text-flare">
            Read full distribution details →
          </ButtonLink>
        </p>
      </div>
    </section>
  );
}
