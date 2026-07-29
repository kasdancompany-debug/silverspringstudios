"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function FinalCTA() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[70svh] overflow-hidden">
      <Image
        src="/brand/cta.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-void/75" />
      <div aria-hidden className="media-scrim absolute inset-0" />

      <div className="container-page relative z-[2] flex min-h-[70svh] items-center py-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <h2 className="font-impact text-[clamp(2.5rem,8vw,4.5rem)] tracking-[0.04em] text-white">
            Submit your film
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-silver">
            If you have a completed feature, documentary, or limited series, we invite you to
            submit. We are selective — and if we offer distribution, we will be there to support
            the release.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/submit" variant="signal" size="lg">
              Submit Now
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
