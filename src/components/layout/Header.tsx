"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui/ButtonLink";

/** Indie Rights–style primary nav: distribution-first, simple labels. */
const PRIMARY_LINKS = [
  { href: "/filmmakers", label: "Distribution" },
  { href: "/how-it-works", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "bg-void/90 backdrop-blur-md border-b border-line" : "bg-transparent",
      )}
    >
      <div className="container-page flex items-center justify-between py-4 md:py-5">
        <Wordmark size="sm" />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-[0.04em] text-silver no-underline transition-colors hover:text-ivory",
                (pathname === link.href || pathname.startsWith(`${link.href}/`)) && "text-signal",
              )}
            >
              {link.label}
            </Link>
          ))}
          <ButtonLink href="/submit" size="sm" variant="signal">
            Submit Now
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="text-ivory lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-void lg:hidden">
          <nav className="container-page flex flex-col gap-6 py-8" aria-label="Mobile">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-impact text-3xl tracking-[0.04em] text-ivory no-underline"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href="/submit" variant="signal" onClick={() => setOpen(false)}>
              Submit Now
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
