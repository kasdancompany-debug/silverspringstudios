import { PageHero } from "@/components/layout/PageHero";
import { BreadcrumbJsonLd, createMetadata } from "@/components/seo/metadata";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { SubmissionReceipt } from "@/components/submit/SubmissionReceipt";

export const metadata = createMetadata({
  title: "Your Film Is In Consideration",
  description: "Submission received. Silver Spring Studios will evaluate your film and may follow up if it's a potential fit for our slate.",
  path: "/thank-you",
  noIndex: true,
});

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Thank You", path: "/thank-you" },
        ]}
      />

      <div className="print:hidden">
        <PageHero
          eyebrow="Submission received"
          title="Your film is now in consideration."
          description="Thank you for trusting us with your work. A submission is the beginning of an evaluation—not an agreement or a promise of release. Our team will consider the film, its audience, rights position, materials and potential fit with our slate."
        />
      </div>

      <Section tone="elevated">
        <div className="mx-auto max-w-2xl space-y-10 print:max-w-none">
          <SubmissionReceipt reference={reference ?? null} />

          <div className="space-y-4 text-sm leading-relaxed text-slate print:hidden">
            <p>
              If you provided a valid email address, a confirmation message may be sent shortly.
              Delivery is not guaranteed and may depend on spam filters or mail system delays.
            </p>
            <p>
              Submission does not create a distribution agreement. We are not obligated to review,
              accept or respond to every project, and review timelines vary based on volume and
              complexity.
            </p>
            <p>
              If we need additional information or wish to schedule a conversation, we will contact
              you using the details provided in your submission.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 print:hidden">
            <ButtonLink href="/">Return Home</ButtonLink>
            <ButtonLink href="/how-it-works" variant="secondary">
              How It Works
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
