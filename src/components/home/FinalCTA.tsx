"use client";

import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CropMarks, CreditLine } from "@/components/home/motifs";

export function FinalCTA() {
  return (
    <section className="film-grain relative overflow-hidden bg-ink py-28 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(73, 90, 80, 0.18) 0%, transparent 65%)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-6 border border-ivory/[0.08] md:inset-10"
      >
        <CropMarks className="inset-0" />
      </div>

      <div className="container-page relative z-[2]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <CreditLine>Next Frame</CreditLine>
          <h2 className="mt-6 font-display text-[2.75rem] leading-[1.02] text-balance text-ivory md:text-5xl lg:text-[3.5rem]">
            Share your completed film with us.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[0.95rem] leading-[1.75] text-slate">
            If you have a finished feature, documentary or limited series with clear rights and
            a private screener, we welcome your submission. Review is selective and submission
            does not guarantee acceptance.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/submit" size="lg" className="min-w-[14rem]">
              Submit Your Film
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" size="lg">
              Contact Acquisitions
            </ButtonLink>
          </div>
          <p className="mt-10 credit text-slate/50">
            No submission fee · No upfront release invoice for selected films · No guarantees
          </p>
        </motion.div>
      </div>
    </section>
  );
}
