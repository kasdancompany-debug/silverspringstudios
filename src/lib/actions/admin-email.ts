"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import { mergeEmailTemplate } from "@/lib/email/merge";
import { getDefaultEmailTemplate } from "@/lib/email/default-templates";
import { EMAIL_TEMPLATE_SLUGS, type EmailTemplateSlug } from "@/lib/constants";
import type { ActionResult } from "@/lib/actions/admin";
import type { EmailTemplate } from "@/types/database";

function toMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

async function requireSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to perform this action.");
  }

  return { supabase, user };
}

// ---------------------------------------------------------------------------
// Send a template email — always an explicit, manual send
// ---------------------------------------------------------------------------

const sendTemplateEmailSchema = z.object({
  submissionId: z.string().min(1, "Missing submission id."),
  templateSlug: z.enum(EMAIL_TEMPLATE_SLUGS, {
    errorMap: () => ({ message: "Please choose a valid email template." }),
  }),
  customMessage: z.string().trim().max(5000).optional(),
  toOverride: z.string().trim().email("Please enter a valid recipient email.").optional().or(z.literal("")),
});

export interface SendTemplateEmailInput {
  submissionId: string;
  templateSlug: EmailTemplateSlug;
  customMessage?: string;
  toOverride?: string;
}

export interface SendTemplateEmailResult extends ActionResult {
  skipped?: boolean;
}

/**
 * Loads the requested template (falling back to the hardcoded defaults if
 * the `email_templates` table is empty or unreachable), substitutes the
 * merge fields, sends via `sendEmail`, logs the send to
 * `submission_email_log`, and bumps `last_contact_at` on the submission.
 *
 * This is always triggered by an explicit admin action — nothing in this
 * codebase calls `sendTemplateEmail` automatically on a status change or
 * any other background event.
 */
export async function sendTemplateEmail(input: SendTemplateEmailInput): Promise<SendTemplateEmailResult> {
  try {
    const parsed = sendTemplateEmailSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Please check the email fields and try again.",
      };
    }

    const { submissionId, templateSlug, customMessage, toOverride } = parsed.data;
    const { supabase, user } = await requireSupabaseUser();

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("id, reference_number")
      .eq("id", submissionId)
      .maybeSingle();

    if (submissionError) throw submissionError;
    if (!submission) {
      return { success: false, message: "Submission not found." };
    }

    const [{ data: film }, { data: contact }] = await Promise.all([
      supabase.from("submission_films").select("title").eq("submission_id", submissionId).maybeSingle(),
      supabase.from("submission_contacts").select("full_name, email").eq("submission_id", submissionId).maybeSingle(),
    ]);

    const toEmail = toOverride?.trim() || contact?.email;
    if (!toEmail) {
      return { success: false, message: "No recipient email is available for this submission." };
    }

    const { data: dbTemplate, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("slug", templateSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (templateError) throw templateError;

    // Fall back to the hardcoded defaults when the table is empty or the
    // migration hasn't run yet — admins should never be blocked from
    // sending one of the ten standard operational templates.
    const template: EmailTemplate | null = (dbTemplate as EmailTemplate | null) ?? getDefaultEmailTemplate(templateSlug);

    if (!template) {
      return { success: false, message: "That email template could not be found." };
    }

    const fields = {
      filmmaker_name: contact?.full_name ?? "Filmmaker",
      film_title: film?.title ?? "your project",
      reference_number: submission.reference_number,
      custom_message: customMessage ?? "",
    };

    const subject = mergeEmailTemplate(template.subject, fields);
    const html = mergeEmailTemplate(template.body_html, fields);
    const text = mergeEmailTemplate(template.body_text, fields);

    const sendResult = await sendEmail({ to: toEmail, subject, html, text });

    // Logging and the last-contact bump are internal audit writes tied to
    // an explicit admin action — use the service role so they succeed even
    // if RLS is stricter than expected for the current session, without
    // ever blocking on a logging failure.
    let logClient = supabase;
    try {
      logClient = createAdminClient();
    } catch {
      // Fall back to the authenticated session client if the service role
      // key isn't configured in this environment (e.g. local dev).
    }

    const { error: logError } = await logClient.from("submission_email_log").insert({
      submission_id: submissionId,
      template_slug: templateSlug,
      to_email: toEmail,
      subject,
      body_html: html,
      body_text: text,
      sent_by: user.id,
      status: sendResult.success ? (sendResult.skipped ? "skipped" : "sent") : "failed",
    });

    if (logError) {
      console.error("[admin-email] Failed to record email log entry:", logError);
    }

    if (sendResult.success) {
      const { error: contactError } = await logClient
        .from("submissions")
        .update({ last_contact_at: new Date().toISOString() })
        .eq("id", submissionId);
      if (contactError) {
        console.error("[admin-email] Failed to update last_contact_at:", contactError);
      }
    }

    revalidatePath(`/admin/submissions/${submissionId}`);

    if (!sendResult.success) {
      return { success: false, message: sendResult.error ?? "Unable to send this email right now." };
    }

    return {
      success: true,
      skipped: sendResult.skipped,
      message: sendResult.skipped
        ? "Email logged, but not actually sent — RESEND_API_KEY is not configured in this environment."
        : "Email sent.",
    };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Edit templates (subject / body) — /admin/templates
// ---------------------------------------------------------------------------

const updateEmailTemplateSchema = z.object({
  slug: z.enum(EMAIL_TEMPLATE_SLUGS, {
    errorMap: () => ({ message: "Please choose a valid email template." }),
  }),
  subject: z.string().trim().min(1, "Subject is required.").max(300),
  body_html: z.string().trim().min(1, "HTML body is required."),
  body_text: z.string().trim().min(1, "Text body is required."),
});

export interface UpdateEmailTemplateInput {
  slug: EmailTemplateSlug;
  subject: string;
  body_html: string;
  body_text: string;
}

/**
 * Upserts an edited template by slug. Upsert (rather than update) so the
 * first edit to a template works even if the `email_templates` table was
 * never seeded — the fallback defaults' name/description are reused so the
 * row stays consistent with the hardcoded copies.
 */
export async function updateEmailTemplate(input: UpdateEmailTemplateInput): Promise<ActionResult> {
  try {
    const parsed = updateEmailTemplateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Please check the template fields and try again.",
      };
    }

    const { supabase, user } = await requireSupabaseUser();
    const fallback = getDefaultEmailTemplate(parsed.data.slug);

    const { error } = await supabase.from("email_templates").upsert(
      {
        slug: parsed.data.slug,
        name: fallback?.name ?? parsed.data.slug,
        subject: parsed.data.subject,
        body_html: parsed.data.body_html,
        body_text: parsed.data.body_text,
        description: fallback?.description ?? null,
        updated_by: user.id,
      },
      { onConflict: "slug" },
    );

    if (error) throw error;

    revalidatePath("/admin/templates");

    return { success: true, message: "Template saved." };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}
