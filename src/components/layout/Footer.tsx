import Link from "next/link";
import { SITE } from "@/lib/constants";
import { Wordmark } from "./Wordmark";

const footerColumns = [
  {
    title: "Company",
    links: [
      { href: "/filmmakers", label: "Distribution" },
      { href: "/how-it-works", label: "Process" },
      { href: "/about", label: "About" },
      { href: "/what-we-look-for", label: "What We Look For" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Filmmakers",
    links: [
      { href: "/submit", label: "Submit Now" },
      { href: "/checklist", label: "Checklist" },
      { href: "/resources", label: "Resources" },
      { href: "/our-approach", label: "Our Approach" },
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
          <div className="max-w-md space-y-6">
            <Wordmark size="md" />
            <p className="text-base leading-relaxed text-silver">
              Independent film distribution for digital and streaming audiences — with a personal
              approach to packaging and release.
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
                <p className="mb-5 text-xs tracking-[0.18em] uppercase text-signal">{column.title}</p>
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
            Submission does not create a distribution agreement. Acceptance and platform placement
            are never guaranteed.
          </p>
        </div>
      </div>
    </footer>
  );
}
