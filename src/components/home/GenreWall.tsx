"use client";

import { motion, useReducedMotion } from "framer-motion";
import { GENRES } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function GenreWall() {
  const reduceMotion = useReducedMotion();
  const focus = GENRES.filter((g) => g !== "Other");

  return (
    <section className="relative overflow-hidden bg-void py-24 md:py-32">
      <div className="container-page">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="credit text-signal">Acquisition Focus</p>
            <h2 className="mt-4 font-impact text-[clamp(2.5rem,7vw,4.5rem)] text-ivory">
              What we chase.
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-slate">
              Completed work with clear genre positioning and a commercially identifiable
              audience. Distinctive projects outside these lanes may still be considered.
            </p>
          </div>
          <ButtonLink href="/what-we-look-for" variant="ghost">
            What We Look For
          </ButtonLink>
        </div>

        <ul className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {focus.map((genre, i) => (
            <motion.li
              key={genre}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className="group border-t border-line py-8 pr-4 sm:border-r sm:odd:border-l-0 lg:[&:nth-child(3n)]:border-r-0"
            >
              <span className="credit text-slate/50">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-impact text-3xl tracking-[0.04em] text-ivory transition-colors group-hover:text-signal md:text-4xl">
                {genre}
              </p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
