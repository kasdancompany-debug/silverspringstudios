export const REFERRAL_PARAM_KEYS = [
  "source",
  "medium",
  "campaign",
  "festival",
  "school",
  "partner",
  "referrer",
  "outreach",
] as const;

export type ReferralParamKey = (typeof REFERRAL_PARAM_KEYS)[number];

/**
 * Client-facing attribution bag captured from URL search params.
 * `outreach` maps to `outreach_contact_id` on the submissions row.
 */
export type ReferralAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  festival?: string;
  school?: string;
  partner?: string;
  referrer?: string;
  /** Maps to submissions.outreach_contact_id */
  outreach?: string;
};

export const REFERRAL_STORAGE_KEY = "ssp_referral";

const MAX_REFERRAL_CHARS = 200;

export function sanitizeReferralValue(value: unknown, maxLength = MAX_REFERRAL_CHARS): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim()
    .slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : undefined;
}

export function parseReferralFromSearchParams(params: URLSearchParams): ReferralAttribution {
  const result: ReferralAttribution = {};

  for (const key of REFERRAL_PARAM_KEYS) {
    const raw = params.get(key);
    const cleaned = sanitizeReferralValue(raw);
    if (cleaned) {
      result[key] = cleaned;
    }
  }

  return result;
}

/** First-touch merge: existing non-empty keys win; empty/missing keys take incoming. */
export function mergeReferralAttribution(
  existing: ReferralAttribution,
  incoming: ReferralAttribution,
): ReferralAttribution {
  const merged: ReferralAttribution = { ...existing };

  for (const key of REFERRAL_PARAM_KEYS) {
    const current = sanitizeReferralValue(existing[key]);
    const next = sanitizeReferralValue(incoming[key]);
    if (!current && next) {
      merged[key] = next;
    } else if (current) {
      merged[key] = current;
    } else {
      delete merged[key];
    }
  }

  return merged;
}

/**
 * Columns persisted on `submissions` when a referral object is present.
 * `outreach` → `outreach_contact_id`; `partner` also sets `partner_slug`.
 */
export type ReferralDbFields = {
  referral_source?: string | null;
  referral_medium?: string | null;
  referral_campaign?: string | null;
  referral_festival?: string | null;
  referral_school?: string | null;
  referral_partner?: string | null;
  referral_referrer?: string | null;
  outreach_contact_id?: string | null;
  partner_slug?: string | null;
};

export function referralToDbFields(referral: unknown): ReferralDbFields | null {
  if (!referral || typeof referral !== "object") return null;

  const raw = referral as Record<string, unknown>;
  const fields: ReferralDbFields = {};
  let hasAny = false;

  const map: Array<[ReferralParamKey, keyof ReferralDbFields]> = [
    ["source", "referral_source"],
    ["medium", "referral_medium"],
    ["campaign", "referral_campaign"],
    ["festival", "referral_festival"],
    ["school", "referral_school"],
    ["partner", "referral_partner"],
    ["referrer", "referral_referrer"],
    ["outreach", "outreach_contact_id"],
  ];

  for (const [paramKey, column] of map) {
    const cleaned = sanitizeReferralValue(raw[paramKey]);
    if (!cleaned) continue;

    // Only persist outreach_contact_id when it looks like a UUID — avoids FK failures.
    if (column === "outreach_contact_id") {
      const uuidLike =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleaned);
      if (!uuidLike) continue;
    }

    fields[column] = cleaned;
    hasAny = true;
  }

  const partner = sanitizeReferralValue(raw.partner);
  if (partner) {
    fields.partner_slug = partner;
    hasAny = true;
  }

  return hasAny ? fields : null;
}
