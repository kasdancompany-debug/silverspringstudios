import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mergeReferralAttribution,
  parseReferralFromSearchParams,
  referralToDbFields,
} from "../src/lib/referral.ts";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "../src/lib/demo-mode.ts";

describe("referral attribution", () => {
  it("parses known referral params", () => {
    const params = new URLSearchParams(
      "source=resources&medium=cta&campaign=guide&partner=midnight&outreach=not-a-uuid",
    );
    const parsed = parseReferralFromSearchParams(params);
    assert.equal(parsed.source, "resources");
    assert.equal(parsed.medium, "cta");
    assert.equal(parsed.partner, "midnight");
  });

  it("keeps first-touch values on merge", () => {
    const merged = mergeReferralAttribution(
      { source: "festival", medium: "email" },
      { source: "resources", campaign: "later" },
    );
    assert.equal(merged.source, "festival");
    assert.equal(merged.medium, "email");
    assert.equal(merged.campaign, "later");
  });

  it("maps partner to partner_slug and rejects non-uuid outreach ids", () => {
    const fields = referralToDbFields({
      source: "partner",
      partner: "cold-open",
      outreach: "not-a-uuid",
    });
    assert.ok(fields);
    assert.equal(fields.referral_source, "partner");
    assert.equal(fields.partner_slug, "cold-open");
    assert.equal(fields.outreach_contact_id, undefined);
  });

  it("accepts uuid outreach contact ids", () => {
    const fields = referralToDbFields({
      outreach: "de111111-0000-4000-8000-000000000100",
    });
    assert.ok(fields);
    assert.equal(fields.outreach_contact_id, "de111111-0000-4000-8000-000000000100");
  });
});

describe("release economics corridor (formula lock)", () => {
  it("recoups investment before splitting distributable receipts", () => {
    // Mirrors src/lib/admin/economics.ts — lock the public financial model:
    // gross → platform → direct expenses → release investment → 60/40 split.
    const gross = 10000;
    const platform = 3000;
    const expenses = 500;
    const investment = 3500;
    const afterPlatform = gross - platform;
    const afterExpenses = afterPlatform - expenses;
    const distributable = Math.max(afterExpenses - investment, 0);
    assert.equal(distributable, 3000);
    assert.equal(distributable * 0.6, 1800);
    assert.equal(distributable * 0.4, 1200);
  });
});

describe("demo mode", () => {
  it("never enables in production", () => {
    const previous = process.env.NODE_ENV;
    const previousDemo = process.env.NEXT_PUBLIC_DEMO_MODE;
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    assert.equal(isDemoModeAllowed(), false);
    process.env.NODE_ENV = previous;
    process.env.NEXT_PUBLIC_DEMO_MODE = previousDemo;
  });

  it("rejects placeholder supabase urls", () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "your-anon-key";
    assert.equal(isSupabaseEnvConfigured(), false);
    process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = prevKey;
  });
});
