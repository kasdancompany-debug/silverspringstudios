import Link from "next/link";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  href?: string;
  /** Compact mark for dense chrome; full stacked mark by default. */
  size?: "sm" | "md" | "lg";
}

export function Wordmark({ className, href = "/", size = "md" }: WordmarkProps) {
  const sizes = {
    sm: { brand: "text-[1.35rem] tracking-[0.08em]", sub: "text-[0.55rem] tracking-[0.38em]" },
    md: { brand: "text-[1.65rem] tracking-[0.08em] md:text-[1.85rem]", sub: "text-[0.58rem] tracking-[0.42em]" },
    lg: { brand: "text-[2.4rem] tracking-[0.06em] md:text-[3rem]", sub: "text-[0.7rem] tracking-[0.48em]" },
  }[size];

  const content = (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-impact text-ivory", sizes.brand)}>Silver Spring</span>
      <span className={cn("mt-1 font-sans uppercase text-signal", sizes.sub)}>Studios</span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="no-underline" aria-label="Silver Spring Studios home">
      {content}
    </Link>
  );
}
