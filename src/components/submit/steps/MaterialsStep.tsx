"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck, UploadCloud, XCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { compactPartial, type StepHandle } from "@/components/submit/form-utils";
import { OptionalBadge, StepHeader, StepNav } from "@/components/submit/StepChrome";
import { ALLOWED_UPLOAD_EXTENSIONS, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { materialsSchema, type MaterialsInput } from "@/lib/validations/submission";

export interface UploadedFileMeta {
  fileName: string;
  path: string;
}

export interface UploadedFilesState {
  poster?: UploadedFileMeta;
  epk?: UploadedFileMeta;
  stills: UploadedFileMeta[];
  captions: UploadedFileMeta[];
}

export const EMPTY_UPLOADED_FILES: UploadedFilesState = { stills: [], captions: [] };

const MAX_UPLOAD_MB = Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024));
const EXTENSIONS_LABEL = ALLOWED_UPLOAD_EXTENSIONS.join(", ");

const DEFAULTS: MaterialsInput = {
  screener_url: "",
  screener_password: "",
  trailer_url: "",
  caption_availability: "",
  master_resolution: "",
  audio_configuration: "",
  prores_available: false,
  closed_caption_available: false,
  dialogue_list_available: false,
  music_cue_sheet_available: false,
  eo_insurance_status: "",
};

type MaterialsCheckboxField =
  | "prores_available"
  | "closed_caption_available"
  | "dialogue_list_available"
  | "music_cue_sheet_available";

const CHECKBOXES: Array<{ name: MaterialsCheckboxField; label: string }> = [
  { name: "prores_available", label: "ProRes / high-resolution master available on request" },
  { name: "closed_caption_available", label: "Closed caption (SDH) file available" },
  { name: "dialogue_list_available", label: "Dialogue list available" },
  { name: "music_cue_sheet_available", label: "Music cue sheet available" },
];

type UploadFieldKey = "poster" | "epk" | "stills" | "captions";
type BackendFileType = "poster" | "epk" | "still" | "other";

interface UploadFieldConfig {
  key: UploadFieldKey;
  fileType: BackendFileType;
  label: string;
  hint: string;
  accept: string;
  multiple: boolean;
}

const UPLOAD_FIELDS: UploadFieldConfig[] = [
  {
    key: "poster",
    fileType: "poster",
    label: "Poster / key art",
    hint: `JPG, PNG or WEBP, up to ${MAX_UPLOAD_MB} MB.`,
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    multiple: false,
  },
  {
    key: "epk",
    fileType: "epk",
    label: "Electronic press kit (EPK)",
    hint: `PDF or DOCX, up to ${MAX_UPLOAD_MB} MB.`,
    accept: "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.docx",
    multiple: false,
  },
  {
    key: "stills",
    fileType: "still",
    label: "Stills",
    hint: `JPG, PNG or WEBP. Add as many as you like, up to ${MAX_UPLOAD_MB} MB each.`,
    accept: "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    multiple: true,
  },
  {
    key: "captions",
    fileType: "other",
    label: "Caption / subtitle files",
    hint: `VTT or SRT, up to ${MAX_UPLOAD_MB} MB each.`,
    accept: "text/vtt,.vtt,.srt",
    multiple: true,
  },
];

export interface MaterialsStepProps {
  defaultValues?: Partial<MaterialsInput>;
  /** True when the server already has a screener password saved for this
   * draft. The password value itself is never sent to the client. */
  screenerPasswordSet?: boolean;
  onNext: (data: MaterialsInput) => void;
  onBack: (values: Partial<MaterialsInput>) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onValuesChange?: (values: Record<string, unknown>) => void;
  draftToken: string | null;
  uploadedFiles: UploadedFilesState;
  onUploadedFilesChange: (files: UploadedFilesState) => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export const MaterialsStep = forwardRef<StepHandle, MaterialsStepProps>(function MaterialsStep(
  {
    defaultValues,
    screenerPasswordSet = false,
    onNext,
    onBack,
    onDirtyChange,
    onValuesChange,
    draftToken,
    uploadedFiles,
    onUploadedFilesChange,
  },
  ref,
) {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<MaterialsInput>({
    resolver: zodResolver(materialsSchema),
    mode: "onBlur",
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });

  useImperativeHandle(ref, () => ({
    getSnapshot: () => compactPartial(getValues()) as Record<string, unknown>,
    isDirty: () => isDirty,
  }));

  useEffect(() => {
    const subscription = watch((values) => onValuesChange?.(values as Record<string, unknown>));
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const [showPassword, setShowPassword] = useState(false);
  const typedPassword = watch("screener_password");

  const [statuses, setStatuses] = useState<Record<string, UploadStatus>>({});
  const [errorsByField, setErrorsByField] = useState<Record<string, string>>({});

  async function uploadFile(file: File, fileType: BackendFileType, statusKey: string) {
    if (!draftToken) {
      setStatuses((prev) => ({ ...prev, [statusKey]: "error" }));
      setErrorsByField((prev) => ({ ...prev, [statusKey]: "Please wait a moment and try again." }));
      return;
    }

    setStatuses((prev) => ({ ...prev, [statusKey]: "uploading" }));
    setErrorsByField((prev) => ({ ...prev, [statusKey]: "" }));

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("draftToken", draftToken);
      body.append("fileType", fileType);

      const response = await fetch("/api/upload", { method: "POST", body });
      const json = (await response.json().catch(() => null)) as
        | { success: true; path: string; fileName: string }
        | { success: false; error?: string }
        | null;

      if (!response.ok || !json || !json.success) {
        throw new Error((json && "error" in json && json.error) || "Upload failed. Please try again.");
      }

      setStatuses((prev) => ({ ...prev, [statusKey]: "success" }));

      const meta: UploadedFileMeta = { fileName: json.fileName, path: json.path };

      if (fileType === "still") {
        onUploadedFilesChange({ ...uploadedFiles, stills: [...uploadedFiles.stills, meta] });
      } else if (fileType === "other") {
        onUploadedFilesChange({ ...uploadedFiles, captions: [...uploadedFiles.captions, meta] });
      } else {
        onUploadedFilesChange({ ...uploadedFiles, [fileType]: meta });
      }
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [statusKey]: "error" }));
      setErrorsByField((prev) => ({
        ...prev,
        [statusKey]: error instanceof Error ? error.message : "Upload failed. Please try again.",
      }));
    }
  }

  function removeFromList(key: "stills" | "captions", index: number) {
    onUploadedFilesChange({
      ...uploadedFiles,
      [key]: uploadedFiles[key].filter((_, i) => i !== index),
    });
  }

  function removeSingle(key: "poster" | "epk") {
    const next = { ...uploadedFiles };
    delete next[key];
    onUploadedFilesChange(next);
  }

  const passwordHint = screenerPasswordSet && !typedPassword
    ? "A password is already saved. Enter a new one only to replace it."
    : "Leave blank if the screener does not require a password.";

  return (
    <motion.form
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onSubmit={handleSubmit(onNext)}
      className="space-y-8"
      noValidate
    >
      <StepHeader
        step={4}
        title="Materials"
        description="Give our reviewers a way to watch the film, plus any promotional assets you already have."
        estimate="A screener link, plus optional files"
      />

      <div className="space-y-2 border border-warm-metal/30 bg-surface px-4 py-4 text-sm leading-relaxed text-slate">
        <p className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-warm-metal" aria-hidden="true" />
          <span>
            Do not upload a full film master through this form. Provide a private screener link
            instead — masters are coordinated only after an agreement is in place.
          </span>
        </p>
      </div>

      <Input
        label="Screener URL"
        type="url"
        required
        placeholder="https://vimeo.com/..."
        hint="A private streaming link (Vimeo, YouTube unlisted, Google Drive, etc.)."
        error={errors.screener_url?.message}
        {...register("screener_url")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="screener_password" className="block text-xs tracking-[0.14em] uppercase text-slate">
            Screener password <OptionalBadge />
          </label>
          <div className="relative">
            <input
              id="screener_password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className={cn(
                "w-full bg-surface border border-line-strong px-4 py-3 pr-11 text-sm text-ivory placeholder:text-slate/60 outline-none transition-colors focus:border-silver",
                errors.screener_password && "border-danger",
              )}
              placeholder={screenerPasswordSet ? "•••••••• (saved — enter a new one to replace)" : undefined}
              aria-describedby="screener_password-hint"
              {...register("screener_password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate transition-colors hover:text-ivory"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          <p id="screener_password-hint" className="text-xs text-slate">
            {passwordHint}
          </p>
          {errors.screener_password ? (
            <p className="text-xs text-danger" role="alert">
              {errors.screener_password.message}
            </p>
          ) : null}
        </div>
        <Input
          label={<>Trailer URL <OptionalBadge /></>}
          type="url"
          placeholder="https://"
          error={errors.trailer_url?.message}
          {...register("trailer_url")}
        />
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warm-metal" aria-hidden="true" />
        Screener credentials are stored privately and only visible to authenticated acquisitions
        staff. They are never included in confirmation emails.
      </p>

      <Input
        label="Caption / subtitle availability for the screener"
        required
        error={errors.caption_availability?.message}
        {...register("caption_availability")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label={<>Master resolution <OptionalBadge /></>}
          hint="e.g. 4K DCP, 2K ProRes, HD"
          error={errors.master_resolution?.message}
          {...register("master_resolution")}
        />
        <Input
          label={<>Audio configuration <OptionalBadge /></>}
          hint="e.g. 5.1 surround, stereo"
          error={errors.audio_configuration?.message}
          {...register("audio_configuration")}
        />
      </div>

      <div className="space-y-3">
        {CHECKBOXES.map((item) => (
          <label
            key={item.name}
            className="flex cursor-pointer items-start gap-3 border border-line-strong bg-surface px-4 py-3 text-sm text-ivory transition-colors hover:border-silver"
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-warm-metal"
              {...register(item.name)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <Input
        label={<>Errors &amp; omissions insurance status <OptionalBadge /></>}
        hint="e.g. Active policy, quote obtained, not yet secured"
        error={errors.eo_insurance_status?.message}
        {...register("eo_insurance_status")}
      />

      <div className="space-y-6 border-t border-line pt-8">
        <div className="space-y-1">
          <p className="text-xs tracking-[0.14em] uppercase text-slate">
            Optional files <OptionalBadge />
          </p>
          <p className="text-sm text-slate">
            Upload a poster, EPK, stills or caption files if you have them ready — or continue
            without uploading anything and send these later. Accepted formats: {EXTENSIONS_LABEL}.
            Maximum {MAX_UPLOAD_MB} MB per file.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {UPLOAD_FIELDS.filter((field) => !field.multiple).map((field) => {
            const status = statuses[field.key] ?? "idle";
            const uploaded = field.key === "poster" || field.key === "epk" ? uploadedFiles[field.key] : undefined;
            return (
              <div key={field.key} className="space-y-2">
                <p className="block text-xs tracking-[0.14em] uppercase text-slate">{field.label}</p>
                <label
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-surface px-4 py-8 text-center text-sm text-slate transition-colors hover:border-silver",
                    status === "success" && "border-success/60 text-success",
                    status === "error" && "border-danger/60",
                  )}
                >
                  <input
                    type="file"
                    className="sr-only"
                    accept={field.accept}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadFile(file, field.fileType, field.key);
                      event.target.value = "";
                    }}
                  />
                  {status === "uploading" ? (
                    <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
                  ) : status === "success" ? (
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  ) : status === "error" ? (
                    <XCircle className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <UploadCloud className="h-6 w-6" aria-hidden="true" />
                  )}
                  <span className="text-xs">
                    {status === "success" && uploaded
                      ? uploaded.fileName
                      : status === "uploading"
                        ? "Uploading…"
                        : "Click to choose a file"}
                  </span>
                </label>
                <p className="text-xs text-slate">{field.hint}</p>
                {status === "success" && uploaded ? (
                  <button
                    type="button"
                    onClick={() => removeSingle(field.key as "poster" | "epk")}
                    className="text-xs text-slate underline underline-offset-4 transition-colors hover:text-danger"
                  >
                    Remove
                  </button>
                ) : null}
                {errorsByField[field.key] ? (
                  <p className="text-xs text-danger" role="alert">
                    {errorsByField[field.key]}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        {UPLOAD_FIELDS.filter((field) => field.multiple).map((field) => {
          const listKey = field.key as "stills" | "captions";
          const items = uploadedFiles[listKey];
          return (
            <div key={field.key} className="space-y-2">
              <p className="block text-xs tracking-[0.14em] uppercase text-slate">{field.label}</p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line-strong bg-surface px-4 py-8 text-center text-sm text-slate transition-colors hover:border-silver">
                <input
                  type="file"
                  className="sr-only"
                  accept={field.accept}
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    files.forEach((file, index) => {
                      void uploadFile(file, field.fileType, `${field.key}-${Date.now()}-${index}`);
                    });
                    event.target.value = "";
                  }}
                />
                <UploadCloud className="h-6 w-6" aria-hidden="true" />
                <span className="text-xs">Click to choose one or more files</span>
              </label>
              <p className="text-xs text-slate">{field.hint}</p>
              {items.length > 0 ? (
                <ul className="space-y-2 pt-2">
                  {items.map((item, index) => (
                    <li
                      key={`${item.path}-${index}`}
                      className="flex items-center justify-between border border-line-strong bg-surface px-4 py-2 text-xs text-ivory"
                    >
                      <span className="truncate">{item.fileName}</span>
                      <button
                        type="button"
                        onClick={() => removeFromList(listKey, index)}
                        className="ml-3 shrink-0 text-slate transition-colors hover:text-danger"
                        aria-label={`Remove ${item.fileName}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <StepNav onBack={() => onBack(getValues())} continueLabel="Continue to expectations" />
    </motion.form>
  );
});
