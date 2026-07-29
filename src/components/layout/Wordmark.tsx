import Link from "next/link";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  href?: string;
}

export function Wordmark({ className, href = "/" }: WordmarkProps) {
  const content = (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className="font-display text-[1.05rem] tracking-[0.08em] text-ivory md:text-[1.15rem]">
        Silver Spring
      </span>
      <span className="mt-1 font-sans text-[0.62rem] tracking-[0.32em] uppercase text-silver">
        Studios
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="no-underline" aria-label="Silver Spring Studios home">
      {content}
    </Link>
  );
}
