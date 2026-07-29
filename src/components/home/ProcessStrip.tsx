"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

const STEPS = [
  {
    n: "01",
    title: "Submit",
    body: "Share the film, rights position and a private screener. Free. Creates no agreement.",
  },
  {
    n: "02",
    title: "Review",
    body: "We watch, check rights readiness and ask whether the film has a real audience path.",
  },
  {
    n: "03",
    title: "Discuss",
    body: "Promising titles get a direct conversation on strategy, expectations and terms.",
  },
  {
    n: "04",
    title: "Agreement",
    body: "A release starts only after both sides review and sign a written distribution agreement.",
  },
] as const;

export function ProcessStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="process" className="relative overflow-hidden bg-void py-20 md:py-28">
      <div className="container-page">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="credit text-signal">The Path</p>
            <h2 className="mt-4 font-impact text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.92] text-ivory">
              Four steps.
              <br />
              No black hole.
            </h2>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-slate">
              Selective at every stage. Submission never creates a deal. A release begins only when
              both sides sign.
            </p>
          </div>
          <ButtonLink href="/how-it-works" variant="secondary" className="shrink-0 self-start">
            Full Process
          </ButtonLink>
        </div>

        <ol className="grid gap-0 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.n}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.55,
                delay: reduceMotion ? 0 : i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative border-t border-line py-8 md:border-t-0 md:border-l md:px-6 md:py-2 md:first:border-l-0 md:first:pl-0"
            >
              <p className="font-impact text-5xl leading-none text-signal md:text-6xl">{step.n}</p>
              <h3 className="mt-5 font-impact text-2xl tracking-[0.04em] text-ivory">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
