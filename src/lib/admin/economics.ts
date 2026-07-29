import type { ReleaseEconomics } from "@/types/database";

/**
 * Deliberately simplified internal planning math — never treat these
 * outputs as a promise to the filmmaker. Every figure here is an internal
 * estimate for release-investment planning only.
 *
 * Recoupment-corridor model (standard for indie digital distribution):
 *   1. Platform/aggregator takes its cut first: netAfterPlatform = gross − platform deductions
 *   2. Direct release expenses come out next: afterExpenses = netAfterPlatform − direct expenses
 *   3. Silver Spring Studios' release investment is recouped from what's left
 *   4. Whatever remains (`remainingAfterInvestment`) is split filmmaker/studio
 *
 * `platform_deductions` and `direct_expenses` are reported for the
 * `expected_gross` scenario. To keep the low/base/high cases internally
 * consistent without asking admins for a separate rate, we derive an
 * implied platform take-rate (`platform_deductions / expected_gross`) and
 * scale it across each case's gross; direct expenses are treated as a
 * fixed cost that does not vary by scenario.
 */
export interface EconomicsCase {
  label: "low" | "base" | "high";
  grossReceipts: number;
  netAfterPlatform: number;
  afterExpenses: number;
  /** Distributable pool after the studio's release investment is recouped. */
  distributable: number;
  filmmakerShare: number;
  studioShare: number;
  /** Whether afterExpenses covers the release investment in this case. */
  investmentRecouped: boolean;
  /** How much of the release investment remains unrecouped in this case (0 if fully recouped). */
  recoupmentShortfall: number;
}

export interface EconomicsResult {
  /** Base-case net receipts after the platform's cut. */
  netAfterPlatform: number;
  /** Base-case net after platform cut and direct release expenses. */
  afterExpenses: number;
  /** Base-case distributable pool after the release investment is recouped — the amount split filmmaker/studio. */
  remainingAfterInvestment: number;
  /** Base-case filmmaker share of the distributable pool. */
  filmmakerShare: number;
  /** Base-case studio share of the distributable pool. */
  studioShare: number;
  /** The release investment amount that must be recouped before any split occurs (= release_investment). */
  recoupmentThreshold: number;
  /** Gross receipts required to exactly recoup the investment and direct expenses (null if the implied platform rate is 100%+). */
  breakEvenReceipts: number | null;
  /** Derived platform take-rate implied by platform_deductions / expected_gross, used to scale the case scenarios. */
  impliedPlatformRate: number;
  cases: { low: EconomicsCase; base: EconomicsCase; high: EconomicsCase };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function num(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function computeCase(
  label: EconomicsCase["label"],
  grossReceipts: number,
  platformRate: number,
  directExpenses: number,
  releaseInvestment: number,
  filmmakerPercent: number,
  studioPercent: number,
): EconomicsCase {
  const gross = Math.max(num(grossReceipts), 0);
  const netAfterPlatform = Math.max(gross * (1 - platformRate), 0);
  const afterExpenses = netAfterPlatform - directExpenses;
  const distributable = Math.max(afterExpenses - releaseInvestment, 0);
  const filmmakerShare = distributable * (filmmakerPercent / 100);
  const studioShare = distributable * (studioPercent / 100);
  const investmentRecouped = afterExpenses >= releaseInvestment;
  const recoupmentShortfall = investmentRecouped ? 0 : round2(releaseInvestment - Math.max(afterExpenses, 0));

  return {
    label,
    grossReceipts: round2(gross),
    netAfterPlatform: round2(netAfterPlatform),
    afterExpenses: round2(afterExpenses),
    distributable: round2(distributable),
    filmmakerShare: round2(filmmakerShare),
    studioShare: round2(studioShare),
    investmentRecouped,
    recoupmentShortfall,
  };
}

/**
 * Computes internal release-economics estimates for a submission or film.
 * See module comment above for the recoupment-corridor formula and the
 * assumptions used to scale the low/base/high sensitivity cases.
 */
export function computeEconomics(input: ReleaseEconomics): EconomicsResult {
  const expectedGross = num(input.expected_gross);
  const platformDeductions = num(input.platform_deductions);
  const directExpenses = num(input.direct_expenses);
  const releaseInvestment = num(input.release_investment);
  const filmmakerPercent = num(input.filmmaker_percent);
  const studioPercent = num(input.studio_percent);

  const impliedPlatformRate =
    expectedGross > 0 ? Math.min(Math.max(platformDeductions / expectedGross, 0), 1) : 0;

  // When an admin hasn't provided explicit low/high scenario figures, fall
  // back to a clearly-labeled ±35% internal default spread around the base
  // case rather than leaving the sensitivity cases empty.
  const lowGross = input.case_low_gross ?? expectedGross * 0.65;
  const baseGross = input.case_base_gross ?? expectedGross;
  const highGross = input.case_high_gross ?? expectedGross * 1.5;

  const low = computeCase("low", lowGross, impliedPlatformRate, directExpenses, releaseInvestment, filmmakerPercent, studioPercent);
  const base = computeCase("base", baseGross, impliedPlatformRate, directExpenses, releaseInvestment, filmmakerPercent, studioPercent);
  const high = computeCase("high", highGross, impliedPlatformRate, directExpenses, releaseInvestment, filmmakerPercent, studioPercent);

  const breakEvenDenominator = 1 - impliedPlatformRate;
  const breakEvenReceipts =
    breakEvenDenominator > 0 ? round2((releaseInvestment + directExpenses) / breakEvenDenominator) : null;

  return {
    netAfterPlatform: base.netAfterPlatform,
    afterExpenses: base.afterExpenses,
    remainingAfterInvestment: base.distributable,
    filmmakerShare: base.filmmakerShare,
    studioShare: base.studioShare,
    recoupmentThreshold: round2(releaseInvestment),
    breakEvenReceipts,
    impliedPlatformRate: round2(impliedPlatformRate * 10000) / 10000,
    cases: { low, base, high },
  };
}
