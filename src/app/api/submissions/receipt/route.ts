import { NextResponse } from "next/server";
import { getSubmissionReceipt } from "@/lib/actions/submissions";
import { getClientIp } from "@/lib/request-ip";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const ip = getClientIp(request);
  const result = await getSubmissionReceipt(reference, { ip });

  if (!result.success) {
    const status = result.error?.toLowerCase().includes("too many")
      ? 429
      : result.error?.toLowerCase().includes("no submission")
        ? 404
        : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
