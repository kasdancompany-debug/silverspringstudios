import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { getPartnerBySlug, listPublishedPartners } from "@/lib/partners/data";
import { SITE } from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await listPublishedPartners();
  return data.map((partner) => ({ slug: partner.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: partner } = await getPartnerBySlug(slug);
  if (!partner || !partner.is_published) {
    return { title: "Partner" };
  }
  return createMetadata({
    title: partner.partner_name,
    description: partner.headline ?? partner.introduction ?? `${partner.partner_name} — Silver Spring Studios partner page.`,
    path: `/partners/${partner.slug}`,
  });
}

export default async function PartnerPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: partner } = await getPartnerBySlug(slug);

  if (!partner || !partner.is_published) {
    notFound();
  }

  const source = partner.tracking_source || partner.slug;
  const medium = partner.tracking_medium || "partner";
  const campaign = partner.tracking_campaign || partner.slug;
  const submitHref = `/submit?partner=${encodeURIComponent(partner.slug)}&source=${encodeURIComponent(source)}&medium=${encodeURIComponent(medium)}&campaign=${encodeURIComponent(campaign)}`;
  const checklistHref = partner.resource_download_slug
    ? `/checklist?partner=${encodeURIComponent(partner.slug)}`
    : "/checklist";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Partners", path: "/partners" },
          { name: partner.partner_name, path: `/partners/${partner.slug}` },
        ]}
      />

      <PageHero
        eyebrow="Partner"
        title={partner.partner_name}
        description={partner.headline ?? undefined}
      >
        <p className="mt-4 text-xs tracking-[0.18em] text-warm-metal uppercase">
          {partner.partner_type.replace(/_/g, " ")}
        </p>
      </PageHero>

      <Section tone="elevated">
        <div className="mx-auto max-w-3xl space-y-12">
          {partner.introduction ? (
            <div className="space-y-3">
              <h2 className="font-display text-2xl text-ivory">Introduction</h2>
              <p className="text-base leading-relaxed text-slate whitespace-pre-line">{partner.introduction}</p>
            </div>
          ) : null}

          {partner.seeking ? (
            <div className="space-y-3">
              <h2 className="font-display text-2xl text-ivory">What we are seeking</h2>
              <p className="text-base leading-relaxed text-slate whitespace-pre-line">{partner.seeking}</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 border border-line-strong bg-surface px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="font-display text-xl text-ivory">Ready to share a finished film?</p>
              <p className="text-sm text-slate">
                Your submission will be attributed to {partner.partner_name}.
              </p>
            </div>
            <ButtonLink href={submitHref} variant="primary">
              {partner.submission_cta_label || "Submit your film"}
            </ButtonLink>
          </div>

          <div className="space-y-3 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ivory">Preparation checklist</h2>
            <p className="text-sm leading-relaxed text-slate">
              Download or review our distribution readiness checklist before you submit.
            </p>
            <ButtonLink href={checklistHref} variant="secondary" size="sm">
              Open checklist
            </ButtonLink>
          </div>

          <div className="space-y-3 border-t border-line pt-10">
            <h2 className="font-display text-2xl text-ivory">Partner contact</h2>
            <p className="text-sm leading-relaxed text-slate">
              {partner.contact_note ??
                "Questions about this partnership can be directed to our acquisitions desk."}
            </p>
            <a
              href={`mailto:${partner.contact_email || SITE.email}`}
              className="text-sm text-silver underline underline-offset-4 hover:text-ivory"
            >
              {partner.contact_email || SITE.email}
            </a>
            <p className="pt-4 text-xs text-slate">
              Prefer the general site?{" "}
              <Link href="/submit" className="text-silver underline underline-offset-4 hover:text-ivory">
                Submit without partner tracking
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
