import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/resources/ArticleBody";
import { ArticleLayout } from "@/components/resources/ArticleLayout";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import {
  articlePath,
  getAllArticlePaths,
  getArticle,
  getHubBySlug,
  getRelatedArticles,
} from "@/lib/resources/articles";

type PageProps = {
  params: Promise<{ hub: string; slug: string }>;
};

export function generateStaticParams() {
  return getAllArticlePaths();
}

export async function generateMetadata({ params }: PageProps) {
  const { hub: hubSlug, slug } = await params;
  const article = getArticle(slug);

  if (!article || article.hub !== hubSlug) {
    return createMetadata({
      title: "Article",
      description: "Silver Spring Studios resource article.",
      path: `/resources/${hubSlug}/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: article.title,
    description: article.description,
    path: articlePath(article),
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    // Draft outlines are educational scaffolding — keep them discoverable
    // on the site, but do not present them as finished indexed articles.
    noIndex: article.status === "draft_outline",
  });
}

export default async function ResourceArticlePage({ params }: PageProps) {
  const { hub: hubSlug, slug } = await params;
  const article = getArticle(slug);

  if (!article || article.hub !== hubSlug) {
    notFound();
  }

  const hub = getHubBySlug(article.hub);
  if (!hub) {
    notFound();
  }

  const path = articlePath(article);
  const related = getRelatedArticles(article).map((item) => ({
    title: item.title,
    description: item.description,
    href: articlePath(item),
  }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: hub.title, path: `/resources/${hub.slug}` },
          { name: article.title, path },
        ]}
      />

      <ArticleJsonLd
        headline={article.title}
        description={article.description}
        author={article.author}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        path={path}
      />

      <ArticleLayout
        title={article.title}
        description={article.description}
        author={article.author}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        status={article.status}
        readingMinutes={article.readingMinutes}
        hub={{ title: hub.title, href: `/resources/${hub.slug}` }}
        sections={article.sections.map((section) => ({
          id: section.id,
          heading: section.heading,
        }))}
        relatedArticles={related}
        submitQuery={{
          source: "resources",
          medium: "article",
          campaign: article.slug,
        }}
        showNewsletterForm
      >
        <ArticleBody sections={article.sections} />
      </ArticleLayout>
    </>
  );
}
