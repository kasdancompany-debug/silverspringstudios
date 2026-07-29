"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocSection = {
  id: string;
  heading: string;
};

export function TableOfContents({
  sections,
  className,
}: {
  sections: TocSection[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) return;

    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
          return;
        }

        const above = entries
          .filter((entry) => entry.boundingClientRect.top < 0)
          .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);

        if (above[0]?.target.id) {
          setActiveId(above[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className={cn("space-y-4", className)}>
      <p className="credit text-warm-metal">On this page</p>
      <ol className="space-y-0 border-l border-line">
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  "block border-l-2 py-2 pl-4 text-sm leading-snug no-underline transition-colors",
                  isActive
                    ? "-ml-px border-warm-metal text-ivory"
                    : "border-transparent text-slate hover:text-silver",
                )}
              >
                {section.heading}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
