import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import { adminContactNotificationEmail, contactConfirmationEmail } from "@/lib/email/templates";
import { SITE } from "@/lib/constants";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { sanitizeText } from "@/lib/utils";
import { contactFormSchema } from "@/lib/validations/submission";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function isDemoModeAllowed(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.NODE_ENV !== "production";
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);

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
    return NextResponse.json({ success: false, error: "Unable to send this message." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const ipHash = await hashIp(ip);
  const rate = checkRateLimit(`contact:${ipHash}`, { limit: 5, windowMs: 60 * 60 * 1000 });

  if (!rate.success) {
    return NextResponse.json(
      { success: false, error: "Too many messages sent from this connection. Please try again later." },
      { status: 429 },
    );
  }

  const name = sanitizeText(value.name, 200);
  const email = value.email.trim().toLowerCase().slice(0, 320);
  const subject = sanitizeText(value.subject, 300);
  const message = sanitizeText(value.message, 5000);

  let stored = false;

  if (isSupabaseConfigured()) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.from("contact_messages").insert({
        full_name: name,
        email,
        subject,
        message,
        ip_hash: ipHash,
        user_agent: request.headers.get("user-agent"),
      });
      stored = !error;
      if (error) {
        console.error("[contact] Failed to store message:", error);
      }
    } catch (error) {
      console.error("[contact] Supabase admin client unavailable:", error);
    }
  }

  if (!stored) {
    if (!isDemoModeAllowed()) {
      return NextResponse.json(
        {
          success: false,
          error: `Unable to send your message right now. Please email us directly at ${SITE.email}.`,
        },
        { status: 503 },
      );
    }
    console.log("[demo] Contact message received (Supabase not configured):", {
      name,
      email,
      subject,
      message,
    });
  }

  const confirmation = contactConfirmationEmail({ name });
  const adminNotice = adminContactNotificationEmail({ name, email, subject, message });

  await Promise.allSettled([
    sendEmail({
      to: email,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    }),
    sendEmail({
      to: SITE.adminEmail,
      subject: adminNotice.subject,
      html: adminNotice.html,
      text: adminNotice.text,
      replyTo: email,
    }),
  ]);

  return NextResponse.json({ success: true, demo: !stored });
}
