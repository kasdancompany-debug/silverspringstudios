import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";

export const metadata = createMetadata({
  title: "Distribution",
  description:
    "Looking for distribution for your feature film or series? Silver Spring Studios offers selective digital and streaming distribution with filmmaker-friendly packaging terms.",
  path: "/filmmakers",
});

const POINTS = [
  "We invest in professional packaging for selected titles — key art, trailer support, and positioning — agreed with the filmmaker.",
  "We do not charge an upfront invoice for the packaging investment we agree to make.",
  "Agreed packaging costs are recouped from revenue earned by the film.",
  "Remaining distributable receipts are shared according to the signed agreement.",
  "We provide reporting as defined in that agreement.",
  "We are selective and only take films we believe we can present well for digital and streaming release.",
  "There is no guarantee that every distribution outlet will accept your film. Platforms are curated.",
  "We do not finance films.",
  "Submission does not create a distribution relationship.",
] as const;

export default function FilmmakersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Distribution", path: "/filmmakers" },
        ]}
      />

      <PageHero
        eyebrow="Filmmakers"
        title="Distribution"
        description="Looking for great distribution for your feature film or series?"
      />

      <Section tone="dark">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-5 text-base leading-[1.8] text-silver md:text-lg">
            <p>
              Silver Spring Studios offers selective digital and streaming distribution with a
              personal approach to packaging and release. We work with independent filmmakers who
              have completed ambitious work and want their films presented with care online.
            </p>
            <p>
              <ButtonLink href="/submit" variant="ghost" className="!inline !px-0 text-signal hover:text-flare">
                Submit now
              </ButtonLink>{" "}
              — and if we offer you distribution, we will support the release with the packaging
              and attention your film deserves.
            </p>
            <p>
              Thousands of independent films are finished each year and never find a clear path to
              audiences. Festival play alone does not guarantee discovery. We focus on completed
              features we can package properly for digital shelves — and we are honest about what
              streaming distribution can and cannot promise.
            </p>
          </div>

          <div className="mt-12">
            <ButtonLink href="/submit" variant="signal" size="lg">
              Submit Now
            </ButtonLink>
          </div>

          <h2 className="mt-16 font-impact text-3xl tracking-[0.04em] text-ivory md:text-4xl">
            How we work with filmmakers
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((item) => (
              <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed text-silver">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-signal" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-10 text-sm text-slate">
            <ButtonLink href="/checklist" variant="ghost" className="!px-0 text-signal hover:text-flare">
              View our submission checklist →
            </ButtonLink>
          </p>
          <p className="mt-3 text-sm text-slate">
            <ButtonLink href="/how-it-works" variant="ghost" className="!px-0 text-signal hover:text-flare">
              See the acquisition process →
            </ButtonLink>
          </p>
        </div>
      </Section>

      <Section tone="elevated">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-impact text-3xl tracking-[0.04em] text-ivory md:text-4xl">
            Ready to submit?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-silver">
            Completed feature, documentary, or limited series — with clear rights and a private
            screener.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/submit" variant="signal" size="lg">
              Submit Now
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Contact
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
