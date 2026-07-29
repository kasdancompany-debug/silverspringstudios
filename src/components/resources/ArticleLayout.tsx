import Link from "next/link";
import type { ReactNode } from "react";
import type { ArticleStatus } from "@/lib/resources/articles";
import { ReadingProgress } from "@/components/resources/ReadingProgress";
import { TableOfContents } from "@/components/resources/TableOfContents";
import {
  RelatedArticles,
  type RelatedArticleItem,
} from "@/components/resources/RelatedArticles";
import { SubmissionCTA } from "@/components/resources/SubmissionCTA";
import { NewsletterCTA } from "@/components/resources/NewsletterCTA";
import { cn } from "@/lib/utils";

function formatArticleDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ArticleLayout({
  title,
  description,
  author,
  publishedAt,
  updatedAt,
  status,
  readingMinutes,
  hub,
  sections,
  relatedArticles,
  children,
  submitQuery,
  showNewsletterForm = false,
  className,
}: {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  status: ArticleStatus;
  readingMinutes: number;
  hub: { title: string; href: string };
  sections: Array<{ id: string; heading: string }>;
  relatedArticles: RelatedArticleItem[];
  children: ReactNode;
  submitQuery?: Record<string, string>;
  showNewsletterForm?: boolean;
  className?: string;
}) {
  const isDraft = status === "draft_outline";
  const showUpdated =
    updatedAt && updatedAt !== publishedAt && formatArticleDate(updatedAt) !== formatArticleDate(publishedAt);

  return (
    <article className={cn("bg-ink text-ivory", className)}>
      <ReadingProgress />

      <header className="grain relative border-b border-line pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="container-page relative z-[2] max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-[0.12em] uppercase text-slate">
              <li>
                <Link href="/resources" className="no-underline hover:text-ivory">
                  Resources
                </Link>
              </li>
              <li aria-hidden className="text-slate/40">
                /
              </li>
              <li>
                <Link href={hub.href} className="no-underline hover:text-ivory">
                  {hub.title}
                </Link>
              </li>
            </ol>
          </nav>

          {isDraft ? (
            <p className="mb-5 inline-flex border border-warm-metal/50 px-3 py-1.5 text-[0.65rem] tracking-[0.18em] uppercase text-warm-metal">
              Draft outline
            </p>
          ) : null}

          <h1 className="font-display text-4xl text-balance text-ivory md:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate md:text-lg">{description}</p>

          <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-xs tracking-[0.1em] uppercase text-slate">
            <div className="flex gap-2">
              <dt className="sr-only">Author</dt>
              <dd className="text-silver">{author}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate/60">Published</dt>
              <dd>
                <time dateTime={publishedAt}>{formatArticleDate(publishedAt)}</time>
              </dd>
            </div>
            {showUpdated ? (
              <div className="flex gap-2">
                <dt className="text-slate/60">Updated</dt>
                <dd>
                  <time dateTime={updatedAt}>{formatArticleDate(updatedAt)}</time>
                </dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt className="text-slate/60">Read</dt>
              <dd>{readingMinutes} min</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="container-page py-12 md:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0">{children}</div>
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents sections={sections} />
            </div>
          </aside>
        </div>

        <div className="mt-16 max-w-3xl md:mt-20">
          <RelatedArticles articles={relatedArticles} />
        </div>
      </div>

      <SubmissionCTA query={submitQuery} />

      <div className="container-page">
        <NewsletterCTA showForm={showNewsletterForm} />
      </div>
    </article>
  );
}
