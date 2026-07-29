"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Mail, Pencil, Send } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { mergeEmailTemplate } from "@/lib/email/merge";
import { sendTemplateEmail } from "@/lib/actions/admin-email";
import type { EmailTemplateSlug } from "@/lib/constants";
import type { EmailTemplate } from "@/types/database";
import type { EmailLogItem } from "@/lib/admin/data";

export const SELECT_TEMPLATE_EVENT = "admin:select-email-template";

export function EmailTemplatePanel({
  submissionId,
  referenceNumber,
  filmTitle,
  filmmakerName,
  filmmakerEmail,
  templates,
  recentLog,
}: {
  submissionId: string;
  referenceNumber: string;
  filmTitle: string;
  filmmakerName: string;
  filmmakerEmail: string | null;
  templates: EmailTemplate[];
  recentLog: EmailLogItem[];
}) {
  const [selectedSlug, setSelectedSlug] = useState<string>(templates[0]?.slug ?? "");
  const [customMessage, setCustomMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    function handleSelectEvent(event: Event) {
      const detail = (event as CustomEvent<{ slug?: string }>).detail;
      if (detail?.slug && templates.some((template) => template.slug === detail.slug)) {
        setSelectedSlug(detail.slug);
        setFeedback(null);
      }
    }
    window.addEventListener(SELECT_TEMPLATE_EVENT, handleSelectEvent);
    return () => window.removeEventListener(SELECT_TEMPLATE_EVENT, handleSelectEvent);
  }, [templates]);

  const selectedTemplate = templates.find((template) => template.slug === selectedSlug) ?? null;

  const mergeFields = useMemo(
    () => ({
      filmmaker_name: filmmakerName,
      film_title: filmTitle,
      reference_number: referenceNumber,
      custom_message: customMessage.trim(),
    }),
    [filmmakerName, filmTitle, referenceNumber, customMessage],
  );

  const previewSubject = selectedTemplate ? mergeEmailTemplate(selectedTemplate.subject, mergeFields) : "";
  const previewHtml = selectedTemplate ? mergeEmailTemplate(selectedTemplate.body_html, mergeFields) : "";

  function handleSend() {
    if (!selectedTemplate || !filmmakerEmail) return;

    const confirmed = window.confirm(
      `Send "${selectedTemplate.name}" to ${filmmakerEmail}? This sends a real email — it cannot be undone.`,
    );
    if (!confirmed) return;

    setFeedback(null);
    startTransition(async () => {
      const result = await sendTemplateEmail({
        submissionId,
        templateSlug: selectedTemplate.slug as EmailTemplateSlug,
        customMessage: customMessage.trim() || undefined,
      });

      setFeedback(
        result.success
          ? { type: "success", message: result.message ?? "Email sent." }
          : { type: "error", message: result.message ?? "Unable to send this email." },
      );
    });
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate">
          No email templates were found. Run the acquisitions-dashboard migration, or{" "}
          <Link href="/admin/templates" className="text-warm-metal hover:text-ivory">
            create templates
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate">
          Ten fixed operational templates. Nothing sends automatically — every email requires this explicit
          click.
        </p>
        <Link
          href="/admin/templates"
          className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] text-warm-metal uppercase no-underline hover:text-ivory"
        >
          <Pencil size={12} strokeWidth={1.75} />
          Edit Templates
        </Link>
      </div>

      <Select
        label="Template"
        value={selectedSlug}
        onChange={(event) => {
          setSelectedSlug(event.target.value);
          setFeedback(null);
        }}
        options={templates.map((template) => ({ value: template.slug, label: template.name }))}
      />

      <Textarea
        label="Custom message"
        rows={4}
        value={customMessage}
        onChange={(event) => setCustomMessage(event.target.value)}
        hint="Fills the {{custom_message}} merge field in the template below."
      />

      {selectedTemplate ? (
        <div className="border border-line-strong bg-ink p-5">
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Preview</p>
          <p className="mt-2 text-sm text-ivory">
            <span className="text-slate">To:</span> {filmmakerEmail ?? "No email on file"}
          </p>
          <p className="mt-1 text-sm text-ivory">
            <span className="text-slate">Subject:</span> {previewSubject}
          </p>
          <div
            className="prose-email mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ivory [&_a]:text-warm-metal [&_p]:mb-3"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      ) : null}

      {feedback ? (
        <p className={feedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"} role="status">
          {feedback.message}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={handleSend}
        disabled={isPending || !selectedTemplate || !filmmakerEmail}
      >
        <Send size={14} strokeWidth={1.75} />
        {isPending ? "Sending…" : "Send Email"}
      </Button>
      {!filmmakerEmail ? <p className="text-xs text-slate">No filmmaker email is on file for this submission.</p> : null}

      <div className="space-y-3 border-t border-line pt-5" id="email-log">
        <p className="text-xs tracking-[0.1em] text-slate uppercase">Recent Emails</p>
        {recentLog.length === 0 ? (
          <p className="text-sm text-slate">No emails logged for this submission yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentLog.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 border border-line-strong bg-ink p-3">
                <Mail size={14} strokeWidth={1.75} className="mt-0.5 shrink-0 text-slate" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-ivory">{entry.subject}</p>
                  <p className="mt-1 text-xs text-slate">
                    To {entry.to_email} · {format(new Date(entry.sent_at), "MMM d, yyyy 'at' h:mm a")}
                    {entry.sent_by_name ? ` · ${entry.sent_by_name}` : ""} · {entry.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
