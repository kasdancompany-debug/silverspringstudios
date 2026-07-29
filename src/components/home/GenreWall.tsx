"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GENRE_POSTERS = [
  { label: "Horror", image: "/brand/genre-horror.jpg" },
  { label: "Thriller", image: "/brand/genre-thriller.jpg" },
  { label: "Science Fiction", image: "/brand/genre-scifi.jpg" },
  { label: "Documentary", image: "/brand/genre-doc.jpg" },
  { label: "Crime", image: "/brand/genre-crime.jpg" },
  { label: "Dark Comedy", image: "/brand/genre-comedy.jpg" },
  { label: "Independent Drama", image: "/brand/genre-drama.jpg" },
  { label: "Action", image: "/brand/genre-action.jpg" },
  { label: "Mystery", image: "/brand/genre-mystery.jpg" },
  { label: "Fantasy", image: "/brand/genre-fantasy.jpg" },
  { label: "Coming of Age", image: "/brand/genre-coming-of-age.jpg" },
  { label: "Psychological", image: "/brand/genre-psycho.jpg" },
  { label: "Experimental", image: "/brand/genre-experimental.jpg" },
] as const;

/** Indie Rights–style genre rail — drag, arrows, no native scrollbar chrome. */
export function GenreWall() {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ active: boolean; startX: number; scrollLeft: number }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [dragging, setDragging] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges]);

  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.72, 520);
    el.scrollBy({ left: dir * amount, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.clientX - dragRef.current.startX;
    el.scrollLeft = dragRef.current.scrollLeft - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    try {
      scrollerRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  return (
    <section className="relative overflow-hidden bg-void py-16 md:py-24">
      <div className="container-page mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-impact text-[clamp(2.5rem,6vw,4rem)] tracking-[0.04em] text-ivory">
            Our Focus
          </h2>
          <p className="mt-4 text-base leading-relaxed text-silver">
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

        <div className="flex items-center gap-2 self-start md:self-end">
          <button
            type="button"
            aria-label="Scroll genres left"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
            className={cn(
              "flex h-11 w-11 items-center justify-center border border-line-strong bg-void/80 text-ivory transition-colors",
              "hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-30",
            )}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Scroll genres right"
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
            className={cn(
              "flex h-11 w-11 items-center justify-center border border-line-strong bg-void/80 text-ivory transition-colors",
              "hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-30",
            )}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-[2] w-10 bg-gradient-to-r from-void to-transparent transition-opacity md:w-16",
            canPrev ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-[2] w-10 bg-gradient-to-l from-void to-transparent transition-opacity md:w-16",
            canNext ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollerRef}
          role="list"
          aria-label="Genres we focus on"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "genre-rail flex gap-3 overflow-x-auto px-4 md:gap-4 md:px-8 lg:px-10",
            "scroll-smooth snap-x snap-mandatory",
            dragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
        >
          {GENRE_POSTERS.map((genre, i) => (
            <motion.article
              key={genre.label}
              role="listitem"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: reduceMotion ? 0 : Math.min(i, 8) * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative aspect-[2/3] w-[62vw] max-w-[240px] shrink-0 snap-start overflow-hidden sm:w-[38vw] md:w-[26vw] lg:w-[15vw] lg:max-w-[220px]"
            >
              <Image
                src={genre.image}
                alt=""
                fill
                sizes="(max-width:768px) 62vw, 15vw"
                draggable={false}
                className="pointer-events-none object-cover transition-transform duration-700 group-hover:scale-105"
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
      </div>
    </section>
  );
}
