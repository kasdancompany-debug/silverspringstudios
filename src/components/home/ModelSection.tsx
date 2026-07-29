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
            <p className="credit text-signal">The Offer Shape</p>
            <p className="mt-3 font-impact text-5xl leading-[0.92] text-ivory md:text-7xl">
              Packaging
              <br />
              first.
            </p>
            <p className="mt-3 max-w-sm text-sm text-silver">
              Scope and spend are set per title — with the filmmaker — then written into the
              agreement.
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
          <p className="credit text-signal">The Model</p>
          <h2 className="mt-4 font-impact text-[clamp(2.75rem,6vw,4.75rem)] leading-[0.9] text-ivory">
            Packaged for
            <br />
            <span className="text-signal">streaming.</span>
          </h2>
          <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-slate">
            For selected titles we invest in release packaging — typically key art, trailer support
            and positioning — so the film looks intentional on digital shelves. What gets built,
            and at what level, depends on the title and what you and we agree.
          </p>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-slate">
            That packaging investment is recouped from revenue the film generates, not billed to
            you as an upfront invoice. After agreed recoupment and deductions, remaining
            distributable receipts are shared per the signed agreement.
          </p>

          <ul className="mt-10 space-y-0 border-t border-line">
            {[
              {
                label: "Packaging",
                body: "Poster, trailer and related release creative — scoped to the film.",
              },
              {
                label: "Recoupment",
                body: "Agreed investment comes back from film receipts first.",
              },
              {
                label: "Share",
                body: "What remains is split as written in your agreement — not a one-size public formula.",
              },
            ].map((row) => (
              <li
                key={row.label}
                className="grid gap-2 border-b border-line py-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
              >
                <p className="credit text-signal">{row.label}</p>
                <p className="text-sm leading-relaxed text-slate">{row.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-slate/85">
            Acceptance, placement and revenue are never guaranteed. Final terms live only in the
            signed agreement.
          </p>

          <div className="mt-10">
            <ButtonLink href="/#process" variant="secondary">
              How the Process Works
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
