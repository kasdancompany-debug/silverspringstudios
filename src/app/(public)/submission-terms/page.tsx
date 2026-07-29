import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Submission Terms",
  description:
    "Operational submission terms for filmmakers submitting completed films to Silver Spring Studios for acquisition review.",
  path: "/submission-terms",
  noIndex: true,
});

function LegalDraftBanner() {
  return (
    <div
      className="mb-10 border border-warm-metal/40 bg-warm-metal/10 px-5 py-4 text-sm text-warm-metal"
      role="note"
    >
      <strong>Draft — legal review required before launch.</strong> These submission terms are
      provided for operational transparency during development. They are not a substitute for
      counsel-reviewed agreements and must be finalized before public launch.
    </div>
  );
}

export default function SubmissionTermsPage() {
  const effectiveDate = "July 28, 2026";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Submission Terms", path: "/submission-terms" },
        ]}
      />

      <PageHero
        eyebrow="Legal"
        title="Submission terms"
        description="Operational terms governing film submissions to Silver Spring Studios. Submitting materials does not create a distribution agreement."
      />

      <Section tone="elevated">
        <div className="mx-auto max-w-3xl">
          <LegalDraftBanner />

          <article className="space-y-10 text-sm leading-relaxed text-slate">
            <p>Effective date: {effectiveDate}</p>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Purpose</h2>
              <p>
                These draft submission terms explain how Silver Spring Studios handles unsolicited
                and invited film submissions made through our website or directed to our acquisitions
                team. They are intended to set expectations before you submit a project for review.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">No agreement created by submission</h2>
              <p>
                Submitting a film, screener, materials or related information does not create a
                distribution agreement, agency relationship, partnership, joint venture or employment
                relationship. Any release arrangement requires a separate written agreement signed by
                authorized parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">No obligation to review or accept</h2>
              <p>
                Silver Spring Studios is not obligated to review, respond to, accept, negotiate with
                or provide feedback on any submission. We may decline submissions for any reason,
                including fit, timing, rights complexity, capacity or commercial assessment. Silence
                should not be interpreted as interest or acceptance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Authority to submit</h2>
              <p>
                By submitting, you represent that you have the authority to share the submitted
                materials and information on behalf of yourself and, where applicable, the rights
                holders of the project. You are responsible for ensuring that your submission does
                not violate any third-party agreement, embargo, festival rule or legal restriction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Accuracy of information</h2>
              <p>
                You agree that information provided in the submission is accurate to the best of your
                knowledge. Material misrepresentation may result in rejection or termination of
                discussions.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">No confidentiality from submission alone</h2>
              <p>
                Submitting materials does not create a confidential relationship, non-disclosure
                obligation or fiduciary duty solely because of the submission. If confidential
                treatment is required, it must be established through a separate written agreement
                signed by authorized representatives before sensitive materials are shared.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Similar projects may exist</h2>
              <p>
                Silver Spring Studios may already be developing, reviewing, distributing or
                considering projects with similar themes, genres, formats, titles or concepts.
                Submission does not prevent us from pursuing such projects independently.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Use of submitted materials and data</h2>
              <p>We may use submitted information and materials to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Evaluate the project for potential acquisition or release</li>
                <li>Communicate with you and your representatives about the submission</li>
                <li>Maintain internal acquisition records and status history</li>
                <li>Improve our submission systems and security controls</li>
                <li>Comply with legal obligations and enforce our policies</li>
              </ul>
              <p>
                Personal information is handled according to our{" "}
                <Link href="/privacy" className="text-silver hover:text-ivory">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">No guarantee of security</h2>
              <p>
                We use reasonable measures to protect submissions, but no online transmission or
                storage system is completely secure. You submit materials at your own risk unless a
                separate security arrangement is agreed in writing.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Third-party links and screeners</h2>
              <p>
                If you provide links to third-party hosting, Vimeo, Dropbox or similar services,
                you are responsible for access controls, passwords and takedown timing. We are not
                responsible for third-party platform outages, unauthorized access on those platforms
                or expired links.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">No revenue or placement promises</h2>
              <p>
                Discussions arising from a submission do not guarantee acceptance, distribution,
                platform placement, publicity, reviews, revenue or recoupment. Illustrative financial
                examples on our website are not offers and are not binding.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Retention and deletion</h2>
              <p>
                We may retain submissions and related correspondence for evaluation, recordkeeping
                and legal purposes. Retention and deletion requests will be handled according to
                applicable law and our final privacy policy.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Withdrawal</h2>
              <p>
                You may request withdrawal of a submission by contacting{" "}
                <a href={`mailto:${SITE.email}`} className="text-silver hover:text-ivory">
                  {SITE.email}
                </a>
                . Withdrawal may not require deletion where retention is permitted or required by law
                or where materials were already reviewed or shared internally.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Governing documents</h2>
              <p>
                These submission terms supplement our{" "}
                <Link href="/terms" className="text-silver hover:text-ivory">
                  Website Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-silver hover:text-ivory">
                  Privacy Policy
                </Link>
                . If a signed distribution agreement is executed, that agreement controls the
                release relationship.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Changes</h2>
              <p>
                We may update these submission terms by posting a revised version on this page.
                Submissions made after the effective date of a revision are subject to the updated
                terms unless otherwise stated.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Contact</h2>
              <p>
                Questions about these draft submission terms may be directed to{" "}
                <a href={`mailto:${SITE.email}`} className="text-silver hover:text-ivory">
                  {SITE.email}
                </a>
                .
              </p>
            </section>
          </article>
        </div>
      </Section>
    </>
  );
}
