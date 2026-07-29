import { Suspense } from "react";
import Link from "next/link";
import { Clock, Link2, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { Section } from "@/components/ui/Section";
import { ReferralCapture } from "@/components/submit/ReferralCapture";
import { SubmissionForm } from "@/components/submit/SubmissionForm";
import { sanitizeReferralValue } from "@/lib/referral";

export const metadata = createMetadata({
  title: "Submit Your Film",
  description:
    "Submit your completed independent film to Silver Spring Studios for acquisitions review. A six-step submission covering filmmaker details, film information, rights, materials and release expectations.",
  path: "/submit",
});

function FormFallback() {
  return <div className="py-24 text-center text-sm text-slate">Loading submission form…</div>;
}

const INFO_CARDS = [
  {
    icon: Clock,
    title: "Six focused sections",
    body: "Each step shows an estimated length so you know what to expect. Most filmmakers finish in one sitting — take the time you need.",
  },
  {
    icon: Link2,
    title: "Your progress saves itself",
    body: "Every section autosaves as you go, both on our servers and in this browser. Copy the return link shown in the form to pick up later from any device.",
  },
  {
    icon: ShieldCheck,
    title: "Sensitive details stay private",
    body: "Screener links and passwords are stored securely and are only ever visible to authenticated acquisitions staff — never included in confirmation emails.",
  },
];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function formatPartnerLabel(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function SubmitPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const partner = sanitizeReferralValue(firstParam(params.partner));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Submit", path: "/submit" },
        ]}
      />

      <PageHero
        eyebrow="Submission"
        title="Submit your film"
        description="A calm, six-step process for sharing a completed independent film with our acquisitions team — built so you never lose your place, and never lose your work."
      />

      <Section tone="elevated">
        <div className="mx-auto max-w-3xl space-y-10">
          {partner ? (
            <p className="border border-line-strong bg-surface px-5 py-3 text-sm text-slate">
              Referred via <span className="text-ivory">{formatPartnerLabel(partner)}</span>
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            {INFO_CARDS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="space-y-3 border border-line-strong bg-surface px-5 py-6">
                <Icon className="h-5 w-5 text-warm-metal" aria-hidden="true" />
                <p className="font-display text-base text-ivory">{title}</p>
                <p className="text-xs leading-relaxed text-slate">{body}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 border border-line-strong bg-surface px-6 py-5 text-sm leading-relaxed text-slate md:px-8">
            <p>
              Submitting this form does not create a distribution agreement and does not obligate
              Silver Spring Studios to review, respond to or accept your project. We evaluate
              submissions as capacity allows, and we do not guarantee any release, marketing outcome
              or revenue figure of any kind.
            </p>
            <p>
              Please read our{" "}
              <Link href="/submission-terms" className="text-silver underline underline-offset-4 hover:text-ivory">
                Submission Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-silver underline underline-offset-4 hover:text-ivory">
                Privacy Policy
              </Link>{" "}
              before proceeding.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <ReferralCapture />
          <Suspense fallback={<FormFallback />}>
            <SubmissionForm />
          </Suspense>
        </div>
      </Section>
    </>
  );
}
