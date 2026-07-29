import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Section({
  children,
  className,
  id,
  tone = "dark",
  padded = true,
  contained = true,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "dark" | "elevated" | "ivory" | "surface";
  padded?: boolean;
  contained?: boolean;
}) {
  const tones = {
    dark: "bg-ink text-ivory",
    elevated: "bg-surface text-ivory",
    surface: "bg-surface-elevated text-ivory",
    ivory: "bg-ivory text-ink",
  };

  return (
    <section
      id={id}
      className={cn(
        "relative",
        padded && "py-24 md:py-32 lg:py-36",
        tones[tone],
        className,
      )}
    >
      {contained ? (
        <div className="container-page relative z-[2]">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className,
  titleClassName,
  narrow = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
  titleClassName?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-14 md:mb-16",
        narrow ? "max-w-xl" : "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "credit mb-5",
            light ? "text-forest" : "text-warm-metal",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-display text-[2.5rem] text-balance md:text-5xl lg:text-[3.5rem]",
          light ? "text-ink" : "text-ivory",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-6 max-w-2xl text-[0.95rem] leading-[1.7] md:text-base",
            light ? "text-ink/65" : "text-slate",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
