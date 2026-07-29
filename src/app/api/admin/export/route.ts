import { NextResponse, type NextRequest } from "next/server";
import { requireStaffSession } from "@/lib/admin/require-staff";
import { getSubmissionsForExport } from "@/lib/admin/data";
import { SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/constants";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const EXPORT_HEADERS = [
  "Reference Number",
  "Film",
  "Filmmaker",
  "Filmmaker Email",
  "Genre",
  "Runtime (min)",
  "Year",
  "Country",
  "Budget Range",
  "Festival History",
  "Status",
  "Internal Score",
  "Submitted Date",
  "Assigned Reviewer",
];

export async function GET(request: NextRequest) {
  const auth = await requireStaffSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;

  const { data: items, configured, error } = await getSubmissionsForExport({
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as SubmissionStatus | "all" | null) ?? "all",
    genre: searchParams.get("genre") ?? "all",
    country: searchParams.get("country") ?? "all",
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
  });

  if (!configured || error) {
    return NextResponse.json(
      { error: error ?? "Supabase environment variables are not configured." },
      { status: 503 },
    );
  }

  const rows = items.map((item) => [
    item.reference_number,
    item.film_title ?? "",
    item.filmmaker_name ?? "",
    item.filmmaker_email ?? "",
    item.genre ?? "",
    item.runtime_minutes ?? "",
    item.completion_year ?? "",
    item.country_of_origin ?? "",
    item.budget_range ?? "",
    item.festival_history ?? "",
    SUBMISSION_STATUS_LABELS[item.status] ?? item.status,
    item.internal_score ?? "",
    item.submitted_at ? new Date(item.submitted_at).toISOString().slice(0, 10) : "",
    item.reviewer_name ?? "",
  ]);

  const csv = [EXPORT_HEADERS, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const filename = `submissions-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
