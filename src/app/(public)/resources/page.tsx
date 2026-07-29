import Link from "next/link";
import { NewsletterCTA } from "@/components/resources/NewsletterCTA";
import { SubmissionCTA } from "@/components/resources/SubmissionCTA";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";
import {
  ARTICLES,
  RESOURCE_HUBS,
  articlePath,
  getHubBySlug,
} from "@/lib/resources/articles";

export const metadata = createMetadata({
  title: "Resources",
  description:
    "Educational guides on independent film distribution, deliverables, contracts, recoupment, and release readiness from Silver Spring Studios.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
        ]}
      />

      <section className="grain relative overflow-hidden border-b border-line bg-ink pt-28 pb-16 md:pt-36 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 0% 0%, rgba(196, 184, 168, 0.08) 0%, transparent 55%)",
          }}
        />
        <div className="container-page relative z-[2] max-w-3xl">
          <p className="mb-4 text-xs tracking-[0.22em] uppercase text-warm-metal">
            Resource centre
          </p>
          <h1 className="font-display text-4xl text-balance text-ivory md:text-5xl lg:text-6xl">
            Clear writing for filmmakers preparing a real release.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate md:text-lg">
            Silver Spring Studios publishes operational guidance on boutique digital distribution —
            deliverables, contracts, recoupment, packaging, and the gap between festival heat and a
            release-ready master. These pages explain how a small studio evaluates finished films.
            They are not a promise of acceptance, placement, or revenue.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/checklist" size="lg">
              Free readiness checklist
            </ButtonLink>
            <ButtonLink href="/submit" variant="secondary" size="lg">
              Submit a completed film
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section tone="elevated">
        <SectionHeader
          eyebrow="Hubs"
          title="Browse by topic"
          description="Nine focused hubs cover the decisions that shape whether a finished film can move from screener to signed release without avoidable friction."
        />

        <ul className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_HUBS.map((hub) => (
            <li key={hub.slug} className="border-t border-line pt-8 pb-10 pr-0 sm:pr-8">
              <Link href={`/resources/${hub.slug}`} className="group block no-underline">
                <h2 className="font-display text-2xl text-ivory transition-colors group-hover:text-warm-metal md:text-[1.75rem]">
                  {hub.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate">{hub.description}</p>
                <span className="mt-4 inline-block text-xs tracking-[0.14em] uppercase text-silver transition-colors group-hover:text-ivory">
                  Open hub
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Articles"
          title="All guides"
          description="Every article in the resource centre — including draft outlines still being expanded. Titles marked Draft outline are structured for reading now and will deepen over time."
        />

        <ul className="divide-y divide-line border-t border-line">
          {ARTICLES.map((article) => {
            const hub = getHubBySlug(article.hub);
            return (
              <li key={article.slug}>
                <Link
                  href={articlePath(article)}
                  className="group grid gap-3 py-8 no-underline md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10"
                >
                  <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-start md:gap-2">
                    <span className="text-xs tracking-[0.14em] uppercase text-warm-metal">
                      {hub?.title ?? article.hub}
                    </span>
                    {article.status === "draft_outline" ? (
                      <span className="inline-flex border border-warm-metal/50 px-2.5 py-1 text-[0.6rem] tracking-[0.16em] uppercase text-warm-metal">
                        Draft outline
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-ivory transition-colors group-hover:text-warm-metal md:text-[1.85rem]">
                      {article.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate md:text-[0.95rem]">
                      {article.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-16 grid gap-8 border-t border-line pt-12 md:grid-cols-2">
          <div>
            <p className="credit text-warm-metal">Lead magnet</p>
            <h2 className="mt-3 font-display text-2xl text-ivory md:text-3xl">
              Distribution readiness checklist
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              A print-ready audit covering rights, music, masters, captions, artwork, festival
              history, and release goals — the same categories acquisitions reviews before an offer.
            </p>
            <ButtonLink href="/checklist" className="mt-6" variant="secondary">
              Get the checklist
            </ButtonLink>
          </div>
          <div>
            <p className="credit text-warm-metal">Acquisitions</p>
            <h2 className="mt-3 font-display text-2xl text-ivory md:text-3xl">
              Finished film ready for review?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              If you have a completed feature, documentary, or limited series with clear rights and a
              private screener, start with the submission form. Reading these guides first reduces
              back-and-forth later.
            </p>
            <ButtonLink href="/submit" className="mt-6">
              Submit your film
            </ButtonLink>
          </div>
        </div>
      </Section>

      <div className="container-page">
        <NewsletterCTA showForm id="newsletter" />
      </div>

      <SubmissionCTA query={{ source: "resources", medium: "cta" }} />
    </>
  );
}
