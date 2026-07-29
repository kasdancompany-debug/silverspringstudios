"use client";

import { forwardRef, useEffect, useImperativeHandle, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { LockKeyhole, Pencil } from "lucide-react";
import { compactPartial, type StepHandle } from "@/components/submit/form-utils";
import { StepHeader, StepNav } from "@/components/submit/StepChrome";
import { FILM_FORMATS } from "@/lib/constants";
import {
  consentSchema,
  type ConsentInput,
  type ExpectationsInput,
  type FilmInput,
  type FilmmakerInput,
  type MaterialsInput,
  type RightsInput,
} from "@/lib/validations/submission";
import type { UploadedFilesState } from "./MaterialsStep";

const FORMAT_LABELS: Record<(typeof FILM_FORMATS)[number], string> = {
  feature: "Feature film",
  documentary: "Documentary",
  limited_series: "Limited series",
  other: "Other",
};

const DEFAULTS: Record<keyof ConsentInput, boolean> = {
  no_agreement_created: false,
  no_obligation_to_review: false,
  authority_to_share: false,
  similar_projects_may_exist: false,
  no_confidentiality: false,
  read_terms_privacy: false,
  information_accurate: false,
};

const CONSENT_ITEMS: Array<{ name: keyof ConsentInput; label: ReactNode }> = [
  {
    name: "no_agreement_created",
    label:
      "I understand that submitting this form does not create a distribution agreement or any other contract between me and Silver Spring Studios.",
  },
  {
    name: "no_obligation_to_review",
    label:
      "I understand Silver Spring Studios is under no obligation to review, respond to, accept or provide feedback on this submission.",
  },
  {
    name: "authority_to_share",
    label:
      "I confirm I have the legal authority to submit these materials and share them with Silver Spring Studios for evaluation.",
  },
  {
    name: "similar_projects_may_exist",
    label:
      "I understand Silver Spring Studios may already be developing, reviewing or distributing similar or competing projects, and this submission does not restrict those activities.",
  },
  {
    name: "no_confidentiality",
    label:
      "I understand this submission is not made under any confidentiality or non-disclosure obligation unless a separate signed agreement states otherwise.",
  },
  {
    name: "read_terms_privacy",
    label: (
      <>
        I have read and agree to the{" "}
        <a
          href="/submission-terms"
          target="_blank"
          rel="noreferrer"
          className="text-silver underline underline-offset-4 hover:text-ivory"
        >
          Submission Terms
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noreferrer"
          className="text-silver underline underline-offset-4 hover:text-ivory"
        >
          Privacy Policy
        </a>
        .
      </>
    ),
  },
  {
    name: "information_accurate",
    label: "I confirm the information provided in this submission is accurate and complete to the best of my knowledge.",
  },
];

function ReviewRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-3 sm:gap-4">
      <dt className="text-xs tracking-[0.1em] uppercase text-slate">{label}</dt>
      <dd className="sm:col-span-2 text-sm text-ivory">
        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
      </dd>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border border-line-strong bg-surface p-6">
      <div className="mb-2 flex items-center justify-between gap-4">
        <h3 className="font-display text-lg text-ivory">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-silver underline underline-offset-4 transition-colors hover:text-ivory"
        >
          <Pencil className="h-3 w-3" aria-hidden="true" />
          Edit
        </button>
      </div>
      <dl className="divide-y divide-line">{children}</dl>
    </div>
  );
}

export interface ConsentStepProps {
  defaultValues?: Partial<ConsentInput>;
  reviewData: {
    filmmaker: Partial<FilmmakerInput>;
    film: Partial<FilmInput>;
    rights: Partial<RightsInput>;
    materials: Partial<MaterialsInput>;
    expectations: Partial<ExpectationsInput>;
  };
  uploadedFiles: UploadedFilesState;
  /** Whether a screener password already exists for this draft (loaded from
   * the server) — combined with any freshly-typed password to decide what
   * the review summary shows, without ever rendering the value itself. */
  screenerPasswordSet?: boolean;
  previewReference: string;
  onBack: (values: Partial<ConsentInput>) => void;
  onEditStep: (step: number) => void;
  onSubmit: (data: ConsentInput) => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  onValuesChange?: (values: Record<string, unknown>) => void;
}

export const ConsentStep = forwardRef<StepHandle, ConsentStepProps>(function ConsentStep(
  {
    defaultValues,
    reviewData,
    uploadedFiles,
    screenerPasswordSet = false,
    previewReference,
    onBack,
    onEditStep,
    onSubmit,
    isSubmitting,
    submitError,
    onDirtyChange,
    onValuesChange,
  },
  ref,
) {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<ConsentInput>({
    resolver: zodResolver(consentSchema),
    mode: "onChange",
    defaultValues: { ...DEFAULTS, ...defaultValues } as ConsentInput,
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

  const { filmmaker, film, rights, materials, expectations } = reviewData;
  const attachmentCount =
    (uploadedFiles.poster ? 1 : 0) +
    (uploadedFiles.epk ? 1 : 0) +
    uploadedFiles.stills.length +
    uploadedFiles.captions.length;

  // Never render the screener password itself here — only whether one has
  // been provided, either previously (server-confirmed) or in this session.
  const hasScreenerPassword = screenerPasswordSet || Boolean(materials.screener_password?.trim());

  return (
    <motion.form
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
    >
      <StepHeader
        step={6}
        title="Review & consent"
        description="Please review your submission below. You can edit any section before sending it to us."
        estimate="A final read-through before sending"
      />

      <div className="border border-line-strong bg-surface-elevated px-6 py-5">
        <p className="text-xs tracking-[0.18em] uppercase text-warm-metal">Reference number</p>
        <p className="mt-2 font-display text-2xl tracking-wide text-ivory">{previewReference}</p>
        <p className="mt-2 text-xs text-slate">
          This is a preview — your final reference will be issued once you submit. Save it for
          future correspondence.
        </p>
      </div>

      <div className="space-y-6">
        <ReviewSection title="Filmmaker" onEdit={() => onEditStep(1)}>
          <ReviewRow label="Name" value={filmmaker.full_name} />
          <ReviewRow label="Email" value={filmmaker.email} />
          <ReviewRow label="Phone" value={filmmaker.phone} />
          <ReviewRow label="Company" value={filmmaker.company} />
          <ReviewRow
            label="Location"
            value={[filmmaker.city, filmmaker.province_state, filmmaker.country].filter(Boolean).join(", ")}
          />
          <ReviewRow label="Role on film" value={filmmaker.role_on_film} />
        </ReviewSection>

        <ReviewSection title="Film" onEdit={() => onEditStep(2)}>
          <ReviewRow label="Title" value={film.title} />
          <ReviewRow label="Format" value={film.format ? FORMAT_LABELS[film.format] : undefined} />
          <ReviewRow label="Genre" value={[film.genre, film.secondary_genre].filter(Boolean).join(" / ")} />
          <ReviewRow label="Runtime" value={film.runtime_minutes ? `${film.runtime_minutes} minutes` : undefined} />
          <ReviewRow label="Completion year" value={film.completion_year} />
          <ReviewRow label="Budget range" value={film.budget_range} />
          <ReviewRow label="Logline" value={film.logline} />
        </ReviewSection>

        <ReviewSection title="Rights" onEdit={() => onEditStep(3)}>
          <ReviewRow label="Controls rights" value={rights.controls_rights} />
          <ReviewRow label="Territories" value={rights.available_territories} />
          <ReviewRow label="Rights available" value={rights.rights_available} />
          <ReviewRow label="Chain of title" value={rights.chain_of_title_status} />
          <ReviewRow label="Music clearance" value={rights.music_clearance_status} />
        </ReviewSection>

        <ReviewSection title="Materials" onEdit={() => onEditStep(4)}>
          <ReviewRow label="Screener URL" value={materials.screener_url} />
          <ReviewRow label="Screener password" value={hasScreenerPassword ? "Provided" : "Not provided"} />
          <ReviewRow label="Trailer URL" value={materials.trailer_url} />
          <ReviewRow label="Captions" value={materials.caption_availability} />
          <ReviewRow
            label="Attachments"
            value={attachmentCount > 0 ? `${attachmentCount} file(s) uploaded` : "None uploaded"}
          />
        </ReviewSection>

        <ReviewSection title="Expectations" onEdit={() => onEditStep(5)}>
          <ReviewRow label="Primary goal" value={expectations.primary_release_goal} />
          <ReviewRow label="Key territory" value={expectations.most_important_territory} />
          <ReviewRow label="Desired timing" value={expectations.desired_release_timing} />
        </ReviewSection>
      </div>

      <div className="space-y-3 border border-warm-metal/40 bg-surface px-6 py-6">
        <p className="flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-warm-metal">
          <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
          Before you submit
        </p>
        <p className="text-sm leading-relaxed text-slate">
          Submitting this form does not create a distribution agreement and does not obligate
          Silver Spring Studios to review, respond to or accept your project. We do not guarantee
          any release, marketing outcome or revenue figure of any kind.
        </p>
        <p className="text-sm leading-relaxed text-slate">
          After you submit, this version will be locked for review — you will need to contact us
          to make further changes.
        </p>
      </div>

      <div className="space-y-3">
        {CONSENT_ITEMS.map((item) => (
          <label
            key={item.name}
            className="flex cursor-pointer items-start gap-3 border border-line-strong bg-surface px-4 py-3 text-sm text-ivory transition-colors hover:border-silver"
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-warm-metal"
              {...register(item.name)}
            />
            <span className="leading-relaxed">{item.label}</span>
          </label>
        ))}
        {Object.values(errors).length > 0 ? (
          <p className="text-xs text-danger" role="alert">
            Please confirm every statement above before submitting.
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p className="border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {submitError}
        </p>
      ) : null}

      <StepNav
        onBack={() => onBack(getValues())}
        continueLabel="Submit application"
        submittingLabel="Submitting…"
        isSubmitting={isSubmitting}
      />
    </motion.form>
  );
});
