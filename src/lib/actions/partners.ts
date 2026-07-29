"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "@/lib/demo-mode";
import { slugify, sanitizeText } from "@/lib/utils";
import { PARTNER_TYPES } from "@/lib/constants";
import type { PartnerPage } from "@/types/database";

export interface ActionResult {
  success: boolean;
  message?: string;
  partner?: PartnerPage;
}

function toMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

const PARTNER_TYPE_VALUES = PARTNER_TYPES.map((item) => item.value);

export interface UpsertPartnerInput {
  id?: string;
  slug?: string;
  partner_name: string;
  partner_type?: string;
  headline?: string;
  introduction?: string;
  seeking?: string;
  submission_cta_label?: string;
  resource_download_slug?: string;
  contact_email?: string;
  contact_note?: string;
  tracking_source?: string;
  tracking_medium?: string;
  tracking_campaign?: string;
  is_published?: boolean;
}

function normalizePartnerPayload(input: UpsertPartnerInput) {
  const partnerName = sanitizeText(input.partner_name ?? "", 200);
  if (!partnerName) {
    throw new Error("Partner name is required.");
  }

  const slug = slugify(input.slug?.trim() || partnerName);
  if (!slug) {
    throw new Error("A valid slug is required.");
  }

  const partnerType = input.partner_type?.trim() || "other";
  if (!PARTNER_TYPE_VALUES.includes(partnerType as (typeof PARTNER_TYPE_VALUES)[number])) {
    throw new Error("Please choose a valid partner type.");
  }

  return {
    slug,
    partner_name: partnerName,
    partner_type: partnerType,
    headline: sanitizeText(input.headline ?? "", 300) || null,
    introduction: sanitizeText(input.introduction ?? "", 5000) || null,
    seeking: sanitizeText(input.seeking ?? "", 5000) || null,
    submission_cta_label: sanitizeText(input.submission_cta_label ?? "", 120) || "Submit your film",
    resource_download_slug: sanitizeText(input.resource_download_slug ?? "", 200) || null,
    contact_email: sanitizeText(input.contact_email ?? "", 200) || null,
    contact_note: sanitizeText(input.contact_note ?? "", 1000) || null,
    tracking_source: sanitizeText(input.tracking_source ?? "", 200) || slug,
    tracking_medium: sanitizeText(input.tracking_medium ?? "", 200) || "partner",
    tracking_campaign: sanitizeText(input.tracking_campaign ?? "", 200) || slug,
    is_published: Boolean(input.is_published),
  };
}

async function requireAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage partners.");
  }

  return { supabase, user };
}

export async function upsertPartner(input: UpsertPartnerInput): Promise<ActionResult> {
  try {
    const payload = normalizePartnerPayload(input);

    if (!isSupabaseEnvConfigured()) {
      if (isDemoModeAllowed()) {
        console.log("[demo] upsertPartner:", JSON.stringify({ id: input.id, ...payload }, null, 2));
        return {
          success: true,
          message: "Partner saved in demo mode (Supabase not configured).",
          partner: {
            id: input.id ?? `demo-partner-${payload.slug}`,
            ...payload,
            created_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }
      return { success: false, message: "Supabase is not configured." };
    }

    const { supabase, user } = await requireAdminSession();

    if (input.id) {
      const { data, error } = await supabase
        .from("partner_pages")
        .update(payload)
        .eq("id", input.id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (!data) return { success: false, message: "Partner not found." };

      revalidatePath("/admin/partners");
      revalidatePath(`/partners/${payload.slug}`);
      return { success: true, message: "Partner updated.", partner: data as PartnerPage };
    }

    const { data, error } = await supabase
      .from("partner_pages")
      .insert({ ...payload, created_by: user.id })
      .select("*")
      .maybeSingle();

    if (error) throw error;

    revalidatePath("/admin/partners");
    revalidatePath(`/partners/${payload.slug}`);
    return { success: true, message: "Partner created.", partner: data as PartnerPage };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

export async function togglePublish(partnerId: string, isPublished: boolean): Promise<ActionResult> {
  try {
    if (!partnerId) {
      return { success: false, message: "Missing partner id." };
    }

    if (!isSupabaseEnvConfigured()) {
      if (isDemoModeAllowed()) {
        console.log("[demo] togglePublish:", { partnerId, isPublished });
        return {
          success: true,
          message: isPublished
            ? "Partner published in demo mode (Supabase not configured)."
            : "Partner unpublished in demo mode (Supabase not configured).",
        };
      }
      return { success: false, message: "Supabase is not configured." };
    }

    const { supabase } = await requireAdminSession();
    const { data, error } = await supabase
      .from("partner_pages")
      .update({ is_published: isPublished })
      .eq("id", partnerId)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return { success: false, message: "Partner not found." };

    revalidatePath("/admin/partners");
    revalidatePath(`/partners/${(data as PartnerPage).slug}`);
    return {
      success: true,
      message: isPublished ? "Partner published." : "Partner unpublished.",
      partner: data as PartnerPage,
    };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}
