"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CropMarks, CreditLine } from "@/components/home/motifs";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 1, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="film-grain relative flex min-h-[100svh] items-center overflow-hidden bg-ink pb-16 pt-28 md:pb-20 md:pt-24">
      {/* Atmospheric field */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 12% 88%, rgba(73, 90, 80, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 55% 45% at 88% 12%, rgba(196, 184, 168, 0.07) 0%, transparent 50%),
            linear-gradient(165deg, #12151a 0%, #090a0c 42%, #060708 100%)
          `,
        }}
      />

      {/* Slow drifting light plane */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[55vh] w-[70vw] rounded-full bg-forest/10 blur-3xl"
        animate={
          reduceMotion
            ? { opacity: 0.4 }
            : { x: [0, 40, 0], y: [0, -24, 0], opacity: [0.35, 0.55, 0.35] }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 18, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* Title-card frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 border border-ivory/[0.07] md:inset-6 lg:inset-8"
      >
        <CropMarks className="inset-0" />
      </div>

      {/* Documentation micro-labels */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-6 top-24 hidden credit text-ivory/25 md:left-10 md:top-28 lg:block"
      >
        SSS · RELEASE CARD
        <br />
        FRAME 01 / OPENING
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-28 right-6 hidden credit text-right text-ivory/25 md:right-10 lg:block"
      >
        INDEPENDENT FEATURES
        <br />
        CA · US · EN
      </div>

      <div className="container-page relative z-[2] w-full py-10 md:py-20">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.11, delayChildren: 0.2 }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.75, ease }}>
              <CreditLine>Independent Film Distribution</CreditLine>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.75, ease }}
              className="mt-5 font-display text-2xl text-ivory/90 md:text-3xl"
            >
              Silver Spring Studios
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.9, ease }}
              className="mt-6 font-display text-[2.85rem] leading-[0.98] text-ivory sm:text-5xl md:text-6xl lg:text-[4.35rem]"
            >
              Independent films
              <br className="hidden sm:block" />{" "}
              <em className="not-italic text-ivory/90">deserve a real release.</em>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.85, ease }}
              className="mt-8 max-w-xl text-[0.95rem] leading-[1.75] text-slate md:text-base"
            >
              We partner with distinctive filmmakers to package, position and distribute
              completed feature films—investing in the release upfront and recovering that
              investment only from revenue earned by the film.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.85, ease }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <ButtonLink href="/submit" size="lg" className="min-w-[13rem]">
                Submit Your Film
              </ButtonLink>
              <ButtonLink href="/#model" variant="secondary" size="lg">
                Understand the Model
              </ButtonLink>
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.85, ease }}
              className="mt-8 text-sm text-silver/80"
            >
              Now considering completed feature films, documentaries and limited series.
            </motion.p>
          </motion.div>

          {/* Submission status as title-card panel */}
          <motion.aside
            initial={{ opacity: 1, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease }}
            className="relative border border-line-strong bg-ink/40 p-6 backdrop-blur-[2px] md:p-8"
          >
            <CropMarks className="inset-2" />
            <div className="relative z-[1]">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-50 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-forest" />
                </span>
                <p className="credit text-ivory">Submissions Open</p>
              </div>
              <p className="mt-5 font-display text-2xl leading-snug text-ivory md:text-[1.65rem]">
                Currently reviewing completed films for upcoming release consideration.
              </p>
              <div className="mt-8 space-y-3 border-t border-line pt-5">
                <div className="flex justify-between gap-4 text-xs text-slate">
                  <span className="credit text-slate/70">Status</span>
                  <span>Open for consideration</span>
                </div>
                <div className="flex justify-between gap-4 text-xs text-slate">
                  <span className="credit text-slate/70">Focus</span>
                  <span className="text-right">Horror · Thriller · Sci-Fi · Doc · Crime · Drama</span>
                </div>
                <div className="flex justify-between gap-4 text-xs text-slate">
                  <span className="credit text-slate/70">Fee</span>
                  <span>No submission fee</span>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
