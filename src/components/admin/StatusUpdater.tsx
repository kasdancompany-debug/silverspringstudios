"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { SUBMISSION_STATUSES, SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/constants";
import { updateStatus } from "@/lib/actions/admin";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export interface StatusHistoryItem {
  id: string;
  from_status: SubmissionStatus | null;
  to_status: SubmissionStatus;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
}

export function StatusUpdater({
  submissionId,
  currentStatus,
  history,
}: {
  submissionId: string;
  currentStatus: SubmissionStatus;
  history: StatusHistoryItem[];
}) {
  const [status, setStatus] = useState<SubmissionStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await updateStatus({
        submissionId,
        status,
        note: note.trim() || undefined,
        declineReason: status === "declined" ? declineReason : undefined,
      });

      if (result.success) {
        setFeedback({ type: "success", message: "Status updated." });
        setNote("");
      } else {
        setFeedback({ type: "error", message: result.message ?? "Unable to update status." });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg text-ivory">Status</h3>
        <StatusBadge status={currentStatus} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Change status to"
          value={status}
          onChange={(event) => setStatus(event.target.value as SubmissionStatus)}
          options={SUBMISSION_STATUSES.map((value) => ({ value, label: SUBMISSION_STATUS_LABELS[value] }))}
        />

        {status === "declined" ? (
          <Textarea
            label="Decline reason"
            required
            rows={3}
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
            hint="Required — this is stored on the submission record."
          />
        ) : null}

        <Textarea
          label="Note (optional)"
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          hint="Logged alongside this status change in the history below."
        />

        {feedback ? (
          <p className={feedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"} role="status">
            {feedback.message}
          </p>
        ) : null}

        <Button
          type="submit"
          size="sm"
          disabled={isPending || (status === "declined" && !declineReason.trim())}
        >
          {isPending ? "Updating…" : "Update Status"}
        </Button>
      </form>

      <div className="space-y-3 border-t border-line pt-5">
        <p className="text-xs tracking-[0.1em] text-slate uppercase">History</p>
        {history.length === 0 ? (
          <p className="text-sm text-slate">No status changes recorded yet.</p>
        ) : (
          <ol className="max-h-80 space-y-4 overflow-y-auto pr-1">
            {history.map((entry) => (
              <li key={entry.id} className="border-l border-line-strong pl-4">
                <p className="text-sm text-ivory">
                  {entry.from_status ? `${SUBMISSION_STATUS_LABELS[entry.from_status]} → ` : ""}
                  {SUBMISSION_STATUS_LABELS[entry.to_status]}
                </p>
                <p className="mt-1 text-xs text-slate">
                  {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                  {entry.changed_by_name ? ` · ${entry.changed_by_name}` : ""}
                </p>
                {entry.note ? <p className="mt-1 text-xs whitespace-pre-wrap text-slate">{entry.note}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
