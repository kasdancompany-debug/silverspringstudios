import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section, SectionHeader } from "@/components/ui/Section";
import { FoundingSlateSignup } from "@/components/approach/FoundingSlateSignup";
import { RELEASE_INVESTMENT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export const metadata = createMetadata({
  title: "Our Approach",
  description:
    "How a new digital distributor works: selective acquisition, streaming-ready packaging, and transparent economics — presented honestly, without a manufactured track record.",
  path: "/our-approach",
});

const founderDisciplines = [
  {
    title: "Positioning and audience framing",
    body: "The founding practice starts with who a film is actually for, and how to say that clearly before a single dollar is spent on marketing.",
  },
  {
    title: "Key art and design direction",
    body: "We treat the poster, thumbnail and still as first-contact objects—studying what independent films get right and wrong when strangers decide whether to click.",
  },
  {
    title: "Trailer structure and editing",
    body: "Trailer craft is part of how we evaluate and prepare titles: pacing, reveal and restraint, and whether the cut matches the film a distributor can honestly sell.",
  },
  {
    title: "Release sequencing and publicity groundwork",
    body: "Announcements, press outreach and platform conversations are planned as a sequence across a release window—not compressed into a single launch day.",
  },
];

const acquisitionSteps = [
  {
    title: "Completed work only",
    body: "We review finished films—not scripts, pitches or works-in-progress. A completed film is the only way to honestly assess craft, audience fit and rights readiness.",
  },
  {
    title: "A real screener, watched in full",
    body: "Submissions that advance past initial screening are reviewed with a full screener watch whenever capacity allows. We do not make serious decisions from a logline and a trailer alone.",
  },
  {
    title: "Rights and delivery checked early",
    body: "Chain-of-title, music clearances and technical deliverability are assessed before any conversation about terms, so filmmakers aren't surprised later.",
  },
  {
    title: "A direct conversation, not a form letter",
    body: "When a film merits it, we talk to the filmmaker directly about positioning, audience and realistic expectations before any offer is discussed.",
  },
];

const releasePlanningSteps = [
  {
    title: "Audience-first positioning",
    body: "Before key art or a trailer cut begins, we define who the film is for and what will make that audience pay attention. Everything downstream follows from that answer.",
  },
  {
    title: "Key art shaped for digital release contexts",
    body: "Poster and thumbnail treatments are designed for the digital contexts a given release can realistically target — never as proof of a promised platform placement.",
  },
  {
    title: "A trailer that sells the film it is, not the film we wish it were",
    body: "Trailer editing is treated as a craft discipline—structured to represent the film honestly while giving it the strongest possible opening impression.",
  },
  {
    title: "A publicity and outreach sequence with a timeline",
    body: "Announcements, press materials and platform conversations are planned against a release calendar, not scattered reactively after the fact.",
  },
];

const publishCommitments = [
  "Release announcements",
  "Filmmaker interviews",
  "Campaign case studies",
  "Platform availability",
  "Reporting benchmarks",
  "Lessons from completed releases",
];

export default function OurApproachPage() {
  const exampleReceipts = 10_000;
  const remaining = exampleReceipts - RELEASE_INVESTMENT.total;
  const filmmakerShare = Math.round(
    remaining * (RELEASE_INVESTMENT.filmmakerSharePercent / 100),
  );
  const studioShare = remaining - filmmakerShare;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Our Approach", path: "/our-approach" },
        ]}
      />

      <PageHero
        eyebrow="Our Approach"
        title="Digital releases, packaged with intent"
        description="Silver Spring Studios is a young company. We don't have a decade of titles to point to, and we won't pretend otherwise. What we have is a clear offer: selective streaming and digital releases with poster, trailer and positioning treated as part of the job — not an afterthought upload."
      />

      <Section tone="elevated">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Why we exist"
              title="Finished films still look unfinished online"
              description="Too many capable independent films reach streaming with weak key art, a rushed trailer and no clear positioning — not because the film failed, but because the packaging did."
            />
            <div className="space-y-5 text-base leading-relaxed text-slate">
              <p>
                On platforms, the poster and trailer often decide whether anyone presses play. We
                built Silver Spring Studios to invest in that packaging for selected titles — then
                recover the cost from the film&apos;s own receipts, not from an upfront invoice to
                the filmmaker.
              </p>
              <p>
                Filmmakers are often offered a self-serve upload with no campaign, or a boutique
                deal that asks them to pay for marketing upfront. We occupy a different space:
                selective digital distribution, invested packaging, transparent recoupment, and
                honest limits about what streaming can and cannot promise.
              </p>
            </div>
          </div>

          <aside className="border border-line-strong bg-surface p-8 md:p-10">
            <p className="text-xs tracking-[0.18em] uppercase text-warm-metal">Where we stand today</p>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">Company stage</dt>
                <dd className="mt-2 text-sm text-ivory">
                  New and building our founding slate—not an established catalogue
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">What that means for you</dt>
                <dd className="mt-2 text-sm text-ivory">
                  Direct access, closer attention per title, and a company with real incentive to
                  make each early release work
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-[0.12em] uppercase text-slate">What we won&apos;t do</dt>
                <dd className="mt-2 text-sm text-ivory">
                  Invent a track record, guarantee placement, or promise revenue we can&apos;t
                  control
                </dd>
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
          eyebrow="Founder craft"
          title="Built on disciplines, not a highlight reel"
          description="Rather than list film titles or platform names, here is what the person building this company has actually spent time getting good at. These are working disciplines that shape how every release is planned—regardless of how new the company is."
        />
        <div className="grid gap-10 md:grid-cols-2">
          {founderDisciplines.map((item) => (
            <article key={item.title} className="border-t border-line-strong pt-8">
              <h3 className="font-display text-xl text-ivory">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate">{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="ivory">
        <div className="max-w-3xl">
          <p className="credit text-forest">What we believe</p>
          <h2 className="mt-5 font-display text-[2.5rem] text-ink text-balance md:text-5xl">
            Most independent films aren&apos;t undersold because they&apos;re weak. They&apos;re
            undersold because the release was.
          </h2>
          <p className="mt-6 max-w-2xl text-[0.95rem] leading-[1.75] text-ink/65">
            A film can be well-shot, well-acted and genuinely distinctive, and still underperform
            because its key art doesn&apos;t say anything, its trailer buries the hook, or nobody
            has clearly defined who the audience actually is. Packaging and audience positioning
            aren&apos;t decoration after the film is finished—they&apos;re the last part of making
            the film findable. That belief is the reason this company exists.
          </p>
        </div>
      </Section>

      <Section tone="elevated">
        <SectionHeader
          eyebrow="Acquisition"
          title="A selective, human review process"
          description="We are not trying to acquire volume. A small, deliberately chosen slate is what allows the attention described above to be real rather than aspirational."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {acquisitionSteps.map((item, index) => (
            <div key={item.title} className="flex gap-4 border-t border-line-strong pt-6">
              <span className="font-display text-lg text-warm-metal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-lg text-ivory">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Release method"
          title="How we plan a release"
          description="Every accepted film goes through the same sequence of positioning decisions before campaign assets are built. The order matters: audience thinking comes before design, and design comes before publicity."
        />
        <ol className="space-y-8">
          {releasePlanningSteps.map((item, index) => (
            <li key={item.title} className="flex gap-6 border-t border-line-strong pt-6">
              <span className="font-display text-2xl text-warm-metal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-xl text-ivory">{item.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="ivory">
        <SectionHeader
          light
          eyebrow="Economics"
          title="A transparent way to think about revenue"
          description="We would rather a filmmaker understand the structure fully before signing than discover it later in a statement. The figures below are illustrative, not a promise of what any specific film will earn."
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5 text-[0.95rem] leading-[1.75] text-ink/70">
            <p>
              For our standard offer, Silver Spring Studios may invest up to{" "}
              {formatCurrency(RELEASE_INVESTMENT.total)} in release preparation—typically{" "}
              {formatCurrency(RELEASE_INVESTMENT.posterDesign)} toward poster design and{" "}
              {formatCurrency(RELEASE_INVESTMENT.trailerAndPublicity)} toward trailer editing and
              publicity support. This is an investment we make, not a fee invoiced to the
              filmmaker personally.
            </p>
            <p>
              That release investment is recouped from the film&apos;s own receipts before any
              further split occurs. Once recouped, distributable receipts are typically shared{" "}
              {RELEASE_INVESTMENT.filmmakerSharePercent}% to the filmmaker and{" "}
              {RELEASE_INVESTMENT.studioSharePercent}% to Silver Spring Studios—always subject to
              the signed distribution agreement, which governs the actual terms, territories and
              reporting cadence for a given film.
            </p>
            <p className="text-ink/55">
              We use the terms &ldquo;net receipts&rdquo; and &ldquo;distributable receipts&rdquo;
              deliberately, and never &ldquo;profit.&rdquo; No revenue, recoupment or platform
              placement is guaranteed, and a title may never generate enough receipts to recoup
              the agreed release investment.
            </p>
          </div>

          <div className="border border-line-ink-strong bg-ivory p-8">
            <p className="text-xs tracking-[0.18em] uppercase text-forest">
              Illustrative example only · Not a forecast
            </p>
            <p className="mt-4 font-display text-2xl text-ink md:text-3xl">
              A film generates {formatCurrency(exampleReceipts)} in net receipts
            </p>
            <ol className="mt-8 space-y-6">
              <li className="flex gap-4 border-t border-ink/10 pt-6">
                <span className="text-forest">1</span>
                <p className="text-sm text-ink/80">
                  {formatCurrency(RELEASE_INVESTMENT.total)} recoups the agreed release investment
                </p>
              </li>
              <li className="flex gap-4 border-t border-ink/10 pt-6">
                <span className="text-forest">2</span>
                <p className="text-sm text-ink/80">
                  {formatCurrency(remaining)} remains as distributable receipts
                </p>
              </li>
              <li className="flex gap-4 border-t border-ink/10 pt-6">
                <span className="text-forest">3</span>
                <div className="space-y-2">
                  <p className="text-sm text-ink/80">
                    Filmmaker receives {RELEASE_INVESTMENT.filmmakerSharePercent}%:{" "}
                    {formatCurrency(filmmakerShare)}
                  </p>
                  <p className="text-sm text-ink/60">
                    Silver Spring Studios receives {RELEASE_INVESTMENT.studioSharePercent}%:{" "}
                    {formatCurrency(studioShare)}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </Section>

      <Section tone="elevated">
        <div className="max-w-3xl">
          <SectionHeader
            eyebrow="Honest expectations"
            title="We would rather have a frank conversation than an easy yes"
            description="Part of a selective process is being willing to say plainly what a film's commercial prospects look like, even when that isn't what a filmmaker hopes to hear."
          />
          <div className="space-y-5 text-base leading-relaxed text-slate">
            <p>
              If we take on a film, we will tell you what we genuinely believe about its audience,
              its likely reach and the realistic range of outcomes—not an inflated pitch designed
              to win the submission. We do not guarantee acceptance, platform placement, or any
              specific level of revenue, and we will not tell a filmmaker otherwise to make a
              conversation more comfortable.
            </p>
            <p>
              We would rather decline a film honestly, or accept it with clear-eyed expectations,
              than build a relationship on promises we cannot keep. That is true today, while we
              are building our first releases, and it will remain true as the slate grows.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="Growing in public"
          title="What we will publish as the slate grows"
          description="As we move from a founding slate to a body of completed releases, we intend to share the real evidence of that work publicly—not curated highlights, but the ordinary record of what we're doing."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishCommitments.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 border-t border-line-strong pt-5 text-sm text-ivory"
            >
              <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-warm-metal" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section id="founding-slate" tone="surface">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="credit text-signal">Founding Slate</p>
            <h2 className="mt-5 font-impact text-[clamp(2rem,5vw,3.25rem)] tracking-[0.02em] text-ivory text-balance">
              Building our founding slate
            </h2>
            <p className="mt-6 max-w-md text-[0.95rem] leading-[1.75] text-slate">
              Silver Spring Studios is currently building its founding slate. Early partners
              should expect direct access, detailed release conversations and a company actively
              building its reputation title by title.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink
                href="/submit?source=founding-slate&medium=our-approach&campaign=founding-slate"
                variant="secondary"
              >
                Submit Your Film
              </ButtonLink>
            </div>
          </div>

          <FoundingSlateSignup />
        </div>
      </Section>
    </>
  );
}
