import { NextResponse } from "next/server";
import { isDemoModeAllowed } from "@/lib/demo-mode";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeText } from "@/lib/utils";
import { leadMagnetSchema } from "@/lib/validations/leads";

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

  const parsed = leadMagnetSchema.safeParse(body);

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
    return NextResponse.json(
      { success: false, error: "Unable to process this request." },
      { status: 400 },
    );
  }

  const ip = getClientIp(request);
  const ipHash = await hashIp(ip);
  const rate = checkRateLimit(`lead-magnet:${ipHash}`, { limit: 8, windowMs: 60 * 60 * 1000 });

  if (!rate.success) {
    return NextResponse.json(
      { success: false, error: "Too many download requests. Please try again later." },
      { status: 429 },
    );
  }

  const firstName = sanitizeText(value.firstName, 120);
  const email = value.email.trim().toLowerCase().slice(0, 320);
  const primaryRole = sanitizeText(value.primaryRole, 80);
  const filmStage = sanitizeText(value.filmStage, 80);
  const resourceSlug = sanitizeText(value.resourceSlug, 200);
  const source = value.source ? sanitizeText(value.source, 120) : "checklist";
  const partnerSlug = value.partnerSlug ? sanitizeText(value.partnerSlug, 120) : null;

  let stored = false;

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("lead_magnet_downloads").insert({
        email,
        first_name: firstName,
        primary_role: primaryRole,
        film_stage: filmStage,
        resource_slug: resourceSlug,
        consent: true,
        source,
        partner_slug: partnerSlug,
        ip_hash: ipHash,
        user_agent: request.headers.get("user-agent"),
      });
      stored = !error;
      if (error) {
        console.error("[lead-magnet] Failed to store download:", error);
      }
    } catch (error) {
      console.error("[lead-magnet] Supabase admin client unavailable:", error);
    }
  }

  if (!stored) {
    if (!isDemoModeAllowed()) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to unlock the checklist right now. Please try again later.",
        },
        { status: 503 },
      );
    }
    console.log("[demo] Lead magnet download received (Supabase not configured):", {
      firstName,
      email,
      primaryRole,
      filmStage,
      resourceSlug,
      source,
      partnerSlug,
    });
  }

  return NextResponse.json({ success: true, demo: !stored });
}
