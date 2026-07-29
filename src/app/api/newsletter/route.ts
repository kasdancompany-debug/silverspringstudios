import { NextResponse } from "next/server";
import { isDemoModeAllowed } from "@/lib/demo-mode";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeText } from "@/lib/utils";
import { newsletterSchema } from "@/lib/validations/leads";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = newsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Please correct the highlighted fields and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { honeypot, ...value } = parsed.data;

  if (honeypot && honeypot.trim().length > 0) {
    return NextResponse.json({ success: false, error: "Unable to subscribe." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipHash = await hashIp(ip);
  const rate = checkRateLimit(`newsletter:${ipHash}`, { limit: 8, windowMs: 60 * 60 * 1000 });

  if (!rate.success) {
    return NextResponse.json(
      { success: false, error: "Too many subscription attempts. Please try again later." },
      { status: 429 },
    );
  }

  const firstName = sanitizeText(value.firstName, 120);
  const email = value.email.trim().toLowerCase().slice(0, 320);
  const primaryRole = sanitizeText(value.primaryRole, 80);
  const filmStage = sanitizeText(value.filmStage, 80);
  const genreInterest = sanitizeText(value.genreInterest, 80);
  const source = value.source ? sanitizeText(value.source, 120) : "website";
  const partnerSlug = value.partnerSlug ? sanitizeText(value.partnerSlug, 120) : null;

  let stored = false;

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("newsletter_subscribers").upsert(
        {
          email,
          first_name: firstName,
          primary_role: primaryRole,
          film_stage: filmStage,
          genre_interest: genreInterest,
          consent: true,
          source,
          partner_slug: partnerSlug,
          ip_hash: ipHash,
          user_agent: request.headers.get("user-agent"),
          unsubscribed_at: null,
        },
        { onConflict: "email" },
      );
      stored = !error;
      if (error) {
        console.error("[newsletter] Failed to store subscriber:", error);
      }
    } catch (error) {
      console.error("[newsletter] Supabase admin client unavailable:", error);
    }
  }

  if (!stored) {
    if (!isDemoModeAllowed()) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to complete your subscription right now. Please try again later.",
        },
        { status: 503 },
      );
    }
    console.log("[demo] Newsletter subscription received (Supabase not configured):", {
      firstName,
      email,
      primaryRole,
      filmStage,
      genreInterest,
      source,
      partnerSlug,
    });
  }

  return NextResponse.json({ success: true, demo: !stored });
}
