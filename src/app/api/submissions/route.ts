import { NextResponse } from "next/server";
import { submitSubmission } from "@/lib/actions/submissions";
import { getClientIp } from "@/lib/request-ip";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const result = await submitSubmission(body, { ip });

  if (!result.success) {
    const status = result.error?.toLowerCase().includes("too many") ? 429 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
