import Link from "next/link";
import { ChecklistCaptureForm } from "@/components/resources/ChecklistCaptureForm";
import { SubmissionCTA } from "@/components/resources/SubmissionCTA";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";
import { CHECKLIST_SECTIONS } from "@/lib/resources/articles";

export const metadata = createMetadata({
  title: "Independent Film Distribution Readiness Checklist",
  description:
    "A free, print-ready checklist covering rights, music, masters, captions, artwork, festival history, and release goals for independent filmmakers preparing digital distribution.",
  path: "/checklist",
});

export default function ChecklistPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Checklist", path: "/checklist" },
        ]}
      />

      <section className="grain relative overflow-hidden border-b border-line bg-ink pt-28 pb-16 md:pt-36 md:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 100% 0%, rgba(73, 90, 80, 0.18) 0%, transparent 60%)",
          }}
        />
        <div className="container-page relative z-[2] max-w-3xl">
          <p className="mb-4 text-xs tracking-[0.22em] uppercase text-warm-metal">
            Free lead magnet
          </p>
          <h1 className="font-display text-4xl text-balance text-ivory md:text-5xl lg:text-6xl">
            The Independent Film Distribution Readiness Checklist
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate md:text-lg">
            Before you submit a screener or open a distribution conversation, walk through the same
            categories an acquisitions team checks: rights, music, cast agreements, masters, audio,
            captions, artwork, trailer, metadata, festival history, press, audience, existing
            licenses, financial obligations, and release goals.
          </p>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-[1.75] text-slate/90">
            This checklist will not get your film accepted. It will surface missing clearances, weak
            deliverables, and mismatched expectations early — when you can still fix them — instead
            of after an offer stalls on paperwork.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="#capture" size="lg">
              Unlock the checklist
            </ButtonLink>
            <ButtonLink href="/checklist/print" variant="secondary" size="lg">
              Preview print version
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section tone="elevated">
        <SectionHeader
          eyebrow="What's inside"
          title="Fifteen sections distributors actually ask about"
          description="Each section lists concrete items — not vague reminders. Use it with your producer, post supervisor, and counsel. Nothing here is legal advice."
        />

        <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKLIST_SECTIONS.map((section, index) => (
            <li
              key={section.id}
              className="border-t border-line py-8 pr-0 sm:pr-8"
            >
              <p className="font-display text-2xl text-warm-metal">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-xl text-ivory md:text-2xl">
                {section.title}
              </h2>
              <p className="mt-2 text-xs tracking-[0.12em] uppercase text-slate">
                {section.items.length} checkpoints
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-slate">
          Prefer to read first? Explore the{" "}
          <Link href="/resources" className="text-silver transition-colors hover:text-ivory">
            resource centre
          </Link>{" "}
          for deeper guides on deliverables, contracts, and recoupment — then return here to audit
          your materials.
        </p>
      </Section>

      <Section id="capture">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Email unlock"
              title="Print it. Work it. Submit when ready."
              description="Enter your details to unlock the print-quality checklist. Open it in your browser, then use Print → Save as PDF. We may send occasional resource updates; unsubscribe anytime."
              className="mb-0"
            />
            <p className="mt-8 text-sm leading-relaxed text-slate">
              Already unlocked? Go straight to the{" "}
              <Link
                href="/checklist/print"
                className="text-silver transition-colors hover:text-ivory"
              >
                print version
              </Link>
              .
            </p>
          </div>
          <ChecklistCaptureForm />
        </div>
      </Section>

      <SubmissionCTA
        query={{ source: "checklist", medium: "cta" }}
        title="Checklist done — ready to submit?"
        description="If your film is finished, rights are clear, and you have a private screener, we welcome a selective review. Completing this checklist first usually means fewer follow-up questions."
      />
    </>
  );
}
