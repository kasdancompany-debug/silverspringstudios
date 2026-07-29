import { FileText, Image as ImageIcon, Paperclip, ExternalLink } from "lucide-react";

export interface SubmissionFileItem {
  id: string;
  file_type: "poster" | "epk" | "still" | "other";
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  signedUrl: string | null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconFor(fileType: SubmissionFileItem["file_type"]) {
  if (fileType === "poster" || fileType === "still") return ImageIcon;
  if (fileType === "epk") return FileText;
  return Paperclip;
}

const FILE_TYPE_LABELS: Record<SubmissionFileItem["file_type"], string> = {
  poster: "Poster",
  epk: "EPK",
  still: "Still",
  other: "Other",
};

export function SubmissionFiles({ files }: { files: SubmissionFileItem[] }) {
  if (files.length === 0) {
    return <p className="text-sm text-slate">No files were uploaded with this submission.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {files.map((file) => {
        const Icon = iconFor(file.file_type);
        return (
          <li key={file.id} className="flex items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Icon size={16} strokeWidth={1.75} className="shrink-0 text-slate" />
              <div className="min-w-0">
                <p className="truncate text-sm text-ivory">{file.file_name}</p>
                <p className="text-xs text-slate">
                  {FILE_TYPE_LABELS[file.file_type]} · {formatBytes(file.file_size)}
                </p>
              </div>
            </div>
            {file.signedUrl ? (
              <a
                href={file.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1.5 text-xs tracking-[0.08em] text-warm-metal uppercase no-underline hover:text-ivory"
              >
                View <ExternalLink size={12} strokeWidth={1.75} />
              </a>
            ) : (
              <span className="shrink-0 text-xs text-slate/60" title={file.file_path}>
                Preview unavailable
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
