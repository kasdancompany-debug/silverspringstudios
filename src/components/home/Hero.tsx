"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="cine-field film-grain relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 md:pb-20 md:pt-24">
      {/* Drift light — intentional motion #1 */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-[20%] z-[1] h-[50vh] w-[65vw] rounded-full bg-signal/15 blur-3xl"
        animate={
          reduceMotion
            ? { opacity: 0.45 }
            : { x: [0, 48, 0], y: [0, -28, 0], opacity: [0.3, 0.55, 0.3] }
        }
        transition={
          reduceMotion ? { duration: 0 } : { duration: 16, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/5 bottom-[10%] z-[1] h-[40vh] w-[50vw] rounded-full bg-flare/10 blur-3xl"
        animate={
          reduceMotion
            ? { opacity: 0.25 }
            : { x: [0, -32, 0], y: [0, 20, 0], opacity: [0.15, 0.35, 0.15] }
        }
        transition={
          reduceMotion ? { duration: 0 } : { duration: 20, repeat: Infinity, ease: "easeInOut" }
        }
      />

      <div className="container-page relative z-[2] w-full">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          className="max-w-5xl"
        >
          <p className="credit text-signal">Independent Film Distribution</p>

          {/* Brand as hero-level signal — not just nav */}
          <h1 className="mt-6 font-impact text-[clamp(3.5rem,14vw,9.5rem)] leading-[0.85] tracking-[0.02em] text-ivory">
            Silver
            <br />
            Spring
            <span className="mt-2 block text-[0.28em] tracking-[0.42em] text-signal">Studios</span>
          </h1>

          <p className="mt-8 max-w-xl font-display text-2xl leading-snug text-ivory md:text-3xl lg:text-[2.15rem]">
            Independent films deserve a real release.
          </p>

          <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-slate md:text-base">
            Boutique distribution for completed features. We invest in packaging and publicity —
            recouped from film receipts, not billed to you — then share what remains.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/submit" variant="signal" size="lg">
              Submit Your Film
            </ButtonLink>
            <ButtonLink href="/our-approach" variant="secondary" size="lg">
              Our Approach
            </ButtonLink>
          </div>

          <p className="mt-8 credit text-slate/60">
            Submissions open · No fee · Selective consideration
          </p>
        </motion.div>
      </div>
    </section>
  );
}
