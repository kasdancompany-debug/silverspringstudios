import { Hero } from "@/components/home/Hero";
import { SubmissionStatus } from "@/components/home/SubmissionStatus";
import { ModelSection } from "@/components/home/ModelSection";
import { WhatWeInvest } from "@/components/home/WhatWeInvest";
import { RevenueWaterfall } from "@/components/home/RevenueWaterfall";
import { WhatWeSeek } from "@/components/home/WhatWeSeek";
import { WhyFilmmakers } from "@/components/home/WhyFilmmakers";
import { ConversationSection } from "@/components/home/ConversationSection";
import { ThreeSteps } from "@/components/home/ThreeSteps";
import { Transparency } from "@/components/home/Transparency";
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
      <SubmissionStatus />
      <ModelSection />
      <WhatWeInvest />
      <RevenueWaterfall />
      <WhatWeSeek />
      <ConversationSection />
      <WhyFilmmakers />
      <ThreeSteps />
      <Transparency />
      <FAQ />
      <FinalCTA />
    </>
  );
}
