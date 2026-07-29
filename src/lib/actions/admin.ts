"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  SUBMISSION_STATUSES,
  RELEASE_INVESTMENT,
  COMMERCIAL_OUTLOOK,
  STRATEGIC_FIT,
  RIGHTS_READINESS_LEVELS,
  TECHNICAL_READINESS_LEVELS,
  INTERNAL_TAG_OPTIONS,
  type SubmissionStatus,
} from "@/lib/constants";
import { scorecardSchema } from "@/lib/validations/submission";
import { slugify } from "@/lib/utils";
import type { ReleaseEconomics } from "@/types/database";

export interface ActionResult {
  success: boolean;
  message?: string;
}

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
// Status updates
// ---------------------------------------------------------------------------

export interface UpdateStatusInput {
  submissionId: string;
  status: SubmissionStatus;
  note?: string;
  declineReason?: string;
}

export async function updateStatus(input: UpdateStatusInput): Promise<ActionResult> {
  try {
    if (!input.submissionId) {
      return { success: false, message: "Missing submission id." };
    }
    if (!SUBMISSION_STATUSES.includes(input.status)) {
      return { success: false, message: "Please choose a valid status." };
    }
    if (input.status === "declined" && !input.declineReason?.trim()) {
      return { success: false, message: "A decline reason is required when declining a submission." };
    }

    const { supabase, user } = await requireSupabaseUser();

    const { data: current, error: currentError } = await supabase
      .from("submissions")
      .select("status")
      .eq("id", input.submissionId)
      .maybeSingle();

    if (currentError) throw currentError;
    if (!current) {
      return { success: false, message: "Submission not found." };
    }

    const updatePayload: Record<string, unknown> = { status: input.status };
    if (input.status === "declined") {
      updatePayload.decline_reason = input.declineReason?.trim();
    }

    const { error: updateError } = await supabase
      .from("submissions")
      .update(updatePayload)
      .eq("id", input.submissionId);

    if (updateError) throw updateError;

    const { error: historyError } = await supabase.from("submission_status_history").insert({
      submission_id: input.submissionId,
      from_status: current.status,
      to_status: input.status,
      changed_by: user.id,
      note: input.note?.trim() ? input.note.trim() : null,
    });

    if (historyError) throw historyError;

    revalidatePath(`/admin/submissions/${input.submissionId}`);
    revalidatePath("/admin/submissions");
    revalidatePath("/admin");

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Internal notes
// ---------------------------------------------------------------------------

export interface AddNoteInput {
  submissionId: string;
  note: string;
  isInternal?: boolean;
}

export async function addNote(input: AddNoteInput): Promise<ActionResult> {
  try {
    const note = input.note?.trim();
    if (!note) {
      return { success: false, message: "Note cannot be empty." };
    }

    const { supabase, user } = await requireSupabaseUser();

    const { error } = await supabase.from("submission_notes").insert({
      submission_id: input.submissionId,
      author_id: user.id,
      note,
      is_internal: input.isInternal ?? true,
    });

    if (error) throw error;

    revalidatePath(`/admin/submissions/${input.submissionId}`);

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Reviewer assignment
// ---------------------------------------------------------------------------

export async function assignReviewer(
  submissionId: string,
  reviewerId: string | null,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireSupabaseUser();

    const { error } = await supabase
      .from("submissions")
      .update({ assigned_reviewer_id: reviewerId })
      .eq("id", submissionId);

    if (error) throw error;

    revalidatePath(`/admin/submissions/${submissionId}`);
    revalidatePath("/admin/submissions");

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Scorecard + evaluation
// ---------------------------------------------------------------------------

const commercialOutlookValues = COMMERCIAL_OUTLOOK.map((option) => option.value) as [string, ...string[]];
const strategicFitValues = STRATEGIC_FIT.map((option) => option.value) as [string, ...string[]];
const rightsReadinessValues = RIGHTS_READINESS_LEVELS.map((option) => option.value) as [string, ...string[]];
const technicalReadinessValues = TECHNICAL_READINESS_LEVELS.map((option) => option.value) as [string, ...string[]];

const evaluationSchema = z.object({
  scorecard: scorecardSchema,
  recommendation: z.string().trim().max(2000).optional().nullable(),
  estimated_revenue_low: z.number().nonnegative().optional().nullable(),
  estimated_revenue_base: z.number().nonnegative().optional().nullable(),
  estimated_revenue_high: z.number().nonnegative().optional().nullable(),
  proposed_investment_cap: z.number().nonnegative().optional().nullable(),
  key_concerns: z.string().trim().max(5000).optional().nullable(),
  required_follow_up: z.string().trim().max(5000).optional().nullable(),
  acquisition_decision: z.string().trim().max(2000).optional().nullable(),
  commercial_outlook: z.enum(commercialOutlookValues).optional().nullable(),
  strategic_fit: z.enum(strategicFitValues).optional().nullable(),
  rights_readiness_level: z.enum(rightsReadinessValues).optional().nullable(),
  technical_readiness: z.enum(technicalReadinessValues).optional().nullable(),
});

export type EvaluationInput = z.infer<typeof evaluationSchema>;

export async function saveScorecard(
  submissionId: string,
  input: EvaluationInput,
): Promise<ActionResult> {
  try {
    if (!submissionId) {
      return { success: false, message: "Missing submission id." };
    }

    const parsed = evaluationSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Please check the evaluation fields and try again.",
      };
    }

    const { supabase } = await requireSupabaseUser();
    const { scorecard, ...evaluation } = parsed.data;
    // internal_score is purely a derived sum of the 0–10 scorecard criteria.
    // It — and the categorical outlook/fit/readiness selectors above — are
    // informative context only. Neither ever sets or infers
    // acquisition_decision; that stays a deliberate, manually typed call.
    const internalScore = Object.values(scorecard).reduce((sum, value) => sum + value, 0);

    const { error } = await supabase
      .from("submissions")
      .update({
        scorecard,
        internal_score: internalScore,
        recommendation: evaluation.recommendation ?? null,
        estimated_revenue_low: evaluation.estimated_revenue_low ?? null,
        estimated_revenue_base: evaluation.estimated_revenue_base ?? null,
        estimated_revenue_high: evaluation.estimated_revenue_high ?? null,
        proposed_investment_cap: evaluation.proposed_investment_cap ?? null,
        key_concerns: evaluation.key_concerns ?? null,
        required_follow_up: evaluation.required_follow_up ?? null,
        acquisition_decision: evaluation.acquisition_decision ?? null,
        commercial_outlook: evaluation.commercial_outlook ?? null,
        strategic_fit: evaluation.strategic_fit ?? null,
        rights_readiness_level: evaluation.rights_readiness_level ?? null,
        technical_readiness: evaluation.technical_readiness ?? null,
      })
      .eq("id", submissionId);

    if (error) throw error;

    revalidatePath(`/admin/submissions/${submissionId}`);
    revalidatePath("/admin/submissions");

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Triage fields — sidebar workflow (tags, dates, next action)
// ---------------------------------------------------------------------------

const triageFieldsSchema = z.object({
  next_action: z.string().trim().max(1000).optional().nullable(),
  follow_up_date: z.string().trim().max(32).optional().nullable(),
  meeting_date: z.string().trim().max(64).optional().nullable(),
  last_contact_at: z.string().trim().max(64).optional().nullable(),
  internal_tags: z.array(z.enum(INTERNAL_TAG_OPTIONS as unknown as [string, ...string[]])).optional(),
});

export type TriageFieldsInput = z.infer<typeof triageFieldsSchema>;

export async function updateTriageFields(
  submissionId: string,
  input: TriageFieldsInput,
): Promise<ActionResult> {
  try {
    if (!submissionId) {
      return { success: false, message: "Missing submission id." };
    }

    const parsed = triageFieldsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Please check the fields and try again.",
      };
    }

    const { supabase } = await requireSupabaseUser();
    const value = parsed.data;

    const { error } = await supabase
      .from("submissions")
      .update({
        next_action: value.next_action?.trim() || null,
        follow_up_date: value.follow_up_date || null,
        meeting_date: value.meeting_date || null,
        last_contact_at: value.last_contact_at || null,
        internal_tags: value.internal_tags ?? [],
      })
      .eq("id", submissionId);

    if (error) throw error;

    revalidatePath(`/admin/submissions/${submissionId}`);
    revalidatePath("/admin/submissions");

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Triage actions — sidebar shortcut buttons
// ---------------------------------------------------------------------------

export async function markPotentialAcquisition(submissionId: string): Promise<ActionResult> {
  return updateStatus({
    submissionId,
    status: "offer_considered",
    note: "Marked as a potential acquisition from the submission sidebar.",
  });
}

export async function archiveSubmission(submissionId: string): Promise<ActionResult> {
  return updateStatus({
    submissionId,
    status: "archived",
    note: "Archived from the submission sidebar.",
  });
}

// ---------------------------------------------------------------------------
// Offer summary draft
// ---------------------------------------------------------------------------

export async function saveOfferSummary(submissionId: string, draft: string): Promise<ActionResult> {
  try {
    if (!submissionId) {
      return { success: false, message: "Missing submission id." };
    }

    const { supabase } = await requireSupabaseUser();

    const { error } = await supabase
      .from("submissions")
      .update({ offer_summary_draft: draft.trim().slice(0, 20000) || null })
      .eq("id", submissionId);

    if (error) throw error;

    revalidatePath(`/admin/submissions/${submissionId}`);

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Release economics
// ---------------------------------------------------------------------------

const economicsSchema = z.object({
  expected_gross: z.number().nonnegative(),
  platform_deductions: z.number().nonnegative(),
  direct_expenses: z.number().nonnegative(),
  release_investment: z.number().nonnegative(),
  filmmaker_percent: z.number().min(0).max(100),
  studio_percent: z.number().min(0).max(100),
  case_low_gross: z.number().nonnegative().optional().nullable(),
  case_base_gross: z.number().nonnegative().optional().nullable(),
  case_high_gross: z.number().nonnegative().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function saveEconomics(
  submissionId: string,
  input: ReleaseEconomics,
): Promise<ActionResult> {
  try {
    if (!submissionId) {
      return { success: false, message: "Missing submission id." };
    }

    const parsed = economicsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Please check the economics fields and try again.",
      };
    }

    const { supabase } = await requireSupabaseUser();

    const { error } = await supabase
      .from("submissions")
      .update({ economics: parsed.data })
      .eq("id", submissionId);

    if (error) throw error;

    revalidatePath(`/admin/submissions/${submissionId}`);

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Convert to film record
// ---------------------------------------------------------------------------

export interface ConvertSubmissionResult extends ActionResult {
  filmId?: string;
}

export async function convertSubmissionToFilm(submissionId: string): Promise<ConvertSubmissionResult> {
  try {
    if (!submissionId) {
      return { success: false, message: "Missing submission id." };
    }

    const { supabase, user } = await requireSupabaseUser();

    const { data: existingFilm } = await supabase
      .from("films")
      .select("id")
      .eq("submission_id", submissionId)
      .maybeSingle();

    if (existingFilm) {
      return { success: true, filmId: existingFilm.id, message: "A film record already exists for this submission." };
    }

    const [
      { data: submission, error: submissionError },
      { data: film, error: filmError },
      { data: contact, error: contactError },
    ] = await Promise.all([
      supabase.from("submissions").select("*").eq("id", submissionId).maybeSingle(),
      supabase.from("submission_films").select("*").eq("submission_id", submissionId).maybeSingle(),
      supabase.from("submission_contacts").select("email").eq("submission_id", submissionId).maybeSingle(),
    ]);

    if (submissionError) throw submissionError;
    if (filmError) throw filmError;
    if (contactError) throw contactError;
    if (!submission || !film) {
      return { success: false, message: "This submission is missing film details and cannot be converted yet." };
    }

    const baseSlug = slugify(film.title || `film-${submissionId.slice(0, 8)}`) || `film-${submissionId.slice(0, 8)}`;
    let slug = baseSlug;
    let attempt = 0;
    // Guarantee slug uniqueness without relying on a DB-level retry loop —
    // conflicts are rare (only when two films share a title), so a short
    // bounded loop is sufficient here.
    while (attempt < 10) {
      const { data: clash } = await supabase.from("films").select("id").eq("slug", slug).maybeSingle();
      if (!clash) break;
      attempt += 1;
      slug = `${baseSlug}-${attempt + 1}`;
    }

    // A submission that is already onboarding stays onboarding; everything
    // else lands on "signed" the moment a film record is created.
    const targetStatus: SubmissionStatus = submission.status === "onboarding" ? "onboarding" : "signed";

    // Best-effort link to an existing filmmaker profile by matching email —
    // never blocks the conversion if no match is found.
    let filmmakerProfileId: string | null = null;
    if (contact?.email) {
      const { data: matchingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", contact.email)
        .maybeSingle();
      filmmakerProfileId = matchingProfile?.id ?? null;
    }

    const { data: created, error: createError } = await supabase
      .from("films")
      .insert({
        submission_id: submissionId,
        title: film.title,
        slug,
        status: targetStatus,
        synopsis: film.synopsis ?? null,
        genre: film.genre ?? null,
        runtime_minutes: film.runtime_minutes ?? null,
        release_year: film.completion_year ?? null,
        filmmaker_profile_id: filmmakerProfileId,
        release_investment:
          submission.proposed_investment_cap && submission.proposed_investment_cap > 0
            ? submission.proposed_investment_cap
            : RELEASE_INVESTMENT.total,
        recouped_amount: 0,
        filmmaker_share_percent:
          submission.economics?.filmmaker_percent ?? RELEASE_INVESTMENT.filmmakerSharePercent,
        studio_share_percent: submission.economics?.studio_percent ?? RELEASE_INVESTMENT.studioSharePercent,
      })
      .select("id")
      .single();

    if (createError) throw createError;

    const { error: statusError } = await supabase
      .from("submissions")
      .update({ status: targetStatus })
      .eq("id", submissionId);
    if (statusError) throw statusError;

    const { error: historyError } = await supabase.from("submission_status_history").insert({
      submission_id: submissionId,
      from_status: submission.status,
      to_status: targetStatus,
      changed_by: user.id,
      note: "Converted to film record",
    });
    if (historyError) throw historyError;

    revalidatePath(`/admin/submissions/${submissionId}`);
    revalidatePath("/admin/submissions");
    revalidatePath("/admin/films");
    revalidatePath(`/admin/films/${created.id}`);
    revalidatePath("/admin");

    return { success: true, filmId: created.id, message: "Film record created." };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}

// ---------------------------------------------------------------------------
// Film portal data
// ---------------------------------------------------------------------------

const filmUpdateSchema = z.object({
  status: z.string().trim().min(1).max(60).optional(),
  synopsis: z.string().trim().max(5000).optional().nullable(),
  release_investment: z.number().nonnegative().optional().nullable(),
  recouped_amount: z.number().nonnegative().optional().nullable(),
  filmmaker_share_percent: z.number().min(0).max(100).optional().nullable(),
  studio_share_percent: z.number().min(0).max(100).optional().nullable(),
});

export type FilmUpdateInput = z.infer<typeof filmUpdateSchema>;

export async function updateFilmData(filmId: string, input: FilmUpdateInput): Promise<ActionResult> {
  try {
    if (!filmId) {
      return { success: false, message: "Missing film id." };
    }

    const parsed = filmUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? "Please check the film fields and try again.",
      };
    }

    const { supabase } = await requireSupabaseUser();

    const { error } = await supabase.from("films").update(parsed.data).eq("id", filmId);
    if (error) throw error;

    revalidatePath(`/admin/films/${filmId}`);
    revalidatePath("/admin/films");

    return { success: true };
  } catch (err) {
    return { success: false, message: toMessage(err) };
  }
}
