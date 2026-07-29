"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { faqItems } from "@/lib/faq-items";
import { Section } from "@/components/ui/Section";
import { CreditLine } from "@/components/home/motifs";
import { cn } from "@/lib/utils";

export { faqItems };

function FaqItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: (typeof faqItems)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = `faq-panel-${index}`;

  return (
    <div className="border-t border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-6 py-6 text-left md:py-7"
      >
        <span className="flex gap-5">
          <span className="credit shrink-0 pt-1.5 text-signal/40">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-impact text-xl tracking-[0.03em] leading-snug text-ivory md:text-2xl">
            {item.question}
          </span>
        </span>
        <span className="mt-1 shrink-0 text-slate">
          {isOpen ? <Minus size={16} aria-hidden /> : <Plus size={16} aria-hidden />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className={cn(
                "pb-7 pl-0 text-sm leading-relaxed text-slate md:pl-[3.25rem] md:text-[0.95rem]",
              )}
            >
              {item.answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FAQ({ limit }: { limit?: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = typeof limit === "number" ? faqItems.slice(0, limit) : faqItems;

  return (
    <Section id="faq" tone="dark">
      <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <CreditLine>Questions</CreditLine>
          <h2 className="mt-5 font-impact text-[clamp(2.25rem,6vw,3.75rem)] tracking-[0.02em] text-ivory">
            Clear answers.
          </h2>
          <p className="mt-6 max-w-sm text-[0.95rem] leading-[1.75] text-slate">
            Submission, investment, rights and reporting — without the spin. Final terms always live
            in the signed agreement.
          </p>
        </div>

        <div className="border-b border-line">
          {items.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
