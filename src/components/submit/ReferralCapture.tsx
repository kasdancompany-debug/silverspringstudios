"use client";

import { useEffect } from "react";
import {
  REFERRAL_STORAGE_KEY,
  mergeReferralAttribution,
  parseReferralFromSearchParams,
  sanitizeReferralValue,
  type ReferralAttribution,
  type ReferralParamKey,
  REFERRAL_PARAM_KEYS,
} from "@/lib/referral";

function readStoredRaw(): ReferralAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const result: ReferralAttribution = {};
    for (const key of REFERRAL_PARAM_KEYS) {
      const cleaned = sanitizeReferralValue(parsed[key]);
      if (cleaned) result[key] = cleaned;
    }
    return result;
  } catch {
    return {};
  }
}

function writeStored(attribution: ReferralAttribution): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned: ReferralAttribution = {};
    for (const key of REFERRAL_PARAM_KEYS) {
      const value = sanitizeReferralValue(attribution[key as ReferralParamKey]);
      if (value) cleaned[key] = value;
    }
    window.sessionStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(cleaned));
  } catch {
    // Best-effort — private mode / quota should never break the form.
  }
}

/** First-touch attribution from sessionStorage for draft/submit payloads. */
export function getStoredReferral(): ReferralAttribution {
  return readStoredRaw();
}

/**
 * On mount, reads `window.location.search` and merges into sessionStorage
 * under {@link REFERRAL_STORAGE_KEY}. First-touch wins for each key unless empty.
 */
export function ReferralCapture() {
  useEffect(() => {
    try {
      const incoming = parseReferralFromSearchParams(new URLSearchParams(window.location.search));
      if (Object.keys(incoming).length === 0) return;
      const merged = mergeReferralAttribution(readStoredRaw(), incoming);
      writeStored(merged);
    } catch {
      // Ignore — attribution is optional.
    }
  }, []);

  return null;
}
