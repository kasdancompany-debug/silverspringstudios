"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { cn, generateDraftToken, generateSubmissionReference } from "@/lib/utils";
import { STEP_META } from "@/lib/constants";
import type {
  ConsentInput,
  ExpectationsInput,
  FilmInput,
  FilmmakerInput,
  MaterialsInput,
  RightsInput,
} from "@/lib/validations/submission";
import { SUBMISSION_SUMMARY_STORAGE_PREFIX, compactPartial, safeStringify, type StepHandle } from "./form-utils";
import { getStoredReferral } from "./ReferralCapture";
import { DirtyLeaveGuard, ProgressRail, SaveStatus } from "./StepChrome";
import { ConsentStep } from "./steps/ConsentStep";
import { ExpectationsStep } from "./steps/ExpectationsStep";
import { FilmStep } from "./steps/FilmStep";
import { FilmmakerStep } from "./steps/FilmmakerStep";
import { EMPTY_UPLOADED_FILES, MaterialsStep, type UploadedFilesState } from "./steps/MaterialsStep";
import { RightsStep } from "./steps/RightsStep";

const TOTAL_STEPS = STEP_META.length;
const STEP_KEYS = ["filmmaker", "film", "rights", "materials", "expectations", "consent"] as const;
const AUTOSAVE_INTERVAL_MS = 30_000;
const AUTOSAVE_DEBOUNCE_MS = 1_500;
const LOCAL_STORAGE_PREFIX = "sss-submission-draft:";

/** Rough field-count hints used only to estimate in-progress completion of
 * the *current* step for the progress rail — not a validation source. */
const STEP_FIELD_COUNT_HINTS: Record<number, number> = {
  1: 10,
  2: 21,
  3: 11,
  4: 5,
  5: 9,
  6: 7,
};

interface SubmissionAggregate {
  filmmaker: Partial<FilmmakerInput>;
  film: Partial<FilmInput>;
  rights: Partial<RightsInput>;
  materials: Partial<MaterialsInput>;
  expectations: Partial<ExpectationsInput>;
  consent: Partial<ConsentInput>;
}

const EMPTY_AGGREGATE: SubmissionAggregate = {
  filmmaker: {},
  film: {},
  rights: {},
  materials: {},
  expectations: {},
  consent: {},
};

interface LocalDraftSnapshot {
  currentStep: number;
  data: SubmissionAggregate;
  uploadedFiles: UploadedFilesState;
  screenerPasswordSet: boolean;
  savedAt: string;
}

function readLocalDraft(token: string): LocalDraftSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${token}`);
    if (!raw) return null;
    return JSON.parse(raw) as LocalDraftSnapshot;
  } catch {
    return null;
  }
}

function writeLocalDraft(token: string, snapshot: LocalDraftSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${token}`, safeStringify(snapshot));
  } catch {
    // Ignore quota / private-mode failures — this is a resilience layer, not the source of truth.
  }
}

function clearLocalDraft(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${token}`);
  } catch {
    // Ignore.
  }
}

/** Stores a print-safe copy of the submission on success, keyed by
 * reference number, for the thank-you page's SubmissionReceipt (print view
 * + offline-friendly fallback to the receipt API) to read from —
 * deliberately excludes screener_password. `status`/`submittedAt` are taken
 * from the server's POST /api/submissions response when available so the
 * stored summary matches what was actually persisted. */
function storePrintSafeSummary(
  referenceNumber: string,
  aggregate: SubmissionAggregate,
  uploadedFiles: UploadedFilesState,
  server: { submittedAt?: string; status?: string } = {},
) {
  if (typeof window === "undefined") return;
  try {
    const materialsSafe = { ...aggregate.materials } as Partial<MaterialsInput> & Record<string, unknown>;
    delete materialsSafe.screener_password;
    const summary = {
      referenceNumber,
      submittedAt: server.submittedAt ?? new Date().toISOString(),
      status: server.status ?? "submitted",
      filmmaker: aggregate.filmmaker,
      film: aggregate.film,
      rights: aggregate.rights,
      materials: materialsSafe,
      expectations: aggregate.expectations,
      uploadedFiles,
    };
    window.sessionStorage.setItem(
      `${SUBMISSION_SUMMARY_STORAGE_PREFIX}${referenceNumber}`,
      safeStringify(summary),
    );
  } catch {
    // Best-effort only — never block a successful submission on this.
  }
}

export function SubmissionForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draftToken, setDraftToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SubmissionAggregate>(EMPTY_AGGREGATE);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFilesState>(EMPTY_UPLOADED_FILES);
  const [screenerPasswordSet, setScreenerPasswordSet] = useState(false);
  const [previewReference] = useState(() => generateSubmissionReference());

  const [isLoadingDraft, setIsLoadingDraft] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [currentStepFilledCount, setCurrentStepFilledCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [alreadySubmittedReference, setAlreadySubmittedReference] = useState<string | null>(null);

  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const activeStepRef = useRef<StepHandle | null>(null);
  const skipStepAutosaveRef = useRef(true);
  const formDataRef = useRef(formData);
  const uploadedFilesRef = useRef(uploadedFiles);
  const currentStepRef = useRef(currentStep);
  const draftTokenRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<number | undefined>(undefined);

  formDataRef.current = formData;
  uploadedFilesRef.current = uploadedFiles;
  currentStepRef.current = currentStep;
  draftTokenRef.current = draftToken;

  // ---------------------------------------------------------------------
  // Initial hydration: resume from ?token=, or mint a fresh shareable one.
  // ---------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const urlToken = searchParams.get("token");

        if (urlToken) {
          try {
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), 4000);
            const response = await fetch(
              `/api/submissions/draft?token=${encodeURIComponent(urlToken)}`,
              { signal: controller.signal },
            );
            window.clearTimeout(timeout);
            const json = await response.json().catch(() => null);

            if (cancelled) return;

            if (json?.success && json.data) {
              const rawMaterials = (json.data.materials ?? {}) as Partial<MaterialsInput> & {
                screener_password_set?: boolean;
              };
              const { screener_password_set: passwordSet, ...materialsRest } = rawMaterials;

              setFormData({
                filmmaker: json.data.filmmaker ?? {},
                film: json.data.film ?? {},
                rights: json.data.rights ?? {},
                materials: materialsRest,
                expectations: json.data.expectations ?? {},
                consent: {},
              });
              setScreenerPasswordSet(Boolean(passwordSet));
              setCurrentStep(Math.min(Math.max(json.currentStep ?? 1, 1), TOTAL_STEPS));
              setDraftToken(urlToken);
              return;
            }

            if (json?.alreadySubmitted) {
              setAlreadySubmittedReference(json.referenceNumber ?? null);
              setDraftToken(urlToken);
              return;
            }
          } catch {
            // Fall through to the local-storage safety net below.
          }

          if (cancelled) return;

          const local = readLocalDraft(urlToken);
          if (local) {
            setFormData(local.data);
            setUploadedFiles(local.uploadedFiles ?? EMPTY_UPLOADED_FILES);
            setScreenerPasswordSet(Boolean(local.screenerPasswordSet));
            setCurrentStep(Math.min(Math.max(local.currentStep, 1), TOTAL_STEPS));
          }
          setDraftToken(urlToken);
          return;
        }

        const token = generateDraftToken();
        if (cancelled) return;
        setDraftToken(token);
        router.replace(`${pathname}?token=${token}`, { scroll: false });
      } catch (error) {
        console.error("[submission] Failed to initialize draft:", error);
        if (!cancelled) {
          const fallback = generateDraftToken();
          setDraftToken(fallback);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDraft(false);
        }
      }
    }

    void init();

    // Hard failsafe so a hung network call cannot trap the form forever.
    const failsafe = window.setTimeout(() => {
      if (!cancelled) setIsLoadingDraft(false);
    }, 5000);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
    };
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------
  // Track how "full" the current step looks, for the progress estimate —
  // re-derived whenever the step changes so returning to a completed step
  // (via Back) doesn't momentarily show 0% progress for it.
  // ---------------------------------------------------------------------
  useEffect(() => {
    const key = STEP_KEYS[currentStep - 1];
    const snapshot = formData[key] ?? {};
    setCurrentStepFilledCount(Object.keys(compactPartial(snapshot as Record<string, unknown>)).length);
  }, [currentStep, formData]);

  const progressPercent = (() => {
    const completedFraction = (currentStep - 1) / TOTAL_STEPS;
    const fieldHint = STEP_FIELD_COUNT_HINTS[currentStep] ?? 10;
    const inProgressFraction = Math.min(1, currentStepFilledCount / fieldHint) / TOTAL_STEPS;
    return Math.min(100, Math.round((completedFraction + inProgressFraction) * 100));
  })();

  // ---------------------------------------------------------------------
  // Autosave
  // ---------------------------------------------------------------------
  const saveDraftNow = useCallback(async () => {
    const token = draftTokenRef.current;
    if (!token) return;

    const liveSnapshot = activeStepRef.current?.getSnapshot();
    const step = currentStepRef.current;
    const groupKey = STEP_KEYS[step - 1];

    const dataToSave: SubmissionAggregate = liveSnapshot
      ? { ...formDataRef.current, [groupKey]: { ...formDataRef.current[groupKey], ...liveSnapshot } }
      : formDataRef.current;

    setIsSaving(true);

    try {
      const response = await fetch("/api/submissions/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: safeStringify({
          draftToken: token,
          honeypot: honeypotRef.current?.value ?? "",
          currentStep: step,
          filmmaker: dataToSave.filmmaker,
          film: dataToSave.film,
          rights: dataToSave.rights,
          materials: dataToSave.materials,
          expectations: dataToSave.expectations,
          consent: dataToSave.consent,
          referral: getStoredReferral(),
        }),
      });

      const json = await response.json().catch(() => null);

      if (json?.success) {
        setLastSavedAt(new Date());
        setIsDirty(false);
        if (json.draftToken && json.draftToken !== token) {
          setDraftToken(json.draftToken);
        }
      }
    } catch {
      // Silent — localStorage below is the resilience layer for autosave.
    } finally {
      setIsSaving(false);
    }

    writeLocalDraft(token, {
      currentStep: step,
      data: dataToSave,
      uploadedFiles: uploadedFilesRef.current,
      screenerPasswordSet,
      savedAt: new Date().toISOString(),
    });
  }, [screenerPasswordSet]);

  // 30-second interval autosave — the steady safety net regardless of
  // whether the filmmaker is actively typing.
  useEffect(() => {
    if (isLoadingDraft || !draftToken) return undefined;
    const interval = setInterval(() => {
      void saveDraftNow();
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoadingDraft, draftToken, saveDraftNow]);

  // Autosave immediately whenever the visible step changes (Back/Continue).
  useEffect(() => {
    if (isLoadingDraft || !draftToken) return;
    if (skipStepAutosaveRef.current) {
      skipStepAutosaveRef.current = false;
      return;
    }
    void saveDraftNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Debounced (~1.5s) autosave after meaningful in-field edits, reported by
  // the active step via onValuesChange — catches long stays on one step.
  const handleStepValuesChange = useCallback((values: Record<string, unknown>) => {
    setCurrentStepFilledCount(Object.keys(compactPartial(values)).length);
    setIsDirty(true);
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      void saveDraftNow();
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [saveDraftNow]);

  const handleStepDirtyChange = useCallback((dirty: boolean) => {
    if (dirty) setIsDirty(true);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------
  const goToStep = useCallback((step: number) => {
    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
    setCurrentStep(step);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleFilmmakerNext = useCallback(
    (data: FilmmakerInput) => {
      setFormData((prev) => ({ ...prev, filmmaker: data }));
      goToStep(2);
    },
    [goToStep],
  );

  const handleFilmNext = useCallback(
    (data: FilmInput) => {
      setFormData((prev) => ({ ...prev, film: data }));
      goToStep(3);
    },
    [goToStep],
  );

  const handleFilmBack = useCallback(
    (values: Partial<FilmInput>) => {
      setFormData((prev) => ({ ...prev, film: { ...prev.film, ...compactPartial(values) } }));
      goToStep(1);
    },
    [goToStep],
  );

  const handleRightsNext = useCallback(
    (data: RightsInput) => {
      setFormData((prev) => ({ ...prev, rights: data }));
      goToStep(4);
    },
    [goToStep],
  );

  const handleRightsBack = useCallback(
    (values: Partial<RightsInput>) => {
      setFormData((prev) => ({ ...prev, rights: { ...prev.rights, ...compactPartial(values) } }));
      goToStep(2);
    },
    [goToStep],
  );

  const handleMaterialsNext = useCallback(
    (data: MaterialsInput) => {
      setFormData((prev) => ({ ...prev, materials: data }));
      if (data.screener_password && data.screener_password.trim().length > 0) {
        setScreenerPasswordSet(true);
      }
      goToStep(5);
    },
    [goToStep],
  );

  const handleMaterialsBack = useCallback(
    (values: Partial<MaterialsInput>) => {
      setFormData((prev) => ({ ...prev, materials: { ...prev.materials, ...compactPartial(values) } }));
      goToStep(3);
    },
    [goToStep],
  );

  const handleExpectationsNext = useCallback(
    (data: ExpectationsInput) => {
      setFormData((prev) => ({ ...prev, expectations: data }));
      goToStep(6);
    },
    [goToStep],
  );

  const handleExpectationsBack = useCallback(
    (values: Partial<ExpectationsInput>) => {
      setFormData((prev) => ({
        ...prev,
        expectations: { ...prev.expectations, ...compactPartial(values) },
      }));
      goToStep(4);
    },
    [goToStep],
  );

  const handleConsentBack = useCallback(
    (values: Partial<ConsentInput>) => {
      setFormData((prev) => ({ ...prev, consent: { ...prev.consent, ...values } }));
      goToStep(5);
    },
    [goToStep],
  );

  // ---------------------------------------------------------------------
  // Final submit
  // ---------------------------------------------------------------------
  const handleFinalSubmit = useCallback(
    async (consentData: ConsentInput) => {
      setSubmitError(null);
      setIsSubmitting(true);

      const finalData: SubmissionAggregate = { ...formDataRef.current, consent: consentData };
      setFormData(finalData);

      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: safeStringify({
            draftToken: draftTokenRef.current,
            honeypot: honeypotRef.current?.value ?? "",
            referenceHint: previewReference,
            filmmaker: finalData.filmmaker,
            film: finalData.film,
            rights: finalData.rights,
            materials: finalData.materials,
            expectations: finalData.expectations,
            consent: finalData.consent,
            referral: getStoredReferral(),
          }),
        });

        const json = await response.json().catch(() => null);

        if (!response.ok || !json?.success) {
          setSubmitError(
            json?.error ?? "Something went wrong while submitting your film. Please try again.",
          );
          setIsSubmitting(false);
          return;
        }

        if (draftTokenRef.current) {
          clearLocalDraft(draftTokenRef.current);
        }

        storePrintSafeSummary(json.referenceNumber, finalData, uploadedFilesRef.current, {
          submittedAt: json.submittedAt,
          status: json.status,
        });
        setIsDirty(false);

        router.push(`/thank-you?reference=${encodeURIComponent(json.referenceNumber)}`);
      } catch {
        setSubmitError(
          "Something went wrong while submitting your film. Please check your connection and try again.",
        );
        setIsSubmitting(false);
      }
    },
    [previewReference, router],
  );

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  if (isLoadingDraft) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading your submission…
      </div>
    );
  }

  if (alreadySubmittedReference) {
    return (
      <div className="space-y-4 border border-line-strong bg-surface p-8 text-center md:p-10">
        <p className="font-display text-2xl text-ivory">This submission has already been sent.</p>
        <p className="text-sm text-slate">
          Reference number: <span className="text-ivory">{alreadySubmittedReference}</span>
        </p>
        <p className="text-sm text-slate">
          If you need to make changes, please contact us and reference this number.
        </p>
        <div className="flex justify-center pt-2">
          <ButtonLink href="/submit">Start a new submission</ButtonLink>
        </div>
      </div>
    );
  }

  const draftUrl =
    typeof window !== "undefined" && draftToken
      ? `${window.location.origin}${pathname}?token=${draftToken}`
      : null;

  return (
    <div className="relative">
      <DirtyLeaveGuard isDirty={isDirty} />

      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="company_website">Leave this field blank</label>
        <input id="company_website" type="text" tabIndex={-1} autoComplete="off" ref={honeypotRef} />
      </div>

      <div className={cn("lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14")}>
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-8">
            <ProgressRail
              currentStep={currentStep}
              total={TOTAL_STEPS}
              percent={progressPercent}
              steps={STEP_META}
              orientation="vertical"
            />
            <SaveStatus isSaving={isSaving} lastSavedAt={lastSavedAt} isDirty={isDirty} draftUrl={draftUrl} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-8 space-y-4 lg:hidden">
            <ProgressRail currentStep={currentStep} total={TOTAL_STEPS} percent={progressPercent} steps={STEP_META} />
            <SaveStatus isSaving={isSaving} lastSavedAt={lastSavedAt} isDirty={isDirty} draftUrl={draftUrl} />
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <FilmmakerStep
                key="filmmaker"
                ref={activeStepRef}
                defaultValues={formData.filmmaker}
                onNext={handleFilmmakerNext}
                onValuesChange={handleStepValuesChange}
                onDirtyChange={handleStepDirtyChange}
              />
            ) : null}
            {currentStep === 2 ? (
              <FilmStep
                key="film"
                ref={activeStepRef}
                defaultValues={formData.film}
                onNext={handleFilmNext}
                onBack={handleFilmBack}
                onValuesChange={handleStepValuesChange}
                onDirtyChange={handleStepDirtyChange}
              />
            ) : null}
            {currentStep === 3 ? (
              <RightsStep
                key="rights"
                ref={activeStepRef}
                defaultValues={formData.rights}
                onNext={handleRightsNext}
                onBack={handleRightsBack}
                onValuesChange={handleStepValuesChange}
                onDirtyChange={handleStepDirtyChange}
              />
            ) : null}
            {currentStep === 4 ? (
              <MaterialsStep
                key="materials"
                ref={activeStepRef}
                defaultValues={formData.materials}
                screenerPasswordSet={screenerPasswordSet}
                onNext={handleMaterialsNext}
                onBack={handleMaterialsBack}
                onValuesChange={handleStepValuesChange}
                onDirtyChange={handleStepDirtyChange}
                draftToken={draftToken}
                uploadedFiles={uploadedFiles}
                onUploadedFilesChange={setUploadedFiles}
              />
            ) : null}
            {currentStep === 5 ? (
              <ExpectationsStep
                key="expectations"
                ref={activeStepRef}
                defaultValues={formData.expectations}
                onNext={handleExpectationsNext}
                onBack={handleExpectationsBack}
                onValuesChange={handleStepValuesChange}
                onDirtyChange={handleStepDirtyChange}
              />
            ) : null}
            {currentStep === 6 ? (
              <ConsentStep
                key="consent"
                ref={activeStepRef}
                defaultValues={formData.consent}
                reviewData={{
                  filmmaker: formData.filmmaker,
                  film: formData.film,
                  rights: formData.rights,
                  materials: formData.materials,
                  expectations: formData.expectations,
                }}
                uploadedFiles={uploadedFiles}
                screenerPasswordSet={screenerPasswordSet}
                previewReference={previewReference}
                onBack={handleConsentBack}
                onEditStep={goToStep}
                onSubmit={handleFinalSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
