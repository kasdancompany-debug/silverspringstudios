import { Hero } from "@/components/home/Hero";
import { StatementMarquee } from "@/components/home/StatementMarquee";
import { ModelSection } from "@/components/home/ModelSection";
import { GenreWall } from "@/components/home/GenreWall";
import { ApproachNumerals } from "@/components/home/ApproachNumerals";
import { FoundingStrip } from "@/components/home/FoundingStrip";
import { FAQ } from "@/components/home/FAQ";
import { faqItems } from "@/lib/faq-items";
import { FinalCTA } from "@/components/home/FinalCTA";
import {
  createMetadata,
  FaqJsonLd,
  OrganizationJsonLd,
} from "@/components/seo/metadata";
import { SITE } from "@/lib/constants";

export const metadata = createMetadata({
  title: SITE.name,
  description: SITE.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <FaqJsonLd
        items={faqItems.map((item) => ({
          question: item.question,
          answer: item.answer,
        }))}
      />
      <Hero />
      <StatementMarquee />
      <GenreWall />
      <ModelSection />
      <ApproachNumerals />
      <FoundingStrip />
      <FAQ />
      <FinalCTA />
    </>
  );
}
