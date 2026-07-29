import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";

export const metadata = createMetadata({
  title: "About",
  description:
    "Silver Spring Studios is a boutique digital distributor — packaging and releasing completed independent films for streaming platforms across Canada, the United States and English-language markets.",
  path: "/about",
});

const principles = [
  {
    title: "Selective, not distant",
    body: "We review completed work carefully and speak directly with filmmakers when a project merits conversation. Access does not mean automatic acceptance—but it does mean a human process.",
  },
  {
    title: "Packaging is the product",
    body: "On streaming, the poster and trailer are often the first and only chance a title gets. We treat key art, trailer edit and positioning as core release work — not an afterthought upload.",
  },
  {
    title: "Transparent economics",
    body: "Filmmakers should understand recoupment, deductions and reporting before they sign—not discover surprises in a statement months later.",
  },
  {
    title: "Honest scope",
    body: "We do digital and streaming releases. We do not promise theatrical runs, homepage placement we cannot deliver, or revenue we cannot predict.",
  },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <PageHero
        eyebrow="Company"
        title="About Silver Spring Studios"
        description="A selective digital distribution partner for filmmakers who have finished a film and want it packaged properly for streaming — not dumped into a queue looking unfinished."
      />

      <Section tone="elevated">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Our story"
              title="Built for streaming releases that look intentional"
              description="Silver Spring Studios started from a practical problem: many strong independent films finish production and then land on platforms with weak key art, thin trailers and no clear positioning — or get asked to finance marketing they cannot afford."
            />
            <div className="space-y-5 text-base leading-relaxed text-slate">
              <p>
                We occupy a narrow space: selective partnerships with completed features,
                documentaries and limited series for digital and streaming release. We invest in
                packaging — poster and trailer/publicity support — and recover that investment from
                film receipts, not from an upfront invoice to the filmmaker.
              </p>
              <p>
                Our focus is Canada, the United States and English-language international work with
                clear subtitle and rights pathways. We are small by design — large enough to prepare
                releases carefully, small enough that submissions are read by people who can respond.
              </p>
              <p>
                We are not a theatrical distributor, a volume aggregator or a festival brand
                extension. We are an acquisitions-led digital release partner for filmmakers who
                value clarity, packaging craft and honest expectations.
              </p>
            </div>
          </div>

          <aside className="border border-line-strong bg-surface p-8 md:p-10">
            <p className="credit text-signal">At a glance</p>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Focus</dt>
                <dd className="mt-2 text-sm text-ivory">Streaming & digital release for completed features, docs, limited series</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Territories</dt>
                <dd className="mt-2 text-sm text-ivory">Canada, United States, English-language international</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Approach</dt>
                <dd className="mt-2 text-sm text-ivory">Selective partnerships with invested packaging support</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Core offer</dt>
                <dd className="mt-2 font-display text-xl text-signal">
                  Streaming releases with real packaging.
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Principles"
          title="How we work with filmmakers"
          description="These principles guide how we review submissions, structure agreements and communicate throughout a release."
        />

        <div className="grid gap-10 md:grid-cols-2">
          {principles.map((item) => (
            <article key={item.title} className="border-t border-line-strong pt-8">
              <h3 className="font-impact text-2xl tracking-[0.03em] text-ivory">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="ivory">
        <div className="max-w-2xl">
          <SectionHeader
            light
            eyebrow="Acquisitions"
            title="We are currently reviewing completed films"
            description="If you believe your project aligns with our focus and you can speak clearly about rights and audience, we welcome your submission."
          />
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/submit" variant="signal">Submit Your Film</ButtonLink>
            <ButtonLink href="/contact" variant="secondary" className="border-ink/20 text-ink hover:border-ink">
              Contact Us
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-ink/60">
            Curious how we actually work?{" "}
            <Link
              href="/our-approach"
              className="text-ink underline underline-offset-4 transition-colors hover:text-ink/70"
            >
              Read our approach
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
