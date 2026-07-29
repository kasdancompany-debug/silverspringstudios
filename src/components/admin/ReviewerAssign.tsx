"use client";

import { useState, useTransition } from "react";
import { assignReviewer } from "@/lib/actions/admin";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { ReviewerOption } from "@/lib/admin/data";

export function ReviewerAssign({
  submissionId,
  currentReviewerId,
  reviewers,
}: {
  submissionId: string;
  currentReviewerId: string | null;
  reviewers: ReviewerOption[];
}) {
  const [reviewerId, setReviewerId] = useState(currentReviewerId ?? "");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await assignReviewer(submissionId, reviewerId || null);
      setFeedback(result.success ? "Reviewer updated." : (result.message ?? "Unable to assign reviewer."));
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-display text-lg text-ivory">Reviewer</h3>
      {reviewers.length === 0 ? (
        <p className="text-sm text-slate">No admin or reviewer profiles found yet.</p>
      ) : (
        <Select
          label="Assigned reviewer"
          value={reviewerId}
          onChange={(event) => setReviewerId(event.target.value)}
          placeholder="Unassigned"
          options={reviewers.map((reviewer) => ({
            value: reviewer.id,
            label: reviewer.full_name ?? reviewer.email,
          }))}
        />
      )}
      {feedback ? (
        <p className="text-sm text-slate" role="status">
          {feedback}
        </p>
      ) : null}
      <Button type="submit" size="sm" variant="secondary" disabled={isPending || reviewers.length === 0}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
