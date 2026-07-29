"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SITE } from "@/lib/constants";
import {
  FILM_STAGE_VALUES,
  PRIMARY_ROLE_VALUES,
} from "@/lib/validations/leads";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = PRIMARY_ROLE_VALUES.map((value) => ({ value, label: value }));
const STAGE_OPTIONS = FILM_STAGE_VALUES.map((value) => ({ value, label: value }));

type ChecklistFormState = {
  firstName: string;
  email: string;
  primaryRole: string;
  filmStage: string;
  consent: boolean;
  honeypot: string;
};

const initialForm: ChecklistFormState = {
  firstName: "",
  email: "",
  primaryRole: "",
  filmStage: "",
  consent: false,
  honeypot: "",
};

export function ChecklistCaptureForm({ className }: { className?: string }) {
  const [form, setForm] = useState<ChecklistFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof ChecklistFormState>(
    key: K,
    value: ChecklistFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.consent) {
      setError("Please confirm you agree to receive the checklist and occasional updates.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          email: form.email,
          primaryRole: form.primaryRole,
          filmStage: form.filmStage,
          consent: form.consent,
          honeypot: form.honeypot,
          resourceSlug: "distribution-readiness-checklist",
          source: "checklist",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to unlock the checklist. Please try again.");
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className={cn("border border-line-strong bg-surface p-8 md:p-10", className)}>
        <p className="credit text-warm-metal">Checklist unlocked</p>
        <h2 className="mt-4 font-display text-3xl text-ivory md:text-4xl">
          Your readiness checklist is ready.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate md:text-[0.95rem]">
          Open the print version, then use your browser&apos;s Print dialog and choose
          &ldquo;Save as PDF&rdquo; for a shareable file. Work through it with your producer and
          post supervisor before you submit.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href="/checklist/print" size="lg">
            Open print version
          </ButtonLink>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setSuccess(false)}
          >
            Use another email
          </Button>
        </div>
        <p className="mt-8 text-sm leading-relaxed text-slate">
          Prefer email? Write us at{" "}
          <a
            href={`mailto:${SITE.email}?subject=${encodeURIComponent("Distribution readiness checklist")}`}
            className="text-silver transition-colors hover:text-ivory"
          >
            {SITE.email}
          </a>{" "}
          if you need the checklist resent or have a deliverables question before submission.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("border border-line-strong bg-surface p-8 md:p-10", className)}>
      <p className="credit text-warm-metal">Free download</p>
      <h2 className="mt-4 font-display text-3xl text-ivory md:text-4xl">
        Get the checklist
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate md:text-[0.95rem]">
        Share your details and we&apos;ll unlock the print-ready checklist. Occasional resource
        notes may follow — unsubscribe anytime.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="checklist-honeypot">Leave blank</label>
          <input
            id="checklist-honeypot"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.honeypot}
            onChange={(e) => updateField("honeypot", e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            name="firstName"
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Primary role"
            name="primaryRole"
            required
            placeholder="Select a role"
            options={ROLE_OPTIONS}
            value={form.primaryRole}
            onChange={(e) => updateField("primaryRole", e.target.value)}
          />
          <Select
            label="Film stage"
            name="filmStage"
            required
            placeholder="Select a stage"
            options={STAGE_OPTIONS}
            value={form.filmStage}
            onChange={(e) => updateField("filmStage", e.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-slate">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={(e) => updateField("consent", e.target.checked)}
            className="mt-1 size-4 shrink-0 border border-line-strong bg-surface accent-warm-metal"
            required
          />
          <span>
            I agree to receive this checklist and occasional email updates from Silver Spring
            Studios. See our{" "}
            <Link href="/privacy" className="text-silver hover:text-ivory">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Unlocking…" : "Unlock checklist"}
        </Button>
      </form>
    </div>
  );
}
