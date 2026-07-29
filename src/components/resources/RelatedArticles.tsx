import Link from "next/link";
import { cn } from "@/lib/utils";

export type RelatedArticleItem = {
  title: string;
  description: string;
  href: string;
};

export function RelatedArticles({
  articles,
  title = "Related reading",
  className,
}: {
  articles: RelatedArticleItem[];
  title?: string;
  className?: string;
}) {
  if (articles.length === 0) return null;

  return (
    <section className={cn("border-t border-line", className)}>
      <p className="credit pt-10 text-warm-metal">{title}</p>
      <ul className="mt-6 divide-y divide-line">
        {articles.map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="group block py-6 no-underline transition-colors first:pt-0"
            >
              <h3 className="font-display text-2xl text-ivory transition-colors group-hover:text-warm-metal md:text-[1.65rem]">
                {article.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate md:text-[0.95rem]">
                {article.description}
              </p>
              <span className="mt-3 inline-block text-xs tracking-[0.14em] uppercase text-silver transition-colors group-hover:text-ivory">
                Continue reading
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
