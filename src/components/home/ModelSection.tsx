"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { RELEASE_INVESTMENT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
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
            <p className="credit text-signal">Standard Offer Frame</p>
            <p className="mt-3 font-impact text-6xl text-ivory md:text-8xl">
              {formatCurrency(RELEASE_INVESTMENT.total)}
            </p>
            <p className="mt-2 text-sm text-silver">
              Packaging investment · recouped from streaming / digital receipts
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
            For selected titles we fund poster design and trailer/publicity support so the film
            looks intentional on digital shelves — then recover that investment only from revenue
            the film generates. After recoupment, remaining distributable receipts typically split{" "}
            {RELEASE_INVESTMENT.filmmakerSharePercent}% filmmaker /{" "}
            {RELEASE_INVESTMENT.studioSharePercent}% studio.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-8">
            <div>
              <p className="credit text-slate">Filmmaker</p>
              <p className="mt-2 font-impact text-6xl text-signal md:text-7xl">
                {RELEASE_INVESTMENT.filmmakerSharePercent}%
              </p>
            </div>
            <div>
              <p className="credit text-slate">Studio</p>
              <p className="mt-2 font-impact text-6xl text-ivory/70 md:text-7xl">
                {RELEASE_INVESTMENT.studioSharePercent}%
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-slate/85">
            You are not personally invoiced for the standard release investment. Acceptance,
            placement and revenue are never guaranteed.
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
