import { Hero } from "@/components/home/Hero";
import { StatementMarquee } from "@/components/home/StatementMarquee";
import { ModelSection } from "@/components/home/ModelSection";
import { ProcessStrip } from "@/components/home/ProcessStrip";
import { ExpectationsBand } from "@/components/home/ExpectationsBand";
import { GenreWall } from "@/components/home/GenreWall";
import { PrepareGateway } from "@/components/home/PrepareGateway";
import { TrustBand } from "@/components/home/TrustBand";
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
      {/* 1 Brand → 2 Model → 3 Process → 4 Expectations → 5 Qualify → 6 Prepare → 7 Trust → 8 FAQ → 9 Act */}
      <Hero />
      <StatementMarquee />
      <ModelSection />
      <ProcessStrip />
      <ExpectationsBand />
      <GenreWall />
      <PrepareGateway />
      <TrustBand />
      <FAQ limit={6} />
      <FinalCTA />
    </>
  );
}
