import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { Section, SectionHeader } from "@/components/ui/Section";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: "Contact",
  description:
    "Contact Silver Spring Studios acquisitions for submission questions, rights inquiries and general correspondence.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      <PageHero
        eyebrow="Correspondence"
        title="Contact"
        description="For acquisitions inquiries, submission questions and general correspondence. We read every message we can, though response times vary during active review periods."
      />

      <Section tone="elevated">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeader
              eyebrow="Acquisitions"
              title="Reach the team directly"
              description="If your message relates to a film submission, please include your submission reference number when available."
            />

            <div className="space-y-8">
              <div>
                <p className="text-xs tracking-[0.14em] uppercase text-slate">Acquisitions email</p>
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-3 inline-block font-display text-xl text-ivory transition-colors hover:text-warm-metal md:text-2xl"
                >
                  {SITE.email}
                </a>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate">
                <p>
                  For completed film submissions, the{" "}
                  <Link href="/submit" className="text-silver transition-colors hover:text-ivory">
                    submission form
                  </Link>{" "}
                  is the most efficient route. It ensures we receive screener access, rights context
                  and materials in one structured record.
                </p>
                <p>
                  We cannot guarantee a response to every inquiry, and contact does not create a
                  distribution relationship or confidentiality obligation.
                </p>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
