"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, hashIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/client";
import {
  adminSubmissionNotificationEmail,
  submissionConfirmationEmail,
} from "@/lib/email/templates";
import { SITE } from "@/lib/constants";
import { isDemoModeAllowed } from "@/lib/demo-mode";
import { referralToDbFields } from "@/lib/referral";
import {
  generateDraftToken,
  generateSubmissionReference,
  isSubmissionReference,
  sanitizeText,
  sanitizeUrl,
} from "@/lib/utils";
import {
  draftSubmissionSchema,
  expectationsSchema,
  filmSchema,
  filmmakerSchema,
  fullSubmissionSchema,
  materialsSchema,
  rightsSchema,
  type ConsentInput,
  type ExpectationsInput,
  type FilmInput,
  type FilmmakerInput,
  type MaterialsInput,
  type RightsInput,
} from "@/lib/validations/submission";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getAdminClientOrNull() {
  if (!isSupabaseConfigured()) return null;
  try {
    return createAdminClient();
  } catch (error) {
    console.error("[submissions] Failed to create Supabase admin client:", error);
    return null;
  }
}

function sanitizeOptionalText(value: unknown, maxLength = 5000): string | null {
  if (typeof value !== "string") return null;
  const cleaned = sanitizeText(value, maxLength);
  return cleaned.length ? cleaned : null;
}

function sanitizeRequiredText(value: unknown, maxLength = 5000): string {
  if (typeof value !== "string") return "";
  return sanitizeText(value, maxLength);
}

function sanitizeOptionalUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return sanitizeUrl(value);
}

function toNullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toNullableDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.trim().slice(0, 32);
}

interface OperationError extends Error {
  code?: string;
}

// ---------------------------------------------------------------------------
// Draft submission resolution (shared by draft save + file upload)
// ---------------------------------------------------------------------------

export interface ResolvedDraft {
  id: string;
  draftToken: string;
  status: string;
}

/**
 * Finds the submission row for a draft token, creating one if it does not
 * exist yet. Throws for callers to translate into an HTTP error, since this
 * is only ever invoked from trusted server contexts (Route Handlers).
 */
export async function getOrCreateDraftSubmission(
  draftTokenInput: string | null | undefined,
  currentStep?: number,
): Promise<ResolvedDraft> {
  const admin = getAdminClientOrNull();

  if (!admin) {
    const error: OperationError = new Error(
      "Submissions storage is not configured on this deployment.",
    );
    error.code = "supabase_unconfigured";
    throw error;
  }

  const providedToken =
    typeof draftTokenInput === "string" && draftTokenInput.length >= 16 ? draftTokenInput : null;

  if (providedToken) {
    const { data: existing, error: lookupError } = await admin
      .from("submissions")
      .select("id, status, draft_token")
      .eq("draft_token", providedToken)
      .maybeSingle();

    if (lookupError) {
      throw new Error(`Unable to look up existing draft: ${lookupError.message}`);
    }

    if (existing) {
      if (existing.status !== "draft") {
        const error: OperationError = new Error(
          "This submission has already been submitted and can no longer be edited.",
        );
        error.code = "already_submitted";
        throw error;
      }

      if (typeof currentStep === "number" && Number.isFinite(currentStep)) {
        await admin
          .from("submissions")
          .update({ current_step: Math.min(Math.max(Math.round(currentStep), 1), 6) })
          .eq("id", existing.id);
      }

      return { id: existing.id, draftToken: existing.draft_token as string, status: existing.status };
    }
  }

  const token = providedToken ?? generateDraftToken();

  const { data: created, error: insertError } = await admin
    .from("submissions")
    .insert({
      draft_token: token,
      status: "draft",
      current_step: typeof currentStep === "number" ? Math.min(Math.max(Math.round(currentStep), 1), 6) : 1,
      reference_number: `DRAFT-${token.slice(0, 16).toUpperCase()}`,
    })
    .select("id, status, draft_token")
    .single();

  if (insertError || !created) {
    throw new Error(`Unable to create draft submission: ${insertError?.message ?? "unknown error"}`);
  }

  return { id: created.id, draftToken: created.draft_token as string, status: created.status };
}

// ---------------------------------------------------------------------------
// Row builders — map validation-schema shapes onto database columns
// ---------------------------------------------------------------------------

function buildContactRow(submissionId: string, value: Partial<FilmmakerInput>) {
  return {
    submission_id: submissionId,
    full_name: sanitizeRequiredText(value.full_name, 200),
    email: typeof value.email === "string" ? value.email.trim().toLowerCase().slice(0, 320) : "",
    phone: sanitizeOptionalText(value.phone, 50),
    company: sanitizeOptionalText(value.company, 200),
    city: sanitizeOptionalText(value.city, 120),
    province_state: sanitizeOptionalText(value.province_state, 120),
    country: sanitizeOptionalText(value.country, 120),
    role_on_film: sanitizeOptionalText(value.role_on_film, 200),
    website: sanitizeOptionalUrl(value.website),
    imdb_profile: sanitizeOptionalUrl(value.imdb_profile),
    how_heard: sanitizeOptionalText(value.how_heard, 500),
  };
}

function buildFilmRow(submissionId: string, value: Partial<FilmInput>) {
  return {
    submission_id: submissionId,
    title: sanitizeRequiredText(value.title, 300),
    alternative_title: sanitizeOptionalText(value.alternative_title, 300),
    format: typeof value.format === "string" ? value.format : null,
    genre: sanitizeOptionalText(value.genre, 120),
    secondary_genre: sanitizeOptionalText(value.secondary_genre, 120),
    runtime_minutes: toNullableNumber(value.runtime_minutes),
    completion_year: toNullableNumber(value.completion_year),
    country_of_origin: sanitizeOptionalText(value.country_of_origin, 120),
    primary_language: sanitizeOptionalText(value.primary_language, 120),
    subtitle_availability: sanitizeOptionalText(value.subtitle_availability, 500),
    logline: sanitizeOptionalText(value.logline, 500),
    synopsis: sanitizeOptionalText(value.synopsis, 5000),
    director: sanitizeOptionalText(value.director, 500),
    producers: sanitizeOptionalText(value.producers, 500),
    principal_cast: sanitizeOptionalText(value.principal_cast, 1000),
    budget_range: typeof value.budget_range === "string" ? value.budget_range : null,
    notable_awards: sanitizeOptionalText(value.notable_awards, 2000),
    festival_history: sanitizeOptionalText(value.festival_history, 2000),
    press_coverage: sanitizeOptionalText(value.press_coverage, 2000),
    target_audience: sanitizeOptionalText(value.target_audience, 1000),
    comparable_films: sanitizeOptionalText(value.comparable_films, 1000),
    audience_rationale: sanitizeOptionalText(value.audience_rationale, 2000),
  };
}

function buildRightsRow(submissionId: string, value: Partial<RightsInput>) {
  return {
    submission_id: submissionId,
    controls_rights: toNullableBoolean(value.controls_rights),
    available_territories: sanitizeOptionalText(value.available_territories, 1000),
    rights_available: sanitizeOptionalText(value.rights_available, 1000),
    existing_agreements: sanitizeOptionalText(value.existing_agreements, 2000),
    previous_distributor: sanitizeOptionalText(value.previous_distributor, 500),
    platform_availability: sanitizeOptionalText(value.platform_availability, 1000),
    current_sales_agent: sanitizeOptionalText(value.current_sales_agent, 500),
    music_clearance_status: sanitizeOptionalText(value.music_clearance_status, 500),
    chain_of_title_status: sanitizeOptionalText(value.chain_of_title_status, 500),
    union_guild_obligations: sanitizeOptionalText(value.union_guild_obligations, 1000),
    existing_debts_liens: sanitizeOptionalText(value.existing_debts_liens, 1000),
    rights_available_date: toNullableDate(value.rights_available_date),
  };
}

/**
 * Builds the materials row WITHOUT the screener_password field. The password
 * is handled separately (see `upsertChildTables`) so that an empty/omitted
 * value on draft autosave or resubmission never overwrites a password that
 * was already saved — only an explicit, non-empty new value may replace it.
 */
function buildMaterialsRow(submissionId: string, value: Partial<MaterialsInput>) {
  return {
    submission_id: submissionId,
    screener_url: sanitizeOptionalUrl(value.screener_url),
    trailer_url: sanitizeOptionalUrl(value.trailer_url),
    caption_availability: sanitizeOptionalText(value.caption_availability, 500),
    master_resolution: sanitizeOptionalText(value.master_resolution, 200),
    audio_configuration: sanitizeOptionalText(value.audio_configuration, 200),
    prores_available: toNullableBoolean(value.prores_available),
    closed_caption_available: toNullableBoolean(value.closed_caption_available),
    dialogue_list_available: toNullableBoolean(value.dialogue_list_available),
    music_cue_sheet_available: toNullableBoolean(value.music_cue_sheet_available),
    eo_insurance_status: sanitizeOptionalText(value.eo_insurance_status, 500),
  };
}

function buildExpectationsRow(submissionId: string, value: Partial<ExpectationsInput>) {
  return {
    submission_id: submissionId,
    primary_release_goal: sanitizeOptionalText(value.primary_release_goal, 1000),
    most_important_territory: sanitizeOptionalText(value.most_important_territory, 500),
    existing_audience_size: sanitizeOptionalText(value.existing_audience_size, 500),
    mailing_list_size: sanitizeOptionalText(value.mailing_list_size, 500),
    social_following: sanitizeOptionalText(value.social_following, 500),
    marketing_participation: sanitizeOptionalText(value.marketing_participation, 1000),
    desired_release_timing: sanitizeOptionalText(value.desired_release_timing, 500),
    revenue_expectations: sanitizeOptionalText(value.revenue_expectations, 1000),
    partnership_success: sanitizeOptionalText(value.partnership_success, 2000),
    additional_context: sanitizeOptionalText(value.additional_context, 3000),
  };
}

async function upsertChildTables(
  admin: NonNullable<ReturnType<typeof getAdminClientOrNull>>,
  submissionId: string,
  groups: {
    filmmaker?: Partial<FilmmakerInput>;
    film?: Partial<FilmInput>;
    rights?: Partial<RightsInput>;
    materials?: Partial<MaterialsInput>;
    expectations?: Partial<ExpectationsInput>;
  },
): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (groups.filmmaker) {
    tasks.push(
      Promise.resolve(
        admin
          .from("submission_contacts")
          .upsert(buildContactRow(submissionId, groups.filmmaker), { onConflict: "submission_id" }),
      ),
    );
  }

  if (groups.film) {
    tasks.push(
      Promise.resolve(
        admin
          .from("submission_films")
          .upsert(buildFilmRow(submissionId, groups.film), { onConflict: "submission_id" }),
      ),
    );
  }

  if (groups.rights) {
    tasks.push(
      Promise.resolve(
        admin
          .from("submission_rights")
          .upsert(buildRightsRow(submissionId, groups.rights), { onConflict: "submission_id" }),
      ),
    );
  }

  if (groups.materials) {
    // Only include screener_password in the upsert payload when a new,
    // non-empty value was actually provided. Postgrest's upsert only
    // touches columns present in the payload on conflict, so omitting the
    // key here preserves whatever password (if any) is already stored.
    const materialsPayload: Record<string, unknown> = buildMaterialsRow(submissionId, groups.materials);
    const newPassword = sanitizeOptionalText(groups.materials.screener_password, 200);
    if (newPassword !== null) {
      materialsPayload.screener_password = newPassword;
    }

    tasks.push(
      Promise.resolve(
        admin
          .from("submission_materials")
          .upsert(materialsPayload, { onConflict: "submission_id" }),
      ),
    );
  }

  if (groups.expectations) {
    tasks.push(
      Promise.resolve(
        admin
          .from("submission_expectations")
          .upsert(buildExpectationsRow(submissionId, groups.expectations), {
            onConflict: "submission_id",
          }),
      ),
    );
  }

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[submissions] Child table upsert failed:", result.reason);
    }
  }
}

// ---------------------------------------------------------------------------
// saveDraft
// ---------------------------------------------------------------------------

export interface SaveDraftResult {
  success: boolean;
  draftToken?: string;
  submissionId?: string;
  updatedAt?: string;
  error?: string;
  demo?: boolean;
}

export async function saveDraft(rawInput: unknown, meta: { ip?: string } = {}): Promise<SaveDraftResult> {
  if (!rawInput || typeof rawInput !== "object") {
    return { success: false, error: "Invalid request." };
  }

  const input = rawInput as Record<string, unknown>;
  const honeypot = typeof input.honeypot === "string" ? input.honeypot : "";

  if (honeypot.trim().length > 0) {
    // Silently reject bot traffic without leaking detection details.
    return { success: false, error: "Unable to save draft." };
  }

  if (meta.ip) {
    const ipHash = await hashIp(meta.ip);
    const rate = checkRateLimit(`draft-save:${ipHash}`, { limit: 180, windowMs: 60 * 60 * 1000 });
    if (!rate.success) {
      return { success: false, error: "Too many requests. Please slow down and try again shortly." };
    }
  }

  const draftToken = typeof input.draftToken === "string" ? input.draftToken : null;

  const parsed = draftSubmissionSchema.safeParse({
    filmmaker: input.filmmaker,
    film: input.film,
    rights: input.rights,
    materials: input.materials,
    expectations: input.expectations,
    consent: input.consent,
    current_step: input.currentStep,
  });

  // Draft saves are best-effort: fall back to whatever raw groups were sent
  // if strict validation fails, so a single malformed field never blocks
  // autosave for the rest of the form.
  const safeGroups = parsed.success
    ? parsed.data
    : {
        filmmaker: filmmakerSchema.partial().safeParse(input.filmmaker).success
          ? (input.filmmaker as Partial<FilmmakerInput>)
          : undefined,
        film: filmSchema.partial().safeParse(input.film).success
          ? (input.film as Partial<FilmInput>)
          : undefined,
        rights: rightsSchema.partial().safeParse(input.rights).success
          ? (input.rights as Partial<RightsInput>)
          : undefined,
        materials: materialsSchema.partial().safeParse(input.materials).success
          ? (input.materials as Partial<MaterialsInput>)
          : undefined,
        expectations: expectationsSchema.partial().safeParse(input.expectations).success
          ? (input.expectations as Partial<ExpectationsInput>)
          : undefined,
        consent: undefined,
        current_step: typeof input.currentStep === "number" ? input.currentStep : undefined,
      };

  const referralFields = referralToDbFields(input.referral);

  if (!isSupabaseConfigured()) {
    if (isDemoModeAllowed()) {
      const token = draftToken ?? generateDraftToken();
      console.log(
        "[demo] Draft saved (Supabase not configured):",
        JSON.stringify({ token, referral: referralFields, ...safeGroups }, null, 2),
      );
      return { success: true, draftToken: token, updatedAt: new Date().toISOString(), demo: true };
    }

    return {
      success: false,
      error:
        "Draft saving is temporarily unavailable. Please configure the Supabase environment variables to enable persistence.",
    };
  }

  const admin = getAdminClientOrNull();

  if (!admin) {
    if (isDemoModeAllowed()) {
      const token = draftToken ?? generateDraftToken();
      return { success: true, draftToken: token, updatedAt: new Date().toISOString(), demo: true };
    }
    return { success: false, error: "Draft saving is temporarily unavailable. Please try again shortly." };
  }

  try {
    const resolved = await getOrCreateDraftSubmission(draftToken, safeGroups.current_step);

    await upsertChildTables(admin, resolved.id, {
      filmmaker: safeGroups.filmmaker,
      film: safeGroups.film,
      rights: safeGroups.rights,
      materials: safeGroups.materials,
      expectations: safeGroups.expectations,
    });

    const submissionPatch: Record<string, unknown> = {};
    if (safeGroups.consent) {
      submissionPatch.consent_flags = safeGroups.consent;
    }
    if (referralFields) {
      Object.assign(submissionPatch, referralFields);
    }
    if (Object.keys(submissionPatch).length > 0) {
      await admin.from("submissions").update(submissionPatch).eq("id", resolved.id);
    }

    return {
      success: true,
      draftToken: resolved.draftToken,
      submissionId: resolved.id,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    const operationError = error as OperationError;

    if (operationError.code === "already_submitted") {
      return { success: false, error: operationError.message };
    }

    console.error("[submissions] saveDraft failed:", error);
    return { success: false, error: "Unable to save your progress right now. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// loadDraft
// ---------------------------------------------------------------------------

export interface LoadDraftResult {
  success: boolean;
  draftToken?: string;
  currentStep?: number;
  alreadySubmitted?: boolean;
  referenceNumber?: string;
  data?: {
    filmmaker?: Partial<FilmmakerInput>;
    film?: Partial<FilmInput>;
    rights?: Partial<RightsInput>;
    materials?: DraftMaterials;
    expectations?: Partial<ExpectationsInput>;
    consent?: Partial<ConsentInput>;
  };
  error?: string;
}

/**
 * The draft materials shape returned to (unauthenticated) public clients.
 * `screener_password` is intentionally never included — see `loadDraft`
 * below. `screener_password_set` is a derived boolean, computed
 * server-side, that lets the resume form show "a password is already
 * saved" without ever exposing the value itself outside of an
 * authenticated admin/reviewer session (see ScreenerCredentials +
 * /api/admin/screener-reveal).
 */
export type DraftMaterials = Omit<Partial<MaterialsInput>, "screener_password"> & {
  screener_password_set?: boolean;
};

const ROW_META_KEYS = new Set(["id", "submission_id", "created_at", "updated_at"]);

function stripRowMeta<T extends Record<string, unknown>>(
  row: T | null | undefined,
): Record<string, unknown> | undefined {
  if (!row) return undefined;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (ROW_META_KEYS.has(key)) continue;
    if (value !== null) cleaned[key] = value;
  }
  return cleaned;
}

export async function loadDraft(token: string | null | undefined): Promise<LoadDraftResult> {
  if (!token || token.length < 16) {
    return { success: false, error: "Missing or invalid draft token." };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "No saved draft could be found for this link." };
  }

  const admin = getAdminClientOrNull();
  if (!admin) {
    return { success: false, error: "Draft loading is temporarily unavailable." };
  }

  const { data: submission, error } = await admin
    .from("submissions")
    .select("id, status, current_step, reference_number")
    .eq("draft_token", token)
    .maybeSingle();

  if (error) {
    console.error("[submissions] loadDraft lookup failed:", error);
    return { success: false, error: "Unable to load your draft right now." };
  }

  if (!submission) {
    return { success: false, error: "No saved draft could be found for this link." };
  }

  if (submission.status !== "draft") {
    return {
      success: false,
      alreadySubmitted: true,
      referenceNumber: submission.reference_number,
      error: "This submission has already been sent and can no longer be edited.",
    };
  }

  const [contact, film, rights, materials, expectations] = await Promise.all([
    admin.from("submission_contacts").select("*").eq("submission_id", submission.id).maybeSingle(),
    admin.from("submission_films").select("*").eq("submission_id", submission.id).maybeSingle(),
    admin.from("submission_rights").select("*").eq("submission_id", submission.id).maybeSingle(),
    admin.from("submission_materials").select("*").eq("submission_id", submission.id).maybeSingle(),
    admin.from("submission_expectations").select("*").eq("submission_id", submission.id).maybeSingle(),
  ]);

  // SECURITY: screener_password is never sent to public/unauthenticated
  // clients, even the filmmaker resuming their own draft. `loadDraft` is
  // reachable from the public /submit page via /api/submissions/draft
  // (no auth required — only a draft token, which may end up in browser
  // history, shared links, etc.), so the raw password is stripped here and
  // replaced with a boolean flag. The real value can only be retrieved by
  // an authenticated admin/reviewer via /api/admin/screener-reveal, which
  // logs every access to submission_access_log.
  const materialsRow = materials.data as (Record<string, unknown> & { screener_password?: string | null }) | null;
  const materialsCleaned = stripRowMeta(materialsRow) as Record<string, unknown> | undefined;
  let draftMaterials: DraftMaterials | undefined;
  if (materialsCleaned) {
    const { screener_password: _, ...rest } = materialsCleaned;
    void _;
    draftMaterials = {
      ...(rest as Partial<MaterialsInput>),
      screener_password_set: Boolean(materialsRow?.screener_password),
    };
  }

  return {
    success: true,
    draftToken: token,
    currentStep: submission.current_step ?? 1,
    data: {
      filmmaker: stripRowMeta(contact.data) as Partial<FilmmakerInput> | undefined,
      film: stripRowMeta(film.data) as Partial<FilmInput> | undefined,
      rights: stripRowMeta(rights.data) as Partial<RightsInput> | undefined,
      materials: draftMaterials,
      expectations: stripRowMeta(expectations.data) as Partial<ExpectationsInput> | undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// submitSubmission
// ---------------------------------------------------------------------------

export interface SubmitSubmissionResult {
  success: boolean;
  referenceNumber?: string;
  submissionId?: string;
  submittedAt?: string;
  filmTitle?: string;
  filmmakerEmail?: string;
  status?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  demo?: boolean;
}

/** Client-submitted "preview" reference is only ever a display hint (see
 * `generateSubmissionReference`) — the server always allocates the real,
 * authoritative reference itself via `allocateReferenceNumber`. */
function isValidReferenceHint(value: unknown): value is string {
  return isSubmissionReference(value);
}

/**
 * Allocates the next sequential reference number for the given year by
 * counting existing (non-null, non-placeholder) reference numbers already
 * issued for that year. Format: SSP-2026-000123.
 *
 * This is a best-effort sequential counter, not a database sequence — under
 * concurrent submissions two requests could compute the same count. The
 * `submissions.reference_number` unique constraint (see migration
 * 002_submission_security.sql) is the actual source of truth for
 * uniqueness, and the caller retries with a recount on a unique-constraint
 * collision.
 */
async function allocateReferenceNumber(
  admin: NonNullable<ReturnType<typeof getAdminClientOrNull>>,
  year: number,
  attempt: number,
): Promise<string> {
  const prefix = `SSP-${year}-`;

  const { count, error } = await admin
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .like("reference_number", `${prefix}%`);

  if (error) {
    throw new Error(`Unable to allocate a reference number: ${error.message}`);
  }

  const sequence = (count ?? 0) + 1 + attempt;
  return `${prefix}${String(sequence).padStart(6, "0")}`;
}

export async function submitSubmission(
  rawInput: unknown,
  meta: { ip?: string } = {},
): Promise<SubmitSubmissionResult> {
  if (!rawInput || typeof rawInput !== "object") {
    return { success: false, error: "Invalid request." };
  }

  const input = rawInput as Record<string, unknown>;
  const honeypot = typeof input.honeypot === "string" ? input.honeypot : "";

  if (honeypot.trim().length > 0) {
    return { success: false, error: "We were unable to process this submission." };
  }

  const ipHash = meta.ip ? await hashIp(meta.ip) : "unknown";
  const rate = checkRateLimit(`submit:${ipHash}`, { limit: 6, windowMs: 60 * 60 * 1000 });

  if (!rate.success) {
    return {
      success: false,
      error: "Too many submissions from this connection. Please try again in a little while.",
    };
  }

  const parsed = fullSubmissionSchema.safeParse({
    filmmaker: input.filmmaker,
    film: input.film,
    rights: input.rights,
    materials: input.materials,
    expectations: input.expectations,
    consent: input.consent,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields and try again.",
      fieldErrors: flattenZodErrors(parsed.error),
    };
  }

  const value = parsed.data;
  const draftToken = typeof input.draftToken === "string" ? input.draftToken : null;
  const referenceHint = isValidReferenceHint(input.referenceHint) ? input.referenceHint : null;
  const referralFields = referralToDbFields(input.referral);

  if (!isSupabaseConfigured()) {
    if (isDemoModeAllowed()) {
      const referenceNumber = referenceHint ?? generateSubmissionReference();
      console.log(
        "[demo] Submission received (Supabase not configured):",
        JSON.stringify({ ...value, referral: referralFields }, null, 2),
      );
      return {
        success: true,
        referenceNumber,
        submittedAt: new Date().toISOString(),
        filmTitle: value.film.title,
        filmmakerEmail: value.filmmaker.email,
        status: "submitted",
        demo: true,
      };
    }

    return {
      success: false,
      error:
        "Submissions are temporarily unavailable. Please configure the Supabase environment variables, or contact us directly.",
    };
  }

  const admin = getAdminClientOrNull();

  if (!admin) {
    if (isDemoModeAllowed()) {
      const referenceNumber = referenceHint ?? generateSubmissionReference();
      return {
        success: true,
        referenceNumber,
        submittedAt: new Date().toISOString(),
        filmTitle: value.film.title,
        filmmakerEmail: value.filmmaker.email,
        status: "submitted",
        demo: true,
      };
    }
    return {
      success: false,
      error: "Submissions are temporarily unavailable. Please try again shortly, or contact us directly.",
    };
  }

  try {
    const resolved = await getOrCreateDraftSubmission(draftToken, 6);

    const submittedAt = new Date().toISOString();
    const year = new Date().getFullYear();

    let referenceNumber = await allocateReferenceNumber(admin, year, 0);
    let referenceAssigned = false;

    for (let attempt = 0; attempt < 5 && !referenceAssigned; attempt += 1) {
      const { error: updateError } = await admin
        .from("submissions")
        .update({
          reference_number: referenceNumber,
          status: "submitted",
          submitted_at: submittedAt,
          consent_flags: value.consent,
          honeypot: "",
          ip_hash: ipHash,
          current_step: 6,
          ...(referralFields ?? {}),
        })
        .eq("id", resolved.id);

      if (!updateError) {
        referenceAssigned = true;
        break;
      }

      const isUniqueViolation =
        updateError.code === "23505" || /duplicate key|unique constraint/i.test(updateError.message);

      if (!isUniqueViolation) {
        throw new Error(`Unable to finalize submission: ${updateError.message}`);
      }

      // Another submission claimed this sequence number concurrently —
      // recount and try the next slot.
      referenceNumber = await allocateReferenceNumber(admin, year, attempt + 1);
    }

    if (!referenceAssigned) {
      throw new Error("Unable to allocate a unique reference number. Please try submitting again.");
    }

    await upsertChildTables(admin, resolved.id, {
      filmmaker: value.filmmaker,
      film: value.film,
      rights: value.rights,
      materials: value.materials,
      expectations: value.expectations,
    });

    await admin.from("submission_status_history").insert({
      submission_id: resolved.id,
      from_status: "draft",
      to_status: "submitted",
      note: "Submitted via public submission form.",
    });

    // Emails are best-effort — a delivery failure should never block a
    // successful submission from being acknowledged to the filmmaker.
    //
    // SECURITY: neither email template call below is passed screener_url or
    // screener_password (nor any other field from `value.materials`).
    // Confirmation/notification emails only ever carry filmmaker name,
    // film title, reference number, genre and the filmmaker's own email —
    // screener credentials must never travel over email. See
    // `submissionConfirmationEmail` / `adminSubmissionNotificationEmail` in
    // src/lib/email/templates.ts, whose parameter types do not accept
    // screener fields at all.
    const confirmation = submissionConfirmationEmail({
      filmmakerName: value.filmmaker.full_name,
      filmTitle: value.film.title,
      referenceNumber,
    });

    const adminNotice = adminSubmissionNotificationEmail({
      filmmakerName: value.filmmaker.full_name,
      filmTitle: value.film.title,
      referenceNumber,
      genre: value.film.genre,
      email: value.filmmaker.email,
    });

    await Promise.allSettled([
      sendEmail({
        to: value.filmmaker.email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
      }),
      sendEmail({
        to: SITE.adminEmail,
        subject: adminNotice.subject,
        html: adminNotice.html,
        text: adminNotice.text,
        replyTo: value.filmmaker.email,
      }),
    ]);

    return {
      success: true,
      referenceNumber,
      submissionId: resolved.id,
      submittedAt,
      filmTitle: value.film.title,
      filmmakerEmail: value.filmmaker.email,
      status: "submitted",
    };
  } catch (error) {
    const operationError = error as OperationError;

    if (operationError.code === "already_submitted") {
      return { success: false, error: operationError.message };
    }

    console.error("[submissions] submitSubmission failed:", error);
    return {
      success: false,
      error: "Something went wrong while submitting your film. Please try again in a moment.",
    };
  }
}

function flattenZodErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}): Record<string, string[] | undefined> {
  return error.flatten().fieldErrors;
}

// ---------------------------------------------------------------------------
// getSubmissionReceipt — public, read-only, deliberately minimal
// ---------------------------------------------------------------------------

export interface SubmissionReceiptData {
  referenceNumber: string;
  status: string;
  submittedAt: string | null;
  filmTitle: string;
  filmmakerEmail: string;
  filmmakerName: string;
}

export interface SubmissionReceiptResult {
  success: boolean;
  data?: SubmissionReceiptData;
  error?: string;
}

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

interface RawReceiptRow {
  reference_number: string;
  status: string;
  submitted_at: string | null;
  submission_films: { title: string } | { title: string }[] | null;
  submission_contacts: { full_name: string; email: string } | { full_name: string; email: string }[] | null;
}

/**
 * Looks up a submission by its public reference number for the thank-you
 * page's receipt/print view.
 *
 * SECURITY: this is reachable by anyone who knows (or guesses) a valid
 * reference number — it is intentionally unauthenticated so a filmmaker can
 * revisit their own confirmation. The select below is therefore an
 * allow-list, not a denylist: it returns ONLY reference_number, status,
 * submitted_at, film title, filmmaker name and filmmaker email. It must
 * NEVER be widened to include screener_url, screener_password, scorecard,
 * internal notes, revenue estimates, or any other internal field.
 */
export async function getSubmissionReceipt(
  referenceInput: unknown,
  meta: { ip?: string } = {},
): Promise<SubmissionReceiptResult> {
  if (!isSubmissionReference(referenceInput)) {
    return { success: false, error: "Invalid reference number." };
  }

  const ipHash = meta.ip ? await hashIp(meta.ip) : "unknown";
  const rate = checkRateLimit(`receipt:${ipHash}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!rate.success) {
    return { success: false, error: "Too many requests. Please try again in a few minutes." };
  }

  const admin = getAdminClientOrNull();
  if (!admin) {
    return { success: false, error: "Submission receipts are temporarily unavailable." };
  }

  // Cap lookup time so the thank-you page never hangs when the database is unreachable.
  const lookup = admin
    .from("submissions")
    .select(
      "reference_number, status, submitted_at, submission_films ( title ), submission_contacts ( full_name, email )",
    )
    .eq("reference_number", referenceInput)
    .neq("status", "draft")
    .maybeSingle();

  const timeout = new Promise<{ data: null; error: { message: string } }>((resolve) => {
    setTimeout(() => resolve({ data: null, error: { message: "Receipt lookup timed out." } }), 4000);
  });

  const { data, error } = await Promise.race([lookup, timeout]);

  if (error) {
    console.error("[submissions] getSubmissionReceipt lookup failed:", error);
    return { success: false, error: "Unable to look up this submission right now." };
  }

  if (!data) {
    return { success: false, error: "No submission was found for that reference number." };
  }

  const row = data as unknown as RawReceiptRow;
  const film = firstOf(row.submission_films);
  const contact = firstOf(row.submission_contacts);

  if (!film?.title || !contact?.email || !contact?.full_name) {
    return { success: false, error: "This submission record is incomplete." };
  }

  return {
    success: true,
    data: {
      referenceNumber: row.reference_number,
      status: row.status,
      submittedAt: row.submitted_at,
      filmTitle: film.title,
      filmmakerEmail: contact.email,
      filmmakerName: contact.full_name,
    },
  };
}
