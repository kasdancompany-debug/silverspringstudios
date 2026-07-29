import { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="grain relative bg-ink pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="container-page relative z-[2] max-w-3xl">
        {eyebrow ? (
          <p className="mb-4 text-xs tracking-[0.22em] uppercase text-warm-metal">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-4xl text-balance text-ivory md:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 text-base leading-relaxed text-slate md:text-lg">{description}</p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
