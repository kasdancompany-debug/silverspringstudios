import Link from "next/link";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "signal";
type Size = "sm" | "md" | "lg";

export interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary: "bg-ivory text-ink hover:bg-chalk border border-transparent",
  signal: "bg-signal text-ink hover:bg-flare border border-transparent",
  secondary:
    "bg-transparent text-ivory border border-line-strong hover:border-signal hover:text-signal",
  ghost: "bg-transparent text-slate hover:text-ivory border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.7rem] tracking-[0.18em] uppercase",
  md: "px-5 py-3 text-[0.72rem] tracking-[0.2em] uppercase",
  lg: "px-7 py-4 text-[0.78rem] tracking-[0.22em] uppercase",
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans font-semibold no-underline transition-colors duration-300",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
