/**
 * Shared helpers for the multi-step submission form. Kept outside the "use
 * server" actions module and outside individual step components so both the
 * orchestrator and each step can compact/serialize form values consistently.
 */

/** sessionStorage key prefix for the print-safe submission summary written
 * right after a successful submit (see SubmissionForm's storePrintSafeSummary)
 * and read by the thank-you page's SubmissionReceipt component as an
 * offline-friendly fallback to the receipt API. Shared here so both files
 * stay in sync — never duplicate this string literal. */
export const SUBMISSION_SUMMARY_STORAGE_PREFIX = "sss-submission-summary:";

/** Imperative handle exposed by every step component so the parent can pull
 * a best-effort, unvalidated snapshot of in-progress edits for autosave —
 * without forcing a re-render on every keystroke. */
export interface StepHandle {
  getSnapshot: () => Record<string, unknown>;
  /** Whether the step's form has any edits since it was mounted/reset. Used
   * to drive the "unsaved changes" leave-guard and save-status messaging. */
  isDirty?: () => boolean;
}

/** Drops empty/placeholder values so partial, in-progress edits never fail
 * server-side "required if present" validation during autosave. */
export function compactPartial<T extends Record<string, unknown>>(input: T): Partial<T> {
  const output: Partial<T> = {};

  (Object.keys(input) as Array<keyof T>).forEach((key) => {
    const value = input[key];
    if (value === undefined || value === null) return;
    if (typeof value === "number" && Number.isNaN(value)) return;
    if (typeof value === "string" && value.trim() === "") return;
    output[key] = value;
  });

  return output;
}

/** JSON.stringify that drops NaN numeric fields (from untouched number
 * inputs) instead of turning them into `null`, which would fail zod's
 * `z.number()` checks on the server. */
export function safeStringify(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    typeof val === "number" && Number.isNaN(val) ? undefined : val,
  );
}
