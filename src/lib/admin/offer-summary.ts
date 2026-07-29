import { formatCurrency } from "@/lib/utils";
import type { ReleaseEconomics } from "@/types/database";
import { computeEconomics } from "@/lib/admin/economics";

export interface OfferSummaryDraftInput {
  filmTitle: string;
  referenceNumber: string;
  recommendation?: string | null;
  revenueLow?: number | null;
  revenueBase?: number | null;
  revenueHigh?: number | null;
  investmentCap?: number | null;
  economics?: ReleaseEconomics | null;
}

/**
 * Builds a plain-text starting point for an internal offer-summary draft.
 * Always internal planning language — never phrased as an offer or
 * promise to the filmmaker, since no offer is real until a signed
 * agreement exists.
 */
export function buildOfferSummaryDraft(input: OfferSummaryDraftInput): string {
  const lines: string[] = [];

  lines.push(`INTERNAL OFFER SUMMARY (DRAFT) — ${input.filmTitle} (${input.referenceNumber})`);
  lines.push("This is an internal planning draft only. It is not an offer and creates no obligation.");
  lines.push("");

  if (input.recommendation) {
    lines.push("Recommendation:");
    lines.push(input.recommendation);
    lines.push("");
  }

  if (input.revenueLow || input.revenueBase || input.revenueHigh) {
    lines.push("Internal revenue estimates (planning only — not filmmaker promises):");
    if (input.revenueLow != null) lines.push(`  Low: ${formatCurrency(input.revenueLow)}`);
    if (input.revenueBase != null) lines.push(`  Base: ${formatCurrency(input.revenueBase)}`);
    if (input.revenueHigh != null) lines.push(`  High: ${formatCurrency(input.revenueHigh)}`);
    lines.push("");
  }

  if (input.investmentCap != null) {
    lines.push(`Proposed release-investment cap: ${formatCurrency(input.investmentCap)}`);
    lines.push("");
  }

  if (input.economics) {
    const summary = computeEconomics(input.economics);
    lines.push("Release economics (base case, internal planning estimate):");
    lines.push(`  Expected gross: ${formatCurrency(input.economics.expected_gross)}`);
    lines.push(`  Distributable after investment: ${formatCurrency(summary.remainingAfterInvestment)}`);
    lines.push(
      `  Filmmaker share (${input.economics.filmmaker_percent}%): ${formatCurrency(summary.filmmakerShare)}`,
    );
    lines.push(
      `  Studio share (${input.economics.studio_percent}%): ${formatCurrency(summary.studioShare)}`,
    );
    lines.push(`  Recoupment threshold: ${formatCurrency(summary.recoupmentThreshold)}`);
    if (summary.breakEvenReceipts !== null) {
      lines.push(`  Estimated break-even gross: ${formatCurrency(summary.breakEvenReceipts)}`);
    }
    lines.push("");
  }

  lines.push("Next steps: internal sign-off, then a written distribution agreement before any commitment is made.");

  return lines.join("\n");
}
