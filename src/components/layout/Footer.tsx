import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Wordmark } from "./Wordmark";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/what-we-look-for", label: "What We Look For" },
      { href: "/filmmakers", label: "For Filmmakers" },
      { href: "/resources", label: "Resources" },
      { href: "/checklist", label: "Checklist" },
      { href: "/submit", label: "Submit Your Film" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/our-approach", label: "Our Approach" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Submissions",
    links: [
      { href: "/submission-terms", label: "Submission Terms" },
      { href: "/contact", label: "Acquisitions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm space-y-6">
            <Wordmark />
            <p className="text-sm leading-relaxed text-slate">
              Boutique independent film distribution. Selective partnerships,
              transparent terms, and release support without an upfront invoice
              to the filmmaker.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="text-sm text-silver transition-colors hover:text-ivory"
            >
              {SITE.email}
            </a>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="mb-4 text-xs tracking-[0.18em] uppercase text-warm-metal">
                  {column.title}
                </p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate no-underline transition-colors hover:text-ivory"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="editorial-rule my-12" />

        <div className="flex flex-col gap-4 text-xs text-slate md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Silver Spring Studios. All rights reserved.</p>
          <p className="max-w-xl md:text-right">
            Acceptance is selective. Revenue, platform placement and recoupment
            are never guaranteed. Final terms are governed by each signed
            distribution agreement.
          </p>
        </div>
      </div>
    </footer>
  );
}
