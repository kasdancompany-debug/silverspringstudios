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

/** Indie Rights “Our Movies” genre-rail energy — genres only, no invented titles. */
export function GenreWall() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-void py-16 md:py-24">
      <div className="container-page mb-10 md:mb-12">
        <h2 className="font-impact text-[clamp(2.5rem,6vw,4rem)] tracking-[0.04em] text-ivory">
          Our Focus
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-silver">
          We are interested in completed independent films across these genres — work with a clear
          point of view and an audience we can speak to.
        </p>
        <Link
          href="/what-we-look-for"
          className="mt-4 inline-block text-sm text-signal no-underline hover:text-flare"
        >
          See more about what we look for →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-4 md:gap-4 md:px-8 lg:px-10">
        {GENRE_POSTERS.map((genre, i) => (
          <motion.article
            key={genre.label}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              delay: reduceMotion ? 0 : i * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="group relative aspect-[2/3] w-[68vw] max-w-[260px] shrink-0 overflow-hidden sm:w-[40vw] md:w-[28vw] lg:w-[16vw]"
          >
            <Image
              src={genre.image}
              alt=""
              fill
              sizes="(max-width:768px) 68vw, 16vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div aria-hidden className="poster-scrim absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="font-impact text-2xl tracking-[0.04em] text-white md:text-3xl">
                {genre.label}
              </h3>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
