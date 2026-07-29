"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { CreditLine } from "@/components/home/motifs";

const processSteps = [
  {
    step: "01",
    title: "Submit",
    description:
      "Tell us about the film and provide a private screener. There is no fee to submit.",
  },
  {
    step: "02",
    title: "Review",
    description:
      "Our team reviews the project, rights position, materials and potential audience.",
  },
  {
    step: "03",
    title: "Discuss",
    description:
      "Promising projects receive a direct conversation about expectations, strategy and terms.",
  },
  {
    step: "04",
    title: "Agreement",
    description:
      "If both sides wish to proceed, the release begins only after a written agreement is reviewed and signed.",
  },
];

export function ThreeSteps() {
  return (
    <Section id="process" tone="dark">
      <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <CreditLine>How It Works</CreditLine>
          <h2 className="mt-5 font-display text-[2.5rem] text-ivory md:text-5xl">
            From submission to signed agreement.
          </h2>
          <p className="mt-6 text-[0.95rem] leading-[1.75] text-slate">
            A straightforward path for completed independent films. Acceptance is selective at
            every stage.
          </p>
        </div>
        <ButtonLink href="/how-it-works" variant="secondary" className="shrink-0 self-start md:self-auto">
          Full Process
        </ButtonLink>
      </div>

      {/* Horizontal process as editorial timeline, not equal cards */}
      <ol className="relative">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-line md:block"
        />
        <div className="grid gap-10 md:grid-cols-4 md:gap-6">
          {processSteps.map((item, index) => (
            <motion.li
              key={item.step}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="relative"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="relative z-[1] flex h-9 w-9 items-center justify-center border border-line-strong bg-ink font-display text-sm text-warm-metal">
                  {item.step}
                </span>
                <span className="credit text-slate/50 md:hidden">Step</span>
              </div>
              <h3 className="font-display text-2xl text-ivory">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{item.description}</p>
            </motion.li>
          ))}
        </div>
      </ol>
    </Section>
  );
}
