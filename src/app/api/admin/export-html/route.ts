import { NextResponse, type NextRequest } from "next/server";
import { getSubmissionDetail } from "@/lib/admin/data";
import { buildSubmissionExportHtml } from "@/lib/admin/export-html";
import { requireStaffSession } from "@/lib/admin/require-staff";

/**
 * GET /api/admin/export-html?id={submissionId}
 *
 * Returns a self-contained, print-ready HTML document for a single
 * submission (admins can "Print / Save as PDF" from the browser). Requires
 * an authenticated admin/reviewer session — this route sits under
 * /api/admin/*, which src/middleware.ts already gates, but the session is
 * re-checked here as defense in depth since this document can include
 * internal evaluation notes.
 */
export async function GET(request: NextRequest) {
  const auth = await requireStaffSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter." }, { status: 400 });
  }

  const { data: detail, configured, error } = await getSubmissionDetail(id);

  if (!configured || error) {
    return NextResponse.json(
      { error: error ?? "Supabase environment variables are not configured." },
      { status: 503 },
    );
  }

  if (!detail) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const html = buildSubmissionExportHtml(detail);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
