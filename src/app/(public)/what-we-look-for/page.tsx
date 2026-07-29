import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";
import { GENRES, SCORECARD_CRITERIA } from "@/lib/constants";

export const metadata = createMetadata({
  title: "What We Look For",
  description:
    "Genres, qualities and evaluation criteria Silver Spring Studios considers when reviewing completed independent films for distribution.",
  path: "/what-we-look-for",
});

const qualities = [
  {
    title: "Completed and exhibition-ready",
    body: "We review finished feature films, documentaries and select limited series—not treatments, scripts-in-progress or short films.",
  },
  {
    title: "Commercially identifiable audience",
    body: "The film should have a clear genre, subject or point of view that helps position it for a defined audience—not necessarily a mass audience, but a real one.",
  },
  {
    title: "Strong execution",
    body: "Performance, pacing, sound, picture and editorial craft matter. We look for films that hold attention and reflect intentional filmmaking.",
  },
  {
    title: "Rights readiness",
    body: "Chain of title, music clearance and available exploitation rights should be far enough along for a serious distribution conversation.",
  },
  {
    title: "Release collaboration",
    body: "Filmmakers who are prepared to participate in positioning, publicity and realistic release planning make stronger partners.",
  },
  {
    title: "Honest positioning",
    body: "We respond well to submissions that describe the film accurately—its strengths, limitations and realistic commercial context included.",
  },
];

const notDecisive = [
  "Production budget alone",
  "Celebrity cast without audience clarity",
  "Festival laurels without a viable release path",
  "Comparable-title name-dropping without rationale",
  "Unrealistic revenue expectations",
];

export default function WhatWeLookForPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "What We Look For", path: "/what-we-look-for" },
        ]}
      />

      <PageHero
        eyebrow="Acquisitions"
        title="What we look for"
        description="We are selective, not exclusive for its own sake. We seek distinctive independent work with clear positioning, professional execution and a rights path that can support a real release."
      />

      <Section tone="elevated">
        <SectionHeader
          eyebrow="Genres"
          title="Current areas of interest"
          description="Genre affinity helps us evaluate fit quickly, but strong films outside these lanes are still welcome if the audience and rights story is clear."
        />

        <ul className="flex flex-wrap gap-3">
          {GENRES.map((genre) => (
            <li
              key={genre}
              className="border border-line-strong px-4 py-2 text-xs tracking-[0.14em] uppercase text-silver"
            >
              {genre}
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl text-sm leading-relaxed text-slate">
          Primary geographic focus: Canada, the United States and English-language international
          productions with subtitle availability where needed. We also consider films previously
          released in limited contexts if meaningful rights remain available—each case depends on
          history, existing agreements and realistic opportunity.
        </p>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Qualities"
          title="What makes a submission worth a closer look"
          description="We evaluate the whole picture: the film, the audience, the materials, the rights and the filmmaker relationship."
        />

        <div className="grid gap-10 md:grid-cols-2">
          {qualities.map((item) => (
            <article key={item.title} className="border-t border-line-strong pt-8">
              <h3 className="font-display text-xl text-ivory">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="ivory">
        <SectionHeader
          light
          eyebrow="Evaluation"
          title="How we assess submissions internally"
          description="Our review considers creative strength and release practicality together. Scores are internal guides—not promises of acceptance or revenue."
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {SCORECARD_CRITERIA.map((criterion) => (
            <li
              key={criterion.key}
              className="flex items-baseline gap-3 border-t border-ink/10 pt-4 text-sm text-ink/80"
            >
              <span className="text-forest" aria-hidden="true">
                —
              </span>
              {criterion.label}
            </li>
          ))}
        </ul>

        <div className="mt-12 max-w-3xl">
          <h3 className="font-display text-xl text-ink">What is not decisive on its own</h3>
          <ul className="mt-5 space-y-3">
            {notDecisive.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-ink/70">
                <span className="text-forest" aria-hidden="true">
                  ·
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="elevated">
        <div className="max-w-2xl">
          <SectionHeader
            eyebrow="Transparency"
            title="Acceptance is never guaranteed"
            description="We review every submission we can, but we cannot respond to all projects and we cannot partner with every film that shows promise. Declining a submission is not a judgment of artistic worth—it reflects fit, timing, rights and realistic release opportunity."
          />
          <ButtonLink href="/submit">Submit Your Film</ButtonLink>
        </div>
      </Section>
    </>
  );
}
