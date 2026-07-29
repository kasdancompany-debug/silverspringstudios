"use client";

import { motion } from "framer-motion";
import { RELEASE_INVESTMENT } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { Section } from "@/components/ui/Section";
import { CreditLine, CropMarks } from "@/components/home/motifs";

const EXAMPLE_RECEIPTS = 10_000;
const REMAINING = EXAMPLE_RECEIPTS - RELEASE_INVESTMENT.total;
const FILMMAKER_SHARE = Math.round(
  REMAINING * (RELEASE_INVESTMENT.filmmakerSharePercent / 100),
);
const STUDIO_SHARE = Math.round(
  REMAINING * (RELEASE_INVESTMENT.studioSharePercent / 100),
);

function ArrowDown() {
  return (
    <div aria-hidden className="flex justify-center py-2 text-ink/25">
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none">
        <path d="M8 0v24M1 18l7 8 7-8" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    </div>
  );
}

function WaterTier({
  label,
  amount,
  note,
  emphasis = "default",
  wide,
}: {
  label: string;
  amount: string;
  note?: string;
  emphasis?: "default" | "muted" | "primary" | "secondary";
  wide?: string;
}) {
  const tones = {
    default: "bg-ink text-ivory",
    muted: "bg-[#1a1d21] text-ivory/85",
    primary: "bg-forest text-ivory",
    secondary: "border border-ink/15 bg-[#2a2e33] text-ivory",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.92 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mx-auto origin-center", wide ?? "w-full")}
    >
      <div className={cn("relative px-5 py-5 md:px-8 md:py-6", tones[emphasis])}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="credit text-ivory/50">{label}</p>
            {note ? <p className="mt-2 max-w-sm text-xs leading-relaxed text-ivory/55">{note}</p> : null}
          </div>
          <p className="font-display text-3xl md:text-4xl">{amount}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function RevenueWaterfall() {
  return (
    <Section id="revenue" tone="ivory" className="overflow-hidden">
      <div className="mb-14 grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-16">
        <div>
          <CreditLine light>Revenue Structure</CreditLine>
          <h2 className="mt-5 font-display text-[2.5rem] text-ink md:text-5xl">
            How receipts may flow.
          </h2>
        </div>
        <p className="max-w-xl text-[0.95rem] leading-[1.75] text-ink/65 lg:justify-self-end lg:text-right">
          An illustrative walkthrough of how net receipts might be applied after a title
          begins earning. Actual terms are defined in each signed distribution agreement.
        </p>
      </div>

      <div className="relative mx-auto max-w-2xl border border-line-ink-strong bg-ivory px-4 py-10 md:px-10 md:py-14">
        <CropMarks tone="dark" className="inset-3" />

        <div className="relative z-[1]">
          <p className="mb-8 text-center credit text-forest">
            Illustrative example only · Not a forecast
          </p>

          <WaterTier
            label="Net receipts from licensed exploitation"
            amount={formatCurrency(EXAMPLE_RECEIPTS)}
            note="Hypothetical film generates this amount in net receipts."
            wide="w-full"
          />

          <ArrowDown />

          <WaterTier
            label="Release investment recouped first"
            amount={`− ${formatCurrency(RELEASE_INVESTMENT.total)}`}
            note="Agreed Silver Spring release investment recovered from film receipts."
            emphasis="muted"
            wide="w-[92%]"
          />

          <ArrowDown />

          <WaterTier
            label="Distributable receipts remaining"
            amount={formatCurrency(REMAINING)}
            note="Amount available to share after agreed recoupment."
            wide="w-[78%]"
          />

          <ArrowDown />

          <div className="mx-auto grid w-[78%] gap-3 sm:grid-cols-2">
            <WaterTier
              label={`Filmmaker · ${RELEASE_INVESTMENT.filmmakerSharePercent}%`}
              amount={formatCurrency(FILMMAKER_SHARE)}
              emphasis="primary"
            />
            <WaterTier
              label={`Silver Spring · ${RELEASE_INVESTMENT.studioSharePercent}%`}
              amount={formatCurrency(STUDIO_SHARE)}
              emphasis="secondary"
            />
          </div>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-2xl text-center text-sm leading-relaxed text-ink/55">
        Actual revenue, deductions, recoupable amounts, rights, territories, term and payment
        structure are governed by each film&apos;s signed distribution agreement. No revenue or
        platform placement is guaranteed. A title may never generate enough receipts to
        recoup the agreed release investment.
      </p>
    </Section>
  );
}
