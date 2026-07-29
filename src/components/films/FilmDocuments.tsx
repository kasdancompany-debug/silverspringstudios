import { FileText } from "lucide-react";
import type { FilmDocument } from "@/types/database";

export function FilmDocuments({ documents }: { documents: FilmDocument[] }) {
  if (documents.length === 0) {
    return <p className="text-sm text-slate">No documents have been attached to this film yet.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {documents.map((document) => (
        <li key={document.id} className="flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText size={16} strokeWidth={1.75} className="shrink-0 text-slate" />
            <div className="min-w-0">
              <p className="truncate text-sm text-ivory">{document.title}</p>
              <p className="text-xs text-slate">{document.document_type}</p>
            </div>
          </div>
          <span
            className={`shrink-0 border px-2 py-0.5 text-[0.6rem] tracking-[0.08em] uppercase ${
              document.visible_to_filmmaker
                ? "border-success/60 text-success"
                : "border-line-strong text-slate"
            }`}
          >
            {document.visible_to_filmmaker ? "Visible to Filmmaker" : "Internal Only"}
          </span>
        </li>
      ))}
    </ul>
  );
}
