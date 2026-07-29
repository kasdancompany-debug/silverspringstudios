import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isDemoModeAllowed } from "@/lib/demo-mode";
import type { SubmissionStatus } from "@/lib/constants";
import {
  getDemoSubmissionsList,
  getDemoSubmissionDetail,
  getDemoReviewers,
  getDemoDashboardMetrics,
  getDemoFunnelReports,
  getDemoFilms,
  getDemoFilmDetail,
  getDemoEmailLog,
  getDemoEmailTemplates,
} from "@/lib/admin/demo-data";
import type {
  EmailTemplate,
  Film,
  FilmDocument,
  FilmExpense,
  FilmRelease,
  FilmRevenueStatement,
  FilmPayment,
  FilmUpdateItem,
  Submission,
  SubmissionContact,
  SubmissionExpectations,
  SubmissionFile,
  SubmissionFilm,
  SubmissionListItem,
  SubmissionMaterials,
  SubmissionNote,
  SubmissionRights,
  SubmissionStatusHistory,
} from "@/types/database";

export interface FetchResult<T> {
  data: T;
  /** False when Supabase environment variables are missing entirely. */
  configured: boolean;
  /** Human readable message when a query failed. Null on success. */
  error: string | null;
}

function messageFromError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong while talking to the database.";
}

/**
 * Returns a Supabase server client, or null when the environment is not
 * configured. Callers should treat `null` as "demo mode" and render an
 * informative empty state instead of throwing.
 */
export async function getServerSupabase(): Promise<SupabaseClient | null> {
  try {
    return await createClient();
  } catch {
    return null;
  }
}

function firstOf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

// ---------------------------------------------------------------------------
// Dashboard metrics
// ---------------------------------------------------------------------------

export interface DashboardMetrics {
  newSubmissions: number;
  awaitingScreenerReview: number;
  needsInformation: number;
  meetingsRequested: number;
  offersUnderConsideration: number;
  signedTitles: number;
  declinedTitles: number;
  averageResponseTimeLabel: string;
  averageResponseTimeSampleSize: number;
  hasDemoData: boolean;
}

const EMPTY_METRICS: DashboardMetrics = {
  newSubmissions: 0,
  awaitingScreenerReview: 0,
  needsInformation: 0,
  meetingsRequested: 0,
  offersUnderConsideration: 0,
  signedTitles: 0,
  declinedTitles: 0,
  averageResponseTimeLabel: "Not enough data yet",
  averageResponseTimeSampleSize: 0,
  hasDemoData: false,
};

async function computeAverageResponseTime(
  supabase: SupabaseClient,
): Promise<{ label: string; sampleSize: number }> {
  const [{ data: submissions }, { data: history }] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, submitted_at")
      .not("submitted_at", "is", null)
      .limit(1000),
    supabase
      .from("submission_status_history")
      .select("submission_id, created_at")
      .eq("from_status", "submitted")
      .limit(1000),
  ]);

  if (!submissions?.length || !history?.length) {
    return { label: "Not enough data yet", sampleSize: 0 };
  }

  const submittedAtById = new Map<string, string>(
    submissions.map((row: { id: string; submitted_at: string }) => [row.id, row.submitted_at]),
  );

  const diffsMs: number[] = [];

  for (const row of history as { submission_id: string; created_at: string }[]) {
    const submittedAt = submittedAtById.get(row.submission_id);
    if (!submittedAt) continue;
    const diff = new Date(row.created_at).getTime() - new Date(submittedAt).getTime();
    if (diff > 0) diffsMs.push(diff);
  }

  if (!diffsMs.length) {
    return { label: "Not enough data yet", sampleSize: 0 };
  }

  const avgMs = diffsMs.reduce((sum, value) => sum + value, 0) / diffsMs.length;
  const avgDays = avgMs / (1000 * 60 * 60 * 24);

  const label =
    avgDays < 1
      ? `${Math.max(1, Math.round(avgMs / (1000 * 60 * 60)))} hrs`
      : `${avgDays.toFixed(1)} days`;

  return { label, sampleSize: diffsMs.length };
}

export async function getDashboardMetrics(): Promise<FetchResult<DashboardMetrics>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoDashboardMetrics(), configured: true, error: null };
    }
    return {
      data: EMPTY_METRICS,
      configured: false,
      error: "Supabase environment variables are not configured.",
    };
  }

  const statuses: SubmissionStatus[] = [
    "submitted",
    "screener_review",
    "needs_information",
    "meeting_requested",
    "offer_considered",
    "signed",
    "declined",
  ];

  try {
    const counts = await Promise.all(
      statuses.map((status) =>
        supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", status),
      ),
    );

    const failed = counts.find((result) => result.error);
    if (failed?.error) throw failed.error;

    const [submitted, screener, needsInfo, meeting, offer, signed, declined] = counts;
    const avg = await computeAverageResponseTime(supabase);

    const { count: demoCount } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("is_demo", true);

    return {
      data: {
        newSubmissions: submitted.count ?? 0,
        awaitingScreenerReview: screener.count ?? 0,
        needsInformation: needsInfo.count ?? 0,
        meetingsRequested: meeting.count ?? 0,
        offersUnderConsideration: offer.count ?? 0,
        signedTitles: signed.count ?? 0,
        declinedTitles: declined.count ?? 0,
        averageResponseTimeLabel: avg.label,
        averageResponseTimeSampleSize: avg.sampleSize,
        hasDemoData: (demoCount ?? 0) > 0,
      },
      configured: true,
      error: null,
    };
  } catch (err) {
    return {
      data: EMPTY_METRICS,
      configured: true,
      error: messageFromError(err),
    };
  }
}

// ---------------------------------------------------------------------------
// Submissions list
// ---------------------------------------------------------------------------

export interface SubmissionListFilters {
  search?: string;
  status?: SubmissionStatus | "all";
  genre?: string | "all";
  country?: string | "all";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "submitted_at" | "created_at" | "internal_score" | "film_title" | "status";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface SubmissionListResult {
  items: SubmissionListItem[];
  total: number;
  countries: string[];
}

const EMPTY_LIST_RESULT: SubmissionListResult = { items: [], total: 0, countries: [] };

const SUBMISSION_LIST_SELECT = `
  id, reference_number, status, internal_score, submitted_at, created_at, assigned_reviewer_id,
  is_demo, follow_up_date, meeting_date, commercial_outlook, next_action,
  submission_films ( title, genre, secondary_genre, runtime_minutes, completion_year, country_of_origin, budget_range, festival_history ),
  submission_contacts ( full_name, email ),
  reviewer:profiles!submissions_assigned_reviewer_id_fkey ( full_name )
`;

interface RawSubmissionListRow {
  id: string;
  reference_number: string;
  status: SubmissionStatus;
  internal_score: number | null;
  submitted_at: string | null;
  created_at: string;
  assigned_reviewer_id: string | null;
  is_demo: boolean | null;
  follow_up_date: string | null;
  meeting_date: string | null;
  commercial_outlook: string | null;
  next_action: string | null;
  submission_films: Partial<SubmissionFilm> | Partial<SubmissionFilm>[] | null;
  submission_contacts: Partial<SubmissionContact> | Partial<SubmissionContact>[] | null;
  reviewer: { full_name: string | null } | { full_name: string | null }[] | null;
}

function normalizeSubmissionListRow(row: RawSubmissionListRow): SubmissionListItem {
  const film = firstOf(row.submission_films);
  const contact = firstOf(row.submission_contacts);
  const reviewer = firstOf(row.reviewer);

  return {
    id: row.id,
    reference_number: row.reference_number,
    status: row.status,
    internal_score: row.internal_score,
    submitted_at: row.submitted_at,
    created_at: row.created_at,
    assigned_reviewer_id: row.assigned_reviewer_id,
    film_title: film?.title ?? null,
    genre: film?.genre ?? null,
    runtime_minutes: film?.runtime_minutes ?? null,
    completion_year: film?.completion_year ?? null,
    country_of_origin: film?.country_of_origin ?? null,
    budget_range: film?.budget_range ?? null,
    festival_history: film?.festival_history ?? null,
    filmmaker_name: contact?.full_name ?? null,
    filmmaker_email: contact?.email ?? null,
    reviewer_name: reviewer?.full_name ?? null,
    is_demo: row.is_demo ?? false,
    follow_up_date: row.follow_up_date ?? null,
    meeting_date: row.meeting_date ?? null,
    commercial_outlook: row.commercial_outlook ?? null,
    next_action: row.next_action ?? null,
  };
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

function sortSubmissionItems(
  items: SubmissionListItem[],
  sortBy: SubmissionListFilters["sortBy"],
  sortDir: SubmissionListFilters["sortDir"],
): SubmissionListItem[] {
  const key = sortBy ?? "submitted_at";
  const dir = sortDir === "asc" ? 1 : -1;

  const sorted = [...items].sort((a, b) => {
    switch (key) {
      case "internal_score":
        return compareValues(a.internal_score, b.internal_score) * dir;
      case "created_at":
        return compareValues(a.created_at, b.created_at) * dir;
      case "film_title":
        return compareValues(a.film_title, b.film_title) * dir;
      case "status":
        return compareValues(a.status, b.status) * dir;
      case "submitted_at":
      default:
        return compareValues(a.submitted_at ?? a.created_at, b.submitted_at ?? b.created_at) * dir;
    }
  });

  return sorted;
}

export async function getSubmissionsList(
  filters: SubmissionListFilters = {},
): Promise<FetchResult<SubmissionListResult>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoSubmissionsList(filters), configured: true, error: null };
    }
    return {
      data: EMPTY_LIST_RESULT,
      configured: false,
      error: "Supabase environment variables are not configured.",
    };
  }

  try {
    let query = supabase.from("submissions").select(SUBMISSION_LIST_SELECT);

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.dateFrom) {
      query = query.gte("submitted_at", `${filters.dateFrom}T00:00:00`);
    }
    if (filters.dateTo) {
      query = query.lte("submitted_at", `${filters.dateTo}T23:59:59`);
    }

    query = query.order("created_at", { ascending: false }).limit(1000);

    const { data, error } = await query;
    if (error) throw error;

    let items = ((data ?? []) as unknown as RawSubmissionListRow[]).map(normalizeSubmissionListRow);

    const countries = Array.from(
      new Set(items.map((item) => item.country_of_origin).filter((value): value is string => Boolean(value))),
    ).sort((a, b) => a.localeCompare(b));

    if (filters.genre && filters.genre !== "all") {
      items = items.filter((item) => item.genre === filters.genre);
    }
    if (filters.country && filters.country !== "all") {
      items = items.filter((item) => item.country_of_origin === filters.country);
    }
    if (filters.search) {
      const needle = filters.search.trim().toLowerCase();
      if (needle) {
        items = items.filter((item) =>
          [item.reference_number, item.film_title, item.filmmaker_name, item.filmmaker_email]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(needle)),
        );
      }
    }

    items = sortSubmissionItems(items, filters.sortBy, filters.sortDir);

    const total = items.length;
    const pageSize = filters.pageSize ?? 25;
    const page = Math.max(1, filters.page ?? 1);
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize);

    return {
      data: { items: paged, total, countries },
      configured: true,
      error: null,
    };
  } catch (err) {
    return {
      data: EMPTY_LIST_RESULT,
      configured: true,
      error: messageFromError(err),
    };
  }
}

/** Fetches every submission matching the given filters, unpaginated — for CSV export. */
export async function getSubmissionsForExport(
  filters: Omit<SubmissionListFilters, "page" | "pageSize"> = {},
): Promise<FetchResult<SubmissionListItem[]>> {
  const result = await getSubmissionsList({ ...filters, page: 1, pageSize: 100000 });
  return { data: result.data.items, configured: result.configured, error: result.error };
}

// ---------------------------------------------------------------------------
// Reviewers (for assignment + display)
// ---------------------------------------------------------------------------

export interface ReviewerOption {
  id: string;
  full_name: string | null;
  email: string;
}

export async function getReviewers(): Promise<FetchResult<ReviewerOption[]>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoReviewers(), configured: true, error: null };
    }
    return { data: [], configured: false, error: "Supabase environment variables are not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("role", ["admin", "reviewer"])
      .order("full_name", { ascending: true });

    if (error) throw error;

    return { data: (data ?? []) as ReviewerOption[], configured: true, error: null };
  } catch (err) {
    return { data: [], configured: true, error: messageFromError(err) };
  }
}

// ---------------------------------------------------------------------------
// Submission detail
// ---------------------------------------------------------------------------

export interface SubmissionDetail {
  submission: Submission;
  contact: SubmissionContact | null;
  film: SubmissionFilm | null;
  rights: SubmissionRights | null;
  materials: SubmissionMaterials | null;
  expectations: SubmissionExpectations | null;
  files: (SubmissionFile & { signedUrl: string | null })[];
  notes: (SubmissionNote & { author_name: string | null })[];
  statusHistory: (SubmissionStatusHistory & { changed_by_name: string | null })[];
  reviewerName: string | null;
}

export async function getSubmissionDetail(
  id: string,
): Promise<FetchResult<SubmissionDetail | null>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoSubmissionDetail(id), configured: true, error: null };
    }
    return { data: null, configured: false, error: "Supabase environment variables are not configured." };
  }

  try {
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (submissionError) throw submissionError;
    if (!submission) {
      return { data: null, configured: true, error: null };
    }

    const [
      { data: contact },
      { data: film },
      { data: rights },
      { data: materials },
      { data: expectations },
      { data: files },
      { data: notes },
      { data: statusHistory },
    ] = await Promise.all([
      supabase.from("submission_contacts").select("*").eq("submission_id", id).maybeSingle(),
      supabase.from("submission_films").select("*").eq("submission_id", id).maybeSingle(),
      supabase.from("submission_rights").select("*").eq("submission_id", id).maybeSingle(),
      supabase.from("submission_materials").select("*").eq("submission_id", id).maybeSingle(),
      supabase.from("submission_expectations").select("*").eq("submission_id", id).maybeSingle(),
      supabase.from("submission_files").select("*").eq("submission_id", id).order("created_at", { ascending: false }),
      supabase
        .from("submission_notes")
        .select("*, author:profiles(full_name)")
        .eq("submission_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("submission_status_history")
        .select("*, author:profiles(full_name)")
        .eq("submission_id", id)
        .order("created_at", { ascending: false }),
    ]);

    let reviewerName: string | null = null;
    if (submission.assigned_reviewer_id) {
      const { data: reviewer } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", submission.assigned_reviewer_id)
        .maybeSingle();
      reviewerName = reviewer?.full_name ?? null;
    }

    const filesWithUrls = await Promise.all(
      ((files ?? []) as SubmissionFile[]).map(async (file) => {
        let signedUrl: string | null = null;
        try {
          const { data: signed } = await supabase.storage
            .from("submission-files")
            .createSignedUrl(file.file_path, 60 * 60);
          signedUrl = signed?.signedUrl ?? null;
        } catch {
          signedUrl = null;
        }
        return { ...file, signedUrl };
      }),
    );

    const notesWithAuthor = ((notes ?? []) as Array<SubmissionNote & { author: { full_name: string | null } | { full_name: string | null }[] | null }>).map(
      (note) => ({ ...note, author_name: firstOf(note.author)?.full_name ?? null }),
    );

    const historyWithAuthor = ((statusHistory ?? []) as Array<SubmissionStatusHistory & { author: { full_name: string | null } | { full_name: string | null }[] | null }>).map(
      (entry) => ({ ...entry, changed_by_name: firstOf(entry.author)?.full_name ?? null }),
    );

    return {
      data: {
        submission: submission as Submission,
        contact: (contact as SubmissionContact) ?? null,
        film: (film as SubmissionFilm) ?? null,
        rights: (rights as SubmissionRights) ?? null,
        materials: (materials as SubmissionMaterials) ?? null,
        expectations: (expectations as SubmissionExpectations) ?? null,
        files: filesWithUrls,
        notes: notesWithAuthor,
        statusHistory: historyWithAuthor,
        reviewerName,
      },
      configured: true,
      error: null,
    };
  } catch (err) {
    return { data: null, configured: true, error: messageFromError(err) };
  }
}

// ---------------------------------------------------------------------------
// Films
// ---------------------------------------------------------------------------

export interface FilmListItem extends Film {
  filmmaker_name: string | null;
}

export async function getFilms(): Promise<FetchResult<FilmListItem[]>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoFilms(), configured: true, error: null };
    }
    return { data: [], configured: false, error: "Supabase environment variables are not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("films")
      .select("*, filmmaker:profiles!films_filmmaker_profile_id_fkey ( full_name )")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const items = ((data ?? []) as Array<Film & { filmmaker: { full_name: string | null } | { full_name: string | null }[] | null }>).map(
      (row) => ({ ...row, filmmaker_name: firstOf(row.filmmaker)?.full_name ?? null }) as FilmListItem,
    );

    return { data: items, configured: true, error: null };
  } catch (err) {
    return { data: [], configured: true, error: messageFromError(err) };
  }
}

export interface FilmDetail {
  film: Film;
  filmmakerName: string | null;
  releases: FilmRelease[];
  revenueStatements: FilmRevenueStatement[];
  expenses: FilmExpense[];
  documents: FilmDocument[];
  payments: FilmPayment[];
  updates: FilmUpdateItem[];
}

export async function getFilmDetail(id: string): Promise<FetchResult<FilmDetail | null>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoFilmDetail(id), configured: true, error: null };
    }
    return { data: null, configured: false, error: "Supabase environment variables are not configured." };
  }

  try {
    const { data: film, error: filmError } = await supabase
      .from("films")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (filmError) throw filmError;
    if (!film) return { data: null, configured: true, error: null };

    let filmmakerName: string | null = null;
    if (film.filmmaker_profile_id) {
      const { data: filmmaker } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", film.filmmaker_profile_id)
        .maybeSingle();
      filmmakerName = filmmaker?.full_name ?? null;
    }

    const [
      { data: releases },
      { data: revenueStatements },
      { data: expenses },
      { data: documents },
      { data: payments },
      { data: updates },
    ] = await Promise.all([
      supabase.from("film_releases").select("*").eq("film_id", id).order("start_date", { ascending: true }),
      supabase
        .from("film_revenue_statements")
        .select("*")
        .eq("film_id", id)
        .order("period_start", { ascending: false }),
      supabase.from("film_expenses").select("*").eq("film_id", id).order("incurred_date", { ascending: false }),
      supabase.from("film_documents").select("*").eq("film_id", id).order("created_at", { ascending: false }),
      supabase.from("film_payments").select("*").eq("film_id", id).order("payment_date", { ascending: false }),
      supabase.from("film_updates").select("*").eq("film_id", id).order("created_at", { ascending: false }),
    ]);

    return {
      data: {
        film: film as Film,
        filmmakerName,
        releases: (releases ?? []) as FilmRelease[],
        revenueStatements: (revenueStatements ?? []) as FilmRevenueStatement[],
        expenses: (expenses ?? []) as FilmExpense[],
        documents: (documents ?? []) as FilmDocument[],
        payments: (payments ?? []) as FilmPayment[],
        updates: (updates ?? []) as FilmUpdateItem[],
      },
      configured: true,
      error: null,
    };
  } catch (err) {
    return { data: null, configured: true, error: messageFromError(err) };
  }
}

// ---------------------------------------------------------------------------
// Email templates + send log
// ---------------------------------------------------------------------------

export async function getEmailTemplates(): Promise<FetchResult<EmailTemplate[]>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoEmailTemplates(), configured: true, error: null };
    }
    return { data: [], configured: false, error: "Supabase environment variables are not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return { data: (data ?? []) as EmailTemplate[], configured: true, error: null };
  } catch (err) {
    return { data: [], configured: true, error: messageFromError(err) };
  }
}

export interface EmailLogItem {
  id: string;
  template_slug: string | null;
  to_email: string;
  subject: string;
  sent_at: string;
  status: string;
  sent_by_name: string | null;
}

export async function getEmailLog(submissionId: string): Promise<FetchResult<EmailLogItem[]>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoEmailLog(), configured: true, error: null };
    }
    return { data: [], configured: false, error: "Supabase environment variables are not configured." };
  }

  try {
    const { data, error } = await supabase
      .from("submission_email_log")
      .select("id, template_slug, to_email, subject, sent_at, status, sender:profiles(full_name)")
      .eq("submission_id", submissionId)
      .order("sent_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const items = ((data ?? []) as Array<
      Omit<EmailLogItem, "sent_by_name"> & { sender: { full_name: string | null } | { full_name: string | null }[] | null }
    >).map((row) => ({ ...row, sent_by_name: firstOf(row.sender)?.full_name ?? null }));

    return { data: items, configured: true, error: null };
  } catch (err) {
    return { data: [], configured: true, error: messageFromError(err) };
  }
}

// ---------------------------------------------------------------------------
// Funnel / acquisitions reports
// ---------------------------------------------------------------------------

export interface CountBucket {
  label: string;
  count: number;
}

export interface FunnelReports {
  isDemoData: boolean;
  totalSubmissions: number;
  submissionsByMonth: CountBucket[];
  submissionsBySource: CountBucket[];
  submissionsByGenre: CountBucket[];
  submissionsByCountry: CountBucket[];
  acceptanceRate: number;
  decisionedCount: number;
  avgReviewTimeLabel: string;
  declineReasons: CountBucket[];
  meetingConversionRate: number;
  agreementConversionRate: number;
  acquisitionsByReviewer: CountBucket[];
  projectedInvestmentExposure: number;
}

const EMPTY_FUNNEL_REPORTS: FunnelReports = {
  isDemoData: false,
  totalSubmissions: 0,
  submissionsByMonth: [],
  submissionsBySource: [],
  submissionsByGenre: [],
  submissionsByCountry: [],
  acceptanceRate: 0,
  decisionedCount: 0,
  avgReviewTimeLabel: "Not enough data yet",
  declineReasons: [],
  meetingConversionRate: 0,
  agreementConversionRate: 0,
  acquisitionsByReviewer: [],
  projectedInvestmentExposure: 0,
};

interface RawReportRow {
  id: string;
  status: SubmissionStatus;
  created_at: string;
  submitted_at: string | null;
  is_demo: boolean | null;
  decline_reason: string | null;
  proposed_investment_cap: number | null;
  assigned_reviewer_id: string | null;
  economics: { release_investment?: number } | null;
  submission_films:
    | { genre: string | null; country_of_origin: string | null }
    | { genre: string | null; country_of_origin: string | null }[]
    | null;
  submission_contacts: { how_heard: string | null } | { how_heard: string | null }[] | null;
  reviewer: { full_name: string | null } | { full_name: string | null }[] | null;
}

function bucketAndSort(counts: Map<string, number>, limit = 12): CountBucket[] {
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function monthLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export async function getFunnelReports(): Promise<FetchResult<FunnelReports>> {
  const supabase = await getServerSupabase();

  if (!supabase) {
    if (isDemoModeAllowed()) {
      return { data: getDemoFunnelReports(), configured: true, error: null };
    }
    return {
      data: EMPTY_FUNNEL_REPORTS,
      configured: false,
      error: "Supabase environment variables are not configured.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select(
        `id, status, created_at, submitted_at, is_demo, decline_reason, proposed_investment_cap, assigned_reviewer_id, economics,
         submission_films ( genre, country_of_origin ),
         submission_contacts ( how_heard ),
         reviewer:profiles!submissions_assigned_reviewer_id_fkey ( full_name )`,
      )
      .neq("status", "draft")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) throw error;

    const rows = (data ?? []) as unknown as RawReportRow[];

    if (rows.length === 0) {
      return { data: EMPTY_FUNNEL_REPORTS, configured: true, error: null };
    }

    const isDemoData = rows.some((row) => row.is_demo);

    const byMonth = new Map<string, number>();
    const bySource = new Map<string, number>();
    const byGenre = new Map<string, number>();
    const byCountry = new Map<string, number>();
    const declineReasons = new Map<string, number>();
    const byReviewer = new Map<string, number>();

    let meetingOrLater = 0;
    let agreementOrLater = 0;
    let signedCount = 0;
    let declinedCount = 0;
    let projectedExposure = 0;

    const REACHED_MEETING: SubmissionStatus[] = [
      "meeting_requested",
      "offer_considered",
      "agreement_sent",
      "signed",
      "onboarding",
      "released",
    ];
    const REACHED_AGREEMENT: SubmissionStatus[] = ["agreement_sent", "signed", "onboarding", "released"];
    const ACTIVE_PIPELINE: SubmissionStatus[] = [
      "submitted",
      "initial_review",
      "screener_review",
      "needs_information",
      "meeting_requested",
      "offer_considered",
      "agreement_sent",
    ];

    for (const row of rows) {
      const film = firstOf(row.submission_films);
      const contact = firstOf(row.submission_contacts);
      const reviewer = firstOf(row.reviewer);

      const monthKey = monthLabel(row.submitted_at ?? row.created_at);
      byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + 1);

      const source = contact?.how_heard?.trim() || "Not provided";
      bySource.set(source, (bySource.get(source) ?? 0) + 1);

      const genre = film?.genre?.trim() || "Unspecified";
      byGenre.set(genre, (byGenre.get(genre) ?? 0) + 1);

      const country = film?.country_of_origin?.trim() || "Unspecified";
      byCountry.set(country, (byCountry.get(country) ?? 0) + 1);

      if (row.status === "declined") {
        declinedCount += 1;
        const reason = row.decline_reason?.trim() || "No reason on file";
        declineReasons.set(reason, (declineReasons.get(reason) ?? 0) + 1);
      }

      if (["signed", "onboarding", "released"].includes(row.status)) {
        signedCount += 1;
        const reviewerName = reviewer?.full_name || "Unassigned";
        byReviewer.set(reviewerName, (byReviewer.get(reviewerName) ?? 0) + 1);
      }

      if (REACHED_MEETING.includes(row.status)) meetingOrLater += 1;
      if (REACHED_AGREEMENT.includes(row.status)) agreementOrLater += 1;

      if (ACTIVE_PIPELINE.includes(row.status)) {
        projectedExposure += row.proposed_investment_cap ?? row.economics?.release_investment ?? 0;
      }
    }

    const totalSubmissions = rows.length;
    const decisionedCount = signedCount + declinedCount;
    const acceptanceRate = decisionedCount > 0 ? signedCount / decisionedCount : 0;

    const monthsSorted = Array.from(byMonth.entries())
      .map(([label, count]) => ({ label, count, sortKey: new Date(label).getTime() || 0 }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-12)
      .map(({ label, count }) => ({ label, count }));

    const { label: avgReviewTimeLabel } = await computeAverageResponseTime(supabase);

    return {
      data: {
        isDemoData,
        totalSubmissions,
        submissionsByMonth: monthsSorted,
        submissionsBySource: bucketAndSort(bySource),
        submissionsByGenre: bucketAndSort(byGenre),
        submissionsByCountry: bucketAndSort(byCountry),
        acceptanceRate,
        decisionedCount,
        avgReviewTimeLabel,
        declineReasons: bucketAndSort(declineReasons),
        meetingConversionRate: totalSubmissions > 0 ? meetingOrLater / totalSubmissions : 0,
        agreementConversionRate: totalSubmissions > 0 ? agreementOrLater / totalSubmissions : 0,
        acquisitionsByReviewer: bucketAndSort(byReviewer),
        projectedInvestmentExposure: projectedExposure,
      },
      configured: true,
      error: null,
    };
  } catch (err) {
    return { data: EMPTY_FUNNEL_REPORTS, configured: true, error: messageFromError(err) };
  }
}
