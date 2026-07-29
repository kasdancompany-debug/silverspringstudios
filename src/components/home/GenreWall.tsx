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

/** Transform-based rail — no overflow scroll, so no native scrollbar chrome. */
export function GenreWall() {
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    origin: number;
    moved: boolean;
  }>({ active: false, startX: 0, origin: 0, moved: false });

  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(0);
  const [dragging, setDragging] = useState(false);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const nextMax = Math.max(0, track.scrollWidth - viewport.clientWidth);
    setMaxOffset(nextMax);
    setOffset((prev) => Math.min(Math.max(0, prev), nextMax));
  }, []);

  const clamp = useCallback(
    (value: number) => Math.min(Math.max(0, value), maxOffset),
    [maxOffset],
  );

  useEffect(() => {
    measure();
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (maxOffset <= 0) return;
      const mostlyHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = mostlyHorizontal ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 1) return;
      e.preventDefault();
      setOffset((prev) => clamp(prev + delta));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clamp, maxOffset]);

  const step = (dir: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const amount = Math.min(viewport.clientWidth * 0.72, 520);
    setOffset((prev) => clamp(prev + dir * amount));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      origin: offset,
      moved: false,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    setOffset(clamp(dragRef.current.origin - dx));
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const canPrev = offset > 2;
  const canNext = offset < maxOffset - 2;

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
            onClick={() => step(-1)}
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
            onClick={() => step(1)}
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
          ref={viewportRef}
          role="region"
          aria-label="Genres we focus on"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "overflow-hidden px-4 touch-pan-y md:px-8 lg:px-10",
            dragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
        >
          <div
            ref={trackRef}
            role="list"
            style={{
              transform: `translate3d(-${offset}px, 0, 0)`,
              transition:
                dragging || reduceMotion ? "none" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="flex w-max gap-3 will-change-transform md:gap-4"
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
                className="group relative aspect-[2/3] w-[62vw] max-w-[240px] shrink-0 overflow-hidden sm:w-[38vw] md:w-[26vw] lg:w-[15vw] lg:max-w-[220px]"
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
      </div>
    </section>
  );
}
