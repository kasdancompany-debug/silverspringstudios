"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function FinalCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="cine-field film-grain relative overflow-hidden py-28 md:py-36">
      <div className="container-page relative z-[2]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="credit text-signal">Next Frame</p>
          <h2 className="mt-6 font-impact text-[clamp(2.75rem,9vw,5.5rem)] tracking-[0.02em] text-ivory">
            Share your
            <br />
            <span className="text-signal">completed film.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[0.95rem] leading-relaxed text-slate">
            Finished feature, documentary or limited series — clear rights, private screener.
            Review is selective. Submission does not guarantee acceptance.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/submit" variant="signal" size="lg" className="min-w-[14rem]">
              Submit Your Film
            </ButtonLink>
            <ButtonLink href="/contact" variant="ghost" size="lg">
              Contact Acquisitions
            </ButtonLink>
          </div>
          <p className="mt-10 credit text-slate/50">
            No submission fee · No personal invoice for standard release investment · No guarantees
          </p>
        </motion.div>
      </div>
    </section>
  );
}
