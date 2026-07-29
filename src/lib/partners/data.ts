import { createClient } from "@/lib/supabase/server";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "@/lib/demo-mode";
import type { PartnerPage } from "@/types/database";
import { DEMO_PARTNERS } from "./demo-partners";

export type PartnerQueryResult<T> = {
  data: T;
  configured: boolean;
  demo: boolean;
  error?: string;
};

async function trySupabasePartners(): Promise<PartnerPage[] | null> {
  if (!isSupabaseEnvConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("partner_pages")
      .select("*")
      .order("partner_name", { ascending: true });

    if (error) {
      console.error("[partners] list failed:", error.message);
      return null;
    }

    return (data ?? []) as PartnerPage[];
  } catch (error) {
    console.error("[partners] client unavailable:", error);
    return null;
  }
}

export async function listPublishedPartners(): Promise<PartnerQueryResult<PartnerPage[]>> {
  const rows = await trySupabasePartners();

  if (rows) {
    return {
      data: rows.filter((row) => row.is_published),
      configured: true,
      demo: false,
    };
  }

  if (isDemoModeAllowed()) {
    return {
      data: DEMO_PARTNERS.filter((row) => row.is_published),
      configured: false,
      demo: true,
    };
  }

  return { data: [], configured: false, demo: false, error: "Partners are unavailable." };
}

export async function listAllPartners(): Promise<PartnerQueryResult<PartnerPage[]>> {
  const rows = await trySupabasePartners();

  if (rows) {
    return { data: rows, configured: true, demo: false };
  }

  if (isDemoModeAllowed()) {
    return { data: [...DEMO_PARTNERS], configured: false, demo: true };
  }

  return { data: [], configured: false, demo: false, error: "Partners are unavailable." };
}

export async function getPartnerBySlug(slug: string): Promise<PartnerQueryResult<PartnerPage | null>> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) {
    return { data: null, configured: isSupabaseEnvConfigured(), demo: false };
  }

  if (isSupabaseEnvConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("partner_pages")
        .select("*")
        .eq("slug", normalized)
        .maybeSingle();

      if (!error && data) {
        return { data: data as PartnerPage, configured: true, demo: false };
      }
    } catch (error) {
      console.error("[partners] getPartnerBySlug failed:", error);
    }
  }

  if (isDemoModeAllowed()) {
    const demo = DEMO_PARTNERS.find((row) => row.slug === normalized && row.is_published) ?? null;
    return { data: demo, configured: false, demo: Boolean(demo) };
  }

  return { data: null, configured: false, demo: false, error: "Partner not found." };
}
