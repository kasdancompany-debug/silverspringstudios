"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { CreditLine, PullQuote } from "@/components/home/motifs";

const commitments = [
  "Clearly documented release investment",
  "Contract-defined recoupable expenses",
  "Scheduled revenue statements",
  "No personal repayment obligation for the standard release investment unless separately agreed in writing",
  "No guarantee that a title will earn enough to recoup",
  "Honest conversations before signing",
];

export function Transparency() {
  return (
    <Section id="transparency" tone="elevated">
      <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <CreditLine>Our Commitment</CreditLine>
          <h2 className="mt-5 font-display text-[2.75rem] text-ivory md:text-5xl lg:text-[3.4rem]">
            No mystery math.
          </h2>
          <p className="mt-6 max-w-lg text-[0.95rem] leading-[1.75] text-slate">
            Filmmakers deserve to understand where their film is available, what it has earned,
            what has been deducted and what remains recoupable. Our goal is straightforward
            reporting, clearly defined expenses and direct communication throughout the
            agreement.
          </p>

          <PullQuote className="mt-12 border-l border-warm-metal/40 pl-6">
            Clarity is part of the release.
          </PullQuote>
        </div>

        <div className="border border-line-strong bg-ink/30 p-2">
          <ul className="divide-y divide-line border border-line bg-surface">
            {commitments.map((item, index) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="flex gap-5 px-5 py-5 md:px-6"
              >
                <span className="credit shrink-0 pt-0.5 text-warm-metal/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-ivory/85 md:text-[0.95rem]">{item}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
