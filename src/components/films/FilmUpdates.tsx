import { format } from "date-fns";
import type { FilmUpdateItem } from "@/types/database";

function formatDate(value: string | null): string {
  if (!value) return "Not yet published";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function FilmUpdates({ updates }: { updates: FilmUpdateItem[] }) {
  if (updates.length === 0) {
    return (
      <p className="text-sm text-slate">
        No news or updates have been posted for this film yet. Updates authored here will eventually
        surface in the filmmaker portal.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {updates.map((update) => (
        <li key={update.id} className="border border-line-strong bg-ink p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-base text-ivory">{update.title}</p>
            <span
              className={`border px-2 py-0.5 text-[0.6rem] tracking-[0.08em] uppercase ${
                update.visible_to_filmmaker ? "border-success/60 text-success" : "border-line-strong text-slate"
              }`}
            >
              {update.visible_to_filmmaker ? "Visible to Filmmaker" : "Internal Only"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-slate">{update.body}</p>
          <p className="mt-3 text-xs text-slate/70">
            {update.update_type} · {formatDate(update.published_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
