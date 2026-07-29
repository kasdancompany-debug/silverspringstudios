"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="container-page flex items-center justify-between py-6 md:py-8">
        <Wordmark />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "credit no-underline transition-colors",
                pathname === link.href ? "text-ivory" : "text-slate hover:text-ivory",
              )}
            >
              {link.label}
            </Link>
          ))}
          <ButtonLink href="/submit" size="sm">
            Submit Your Film
          </ButtonLink>
        </nav>

        <button
          type="button"
          className="lg:hidden text-ivory"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-line bg-ink/95 backdrop-blur-md lg:hidden"
        >
          <nav className="container-page flex flex-col gap-5 py-8" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="credit no-underline text-ivory"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink href="/submit" onClick={() => setOpen(false)}>
              Submit Your Film
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
