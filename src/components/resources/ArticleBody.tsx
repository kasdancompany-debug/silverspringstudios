import type { ArticleSection } from "@/lib/resources/articles";
import { cn } from "@/lib/utils";

export type { ArticleSection, ArticleStatus } from "@/lib/resources/articles";

export function ArticleBody({
  sections,
  className,
}: {
  sections: ArticleSection[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-14 md:space-y-16", className)}>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="font-display text-3xl text-ivory md:text-[2.15rem]">
            {section.heading}
          </h2>

          <div className="mt-5 space-y-4 text-[0.95rem] leading-[1.8] text-slate md:text-base">
            {section.paragraphs.map((paragraph, index) => (
              <p key={`${section.id}-p-${index}`}>{paragraph}</p>
            ))}
          </div>

          {section.bullets && section.bullets.length > 0 ? (
            <ul className="mt-5 space-y-2.5 border-l border-line pl-5 text-[0.95rem] leading-relaxed text-slate md:text-base">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="pl-1">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}

          {section.callout ? (
            <aside className="mt-8 border-l-2 border-warm-metal/70 bg-surface/60 py-4 pl-5 pr-4">
              <p className="credit mb-2 text-warm-metal">Note</p>
              <p className="text-sm leading-relaxed text-silver md:text-[0.95rem]">
                {section.callout}
              </p>
            </aside>
          ) : null}
        </section>
      ))}
    </div>
  );
}
