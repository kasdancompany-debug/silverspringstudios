"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ButtonLink } from "@/components/ui/ButtonLink";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-[85svh] items-end overflow-hidden bg-void md:min-h-[100svh]">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { scale: 1.06 }}
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
      </div>

      <div className="container-page relative z-[2] w-full pb-14 pt-32 md:pb-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease, delay: 0.1 }}
          className="max-w-4xl"
        >
          <p className="text-sm tracking-[0.2em] uppercase text-signal">
            Independent Film Distribution
          </p>
          <h1 className="mt-4 font-impact text-[clamp(3.5rem,12vw,8rem)] leading-[0.85] tracking-[0.02em] text-white">
            Silver Spring
            <span className="mt-2 block text-[0.35em] tracking-[0.4em] text-signal">Studios</span>
          </h1>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/submit" variant="signal" size="lg">
              Submit Now
            </ButtonLink>
            <ButtonLink href="/#welcome" variant="secondary" size="lg">
              Learn More
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
