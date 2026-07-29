import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { getOrCreateDraftSubmission } from "@/lib/actions/submissions";
import { ALLOWED_UPLOAD_EXTENSIONS, ALLOWED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/constants";

const SUBMISSION_FILE_TYPES = ["poster", "epk", "still", "other"] as const;
type SubmissionFileType = (typeof SUBMISSION_FILE_TYPES)[number];

/** Browsers report inconsistent (or empty) MIME types for .srt/.vtt caption
 * files, so a matching extension is accepted as a fallback whenever the
 * reported MIME type isn't one of ALLOWED_UPLOAD_TYPES. */
function hasAllowedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALLOWED_UPLOAD_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

const STORAGE_BUCKET = "submission-files";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function isSubmissionFileType(value: unknown): value is SubmissionFileType {
  return typeof value === "string" && (SUBMISSION_FILE_TYPES as readonly string[]).includes(value);
}

function sanitizeFileName(name: string): string {
  const trimmed = name.trim().slice(-180);
  const cleaned = trimmed.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.length ? cleaned : `file-${Date.now()}`;
}

async function isAuthorizedAdminOrReviewer(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return profile?.role === "admin" || profile?.role === "reviewer";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  const draftTokenRaw = formData.get("draftToken");
  const fileTypeRaw = formData.get("fileType");
  const submissionIdRaw = formData.get("submissionId");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file was provided." }, { status: 400 });
  }

  if (!isSubmissionFileType(fileTypeRaw)) {
    return NextResponse.json(
      { success: false, error: "Invalid file category. Expected poster, epk, still or other." },
      { status: 400 },
    );
  }

  if (file.type.startsWith("video/")) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Video masters are not accepted through this upload. Please share a screener link (with password, if applicable) in the Materials step instead.",
      },
      { status: 400 },
    );
  }

  const typeAllowed = ALLOWED_UPLOAD_TYPES.includes(file.type as (typeof ALLOWED_UPLOAD_TYPES)[number]);
  const extensionAllowed = hasAllowedExtension(file.name || "");

  if (!typeAllowed && !extensionAllowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Unsupported file format${file.type ? ` (${file.type})` : ""}. Allowed formats: JPG, PNG, WEBP, PDF, VTT, SRT, DOCX.`,
      },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ success: false, error: "The selected file is empty." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        success: false,
        error: `File is too large. Maximum size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
      },
      { status: 400 },
    );
  }

  const draftToken = typeof draftTokenRaw === "string" && draftTokenRaw.length >= 16 ? draftTokenRaw : null;
  const safeFileName = sanitizeFileName(file.name || "upload");

  if (!isSupabaseConfigured()) {
    // Demo mode: acknowledge the upload without persisting anything so the
    // multi-step form remains fully testable without Supabase configured.
    return NextResponse.json({
      success: true,
      demo: true,
      draftToken: draftToken ?? undefined,
      path: `demo/${fileTypeRaw}/${Date.now()}-${safeFileName}`,
      fileName: safeFileName,
    });
  }

  let submissionId: string;
  let resolvedDraftToken: string | undefined;

  if (draftToken) {
    try {
      const resolved = await getOrCreateDraftSubmission(draftToken);
      submissionId = resolved.id;
      resolvedDraftToken = resolved.draftToken;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resolve this draft.";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
  } else if (await isAuthorizedAdminOrReviewer()) {
    if (typeof submissionIdRaw !== "string" || !submissionIdRaw) {
      return NextResponse.json(
        { success: false, error: "Missing submissionId for an authenticated upload." },
        { status: 400 },
      );
    }
    submissionId = submissionIdRaw;
  } else {
    return NextResponse.json(
      { success: false, error: "Not authorized to upload files. Provide a valid draft token." },
      { status: 401 },
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { success: false, error: "File storage is temporarily unavailable." },
      { status: 503 },
    );
  }

  const storagePath = `${submissionId}/${fileTypeRaw}/${Date.now()}-${safeFileName}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, Buffer.from(arrayBuffer), {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("[upload] Storage upload failed:", uploadError);
    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }

  const { data: fileRow, error: insertError } = await admin
    .from("submission_files")
    .insert({
      submission_id: submissionId,
      file_type: fileTypeRaw,
      file_name: safeFileName,
      file_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
    })
    .select("id")
    .single();

  if (insertError || !fileRow) {
    console.error("[upload] Failed to record file metadata:", insertError);
    await admin.storage.from(STORAGE_BUCKET).remove([storagePath]);
    return NextResponse.json(
      { success: false, error: "File could not be recorded. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    fileId: fileRow.id,
    path: storagePath,
    fileName: safeFileName,
    draftToken: resolvedDraftToken,
  });
}
