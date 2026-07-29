import { createClient } from "@/lib/supabase/server";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "@/lib/demo-mode";
import {
  getDemoOutreachLead,
  listDemoOutreachLeads,
  type OutreachLeadDetail,
} from "@/lib/admin/outreach-demo";
import type { OutreachLeadStatus } from "@/lib/constants";
import type { OutreachLead } from "@/types/database";

export type OutreachQueryResult<T> = {
  data: T;
  configured: boolean;
  demo: boolean;
  error?: string;
};

export async function listOutreachLeads(
  status: OutreachLeadStatus | "all" = "all",
): Promise<OutreachQueryResult<OutreachLead[]>> {
  if (isSupabaseEnvConfigured()) {
    try {
      const supabase = await createClient();
      let query = supabase.from("outreach_leads").select("*").order("updated_at", { ascending: false });
      if (status !== "all") {
        query = query.eq("status", status);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { data: (data ?? []) as OutreachLead[], configured: true, demo: false };
    } catch (error) {
      console.error("[outreach] list failed:", error);
      if (!isDemoModeAllowed()) {
        return {
          data: [],
          configured: true,
          demo: false,
          error: error instanceof Error ? error.message : "Unable to load leads.",
        };
      }
    }
  }

  if (isDemoModeAllowed()) {
    return { data: listDemoOutreachLeads(status), configured: false, demo: true };
  }

  return { data: [], configured: false, demo: false, error: "Outreach is unavailable." };
}

export async function getOutreachLeadDetail(
  id: string,
): Promise<OutreachQueryResult<OutreachLeadDetail | null>> {
  if (isSupabaseEnvConfigured()) {
    try {
      const supabase = await createClient();
      const { data: lead, error } = await supabase
        .from("outreach_leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (lead) {
        const [messages, followUps, replies] = await Promise.all([
          supabase
            .from("outreach_messages")
            .select("*")
            .eq("lead_id", id)
            .order("created_at", { ascending: false }),
          supabase
            .from("outreach_follow_ups")
            .select("*")
            .eq("lead_id", id)
            .order("due_at", { ascending: true }),
          supabase
            .from("outreach_replies")
            .select("*")
            .eq("lead_id", id)
            .order("received_at", { ascending: false }),
        ]);

        return {
          data: {
            lead: lead as OutreachLead,
            messages: messages.data ?? [],
            followUps: followUps.data ?? [],
            replies: replies.data ?? [],
          },
          configured: true,
          demo: false,
        };
      }
    } catch (error) {
      console.error("[outreach] detail failed:", error);
      if (!isDemoModeAllowed()) {
        return {
          data: null,
          configured: true,
          demo: false,
          error: error instanceof Error ? error.message : "Unable to load lead.",
        };
      }
    }
  }

  if (isDemoModeAllowed()) {
    return { data: getDemoOutreachLead(id), configured: false, demo: true };
  }

  return { data: null, configured: false, demo: false, error: "Lead not found." };
}
