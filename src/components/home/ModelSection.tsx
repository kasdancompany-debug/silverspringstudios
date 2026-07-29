"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RELEASE_INVESTMENT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/ButtonLink";

const ease = [0.22, 1, 0.36, 1] as const;

export function ModelSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="model" className="relative overflow-hidden bg-ink py-24 md:py-32 lg:py-36">
      <div className="container-page">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:items-end">
          <div>
            <p className="credit text-signal">The Model</p>
            <h2 className="mt-5 font-impact text-[clamp(2.75rem,8vw,5.5rem)] tracking-[0.02em] text-ivory">
              Invested
              <br />
              <span className="text-signal">release.</span>
              <br />
              Shared
              <br />
              receipts.
            </h2>
            <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-slate">
              For selected titles, Silver Spring Studios funds a standard release investment —
              poster design and trailer/publicity support — then recovers it only from revenue
              the film generates. After recoupment, remaining distributable receipts typically
              split {RELEASE_INVESTMENT.filmmakerSharePercent}% filmmaker /{" "}
              {RELEASE_INVESTMENT.studioSharePercent}% studio.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate/80">
              You are not personally invoiced for the standard release investment. Acceptance,
              placement and revenue are never guaranteed. Final terms live in the signed agreement.
            </p>
            <div className="mt-10">
              <ButtonLink href="/how-it-works" variant="secondary">
                How It Works
              </ButtonLink>
            </div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease }}
            className="space-y-0 border-t border-line"
          >
            <div className="flex items-baseline justify-between gap-6 border-b border-line py-8">
              <div>
                <p className="credit text-slate">Release Investment</p>
                <p className="mt-2 font-impact text-5xl tracking-wide text-ivory md:text-6xl">
                  {formatCurrency(RELEASE_INVESTMENT.total)}
                </p>
              </div>
              <p className="max-w-[10rem] text-right text-xs leading-relaxed text-slate">
                Poster {formatCurrency(RELEASE_INVESTMENT.posterDesign)} · Trailer/publicity{" "}
                {formatCurrency(RELEASE_INVESTMENT.trailerAndPublicity)}
              </p>
            </div>

            <div className="grid grid-cols-2 border-b border-line">
              <div className="border-r border-line py-8 pr-6">
                <p className="credit text-slate">Filmmaker</p>
                <p className="mt-2 font-impact text-6xl text-signal md:text-7xl">
                  {RELEASE_INVESTMENT.filmmakerSharePercent}
                  <span className="text-4xl">%</span>
                </p>
                <p className="mt-2 text-xs text-slate">of distributable receipts after recoupment</p>
              </div>
              <div className="py-8 pl-6">
                <p className="credit text-slate">Studio</p>
                <p className="mt-2 font-impact text-6xl text-ivory/80 md:text-7xl">
                  {RELEASE_INVESTMENT.studioSharePercent}
                  <span className="text-4xl">%</span>
                </p>
                <p className="mt-2 text-xs text-slate">typical post-recoupment share</p>
              </div>
            </div>

            <div className="py-8">
              <p className="credit text-flare">Recoupment first</p>
              <p className="mt-3 max-w-md font-display text-xl leading-snug text-ivory md:text-2xl">
                Platform fees and the agreed release investment come out before the split.
                If the film never recoups, you are not personally on the hook for the standard
                investment.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
