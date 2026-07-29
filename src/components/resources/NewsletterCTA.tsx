"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

const PRIMARY_ROLES = [
  "Filmmaker",
  "Producer",
  "Director",
  "Festival programmer",
  "Student",
  "Other",
] as const;

const FILM_STAGES = [
  "Script/development",
  "In production",
  "Post-production",
  "Festival circuit",
  "Seeking distribution",
  "Previously released",
] as const;

const GENRE_INTERESTS = [
  "Horror",
  "Thriller",
  "Documentary",
  "Drama",
  "Sci-Fi",
  "Other",
] as const;

const ROLE_OPTIONS = PRIMARY_ROLES.map((value) => ({ value, label: value }));
const STAGE_OPTIONS = FILM_STAGES.map((value) => ({ value, label: value }));
const GENRE_OPTIONS = GENRE_INTERESTS.map((value) => ({ value, label: value }));

type NewsletterFormState = {
  firstName: string;
  email: string;
  primaryRole: string;
  filmStage: string;
  genreInterest: string;
  consent: boolean;
  honeypot: string;
};

const initialForm: NewsletterFormState = {
  firstName: "",
  email: "",
  primaryRole: "",
  filmStage: "",
  genreInterest: "",
  consent: false,
  honeypot: "",
};

export function NewsletterCTA({
  href = "/resources#newsletter",
  showForm = false,
  className,
  id = "newsletter",
}: {
  href?: string;
  showForm?: boolean;
  className?: string;
  id?: string;
}) {
  const [form, setForm] = useState<NewsletterFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function updateField<K extends keyof NewsletterFormState>(
    key: K,
    value: NewsletterFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.consent) {
      setError("Please confirm you agree to receive updates.");
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
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Unable to subscribe. Please try again.");
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!showForm) {
    return (
      <section
        id={id}
        className={cn("border-t border-line py-14 md:py-16", className)}
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="credit text-warm-metal">Newsletter</p>
            <h2 className="mt-3 font-display text-3xl text-ivory md:text-4xl">
              Practical notes for filmmakers preparing a release.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate md:text-[0.95rem]">
              Deliverables, contracts, recoupment and marketing — without the pitch deck noise.
            </p>
          </div>
          <ButtonLink href={href} variant="secondary" size="md">
            Join the list
          </ButtonLink>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section id={id} className={cn("border-t border-line py-14 md:py-16", className)}>
        <p className="credit text-warm-metal">Newsletter</p>
        <p className="mt-4 font-display text-3xl text-ivory">You&apos;re on the list.</p>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate">
          We&apos;ll send occasional resource updates. You can unsubscribe at any time.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-8"
          onClick={() => setSuccess(false)}
        >
          Subscribe another address
        </Button>
      </section>
    );
  }

  return (
    <section id={id} className={cn("border-t border-line py-14 md:py-16", className)}>
      <div className="max-w-2xl">
        <p className="credit text-warm-metal">Newsletter</p>
        <h2 className="mt-3 font-display text-3xl text-ivory md:text-4xl">
          Stay close to the craft of release.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate md:text-[0.95rem]">
          Occasional notes on distribution, deliverables and filmmaker-facing release practice.
          No spam. Unsubscribe anytime.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-10 max-w-2xl space-y-5" noValidate>
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor="newsletter-honeypot">Leave blank</label>
          <input
            id="newsletter-honeypot"
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

        <Select
          label="Genre interest"
          name="genreInterest"
          required
          placeholder="Select a genre"
          options={GENRE_OPTIONS}
          value={form.genreInterest}
          onChange={(e) => updateField("genreInterest", e.target.value)}
        />

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
            I agree to receive occasional email updates from Silver Spring Studios. See our{" "}
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
          {submitting ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
    </section>
  );
}
