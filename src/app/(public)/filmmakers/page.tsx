import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";
import { RELEASE_INVESTMENT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata = createMetadata({
  title: "For Filmmakers",
  description:
    "How Silver Spring Studios partners with independent filmmakers: release investment, recoupment from receipts, and collaborative distribution without an upfront invoice.",
  path: "/filmmakers",
});

const investmentItems = [
  {
    label: "Poster design",
    amount: RELEASE_INVESTMENT.posterDesign,
    note: "Original key art and adaptation for digital and print use, as defined in the agreement.",
  },
  {
    label: "Trailer editing and publicity",
    amount: RELEASE_INVESTMENT.trailerAndPublicity,
    note: "Trailer assembly, positioning support and coordinated publicity materials where appropriate.",
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
  const exampleReceipts = 10_000;
  const recouped = RELEASE_INVESTMENT.total;
  const remaining = exampleReceipts - recouped;
  const filmmakerShare = Math.round(remaining * (RELEASE_INVESTMENT.filmmakerSharePercent / 100));
  const studioShare = remaining - filmmakerShare;

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
        description="We built Silver Spring Studios for filmmakers who have finished a serious independent work and want a distribution partner willing to invest in the release—not send an invoice before the first dollar is earned."
      />

      <Section tone="elevated">
        <SectionHeader
          eyebrow="The model"
          title="We invest before we earn"
          description="Selected films may receive professional release preparation without an upfront charge to the filmmaker. The agreed release investment is recouped only from revenue the film generates."
        />

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            <p className="text-base leading-relaxed text-slate">
              For our standard offer, Silver Spring Studios may invest up to{" "}
              {formatCurrency(RELEASE_INVESTMENT.total)} in release services—typically{" "}
              {formatCurrency(RELEASE_INVESTMENT.posterDesign)} toward poster design and{" "}
              {formatCurrency(RELEASE_INVESTMENT.trailerAndPublicity)} toward trailer editing and
              publicity support. These figures describe the initial release investment, not a fee
              billed to you personally.
            </p>
            <p className="text-base leading-relaxed text-slate">
              After the agreed release investment is recouped from net receipts, distributable
              receipts are typically split {RELEASE_INVESTMENT.filmmakerSharePercent}% to the
              filmmaker and {RELEASE_INVESTMENT.studioSharePercent}% to Silver Spring Studios—subject
              to the signed distribution agreement. We refer to these amounts as net receipts or
              distributable receipts, not profit.
            </p>
          </div>

          <div className="border border-line-strong bg-surface p-8">
            <p className="text-xs tracking-[0.18em] uppercase text-warm-metal">Standard investment</p>
            <ul className="mt-6 space-y-6">
              {investmentItems.map((item) => (
                <li key={item.label} className="border-t border-line pt-6 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-sm text-ivory">{item.label}</p>
                    <p className="font-display text-xl text-warm-metal">{formatCurrency(item.amount)}</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate">{item.note}</p>
                </li>
              ))}
            </ul>
            <div className="editorial-rule my-8" />
            <div className="flex items-baseline justify-between">
              <p className="text-sm uppercase tracking-[0.12em] text-silver">Total release investment</p>
              <p className="font-display text-2xl text-ivory">{formatCurrency(RELEASE_INVESTMENT.total)}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Waterfall"
          title="How recoupment works"
          description="Illustrative example only. Actual deductions, territories, term and payment timing are defined in each signed agreement."
        />

        <div className="max-w-3xl border border-line-strong bg-surface p-8 md:p-10">
          <p className="text-xs tracking-[0.18em] uppercase text-warm-metal">Illustrative example</p>
          <p className="mt-4 font-display text-2xl text-ivory md:text-3xl">
            Film generates {formatCurrency(exampleReceipts)} in net receipts
          </p>

          <ol className="mt-8 space-y-6">
            <li className="flex gap-4 border-t border-line pt-6">
              <span className="text-warm-metal">1</span>
              <div>
                <p className="text-sm text-ivory">
                  {formatCurrency(recouped)} recoups the agreed Silver Spring release investment
                </p>
              </div>
            </li>
            <li className="flex gap-4 border-t border-line pt-6">
              <span className="text-warm-metal">2</span>
              <div>
                <p className="text-sm text-ivory">
                  {formatCurrency(remaining)} remains in distributable receipts
                </p>
              </div>
            </li>
            <li className="flex gap-4 border-t border-line pt-6">
              <span className="text-warm-metal">3</span>
              <div className="space-y-2">
                <p className="text-sm text-ivory">
                  Filmmaker receives {RELEASE_INVESTMENT.filmmakerSharePercent}%:{" "}
                  {formatCurrency(filmmakerShare)}
                </p>
                <p className="text-sm text-slate">
                  Silver Spring Studios receives {RELEASE_INVESTMENT.studioSharePercent}%:{" "}
                  {formatCurrency(studioShare)}
                </p>
              </div>
            </li>
          </ol>
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate">
          If a film never generates enough revenue to recoup the agreed release investment, the
          filmmaker is not personally responsible for repaying that standard investment unless
          separately agreed in writing. No revenue, recoupment or platform placement is guaranteed.
        </p>
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
            <ButtonLink href="/submit">Submit Your Film</ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">
              How It Works
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
