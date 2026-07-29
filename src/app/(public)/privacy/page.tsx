import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "Privacy policy for Silver Spring Studios website visitors and film submission contacts.",
  path: "/privacy",
  noIndex: true,
});

function LegalDraftBanner() {
  return (
    <div
      className="mb-10 border border-warm-metal/40 bg-warm-metal/10 px-5 py-4 text-sm text-warm-metal"
      role="note"
    >
      <strong>Draft — legal review required.</strong> This privacy policy is an operational draft
      prepared for website launch and must be reviewed by qualified legal counsel before production
      use.
    </div>
  );
}

export default function PrivacyPage() {
  const effectiveDate = "July 28, 2026";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy Policy", path: "/privacy" },
        ]}
      />

      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        description="How Silver Spring Studios collects, uses and protects information submitted through this website."
      />

      <Section tone="elevated">
        <div className="mx-auto max-w-3xl">
          <LegalDraftBanner />

          <article className="prose-legal space-y-10 text-sm leading-relaxed text-slate">
            <p className="text-slate">Effective date: {effectiveDate}</p>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Overview</h2>
              <p>
                Silver Spring Studios (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;)
                operates {SITE.url} and related acquisition services. This draft policy describes
                how we may collect and use personal information when you visit our website, submit a
                film for consideration or contact us.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Information we may collect</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Contact details such as name, email address, phone number and location</li>
                <li>Professional information such as company, role and website or IMDb profile</li>
                <li>Film submission data including titles, synopses, rights information and materials links</li>
                <li>Uploaded files such as posters, stills and EPK documents</li>
                <li>Technical data such as IP address, browser type and device information</li>
                <li>Communications you send through contact forms or email</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">How we may use information</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>Review and evaluate film submissions</li>
                <li>Communicate about submissions, meetings and potential agreements</li>
                <li>Operate, secure and improve our website and internal systems</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Maintain internal records for acquisition and reporting purposes</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Legal bases and consent</h2>
              <p>
                Depending on jurisdiction, we may rely on consent, legitimate interests or contractual
                necessity to process personal information. Submission consent checkboxes and form
                acknowledgments are intended to document your agreement to this processing for
                acquisition purposes.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Sharing and service providers</h2>
              <p>
                We may share information with service providers that host our website, store
                submissions, send email or support internal operations—such as hosting, database,
                email delivery and analytics providers. These providers are expected to handle data
                only as instructed. We do not sell personal information.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Retention</h2>
              <p>
                We may retain submission materials and contact records for as long as needed to
                evaluate projects, maintain business records, comply with law or resolve disputes.
                Retention periods may vary by project status and jurisdiction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Security</h2>
              <p>
                We implement reasonable administrative, technical and organizational measures
                designed to protect information. No method of transmission or storage is completely
                secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">International transfers</h2>
              <p>
                Information may be processed in Canada, the United States or other locations where
                our service providers operate. Cross-border transfer mechanisms will be defined in
                the final policy as applicable.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Your rights</h2>
              <p>
                Depending on your location, you may have rights to access, correct, delete or
                restrict certain processing of your personal information, or to withdraw consent
                where applicable. Requests may be sent to{" "}
                <a href={`mailto:${SITE.email}`} className="text-silver hover:text-ivory">
                  {SITE.email}
                </a>
                . We may need to verify identity before responding.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Children</h2>
              <p>
                Our services are not directed to individuals under 18, and we do not knowingly
                collect personal information from children.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Changes</h2>
              <p>
                We may update this policy from time to time. The effective date at the top will
                indicate when revisions take effect. Continued use of the website after changes may
                constitute acceptance of the updated policy, subject to applicable law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Contact</h2>
              <p>
                Questions about this draft policy may be directed to{" "}
                <a href={`mailto:${SITE.email}`} className="text-silver hover:text-ivory">
                  {SITE.email}
                </a>
                . Related documents:{" "}
                <Link href="/terms" className="text-silver hover:text-ivory">
                  Website Terms
                </Link>
                ,{" "}
                <Link href="/submission-terms" className="text-silver hover:text-ivory">
                  Submission Terms
                </Link>
                .
              </p>
            </section>
          </article>
        </div>
      </Section>
    </>
  );
}
