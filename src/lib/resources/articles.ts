import type { Article, ResourceHubSlug } from "./types";
import { ARTICLES_A } from "./content/batch-a";
import { ARTICLES_B } from "./content/batch-b";
import { ARTICLES_C } from "./content/batch-c";

export type {
  Article,
  ArticleSection,
  ArticleStatus,
  ResourceHub,
  ResourceHubSlug,
} from "./types";

export { RESOURCE_HUBS, getHubBySlug } from "./hubs";
export { CHECKLIST_SECTIONS, type ChecklistSection } from "./checklist";

export const ARTICLES: Article[] = [...ARTICLES_A, ...ARTICLES_B, ...ARTICLES_C];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}

export function getArticlesByHub(hub: ResourceHubSlug): Article[] {
  return ARTICLES.filter((article) => article.hub === hub);
}

export function getRelatedArticles(article: Article, limit = 4): Article[] {
  const related = article.relatedSlugs
    .map((slug) => getArticle(slug))
    .filter((item): item is Article => Boolean(item));

  if (related.length >= limit) return related.slice(0, limit);

  const fillers = ARTICLES.filter(
    (candidate) =>
      candidate.slug !== article.slug &&
      !related.some((item) => item.slug === candidate.slug) &&
      (candidate.hub === article.hub || article.relatedSlugs.includes(candidate.slug)),
  );

  return [...related, ...fillers].slice(0, limit);
}

export function getAllArticlePaths(): Array<{ hub: ResourceHubSlug; slug: string }> {
  return ARTICLES.map((article) => ({ hub: article.hub, slug: article.slug }));
}

export function articlePath(article: Pick<Article, "hub" | "slug">): string {
  return `/resources/${article.hub}/${article.slug}`;
}
