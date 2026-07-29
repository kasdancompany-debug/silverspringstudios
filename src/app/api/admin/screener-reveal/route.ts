import { NextResponse } from "next/server";
import { revealScreenerPassword } from "@/lib/actions/admin-screener";
import { getClientIp } from "@/lib/request-ip";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const submissionId =
    body && typeof body === "object" && "submissionId" in body
      ? (body as { submissionId: unknown }).submissionId
      : undefined;

  if (typeof submissionId !== "string" || !submissionId) {
    return NextResponse.json({ success: false, error: "Missing submissionId." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const result = await revealScreenerPassword(submissionId, { ip });

  if (!result.success) {
    const status = result.error?.toLowerCase().includes("signed in")
      ? 401
      : result.error?.toLowerCase().includes("too many")
        ? 429
        : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
