import { Hero } from "@/components/home/Hero";
import { WelcomeSection } from "@/components/home/WelcomeSection";
import { DistributionPitch } from "@/components/home/DistributionPitch";
import { GenreWall } from "@/components/home/GenreWall";
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
      {/* Indie Rights / Wild Eye presentation: hero → welcome → distribution → genres → FAQ → submit */}
      <Hero />
      <WelcomeSection />
      <DistributionPitch />
      <GenreWall />
      <FAQ limit={6} />
      <FinalCTA />
    </>
  );
}
