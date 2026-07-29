"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PARTNER_TYPES } from "@/lib/constants";
import { upsertPartner, togglePublish } from "@/lib/actions/partners";
import type { PartnerPage } from "@/types/database";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const EMPTY_FORM = {
  id: "",
  slug: "",
  partner_name: "",
  partner_type: "festival",
  headline: "",
  introduction: "",
  seeking: "",
  submission_cta_label: "Submit your film",
  resource_download_slug: "distribution-readiness-checklist",
  contact_email: "",
  contact_note: "",
  tracking_source: "",
  tracking_medium: "partner",
  tracking_campaign: "",
  is_published: false,
};

export function PartnerEditor({ partners }: { partners: PartnerPage[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  function loadPartner(partner: PartnerPage) {
    setForm({
      id: partner.id,
      slug: partner.slug,
      partner_name: partner.partner_name,
      partner_type: partner.partner_type,
      headline: partner.headline ?? "",
      introduction: partner.introduction ?? "",
      seeking: partner.seeking ?? "",
      submission_cta_label: partner.submission_cta_label ?? "Submit your film",
      resource_download_slug: partner.resource_download_slug ?? "",
      contact_email: partner.contact_email ?? "",
      contact_note: partner.contact_note ?? "",
      tracking_source: partner.tracking_source ?? "",
      tracking_medium: partner.tracking_medium ?? "partner",
      tracking_campaign: partner.tracking_campaign ?? "",
      is_published: partner.is_published,
    });
    setFeedback(null);
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setFeedback(null);
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await upsertPartner({
        id: form.id || undefined,
        slug: form.slug,
        partner_name: form.partner_name,
        partner_type: form.partner_type,
        headline: form.headline,
        introduction: form.introduction,
        seeking: form.seeking,
        submission_cta_label: form.submission_cta_label,
        resource_download_slug: form.resource_download_slug,
        contact_email: form.contact_email,
        contact_note: form.contact_note,
        tracking_source: form.tracking_source,
        tracking_medium: form.tracking_medium,
        tracking_campaign: form.tracking_campaign,
        is_published: form.is_published,
      });

      if (result.success) {
        setFeedback({ type: "success", message: result.message ?? "Saved." });
        if (result.partner) {
          setForm((prev) => ({ ...prev, id: result.partner!.id, slug: result.partner!.slug }));
        }
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.message ?? "Unable to save partner." });
      }
    });
  }

  function handleTogglePublish(partner: PartnerPage) {
    startTransition(async () => {
      const result = await togglePublish(partner.id, !partner.is_published);
      if (result.success) {
        setFeedback({ type: "success", message: result.message ?? "Updated." });
        router.refresh();
      } else {
        setFeedback({ type: "error", message: result.message ?? "Unable to update publish state." });
      }
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-ivory">Partners</h2>
          <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
            New
          </Button>
        </div>
        <div className="border border-line-strong bg-surface">
          {partners.length === 0 ? (
            <p className="px-4 py-8 text-sm text-slate">No partners yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {partners.map((partner) => (
                <li key={partner.id} className="flex items-start justify-between gap-3 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => loadPartner(partner)}
                    className="text-left"
                  >
                    <p className="font-display text-base text-ivory">{partner.partner_name}</p>
                    <p className="mt-1 text-xs text-slate">
                      /partners/{partner.slug} · {partner.is_published ? "Published" : "Draft"}
                    </p>
                  </button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleTogglePublish(partner)}
                  >
                    {partner.is_published ? "Unpublish" : "Publish"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 border border-line-strong bg-surface px-5 py-6">
        <h2 className="font-display text-xl text-ivory">
          {form.id ? "Edit partner" : "Create partner"}
        </h2>

        <Input
          label="Partner name"
          required
          value={form.partner_name}
          onChange={(event) => setForm((prev) => ({ ...prev, partner_name: event.target.value }))}
        />
        <Input
          label="Slug"
          value={form.slug}
          hint="Leave blank to generate from the name."
          onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
        />
        <Select
          label="Partner type"
          value={form.partner_type}
          onChange={(event) => setForm((prev) => ({ ...prev, partner_type: event.target.value }))}
          options={PARTNER_TYPES.map((item) => ({ value: item.value, label: item.label }))}
        />
        <Input
          label="Headline"
          value={form.headline}
          onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
        />
        <Textarea
          label="Introduction"
          rows={4}
          value={form.introduction}
          onChange={(event) => setForm((prev) => ({ ...prev, introduction: event.target.value }))}
        />
        <Textarea
          label="Seeking"
          rows={4}
          value={form.seeking}
          onChange={(event) => setForm((prev) => ({ ...prev, seeking: event.target.value }))}
        />
        <Input
          label="Submission CTA label"
          value={form.submission_cta_label}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, submission_cta_label: event.target.value }))
          }
        />
        <Input
          label="Checklist / resource slug"
          value={form.resource_download_slug}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, resource_download_slug: event.target.value }))
          }
        />
        <Input
          label="Contact email"
          type="email"
          value={form.contact_email}
          onChange={(event) => setForm((prev) => ({ ...prev, contact_email: event.target.value }))}
        />
        <Textarea
          label="Contact note"
          rows={2}
          value={form.contact_note}
          onChange={(event) => setForm((prev) => ({ ...prev, contact_note: event.target.value }))}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Tracking source"
            value={form.tracking_source}
            onChange={(event) => setForm((prev) => ({ ...prev, tracking_source: event.target.value }))}
          />
          <Input
            label="Tracking medium"
            value={form.tracking_medium}
            onChange={(event) => setForm((prev) => ({ ...prev, tracking_medium: event.target.value }))}
          />
          <Input
            label="Tracking campaign"
            value={form.tracking_campaign}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tracking_campaign: event.target.value }))
            }
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-slate">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(event) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))}
            className="h-4 w-4 border-line-strong bg-ink"
          />
          Published
        </label>

        {feedback ? (
          <p className={feedback.type === "success" ? "text-sm text-warm-metal" : "text-sm text-danger"}>
            {feedback.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : form.id ? "Update partner" : "Create partner"}
        </Button>
      </form>
    </div>
  );
}
