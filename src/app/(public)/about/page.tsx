import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";

export const metadata = createMetadata({
  title: "About",
  description:
    "Silver Spring Studios is a boutique independent film distributor focused on selective partnerships with filmmakers across Canada, the United States and English-language cinema.",
  path: "/about",
});

const principles = [
  {
    title: "Selective, not distant",
    body: "We review completed work carefully and speak directly with filmmakers when a project merits conversation. Access does not mean automatic acceptance—but it does mean a human process.",
  },
  {
    title: "Release is a craft",
    body: "Positioning, key art, trailer editing, metadata and publicity are part of how independent films find audiences. We treat those elements as seriously as acquisition.",
  },
  {
    title: "Transparent economics",
    body: "Filmmakers should understand recoupment, deductions and reporting before they sign—not discover surprises in a statement months later.",
  },
  {
    title: "Honest scope",
    body: "We do not promise platforms we cannot deliver, revenue we cannot predict or acceptance we cannot extend. Our reputation depends on restraint as much as ambition.",
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
        description="A boutique independent distribution and release partner for filmmakers who have finished distinctive work and want more than a upload-and-hope approach."
      />

      <Section tone="elevated">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Our story"
              title="Built for films that deserve a real release"
              description="Silver Spring Studios began with a straightforward observation: many strong independent films finish production with nowhere to go—or with distribution options that ask filmmakers to finance marketing they cannot afford."
            />
            <div className="space-y-5 text-base leading-relaxed text-slate">
              <p>
                We started Silver Spring Studios to occupy a narrower space: selective partnerships
                with completed feature films, documentaries and limited series where professional
                release preparation can meaningfully change outcomes. Not every film needs the same
                campaign. Not every filmmaker wants the same deal. But every filmmaker deserves clarity.
              </p>
              <p>
                Our focus is Canada, the United States and English-language international work with
                clear subtitle and rights pathways. We are small by design—large enough to prepare
                releases thoughtfully, small enough that submissions are read by people who can
                actually respond.
              </p>
              <p>
                We are not a volume aggregator, a festival brand extension or a platform middleman
                pretending to be a distributor. We are an acquisitions-led release partner interested
                in long-term relationships with filmmakers who value craft, audience and honest
                conversation.
              </p>
            </div>
          </div>

          <aside className="border border-line-strong bg-surface p-8 md:p-10">
            <p className="text-xs tracking-[0.18em] uppercase text-warm-metal">At a glance</p>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Focus</dt>
                <dd className="mt-2 text-sm text-ivory">Independent feature films, documentaries, limited series</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Territories</dt>
                <dd className="mt-2 text-sm text-ivory">Canada, United States, English-language international</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Approach</dt>
                <dd className="mt-2 text-sm text-ivory">Selective partnerships with invested release support</dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Core belief</dt>
                <dd className="mt-2 font-display text-xl text-warm-metal">
                  Independent films deserve a real release.
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
              <h3 className="font-display text-xl text-ivory">{item.title}</h3>
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
            <ButtonLink href="/submit">Submit Your Film</ButtonLink>
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
