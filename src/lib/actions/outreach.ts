"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  OUTREACH_LEAD_STATUSES,
  type OutreachLeadStatus,
  type OutreachMessageStatus,
} from "@/lib/constants";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "@/lib/demo-mode";
import {
  addDemoFollowUp,
  addDemoLeads,
  addDemoReply,
  getDemoOutreachLead,
  upsertDemoLead,
  upsertDemoMessage,
} from "@/lib/admin/outreach-demo";
import { sanitizeText } from "@/lib/utils";
import type { OutreachFollowUp, OutreachLead, OutreachMessage, OutreachReply } from "@/types/database";

export interface ActionResult {
  success: boolean;
  message?: string;
  id?: string;
  count?: number;
}

function toMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function requireAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in to manage outreach.");
  }

  return { supabase, user };
}

function isOutreachDemoMode(): boolean {
  return !isSupabaseEnvConfigured() && isDemoModeAllowed();
}

export interface UpdateLeadInput {
  id: string;
  filmmaker_name?: string;
  film_title?: string | null;
  email?: string | null;
  website?: string | null;
  festival?: string | null;
  genre?: string | null;
  completion_year?: number | null;
  country?: string | null;
  source_url?: string | null;
  why_it_may_fit?: string | null;
  personalized_note?: string | null;
  status?: OutreachLeadStatus;
  partner_slug?: string | null;
  next_follow_up_at?: string | null;
  submission_id?: string | null;
}

export async function updateLead(input: UpdateLeadInput): Promise<ActionResult> {
  try {
    if (!input.id) return { success: false, message: "Missing lead id." };
    if (input.status && !OUTREACH_LEAD_STATUSES.includes(input.status)) {
      return { success: false, message: "Invalid lead status." };
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.filmmaker_name !== undefined) patch.filmmaker_name = sanitizeText(input.filmmaker_name, 200);
    if (input.film_title !== undefined) patch.film_title = sanitizeText(input.film_title ?? "", 300) || null;
    if (input.email !== undefined) patch.email = sanitizeText(input.email ?? "", 200) || null;
    if (input.website !== undefined) patch.website = sanitizeText(input.website ?? "", 500) || null;
    if (input.festival !== undefined) patch.festival = sanitizeText(input.festival ?? "", 200) || null;
    if (input.genre !== undefined) patch.genre = sanitizeText(input.genre ?? "", 120) || null;
    if (input.completion_year !== undefined) patch.completion_year = input.completion_year;
    if (input.country !== undefined) patch.country = sanitizeText(input.country ?? "", 120) || null;
    if (input.source_url !== undefined) patch.source_url = sanitizeText(input.source_url ?? "", 500) || null;
    if (input.why_it_may_fit !== undefined) {
      patch.why_it_may_fit = sanitizeText(input.why_it_may_fit ?? "", 5000) || null;
    }
    if (input.personalized_note !== undefined) {
      patch.personalized_note = sanitizeText(input.personalized_note ?? "", 5000) || null;
    }
    if (input.status !== undefined) patch.status = input.status;
    if (input.partner_slug !== undefined) {
      patch.partner_slug = sanitizeText(input.partner_slug ?? "", 200) || null;
    }
    if (input.next_follow_up_at !== undefined) patch.next_follow_up_at = input.next_follow_up_at;
    if (input.submission_id !== undefined) patch.submission_id = input.submission_id;

    if (isOutreachDemoMode()) {
      const detail = getDemoOutreachLead(input.id);
      if (!detail) return { success: false, message: "Lead not found." };
      const updated = { ...detail.lead, ...patch } as OutreachLead;
      upsertDemoLead(updated);
      console.log("[demo] updateLead:", JSON.stringify(updated, null, 2));
      revalidatePath("/admin/outreach");
      revalidatePath(`/admin/outreach/${input.id}`);
      return { success: true, message: "Lead updated (demo mode)." };
    }

    const { supabase } = await requireAdminSession();
    const { error } = await supabase.from("outreach_leads").update(patch).eq("id", input.id);
    if (error) throw error;

    revalidatePath("/admin/outreach");
    revalidatePath(`/admin/outreach/${input.id}`);
    return { success: true, message: "Lead updated." };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

export interface CsvLeadRow {
  filmmaker_name: string;
  film_title?: string;
  email?: string;
  website?: string;
  festival?: string;
  genre?: string;
  completion_year?: number | null;
  country?: string;
  source_url?: string;
  why_it_may_fit?: string;
  personalized_note?: string;
  status?: OutreachLeadStatus;
}

export async function importLeadsCsv(rows: CsvLeadRow[], importBatchId?: string): Promise<ActionResult> {
  try {
    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, message: "No rows to import." };
    }

    const batchId = sanitizeText(importBatchId ?? `csv-${Date.now()}`, 120);
    const now = new Date().toISOString();

    const prepared = rows
      .map((row) => {
        const filmmakerName = sanitizeText(row.filmmaker_name ?? "", 200);
        if (!filmmakerName) return null;

        const status =
          row.status && OUTREACH_LEAD_STATUSES.includes(row.status) ? row.status : "discovered";

        return {
          filmmaker_name: filmmakerName,
          film_title: sanitizeText(row.film_title ?? "", 300) || null,
          email: sanitizeText(row.email ?? "", 200) || null,
          website: sanitizeText(row.website ?? "", 500) || null,
          festival: sanitizeText(row.festival ?? "", 200) || null,
          genre: sanitizeText(row.genre ?? "", 120) || null,
          completion_year: typeof row.completion_year === "number" ? row.completion_year : null,
          country: sanitizeText(row.country ?? "", 120) || null,
          source_url: sanitizeText(row.source_url ?? "", 500) || null,
          why_it_may_fit: sanitizeText(row.why_it_may_fit ?? "", 5000) || null,
          personalized_note: sanitizeText(row.personalized_note ?? "", 5000) || null,
          status,
          import_batch_id: batchId,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    if (prepared.length === 0) {
      return { success: false, message: "No valid rows found. Filmmaker name is required." };
    }

    if (isOutreachDemoMode()) {
      const demoRows: OutreachLead[] = prepared.map((row) => ({
        id: newId("demo-lead"),
        ...row,
        festival_id: null,
        film_school_id: null,
        producer_org_id: null,
        partner_slug: null,
        assigned_to: null,
        next_follow_up_at: null,
        last_contacted_at: null,
        submission_id: null,
        created_at: now,
        updated_at: now,
      }));
      addDemoLeads(demoRows);
      console.log("[demo] importLeadsCsv:", demoRows.length, "rows", batchId);
      revalidatePath("/admin/outreach");
      return {
        success: true,
        message: `Imported ${demoRows.length} leads in demo mode.`,
        count: demoRows.length,
      };
    }

    const { supabase } = await requireAdminSession();
    const { error } = await supabase.from("outreach_leads").insert(prepared);
    if (error) throw error;

    revalidatePath("/admin/outreach");
    return { success: true, message: `Imported ${prepared.length} leads.`, count: prepared.length };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

export interface CreateMessageInput {
  leadId: string;
  subject: string;
  body: string;
  campaignId?: string | null;
}

export async function createMessage(input: CreateMessageInput): Promise<ActionResult> {
  try {
    const subject = sanitizeText(input.subject ?? "", 300);
    const body = sanitizeText(input.body ?? "", 20000);
    if (!input.leadId) return { success: false, message: "Missing lead id." };
    if (!subject || !body) return { success: false, message: "Subject and body are required." };

    if (isOutreachDemoMode()) {
      const id = newId("demo-msg");
      const message: OutreachMessage = {
        id,
        lead_id: input.leadId,
        campaign_id: input.campaignId ?? null,
        subject,
        body,
        status: "draft",
        approved_by: null,
        approved_at: null,
        sent_by: null,
        sent_at: null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      upsertDemoMessage(message);
      console.log("[demo] createMessage:", message);
      revalidatePath(`/admin/outreach/${input.leadId}`);
      return { success: true, message: "Draft saved (demo mode).", id };
    }

    const { supabase, user } = await requireAdminSession();
    const { data, error } = await supabase
      .from("outreach_messages")
      .insert({
        lead_id: input.leadId,
        campaign_id: input.campaignId ?? null,
        subject,
        body,
        status: "draft",
        created_by: user.id,
      })
      .select("id")
      .maybeSingle();

    if (error) throw error;
    revalidatePath(`/admin/outreach/${input.leadId}`);
    return { success: true, message: "Draft saved.", id: data?.id };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

async function transitionMessage(
  messageId: string,
  leadId: string,
  nextStatus: OutreachMessageStatus,
  extras: Record<string, unknown> = {},
): Promise<ActionResult> {
  if (isOutreachDemoMode()) {
    const detail = getDemoOutreachLead(leadId);
    const existing = detail?.messages.find((row) => row.id === messageId);
    if (!existing) return { success: false, message: "Message not found." };

    const updated: OutreachMessage = {
      ...existing,
      status: nextStatus,
      updated_at: new Date().toISOString(),
      ...extras,
    } as OutreachMessage;
    upsertDemoMessage(updated);

    if (nextStatus === "sent") {
      const lead = detail!.lead;
      upsertDemoLead({
        ...lead,
        status: lead.status === "discovered" || lead.status === "qualified" ? "contacted" : lead.status,
        last_contacted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    console.log("[demo] transitionMessage:", { messageId, nextStatus, extras });
    revalidatePath(`/admin/outreach/${leadId}`);
    revalidatePath("/admin/outreach");
    return { success: true, message: `Message marked ${nextStatus} (demo mode).` };
  }

  const { supabase, user } = await requireAdminSession();
  const payload: Record<string, unknown> = { status: nextStatus, ...extras };

  if (nextStatus === "approved") {
    payload.approved_by = user.id;
    payload.approved_at = new Date().toISOString();
  }
  if (nextStatus === "sent") {
    payload.sent_by = user.id;
    payload.sent_at = new Date().toISOString();
  }

  const { error } = await supabase.from("outreach_messages").update(payload).eq("id", messageId);
  if (error) throw error;

  if (nextStatus === "sent") {
    await supabase
      .from("outreach_leads")
      .update({ last_contacted_at: new Date().toISOString() })
      .eq("id", leadId);
  }

  revalidatePath(`/admin/outreach/${leadId}`);
  revalidatePath("/admin/outreach");
  return { success: true, message: `Message marked ${nextStatus}.` };
}

export async function requestApproval(messageId: string, leadId: string): Promise<ActionResult> {
  try {
    if (!messageId || !leadId) return { success: false, message: "Missing message or lead id." };
    return await transitionMessage(messageId, leadId, "pending_approval");
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

export async function approveMessage(messageId: string, leadId: string): Promise<ActionResult> {
  try {
    if (!messageId || !leadId) return { success: false, message: "Missing message or lead id." };
    const extras = isOutreachDemoMode()
      ? { approved_at: new Date().toISOString(), approved_by: null }
      : {};
    return await transitionMessage(messageId, leadId, "approved", extras);
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

/** Manual only — does not send email. Human sends outside the app, then marks sent. */
export async function markMessageSent(messageId: string, leadId: string): Promise<ActionResult> {
  try {
    if (!messageId || !leadId) return { success: false, message: "Missing message or lead id." };
    const extras = isOutreachDemoMode()
      ? { sent_at: new Date().toISOString(), sent_by: null }
      : {};
    return await transitionMessage(messageId, leadId, "sent", extras);
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

export interface AddFollowUpInput {
  leadId: string;
  dueAt: string;
  note?: string;
}

export async function addFollowUp(input: AddFollowUpInput): Promise<ActionResult> {
  try {
    if (!input.leadId || !input.dueAt) {
      return { success: false, message: "Lead and due date are required." };
    }
    const note = sanitizeText(input.note ?? "", 2000) || null;

    if (isOutreachDemoMode()) {
      const followUp: OutreachFollowUp = {
        id: newId("demo-fu"),
        lead_id: input.leadId,
        due_at: input.dueAt,
        note,
        completed_at: null,
        created_by: null,
        created_at: new Date().toISOString(),
      };
      addDemoFollowUp(followUp);
      console.log("[demo] addFollowUp:", followUp);
      revalidatePath(`/admin/outreach/${input.leadId}`);
      return { success: true, message: "Follow-up added (demo mode).", id: followUp.id };
    }

    const { supabase, user } = await requireAdminSession();
    const { data, error } = await supabase
      .from("outreach_follow_ups")
      .insert({
        lead_id: input.leadId,
        due_at: input.dueAt,
        note,
        created_by: user.id,
      })
      .select("id")
      .maybeSingle();

    if (error) throw error;
    revalidatePath(`/admin/outreach/${input.leadId}`);
    return { success: true, message: "Follow-up added.", id: data?.id };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

export interface AddReplyInput {
  leadId: string;
  body: string;
  messageId?: string | null;
  receivedAt?: string;
}

export async function addReply(input: AddReplyInput): Promise<ActionResult> {
  try {
    const body = sanitizeText(input.body ?? "", 10000);
    if (!input.leadId || !body) {
      return { success: false, message: "Lead and reply body are required." };
    }

    if (isOutreachDemoMode()) {
      const reply: OutreachReply = {
        id: newId("demo-reply"),
        lead_id: input.leadId,
        message_id: input.messageId ?? null,
        body,
        received_at: input.receivedAt ?? new Date().toISOString(),
        logged_by: null,
        created_at: new Date().toISOString(),
      };
      addDemoReply(reply);
      const detail = getDemoOutreachLead(input.leadId);
      if (detail) {
        upsertDemoLead({
          ...detail.lead,
          status: "replied",
          updated_at: new Date().toISOString(),
        });
      }
      console.log("[demo] addReply:", reply);
      revalidatePath(`/admin/outreach/${input.leadId}`);
      return { success: true, message: "Reply logged (demo mode).", id: reply.id };
    }

    const { supabase, user } = await requireAdminSession();
    const { data, error } = await supabase
      .from("outreach_replies")
      .insert({
        lead_id: input.leadId,
        message_id: input.messageId ?? null,
        body,
        received_at: input.receivedAt ?? new Date().toISOString(),
        logged_by: user.id,
      })
      .select("id")
      .maybeSingle();

    if (error) throw error;

    await supabase.from("outreach_leads").update({ status: "replied" }).eq("id", input.leadId);

    revalidatePath(`/admin/outreach/${input.leadId}`);
    return { success: true, message: "Reply logged.", id: data?.id };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}
