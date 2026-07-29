"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

const STEPS = [
  {
    n: "01",
    title: "Audience first",
    body: "Who is this film actually for — and how do we say that before a dollar of marketing is spent?",
  },
  {
    n: "02",
    title: "Package with intent",
    body: "Poster, trailer and publicity support shaped to the title — not a generic release kit.",
  },
  {
    n: "03",
    title: "Transparent economics",
    body: "Recoupment from film receipts, then a clear split of remaining distributable receipts.",
  },
] as const;

export function ApproachNumerals() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-ink py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <div className="mb-16 max-w-2xl">
          <p className="credit text-signal">Practice</p>
          <h2 className="mt-4 font-impact text-[clamp(2.5rem,7vw,4.5rem)] text-ivory">
            How we work
            <span className="text-signal">.</span>
          </h2>
          <p className="mt-5 font-display text-xl leading-snug text-silver md:text-2xl">
            A boutique distributor builds title by title — not by inventing a catalogue.
          </p>
        </div>

        <ol className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.65,
                delay: reduceMotion ? 0 : i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <p className="font-impact text-6xl leading-none text-signal/40 md:text-7xl">
                {step.n}
              </p>
              <h3 className="mt-6 font-impact text-2xl tracking-[0.04em] text-ivory md:text-3xl">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate md:text-[0.95rem]">
                {step.body}
              </p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-16">
          <ButtonLink href="/our-approach" variant="signal">
            Read Our Approach
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
