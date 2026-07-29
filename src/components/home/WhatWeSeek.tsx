"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { CreditLine } from "@/components/home/motifs";

const criteria = [
  { label: "Completed feature films", note: "Finished picture ready for private screener review" },
  { label: "Commercially identifiable audiences", note: "A clear viewer for the work, not a vague hope" },
  { label: "Strong genre positioning", note: "Horror, thriller, sci-fi, documentary, crime, dark comedy, distinctive drama" },
  { label: "Clear chain of title", note: "Rights position that can support a legitimate release" },
  { label: "Professional audio and picture", note: "Technical quality that will not undermine the film in market" },
  { label: "Marketable premise or point of view", note: "Something that can be positioned with honesty and intent" },
  { label: "Filmmakers prepared to collaborate", note: "Partners ready to work together on the release" },
];

export function WhatWeSeek() {
  return (
    <Section id="what-we-seek" tone="dark">
      <div className="mb-16 max-w-2xl">
        <CreditLine>Acquisition Focus</CreditLine>
        <h2 className="mt-5 font-display text-[2.5rem] text-ivory md:text-5xl lg:text-[3.25rem]">
          What we look for.
        </h2>
        <p className="mt-6 text-[0.95rem] leading-[1.75] text-slate">
          We evaluate the film, audience, available rights, deliverables, release history and
          realistic commercial potential. Acceptance is never based solely on production budget
          or celebrity cast.
        </p>
      </div>

      <div className="grid gap-x-16 gap-y-0 md:grid-cols-2">
        {criteria.map((item, index) => (
          <motion.article
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (index % 4) * 0.05 }}
            className={
              index === criteria.length - 1 && criteria.length % 2 === 1
                ? "border-t border-line py-8 md:col-span-2 md:max-w-xl md:py-10"
                : "border-t border-line py-8 md:py-10"
            }
          >
            <p className="credit text-warm-metal/55">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-3 font-display text-xl text-ivory md:text-2xl">{item.label}</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate">{item.note}</p>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}


