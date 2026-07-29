"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { CreditLine, DocFrame } from "@/components/home/motifs";

const questions = [
  {
    q: "What is realistically marketable?",
    a: "We talk about the film’s hook, genre lane and how it might actually be positioned—without inventing a campaign the materials cannot support.",
  },
  {
    q: "Which audience is most likely to respond?",
    a: "Not every completed film has the same viewer. We pressure-test who might care, and why, before anyone pretends otherwise.",
  },
  {
    q: "What materials need to improve?",
    a: "Poster, trailer, metadata, captions and deliverables are discussed plainly. Gaps are named so release preparation can be deliberate.",
  },
  {
    q: "Which rights and territories are available?",
    a: "Clear chain of title, existing agreements and available territories shape what a release can even attempt.",
  },
  {
    q: "What release outcome is genuinely plausible?",
    a: "We avoid fantasy platforms and invented guarantees. The conversation stays tethered to rights, materials and audience reality.",
  },
  {
    q: "What does success mean for this particular film?",
    a: "Success is project-specific. We define it together before any agreement is signed—not after disappointment sets in.",
  },
];

export function ConversationSection() {
  return (
    <Section id="conversation" tone="ivory" className="overflow-hidden">
      <div className="mb-14 max-w-3xl">
        <CreditLine light>Trust · Diligence</CreditLine>
        <h2 className="mt-5 font-display text-[2.5rem] leading-[1.05] text-ink md:text-5xl lg:text-[3.35rem]">
          Built around the conversation filmmakers actually need.
        </h2>
        <p className="mt-6 max-w-2xl text-[0.95rem] leading-[1.75] text-ink/65">
          Before strategy decks and wishful platform talk, there is a quieter set of questions.
          These are the ones we return to when evaluating a completed film.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
        {questions.map((item, index) => (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <DocFrame
              tone="dark"
              className="h-full bg-ivory px-6 py-7 md:px-7 md:py-8"
            >
              <p className="credit text-forest/70">
                Q {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display text-xl leading-snug text-ink md:text-2xl">
                {item.q}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink/65">{item.a}</p>
            </DocFrame>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
