"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { updateEmailTemplate } from "@/lib/actions/admin-email";
import { cn } from "@/lib/utils";
import type { EmailTemplate } from "@/types/database";

function TemplateRow({ template }: { template: EmailTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [bodyHtml, setBodyHtml] = useState(template.body_html);
  const [bodyText, setBodyText] = useState(template.body_text);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSave() {
    setFeedback(null);
    startTransition(async () => {
      const result = await updateEmailTemplate({
        slug: template.slug as Parameters<typeof updateEmailTemplate>[0]["slug"],
        subject: subject.trim(),
        body_html: bodyHtml.trim(),
        body_text: bodyText.trim(),
      });
      setFeedback(
        result.success
          ? { type: "success", message: result.message ?? "Saved." }
          : { type: "error", message: result.message ?? "Unable to save this template." },
      );
    });
  }

  return (
    <div className="border border-line-strong bg-surface">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="min-w-0">
          <p className="font-display text-lg text-ivory">{template.name}</p>
          {template.description ? <p className="mt-1 truncate text-sm text-slate">{template.description}</p> : null}
        </div>
        <span className={cn("shrink-0 text-slate transition-transform", expanded && "text-ivory")}>
          {expanded ? <ChevronUp size={18} strokeWidth={1.75} /> : <ChevronDown size={18} strokeWidth={1.75} />}
        </span>
      </button>

      {expanded ? (
        <div className="space-y-5 border-t border-line px-6 py-6">
          <p className="text-xs leading-relaxed text-slate">
            Merge fields: <code className="text-warm-metal">{"{{filmmaker_name}}"}</code>{" "}
            <code className="text-warm-metal">{"{{film_title}}"}</code>{" "}
            <code className="text-warm-metal">{"{{reference_number}}"}</code>{" "}
            <code className="text-warm-metal">{"{{custom_message}}"}</code>
          </p>

          <Input label="Subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
          <Textarea
            label="HTML Body"
            rows={8}
            value={bodyHtml}
            onChange={(event) => setBodyHtml(event.target.value)}
            className="font-mono text-xs"
          />
          <Textarea
            label="Plain-text Body"
            rows={6}
            value={bodyText}
            onChange={(event) => setBodyText(event.target.value)}
            className="font-mono text-xs"
          />

          {feedback ? (
            <p className={feedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"} role="status">
              {feedback.message}
            </p>
          ) : null}

          <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save Template"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function EmailTemplateEditor({ templates }: { templates: EmailTemplate[] }) {
  if (templates.length === 0) {
    return <p className="text-sm text-slate">No email templates were found.</p>;
  }

  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <TemplateRow key={template.id} template={template} />
      ))}
    </div>
  );
}
