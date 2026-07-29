import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";

export const metadata = createMetadata({
  title: "For Filmmakers",
  description:
    "How Silver Spring Studios partners with independent filmmakers on streaming releases: packaging invested per title, recoupment from receipts, and no upfront invoice.",
  path: "/filmmakers",
});

const packagingAreas = [
  {
    label: "Key art / poster",
    note: "Original or adapted art sized for streaming browse grids and platform thumbnails — scoped to what the title needs.",
  },
  {
    label: "Trailer & publicity support",
    note: "Trailer assembly and related publicity materials where they fit the release — not a fixed kit for every film.",
  },
  {
    label: "Positioning",
    note: "Clear audience and genre framing before assets are built, so packaging matches how the film should sell online.",
  },
];

const waterfallSteps = [
  {
    title: "Platform and direct costs",
    body: "Fees and contractually defined expenses come out of receipts as written in the agreement.",
  },
  {
    title: "Agreed packaging investment",
    body: "What we invested in release packaging for that title is recouped from remaining film receipts — not billed to you upfront.",
  },
  {
    title: "Shared remaining receipts",
    body: "What is left is split between filmmaker and studio according to the signed agreement for that project.",
  },
];

const collaboration = [
  {
    title: "Be available for positioning conversations",
    body: "Release language, audience framing and campaign tone work best when the filmmaker is engaged—not absent, not controlling every detail, but present.",
  },
  {
    title: "Provide accurate rights information",
    body: "Existing agreements, platform history, music status and chain-of-title gaps should be disclosed early. Surprises slow releases down.",
  },
  {
    title: "Deliver agreed materials on time",
    body: "Masters, captions, stills, cue sheets and EPK elements may be required before licensing outreach can begin in earnest.",
  },
  {
    title: "Participate in realistic planning",
    body: "We prefer filmmakers who understand that distribution is a process—not a single platform announcement—and who can align expectations accordingly.",
  },
  {
    title: "Review reports and ask questions",
    body: "We aim for clear revenue reporting. Filmmakers should read statements, ask for clarification and keep contact information current.",
  },
];

export default function FilmmakersPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "For Filmmakers", path: "/filmmakers" },
        ]}
      />

      <PageHero
        eyebrow="Partnership"
        title="For filmmakers"
        description="For independent filmmakers with completed work and serious release intentions — selective digital distribution with professional packaging and clear written terms."
      />

      <Section tone="elevated">
        <SectionHeader
          eyebrow="The model"
          title="Packaging invested in the release"
          description="Selected films may receive professional packaging support without an upfront charge to the filmmaker. Scope and budget are agreed per title and set out in the distribution agreement."
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6 text-base leading-relaxed text-slate">
            <p>
              Not every film needs the same poster, trailer or publicity depth. We talk through
              what will actually help the title on streaming, agree the package with you, and treat
              that as an investment in the release — not a menu of fixed public prices.
            </p>
            <p>
              That agreed packaging investment is recouped from revenue the film generates. After
              recoupment and other contract-defined deductions, remaining distributable receipts are
              shared as specified in your signed agreement. We talk about net / distributable
              receipts — never “profit.”
            </p>
            <p className="text-sm text-slate/80">
              Acceptance, platform placement and revenue are never guaranteed. A title may never
              generate enough receipts to recoup the agreed investment; you are not personally on
              the hook for that packaging spend unless a separate written arrangement says so.
            </p>
          </div>

          <div className="border border-line-strong bg-surface p-8">
            <p className="credit text-signal">What packaging can include</p>
            <ul className="mt-6 space-y-6">
              {packagingAreas.map((item) => (
                <li key={item.label} className="border-t border-line pt-6 first:border-t-0 first:pt-0">
                  <p className="font-impact text-xl tracking-[0.03em] text-ivory">{item.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Waterfall"
          title="How recoupment works"
          description="The sequence matters more than any public formula. Exact categories, caps and splits are defined only in each signed agreement."
        />

        <ol className="max-w-3xl space-y-0 border border-line-strong">
          {waterfallSteps.map((step, i) => (
            <li
              key={step.title}
              className="grid gap-4 border-b border-line p-6 last:border-b-0 md:grid-cols-[4rem_1fr] md:gap-8 md:p-8"
            >
              <p className="font-impact text-3xl text-signal">{String(i + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="font-impact text-2xl tracking-[0.03em] text-ivory">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="ivory">
        <SectionHeader
          light
          eyebrow="Collaboration"
          title="What we expect from filmmaking partners"
          description="Distribution works best as a partnership. These expectations apply to projects we accept—not to every submission we review."
        />

        <div className="grid gap-8 md:grid-cols-2">
          {collaboration.map((item) => (
            <article key={item.title} className="border-t border-ink/10 pt-6">
              <h3 className="font-display text-lg text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="elevated">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <SectionHeader
              eyebrow="Next step"
              title="Tell us about your completed film"
              description="Read our submission terms, prepare a private screener and submit when the film and rights story are ready for review."
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/submit" variant="signal">
              Submit Your Film
            </ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">
              How It Works
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
