"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { STUDIO_ADVISOR } from "@/lib/studio-advisor";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-void">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease }}
        >
          <Image
            src="/brand/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        <div aria-hidden className="media-scrim absolute inset-0" />
        <div aria-hidden className="film-grain absolute inset-0" />
      </div>

      <div className="container-page relative z-[2] w-full pb-10 pt-32 md:pb-14 md:pt-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease, delay: 0.15 }}
          className="max-w-6xl"
        >
          <p className="credit text-signal">Independent Film Distribution</p>

          <h1 className="mt-3 font-impact text-[clamp(4.5rem,18vw,12rem)] leading-[0.8] tracking-[0.01em] text-white drop-shadow-[0_4px_40px_rgba(0,0,0,0.65)]">
            Silver
            <br />
            Spring
          </h1>
          <p className="mt-3 font-sans text-[0.75rem] uppercase tracking-[0.55em] text-signal md:text-[0.9rem]">
            Studios
          </p>

          <p className="mt-7 max-w-xl font-display text-[1.75rem] leading-[1.12] text-white md:text-3xl lg:text-[2.5rem]">
            Independent films deserve a{" "}
            <em className="not-italic text-signal">real release.</em>
          </p>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-silver md:text-[0.95rem]">
            Boutique distribution for completed features — invested packaging, transparent
            economics, selective partnerships.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={STUDIO_ADVISOR.heroPrimaryCta.href} variant="signal" size="lg">
              {STUDIO_ADVISOR.heroPrimaryCta.label}
            </ButtonLink>
            <ButtonLink href={STUDIO_ADVISOR.heroSecondaryCta.href} variant="secondary" size="lg">
              {STUDIO_ADVISOR.heroSecondaryCta.label}
            </ButtonLink>
          </div>

          <p className="mt-8 credit text-ivory/55">
            Submissions open · No fee · {STUDIO_ADVISOR.responseAimLabel}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
