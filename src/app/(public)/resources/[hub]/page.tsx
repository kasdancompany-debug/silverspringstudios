import Link from "next/link";
import { notFound } from "next/navigation";
import { HubHero } from "@/components/resources/HubHero";
import { NewsletterCTA } from "@/components/resources/NewsletterCTA";
import { SubmissionCTA } from "@/components/resources/SubmissionCTA";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { Section, SectionHeader } from "@/components/ui/Section";
import {
  RESOURCE_HUBS,
  articlePath,
  getArticlesByHub,
  getHubBySlug,
} from "@/lib/resources/articles";

type PageProps = {
  params: Promise<{ hub: string }>;
};

export function generateStaticParams() {
  return RESOURCE_HUBS.map((hub) => ({ hub: hub.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { hub: hubSlug } = await params;
  const hub = getHubBySlug(hubSlug);
  if (!hub) {
    return createMetadata({
      title: "Resource hub",
      description: "Silver Spring Studios resource hub.",
      path: `/resources/${hubSlug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: hub.title,
    description: hub.description,
    path: `/resources/${hub.slug}`,
  });
}

export default async function ResourceHubPage({ params }: PageProps) {
  const { hub: hubSlug } = await params;
  const hub = getHubBySlug(hubSlug);

  if (!hub) {
    notFound();
  }

  const articles = getArticlesByHub(hub.slug);
  const longParagraphs = hub.longDescription
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: hub.title, path: `/resources/${hub.slug}` },
        ]}
      />

      <HubHero title={hub.title} description={hub.description} eyebrow="Resource hub">
        <div className="mt-6 max-w-2xl space-y-4 text-[0.95rem] leading-[1.75] text-slate/90 md:text-base">
          {longParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </HubHero>

      <Section tone="elevated">
        <SectionHeader
          eyebrow="In this hub"
          title={
            articles.length === 1
              ? "One guide in this hub"
              : `${articles.length} guides in this hub`
          }
          description="Each article is written for filmmakers preparing materials, reviewing offers, or deciding whether boutique distribution fits the film they actually finished."
        />

        {articles.length === 0 ? (
          <p className="text-sm text-slate">Articles for this hub are coming soon.</p>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {articles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={articlePath(article)}
                  className="group block py-8 no-underline"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {article.status === "draft_outline" ? (
                      <span className="inline-flex border border-warm-metal/50 px-2.5 py-1 text-[0.6rem] tracking-[0.16em] uppercase text-warm-metal">
                        Draft outline
                      </span>
                    ) : null}
                    <span className="text-xs tracking-[0.12em] uppercase text-slate">
                      {article.readingMinutes} min read
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl text-ivory transition-colors group-hover:text-warm-metal md:text-3xl">
                    {article.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate md:text-[0.95rem]">
                    {article.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-12 text-sm leading-relaxed text-slate">
          Looking for the full catalogue? Return to the{" "}
          <Link href="/resources" className="text-silver transition-colors hover:text-ivory">
            resource centre
          </Link>
          , download the{" "}
          <Link href="/checklist" className="text-silver transition-colors hover:text-ivory">
            distribution readiness checklist
          </Link>
          , or{" "}
          <Link href="/submit" className="text-silver transition-colors hover:text-ivory">
            submit a completed film
          </Link>
          .
        </p>
      </Section>

      <SubmissionCTA
        query={{ source: "resources", medium: "hub", campaign: hub.slug }}
      />

      <div className="container-page">
        <NewsletterCTA showForm />
      </div>
    </>
  );
}
