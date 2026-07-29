import Link from "next/link";
import { PrintChecklistButton } from "@/components/resources/PrintChecklistButton";
import { createMetadata } from "@/components/seo/metadata";
import { SITE } from "@/lib/constants";
import { CHECKLIST_SECTIONS } from "@/lib/resources/articles";

export const metadata = createMetadata({
  title: "Distribution Readiness Checklist — Print",
  description:
    "Print-quality Independent Film Distribution Readiness Checklist from Silver Spring Studios.",
  path: "/checklist/print",
  noIndex: true,
});

const printedDate = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function ChecklistPrintPage() {
  return (
    <div className="checklist-print bg-ivory text-ink">
      <style>{`
        @media print {
          header, footer, nav, .site-chrome-hide {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .checklist-print {
            background: white !important;
            color: #111 !important;
          }
          .checklist-print a {
            color: inherit !important;
            text-decoration: none !important;
          }
          .no-print {
            display: none !important;
          }
          .checklist-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .checklist-item {
            break-inside: avoid;
          }
          @page {
            margin: 0.75in;
          }
        }
      `}</style>

      <div className="no-print border-b border-black/10 bg-ink px-4 pb-4 pt-24 text-ivory print:hidden md:pt-28">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate">
            Use your browser&apos;s Print dialog and choose &ldquo;Save as PDF.&rdquo;
          </p>
          <div className="flex flex-wrap gap-3">
            <PrintChecklistButton />
            <Link
              href="/checklist"
              className="border border-line px-4 py-2 text-xs tracking-[0.14em] uppercase text-silver no-underline transition-colors hover:text-ivory"
            >
              Back to checklist
            </Link>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
        <header className="border-b border-black/15 pb-8">
          <p className="text-[0.65rem] tracking-[0.22em] uppercase text-black/55">
            {SITE.name}
          </p>
          <h1 className="mt-4 font-display text-3xl leading-tight text-balance text-ink md:text-4xl">
            The Independent Film Distribution Readiness Checklist
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-black/70">
            A working audit for completed independent films preparing digital distribution.
            Printed {printedDate}.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-black/55">
            This checklist is educational only. It is not legal advice, does not create a
            distribution relationship, and does not guarantee acceptance, platform placement, or
            revenue. Consult qualified counsel for rights, contracts, and clearance questions.
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {CHECKLIST_SECTIONS.map((section, index) => (
            <section key={section.id} className="checklist-section">
              <h2 className="font-display text-xl text-ink md:text-2xl">
                <span className="mr-2 text-black/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {section.items.map((item) => (
                  <li key={item} className="checklist-item flex gap-3 text-sm leading-relaxed">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-block size-4 shrink-0 border border-black/40"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="mt-14 border-t border-black/15 pt-8 text-xs leading-relaxed text-black/55">
          <p>
            Prepared by {SITE.name}. For educational resources, visit{" "}
            <span className="text-ink">{SITE.url}/resources</span>. For completed-film submissions,{" "}
            <span className="text-ink">{SITE.url}/submit</span>.
          </p>
          <p className="mt-3">
            Not legal advice. Filmmakers remain responsible for the accuracy of materials and the
            clearance of rights delivered to any distributor or aggregator.
          </p>
        </footer>
      </article>
    </div>
  );
}
