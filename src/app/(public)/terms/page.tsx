import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { Section } from "@/components/ui/Section";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Website Terms",
  description: "Terms of use for the Silver Spring Studios website.",
  path: "/terms",
  noIndex: true,
});

function LegalDraftBanner() {
  return (
    <div
      className="mb-10 border border-warm-metal/40 bg-warm-metal/10 px-5 py-4 text-sm text-warm-metal"
      role="note"
    >
      <strong>Draft — legal review required.</strong> These website terms are an operational draft
      and must be reviewed by qualified legal counsel before production use.
    </div>
  );
}

export default function TermsPage() {
  const effectiveDate = "July 28, 2026";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Website Terms", path: "/terms" },
        ]}
      />

      <PageHero
        eyebrow="Legal"
        title="Website terms"
        description="Terms governing use of the Silver Spring Studios website and related online services."
      />

      <Section tone="elevated">
        <div className="mx-auto max-w-3xl">
          <LegalDraftBanner />

          <article className="space-y-10 text-sm leading-relaxed text-slate">
            <p>Effective date: {effectiveDate}</p>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Agreement to terms</h2>
              <p>
                By accessing or using {SITE.url}, you agree to these website terms. If you do not
                agree, please do not use the site. These terms govern website use only and do not
                create a distribution agreement. Film submissions are additionally subject to our{" "}
                <Link href="/submission-terms" className="text-silver hover:text-ivory">
                  Submission Terms
                </Link>
                .
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Website purpose</h2>
              <p>
                This website provides information about Silver Spring Studios, our acquisition
                process and tools to submit completed films for consideration. Content is provided
                for general informational purposes and may change without notice.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">No guarantees</h2>
              <p>
                Nothing on this website guarantees acceptance of any submission, platform placement,
                publicity coverage, revenue, recoupment or any particular commercial outcome.
                Financial examples are illustrative unless expressly included in a signed written
                agreement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Acceptable use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Use the site unlawfully or in a manner that could harm the site or others</li>
                <li>Attempt unauthorized access to systems, accounts or data</li>
                <li>Submit false, misleading or infringing information or materials</li>
                <li>Interfere with site operation, including through automated scraping or spam</li>
                <li>Circumvent security, rate limits or submission controls</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Intellectual property</h2>
              <p>
                Site content, branding, text, layout and design elements are owned by or licensed to
                Silver Spring Studios and may not be copied or reused without permission, except as
                permitted by law. Film materials submitted through the site remain the property of
                their respective rights holders, subject to the submission terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Third-party links and tools</h2>
              <p>
                The site may reference or link to third-party websites, screeners or services. We do
                not control and are not responsible for third-party content, availability or
                practices.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Disclaimer of warranties</h2>
              <p>
                The website is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
                basis to the fullest extent permitted by law. We disclaim warranties of
                merchantability, fitness for a particular purpose and non-infringement.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Limitation of liability</h2>
              <p>
                To the fullest extent permitted by law, Silver Spring Studios will not be liable for
                indirect, incidental, special, consequential or punitive damages arising from use of
                the website. Our aggregate liability relating to website use will be limited as
                specified in the final legally reviewed version of these terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Indemnity</h2>
              <p>
                You agree to indemnify and hold harmless Silver Spring Studios from claims arising
                out of your misuse of the website, your submissions or your violation of these
                terms, subject to applicable law.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Governing law</h2>
              <p>
                Governing law and dispute resolution provisions will be specified in the final
                legally reviewed version of these terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Changes</h2>
              <p>
                We may modify these terms at any time by posting an updated version on this page.
                Material changes may also be communicated where appropriate.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="font-display text-2xl text-ivory">Contact</h2>
              <p>
                Questions about these terms may be sent to{" "}
                <a href={`mailto:${SITE.email}`} className="text-silver hover:text-ivory">
                  {SITE.email}
                </a>
                . See also our{" "}
                <Link href="/privacy" className="text-silver hover:text-ivory">
                  Privacy Policy
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
