"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { addNote } from "@/lib/actions/admin";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export interface NoteItem {
  id: string;
  note: string;
  author_name: string | null;
  created_at: string;
}

export function NotesPanel({ submissionId, notes }: { submissionId: string; notes: NoteItem[] }) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!value.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await addNote({ submissionId, note: value, isInternal: true });
      if (result.success) {
        setValue("");
      } else {
        setError(result.message ?? "Unable to add note.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg text-ivory">Internal Notes</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          label="Add a note"
          rows={3}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Visible to admins and reviewers only."
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" size="sm" variant="secondary" disabled={isPending || !value.trim()}>
          {isPending ? "Saving…" : "Add Note"}
        </Button>
      </form>

      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-slate">No internal notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border border-line-strong bg-ink p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-ivory">{note.note}</p>
              <p className="mt-2 text-xs text-slate">
                {note.author_name ?? "Unknown"} · {format(new Date(note.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
