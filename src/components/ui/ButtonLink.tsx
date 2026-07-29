import Link from "next/link";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-ivory text-ink hover:bg-warm-metal border border-transparent",
  secondary:
    "bg-transparent text-ivory border border-line-strong hover:border-silver",
  ghost: "bg-transparent text-slate hover:text-ivory border border-transparent",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-xs tracking-[0.12em] uppercase",
  md: "px-5 py-3 text-xs tracking-[0.14em] uppercase",
  lg: "px-6 py-3.5 text-sm tracking-[0.14em] uppercase",
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
        "inline-flex items-center justify-center gap-2 font-sans no-underline transition-colors duration-300",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
