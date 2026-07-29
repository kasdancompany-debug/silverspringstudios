"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { CreditLine, PullQuote, SectionRule } from "@/components/home/motifs";

const stages = [
  {
    step: "01",
    title: "We select the film",
    description:
      "Completed projects are reviewed for audience clarity, rights readiness, release potential and fit with our current slate.",
  },
  {
    step: "02",
    title: "We prepare the release",
    description:
      "Selected films may receive tailored positioning, key art, trailer support, deliverables review and publicity preparation.",
  },
  {
    step: "03",
    title: "The film begins earning",
    description:
      "The title enters licensed exploitation. Revenue is tracked against agreed expenses and recoupable release investment.",
  },
  {
    step: "04",
    title: "Investment recouped, then receipts shared",
    description:
      "After the agreed release investment is recouped from film receipts, distributable receipts are shared according to the signed agreement.",
  },
];

export function ModelSection() {
  return (
    <Section id="model" tone="dark">
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <CreditLine>The Model</CreditLine>
          <h2 className="mt-5 font-display text-[2.75rem] leading-[1.02] text-ivory md:text-5xl lg:text-[3.4rem]">
            We invest before we earn.
          </h2>
          <p className="mt-7 max-w-md text-[0.95rem] leading-[1.75] text-slate">
            A strong release requires more than uploading a video file. Selected films may
            receive professional key art, trailer editing, release preparation and publicity
            support without an upfront invoice to the filmmaker.
          </p>

          <PullQuote className="mt-14 hidden lg:block" attribution="Silver Spring Studios">
            The release should serve the film—not ask the filmmaker to finance the packaging
            first.
          </PullQuote>
        </div>

        <div>
          <SectionRule className="mb-2" />
          {stages.map((stage, index) => (
            <motion.article
              key={stage.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-4 border-b border-line py-9 first:pt-6 md:grid-cols-[4.5rem_1fr] md:gap-10"
            >
              <p className="font-display text-3xl text-warm-metal/45 md:text-4xl">
                {stage.step}
              </p>
              <div>
                <h3 className="font-display text-2xl text-ivory md:text-[1.65rem]">
                  {stage.title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate md:text-[0.95rem]">
                  {stage.description}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
}
