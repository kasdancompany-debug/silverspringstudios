"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  OUTREACH_LEAD_STATUSES,
  OUTREACH_LEAD_STATUS_LABELS,
  OUTREACH_MESSAGE_STATUS_LABELS,
  type OutreachLeadStatus,
} from "@/lib/constants";
import {
  addFollowUp,
  addReply,
  approveMessage,
  createMessage,
  markMessageSent,
  requestApproval,
  updateLead,
} from "@/lib/actions/outreach";
import type { OutreachLeadDetail } from "@/lib/admin/outreach-demo";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function OutreachLeadDetailClient({ detail }: { detail: OutreachLeadDetail }) {
  const router = useRouter();
  const { lead, messages, followUps, replies } = detail;
  const [status, setStatus] = useState<OutreachLeadStatus>(lead.status);
  const [note, setNote] = useState(lead.personalized_note ?? "");
  const [whyFit, setWhyFit] = useState(lead.why_it_may_fit ?? "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(lead.personalized_note ?? "");
  const [followUpDue, setFollowUpDue] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitLink = useMemo(() => {
    const params = new URLSearchParams();
    params.set("outreach", lead.id);
    if (lead.partner_slug) params.set("partner", lead.partner_slug);
    params.set("source", "outreach");
    params.set("medium", "crm");
    return `/submit?${params.toString()}`;
  }, [lead.id, lead.partner_slug]);

  function run(action: () => Promise<{ success: boolean; message?: string }>) {
    setFeedback(null);
    startTransition(async () => {
      const result = await action();
      setFeedback(result.message ?? (result.success ? "Done." : "Something went wrong."));
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Outreach Lead</p>
          <h1 className="mt-2 font-display text-3xl text-ivory">{lead.filmmaker_name}</h1>
          <p className="mt-2 text-sm text-slate">
            {lead.film_title ?? "Untitled film"}
            {lead.genre ? ` · ${lead.genre}` : ""}
            {lead.completion_year ? ` · ${lead.completion_year}` : ""}
            {lead.country ? ` · ${lead.country}` : ""}
          </p>
        </div>
        <Link
          href="/admin/outreach"
          className="text-xs tracking-[0.12em] text-slate uppercase no-underline hover:text-ivory"
        >
          ← All leads
        </Link>
      </div>

      {feedback ? <p className="text-sm text-warm-metal">{feedback}</p> : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4 border border-line-strong bg-surface px-5 py-6">
          <h2 className="font-display text-lg text-ivory">Filmmaker & film</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs tracking-[0.12em] text-slate uppercase">Email</dt>
              <dd className="text-ivory">{lead.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-slate uppercase">Website</dt>
              <dd className="text-ivory break-all">{lead.website ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-slate uppercase">Festival</dt>
              <dd className="text-ivory">{lead.festival ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-slate uppercase">Source URL</dt>
              <dd className="text-ivory break-all">{lead.source_url ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.12em] text-slate uppercase">Partner slug</dt>
              <dd className="text-ivory">{lead.partner_slug ?? "—"}</dd>
            </div>
          </dl>

          <Textarea
            label="Why it may fit"
            rows={4}
            value={whyFit}
            onChange={(event) => setWhyFit(event.target.value)}
          />
          <Textarea
            label="Personalized outreach note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <Select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as OutreachLeadStatus)}
            options={OUTREACH_LEAD_STATUSES.map((value) => ({
              value,
              label: OUTREACH_LEAD_STATUS_LABELS[value],
            }))}
          />
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(() =>
                updateLead({
                  id: lead.id,
                  status,
                  why_it_may_fit: whyFit,
                  personalized_note: note,
                }),
              )
            }
          >
            Save lead
          </Button>

          <div className="border-t border-line pt-4 text-sm text-slate">
            <p className="mb-2 text-xs tracking-[0.12em] text-warm-metal uppercase">
              Convert to submitted
            </p>
            <p>
              Share this attributed submit link with the filmmaker. After they submit, set status to
              Submitted and link the submission id manually if needed.
            </p>
            <Link
              href={submitLink}
              className="mt-2 inline-block break-all text-silver underline underline-offset-4"
            >
              {submitLink}
            </Link>
          </div>
        </section>

        <section className="space-y-4 border border-line-strong bg-surface px-5 py-6">
          <h2 className="font-display text-lg text-ivory">Message draft</h2>
          <p className="text-xs text-slate">
            No auto-send. Request approval, approve when ready, then send from your email client and
            mark as sent here.
          </p>
          <Input
            label="Subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
          <Textarea
            label="Body"
            rows={8}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <Button
            type="button"
            disabled={isPending}
            onClick={() =>
              run(() =>
                createMessage({
                  leadId: lead.id,
                  subject,
                  body,
                }),
              )
            }
          >
            Save draft
          </Button>

          <div className="space-y-3 border-t border-line pt-4">
            <h3 className="text-xs tracking-[0.12em] text-slate uppercase">Existing messages</h3>
            {messages.length === 0 ? (
              <p className="text-sm text-slate">No messages yet.</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2 border border-line px-4 py-3">
                  <p className="text-sm text-ivory">{message.subject}</p>
                  <p className="text-xs text-warm-metal">
                    {OUTREACH_MESSAGE_STATUS_LABELS[message.status]}
                  </p>
                  <p className="whitespace-pre-wrap text-xs text-slate">{message.body}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {message.status === "draft" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => run(() => requestApproval(message.id, lead.id))}
                      >
                        Request approval
                      </Button>
                    ) : null}
                    {message.status === "pending_approval" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => run(() => approveMessage(message.id, lead.id))}
                      >
                        Approve & mark ready to send
                      </Button>
                    ) : null}
                    {message.status === "approved" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isPending}
                        onClick={() => run(() => markMessageSent(message.id, lead.id))}
                      >
                        Mark as sent
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4 border border-line-strong bg-surface px-5 py-6">
          <h2 className="font-display text-lg text-ivory">Follow-ups</h2>
          <ul className="space-y-2 text-sm text-slate">
            {followUps.length === 0 ? <li>No follow-ups.</li> : null}
            {followUps.map((item) => (
              <li key={item.id} className="border border-line px-3 py-2">
                <span className="text-ivory">{item.due_at}</span>
                {item.note ? ` — ${item.note}` : ""}
                {item.completed_at ? " (done)" : ""}
              </li>
            ))}
          </ul>
          <Input
            label="Due date"
            type="date"
            value={followUpDue}
            onChange={(event) => setFollowUpDue(event.target.value)}
          />
          <Input
            label="Note"
            value={followUpNote}
            onChange={(event) => setFollowUpNote(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={isPending || !followUpDue}
            onClick={() =>
              run(() =>
                addFollowUp({
                  leadId: lead.id,
                  dueAt: followUpDue,
                  note: followUpNote,
                }),
              )
            }
          >
            Add follow-up
          </Button>
        </section>

        <section className="space-y-4 border border-line-strong bg-surface px-5 py-6">
          <h2 className="font-display text-lg text-ivory">Logged replies</h2>
          <ul className="space-y-2 text-sm text-slate">
            {replies.length === 0 ? <li>No replies logged.</li> : null}
            {replies.map((item) => (
              <li key={item.id} className="border border-line px-3 py-2">
                <p className="text-xs text-warm-metal">{item.received_at}</p>
                <p className="mt-1 whitespace-pre-wrap text-ivory">{item.body}</p>
              </li>
            ))}
          </ul>
          <Textarea
            label="Log a reply"
            rows={3}
            value={replyBody}
            onChange={(event) => setReplyBody(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={isPending || !replyBody.trim()}
            onClick={() =>
              run(() =>
                addReply({
                  leadId: lead.id,
                  body: replyBody,
                }),
              )
            }
          >
            Log reply
          </Button>
        </section>
      </div>
    </div>
  );
}
