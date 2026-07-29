export type ArticleSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: string;
};

export type ArticleStatus = "draft_outline" | "published";

export type ResourceHubSlug =
  | "film-distribution"
  | "deliverables"
  | "revenue-recoupment"
  | "film-marketing"
  | "distribution-contracts"
  | "filmhub"
  | "festival-to-distribution"
  | "poster-and-trailer"
  | "submission-checklist";

export type Article = {
  slug: string;
  hub: ResourceHubSlug;
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: ArticleStatus;
  readingMinutes: number;
  keywords: string[];
  sections: ArticleSection[];
  relatedSlugs: string[];
};

export type ResourceHub = {
  slug: ResourceHubSlug;
  title: string;
  description: string;
  longDescription: string;
};
