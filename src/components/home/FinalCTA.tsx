"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function FinalCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[75svh] overflow-hidden">
      <Image
        src="/brand/cta.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-void/70" />
      <div aria-hidden className="media-scrim absolute inset-0" />

      <div className="container-page relative z-[2] flex min-h-[75svh] items-center py-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="credit text-signal">Submissions</p>
          <h2 className="mt-5 font-impact text-[clamp(2.75rem,9vw,5.5rem)] leading-[0.9] tracking-[0.01em] text-ivory">
            Submit your
            <br />
            <span className="text-signal">completed film.</span>
          </h2>
          <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-silver">
            Feature, documentary, or limited series — with clear rights and a private screener.
            Review is selective. Submission does not guarantee acceptance or placement.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/submit" variant="signal" size="lg">
              Submit a Film
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary" size="lg">
              Contact
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
