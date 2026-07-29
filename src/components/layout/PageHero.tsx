import { ReactNode } from "react";
import Image from "next/image";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  imageSrc = "/brand/cta.jpg",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  imageSrc?: string;
}) {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="absolute inset-0">
        <Image src={imageSrc} alt="" fill priority sizes="100vw" className="object-cover" />
        <div aria-hidden className="media-scrim absolute inset-0" />
      </div>
      <div className="container-page relative z-[2] max-w-4xl">
        {eyebrow ? <p className="credit mb-5 text-signal">{eyebrow}</p> : null}
        <h1 className="font-impact text-[clamp(2.75rem,9vw,5.5rem)] tracking-[0.01em] text-balance text-ivory">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-silver md:text-lg">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
