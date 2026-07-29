import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";

export interface AuthorizedReviewer {
  id: string;
  role: "admin" | "reviewer";
}

export interface RevealScreenerPasswordResult {
  success: boolean;
  password?: string | null;
  error?: string;
}

/**
 * Verifies the current request is an authenticated admin or reviewer
 * session. Route Handlers under /api/admin/* are already gated by
 * middleware (see src/middleware.ts), but this is checked again here as
 * defense in depth for a route that reveals sensitive credentials.
 */
async function requireAdminOrReviewer(): Promise<AuthorizedReviewer | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin" || profile?.role === "reviewer") {
      return { id: user.id, role: profile.role };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Reveals the screener password for a submission to an authenticated
 * admin/reviewer, and records the reveal in `submission_access_log` for
 * audit purposes. The password is never cached, embedded in page HTML, or
 * returned to any caller other than the one making this authorized,
 * logged request.
 */
export async function revealScreenerPassword(
  submissionId: string,
  meta: { ip?: string } = {},
): Promise<RevealScreenerPasswordResult> {
  if (!submissionId || typeof submissionId !== "string") {
    return { success: false, error: "Missing submission id." };
  }

  const reviewer = await requireAdminOrReviewer();
  if (!reviewer) {
    return { success: false, error: "You must be signed in as an admin or reviewer to do this." };
  }

  const rate = checkRateLimit(`screener-reveal:${reviewer.id}`, {
    limit: 40,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.success) {
    return { success: false, error: "Too many reveal requests. Please slow down and try again shortly." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { success: false, error: "This action is temporarily unavailable." };
  }

  const { data: materials, error: materialsError } = await admin
    .from("submission_materials")
    .select("screener_password")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (materialsError) {
    return { success: false, error: "Unable to retrieve the screener password right now." };
  }

  const ipHash = meta.ip ? await hashIp(meta.ip) : null;

  // Logged unconditionally (even if there is no password set) so every
  // reveal attempt against a submission is auditable, not just successful
  // ones.
  const { error: logError } = await admin.from("submission_access_log").insert({
    submission_id: submissionId,
    accessed_by: reviewer.id,
    access_type: "screener_password_reveal",
    ip_hash: ipHash,
  });

  if (logError) {
    console.error("[admin-screener] Failed to record access log entry:", logError);
    // The audit log is important, but a logging failure should not itself
    // block a legitimate admin/reviewer from doing their job. The failure
    // is surfaced server-side via console.error for follow-up.
  }

  return { success: true, password: materials?.screener_password ?? null };
}
