"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/constants";
import { addNote, updateStatus } from "@/lib/actions/admin";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type Category = "decline" | "info" | "meeting";

const CATEGORY_LABELS: Record<Category, string> = {
  decline: "Decline Reason",
  info: "Request Information",
  meeting: "Meeting Request",
};

const CATEGORY_STATUS: Record<Category, SubmissionStatus> = {
  decline: "declined",
  info: "needs_information",
  meeting: "meeting_requested",
};

const TEMPLATES: Record<Category, { id: string; label: string; body: (filmTitle: string) => string }[]> = {
  decline: [
    {
      id: "not_fit",
      label: "Not the right fit",
      body: (film) =>
        `Thank you for submitting "${film}" to Silver Spring Studios. After careful review, we don't feel it is the right fit for our current slate. We wish you the best of luck placing it elsewhere, and we hope you'll think of us for future projects.`,
    },
    {
      id: "too_similar",
      label: "Overlaps with existing slate",
      body: (film) =>
        `Thank you for sharing "${film}" with us. We currently have a similar title in our pipeline, and to avoid audience overlap we won't be moving forward with this one at this time.`,
    },
    {
      id: "commercial_fit",
      label: "Limited commercial fit",
      body: (film) =>
        `We appreciate you thinking of Silver Spring Studios for "${film}". While we admired the craft that went into it, we don't see a clear commercial path for it within our distribution model, so we will pass for now.`,
    },
  ],
  info: [
    {
      id: "materials",
      label: "Missing or outdated materials",
      body: (film) =>
        `We're continuing our review of "${film}" and would like a closer look. Could you send an up-to-date screener link (with password, if applicable) along with any recent press or festival materials?`,
    },
    {
      id: "rights",
      label: "Rights clarification",
      body: (film) =>
        `Before we continue our review of "${film}", we need more clarity on your current rights position — specifically which territories and platforms are available, and whether any existing distribution agreements are in place.`,
    },
  ],
  meeting: [
    {
      id: "intro_call",
      label: "Introductory call",
      body: (film) =>
        `We'd like to schedule a short call to discuss "${film}" and learn more about your plans for the release. Could you share a few times that work for you over the next week?`,
    },
    {
      id: "deal_discussion",
      label: "Deal discussion",
      body: (film) =>
        `We're excited about "${film}" and would like to set up time to walk through a potential offer and next steps. Let us know your availability this week.`,
    },
  ],
};

export function TemplateActions({
  submissionId,
  filmTitle,
  filmmakerEmail,
  referenceNumber,
}: {
  submissionId: string;
  filmTitle: string;
  filmmakerEmail: string | null;
  referenceNumber: string;
}) {
  const [category, setCategory] = useState<Category>("info");
  const [templateId, setTemplateId] = useState(TEMPLATES.info[0].id);
  const [body, setBody] = useState(TEMPLATES.info[0].body(filmTitle));
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const templatesForCategory = TEMPLATES[category];

  function handleCategoryChange(next: Category) {
    setCategory(next);
    const first = TEMPLATES[next][0];
    setTemplateId(first.id);
    setBody(first.body(filmTitle));
    setFeedback(null);
  }

  function handleTemplateChange(id: string) {
    setTemplateId(id);
    const template = templatesForCategory.find((item) => item.id === id);
    if (template) setBody(template.body(filmTitle));
  }

  const subject = `Re: ${filmTitle} (${referenceNumber})`;
  const mailtoHref = filmmakerEmail
    ? `mailto:${filmmakerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : undefined;

  function handleApplyStatus() {
    setFeedback(null);
    startTransition(async () => {
      const status = CATEGORY_STATUS[category];
      const result = await updateStatus({
        submissionId,
        status,
        note: body,
        declineReason: category === "decline" ? body : undefined,
      });
      setFeedback(
        result.success
          ? `Status updated to “${SUBMISSION_STATUS_LABELS[status]}.”`
          : (result.message ?? "Unable to update status."),
      );
    });
  }

  function handleSaveAsNote() {
    setFeedback(null);
    startTransition(async () => {
      const result = await addNote({
        submissionId,
        note: `[${CATEGORY_LABELS[category]} template]\n\n${body}`,
      });
      setFeedback(result.success ? "Saved as an internal note." : (result.message ?? "Unable to save note."));
    });
  }

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg text-ivory">Template Actions</h3>
      <p className="text-sm text-slate">
        Prefill a decline reason, information request or meeting invite, then send it, log it, or use it
        to update the submission&apos;s status in one step.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Category"
          value={category}
          onChange={(event) => handleCategoryChange(event.target.value as Category)}
          options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <Select
          label="Template"
          value={templateId}
          onChange={(event) => handleTemplateChange(event.target.value)}
          options={templatesForCategory.map((template) => ({ value: template.id, label: template.label }))}
        />
      </div>

      <Textarea label="Message" rows={5} value={body} onChange={(event) => setBody(event.target.value)} />

      {feedback ? (
        <p className="text-sm text-slate" role="status">
          {feedback}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {mailtoHref ? (
          <a
            href={mailtoHref}
            className="inline-flex items-center justify-center gap-2 border border-line-strong bg-transparent px-5 py-3 text-xs tracking-[0.14em] text-ivory uppercase no-underline transition-colors hover:border-silver"
          >
            <Mail size={14} strokeWidth={1.75} />
            Email Filmmaker
          </a>
        ) : null}
        <Button type="button" variant="secondary" onClick={handleSaveAsNote} disabled={isPending}>
          Save as Internal Note
        </Button>
        <Button
          type="button"
          variant={category === "decline" ? "danger" : "primary"}
          onClick={handleApplyStatus}
          disabled={isPending}
        >
          {category === "decline"
            ? "Decline with This Reason"
            : `Set Status: ${SUBMISSION_STATUS_LABELS[CATEGORY_STATUS[category]]}`}
        </Button>
      </div>
    </div>
  );
}
