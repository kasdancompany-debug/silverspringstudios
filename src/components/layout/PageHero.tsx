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
    <section className="cine-field film-grain relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
      <div className="container-page relative z-[2] max-w-4xl">
        {eyebrow ? <p className="credit mb-5 text-signal">{eyebrow}</p> : null}
        <h1 className="font-impact text-[clamp(2.75rem,8vw,5rem)] tracking-[0.02em] text-balance text-ivory">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate md:text-lg">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
