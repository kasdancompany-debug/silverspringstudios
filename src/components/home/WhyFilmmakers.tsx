"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { CreditLine, PullQuote, SectionRule } from "@/components/home/motifs";

const reasons = [
  {
    title: "No upfront release invoice",
    description:
      "Selected filmmakers are not asked to personally finance poster design, trailer editing or standard publicity support before the film earns.",
  },
  {
    title: "Selective, not inaccessible",
    description:
      "We review completed work on its merits—concept, execution, audience clarity and rights readiness—not on whether you already have a sales agent or festival laurels.",
  },
  {
    title: "Transparent reporting",
    description:
      "Filmmakers deserve to know where their title is available, what it has earned and what remains recoupable. We aim for straightforward statements and direct communication.",
  },
  {
    title: "Honest conversations first",
    description:
      "Before any agreement is signed, we discuss realistic expectations, release strategy and terms. We would rather decline clearly than over-promise.",
  },
];

export function WhyFilmmakers() {
  return (
    <Section id="why-filmmakers" tone="elevated">
      <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <CreditLine>For Filmmakers</CreditLine>
          <h2 className="mt-5 font-display text-[2.5rem] text-ivory md:text-5xl">
            Why filmmakers choose Silver Spring.
          </h2>
          <p className="mt-6 max-w-md text-[0.95rem] leading-[1.75] text-slate">
            We are a boutique release partner, not a volume aggregator. These are the principles
            that guide how we work with independent rights holders.
          </p>

          <PullQuote className="mt-12" attribution="Operating principle">
            Selective enough to mean something. Accessible enough to be real.
          </PullQuote>
        </div>

        <div>
          <SectionRule className="mb-0" />
          {reasons.map((reason, index) => (
            <motion.article
              key={reason.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              className="border-b border-line py-8"
            >
              <div className="flex items-baseline gap-4">
                <span className="credit text-warm-metal/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl text-ivory md:text-2xl">{reason.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate">
                    {reason.description}
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </Section>
  );
}
