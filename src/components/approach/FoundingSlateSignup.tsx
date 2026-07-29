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
  GENRE_INTEREST_VALUES,
  PRIMARY_ROLE_VALUES,
} from "@/lib/validations/leads";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS = PRIMARY_ROLE_VALUES.map((value) => ({ value, label: value }));
const STAGE_OPTIONS = FILM_STAGE_VALUES.map((value) => ({ value, label: value }));
const GENRE_OPTIONS = GENRE_INTEREST_VALUES.map((value) => ({ value, label: value }));

const SUBMIT_HREF = "/submit?source=founding-slate&medium=our-approach&campaign=founding-slate";

type FoundingSlateFormState = {
  firstName: string;
  email: string;
  primaryRole: string;
  filmStage: string;
  genreInterest: string;
  consent: boolean;
  honeypot: string;
};

const initialForm: FoundingSlateFormState = {
  firstName: "",
  email: "",
  primaryRole: "",
  filmStage: "",
  genreInterest: "",
  consent: false,
  honeypot: "",
};

export function FoundingSlateSignup({ className }: { className?: string }) {
  const [form, setForm] = useState<FoundingSlateFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof FoundingSlateFormState>(
    key: K,
    value: FoundingSlateFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.consent) {
      setError("Please confirm you agree to receive occasional founding slate updates.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          email: form.email,
          primaryRole: form.primaryRole,
          filmStage: form.filmStage,
          genreInterest: form.genreInterest,
          consent: form.consent,
          honeypot: form.honeypot,
          source: "founding_slate",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to join the list right now. Please try again.");
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
        <p className="credit text-warm-metal">You&apos;re on the list</p>
        <h3 className="mt-4 font-display text-2xl text-ivory md:text-3xl">
          Thanks for following the founding slate.
        </h3>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate">
          We&apos;ll send founding-slate updates as they happen—no catalogue claims, just what is
          actually true about where the company stands. If you have a completed film ready for
          review, you can submit any time.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href={SUBMIT_HREF} size="lg">
            Submit Your Film
          </ButtonLink>
          <Button type="button" variant="secondary" size="lg" onClick={() => setSuccess(false)}>
            Use another email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-line-strong bg-surface p-8 md:p-10", className)}>
      <p className="credit text-warm-metal">Founding Slate interest list</p>
      <h3 className="mt-4 font-display text-2xl text-ivory md:text-3xl">
        Follow the founding slate as it&apos;s built
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate">
        This is an interest list for people who want visibility into a new distributor as it takes
        shape—not a claim of an existing catalogue or confirmed placements. You&apos;ll hear about
        real milestones as they happen.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="founding-slate-honeypot">Leave blank</label>
          <input
            id="founding-slate-honeypot"
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

        <div className="grid gap-5 sm:grid-cols-3">
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
          <Select
            label="Genre interest"
            name="genreInterest"
            required
            placeholder="Select a genre"
            options={GENRE_OPTIONS}
            value={form.genreInterest}
            onChange={(e) => updateField("genreInterest", e.target.value)}
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
            I agree to receive founding-slate updates and occasional email from Silver Spring
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

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Joining…" : "Join the interest list"}
          </Button>
          <Link
            href={SUBMIT_HREF}
            className="text-sm text-silver no-underline transition-colors hover:text-ivory"
          >
            Have a completed film? Submit it instead →
          </Link>
        </div>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-slate/80">
        Prefer email? Write us directly at{" "}
        <a href={`mailto:${SITE.email}`} className="text-silver hover:text-ivory">
          {SITE.email}
        </a>
        .
      </p>
    </div>
  );
}
