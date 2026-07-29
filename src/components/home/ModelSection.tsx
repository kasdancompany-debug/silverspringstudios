"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

const ease = [0.22, 1, 0.36, 1] as const;

export function ModelSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="model" className="relative overflow-hidden bg-ink">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[50vh] lg:min-h-[90vh]">
          <Image
            src="/brand/model.jpg"
            alt=""
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-ink/20 lg:to-ink"
          />
          <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-10">
            <p className="credit text-signal">Release Model</p>
            <p className="mt-3 font-impact text-5xl leading-[0.92] text-ivory md:text-6xl">
              Presentation
              <br />
              matters.
            </p>
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col justify-center px-6 py-16 md:px-12 md:py-24 lg:px-16"
        >
          <p className="credit text-signal">How We Work</p>
          <h2 className="mt-4 font-impact text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[0.92] text-ivory">
            Packaging invested.
            <br />
            <span className="text-signal">Terms agreed in writing.</span>
          </h2>
          <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-slate">
            For titles we take on, Silver Spring Studios invests in release packaging — key art,
            trailer support, and positioning appropriate to the film. Scope is determined with the
            filmmaker and set out in the distribution agreement.
          </p>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-slate">
            Agreed packaging costs are recouped from revenue earned by the film, not charged as an
            upfront invoice. Remaining distributable receipts are shared according to that
            agreement.
          </p>

          <ul className="mt-10 space-y-0 border-t border-line">
            {[
              {
                label: "Packaging",
                body: "Key art, trailer, and related materials scoped to the title.",
              },
              {
                label: "Recoupment",
                body: "Agreed investment is recovered from film receipts first.",
              },
              {
                label: "Participation",
                body: "Remaining receipts are shared as defined in the signed agreement.",
              },
            ].map((row) => (
              <li
                key={row.label}
                className="grid gap-2 border-b border-line py-5 sm:grid-cols-[9rem_1fr] sm:gap-6"
              >
                <p className="credit text-signal">{row.label}</p>
                <p className="text-sm leading-relaxed text-slate">{row.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-slate/85">
            Acceptance, platform placement, and revenue are not guaranteed.
          </p>

          <div className="mt-10">
            <ButtonLink href="/#process" variant="secondary">
              Acquisition Process
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
