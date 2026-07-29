import { NextResponse } from "next/server";
import { loadDraft, saveDraft } from "@/lib/actions/submissions";
import { getClientIp } from "@/lib/request-ip";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const result = await saveDraft(body, { ip });

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ success: false, error: "Missing draft token." }, { status: 400 });
  }

  const result = await loadDraft(token);

  return NextResponse.json(result, { status: result.success ? 200 : 404 });
}
