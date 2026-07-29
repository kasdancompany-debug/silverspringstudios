"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const GENRE_POSTERS = [
  { label: "Horror", image: "/brand/genre-horror.jpg" },
  { label: "Thriller", image: "/brand/genre-thriller.jpg" },
  { label: "Science Fiction", image: "/brand/genre-scifi.jpg" },
  { label: "Documentary", image: "/brand/genre-doc.jpg" },
  { label: "Crime", image: "/brand/genre-crime.jpg" },
  { label: "Dark Comedy", image: "/brand/genre-comedy.jpg" },
  { label: "Independent Drama", image: "/brand/genre-drama.jpg" },
] as const;

export function GenreWall() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-void py-16 md:py-24">
      <div className="container-page mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="credit text-signal">Acquisition Focus</p>
          <h2 className="mt-3 font-impact text-[clamp(2.75rem,8vw,5rem)] text-ivory">
            What we chase.
          </h2>
          <p className="mt-4 max-w-lg text-[0.95rem] leading-relaxed text-slate">
            Completed work with clear genre positioning. Hover a lane — this is atmosphere, not a
            catalogue of invented titles.
          </p>
        </div>
        <Link
          href="/what-we-look-for"
          className="credit text-ivory no-underline transition-colors hover:text-signal"
        >
          What We Look For →
        </Link>
      </div>

      {/* Horizontal poster strip — Neon / Wild Eye energy */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-4 md:gap-4 md:px-8 lg:px-10">
        {GENRE_POSTERS.map((genre, i) => (
          <motion.article
            key={genre.label}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="group relative aspect-[2/3] w-[68vw] max-w-[280px] shrink-0 overflow-hidden sm:w-[42vw] md:w-[30vw] lg:w-[18vw]"
          >
            <Image
              src={genre.image}
              alt=""
              fill
              sizes="(max-width:768px) 68vw, 18vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div aria-hidden className="poster-scrim absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
              <p className="credit text-signal/80">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-impact text-3xl leading-none tracking-[0.03em] text-ivory md:text-4xl">
                {genre.label}
              </h3>
            </div>
            <div
              aria-hidden
              className="absolute inset-0 border border-transparent transition-colors duration-300 group-hover:border-signal"
            />
          </motion.article>
        ))}
      </div>
    </section>
  );
}
