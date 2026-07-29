import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Wordmark } from "./Wordmark";

const footerColumns = [
  {
    title: "Studio",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/filmmakers", label: "For Filmmakers" },
      { href: "/our-approach", label: "Our Approach" },
      { href: "/what-we-look-for", label: "What We Look For" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/checklist", label: "Readiness Checklist" },
      { href: "/resources", label: "Resource Centre" },
      { href: "/submit", label: "Submit Your Film" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/submission-terms", label: "Submission Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-void">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1.6fr] lg:gap-20">
          <div className="max-w-md space-y-8">
            <Wordmark size="md" />
            <p className="font-display text-2xl leading-snug text-ivory md:text-3xl">
              Independent films deserve a real release.
            </p>
            <p className="text-sm leading-relaxed text-slate">
              Boutique distribution for completed features — selective partnerships, invested
              packaging, and transparent economics. No invented catalogue. Building title by title.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-block text-sm text-signal no-underline transition-colors hover:text-flare"
            >
              {SITE.email}
            </a>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p className="credit mb-5 text-signal">{column.title}</p>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-silver no-underline transition-colors hover:text-ivory"
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

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-xs text-slate md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Silver Spring Studios. All rights reserved.</p>
          <p className="max-w-xl md:text-right">
            Submission does not create a distribution agreement. Acceptance, placement and revenue
            are never guaranteed. Final terms are governed by each signed agreement.
          </p>
        </div>
      </div>
    </footer>
  );
}
