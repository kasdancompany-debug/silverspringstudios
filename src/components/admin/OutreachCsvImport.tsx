"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  OUTREACH_LEAD_STATUSES,
  OUTREACH_LEAD_STATUS_LABELS,
  type OutreachLeadStatus,
} from "@/lib/constants";
import { importLeadsCsv, type CsvLeadRow } from "@/lib/actions/outreach";
import { Button } from "@/components/ui/Button";

const EXPECTED_HEADERS = [
  "Filmmaker",
  "Film",
  "Email",
  "Website",
  "Festival",
  "Genre",
  "Completion year",
  "Country",
  "Source URL",
  "Why it may fit",
  "Personalized outreach note",
  "Status",
] as const;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      current.push(cell);
      cell = "";
    } else if (char === "\n") {
      current.push(cell);
      rows.push(current);
      current = [];
      cell = "";
    } else if (char === "\r") {
      // ignore
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || current.length > 0) {
    current.push(cell);
    rows.push(current);
  }

  return rows.filter((row) => row.some((value) => value.trim().length > 0));
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase();
}

function mapStatus(raw: string): OutreachLeadStatus | undefined {
  const cleaned = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (!cleaned) return undefined;
  if (OUTREACH_LEAD_STATUSES.includes(cleaned as OutreachLeadStatus)) {
    return cleaned as OutreachLeadStatus;
  }
  const byLabel = OUTREACH_LEAD_STATUSES.find(
    (status) => OUTREACH_LEAD_STATUS_LABELS[status].toLowerCase() === raw.trim().toLowerCase(),
  );
  return byLabel;
}

export function OutreachCsvImport() {
  const router = useRouter();
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const mapped = useMemo(() => {
    if (rawRows.length < 2) return [] as CsvLeadRow[];

    const headers = rawRows[0].map(normalizeHeader);
    const indexOf = (label: string) => headers.indexOf(label.toLowerCase());

    const idxs = {
      filmmaker: indexOf("Filmmaker"),
      film: indexOf("Film"),
      email: indexOf("Email"),
      website: indexOf("Website"),
      festival: indexOf("Festival"),
      genre: indexOf("Genre"),
      year: indexOf("Completion year"),
      country: indexOf("Country"),
      source: indexOf("Source URL"),
      why: indexOf("Why it may fit"),
      note: indexOf("Personalized outreach note"),
      status: indexOf("Status"),
    };

    return rawRows.slice(1).map((row) => {
      const yearRaw = idxs.year >= 0 ? row[idxs.year]?.trim() : "";
      const year = yearRaw && /^\d{4}$/.test(yearRaw) ? Number(yearRaw) : null;
      const statusRaw = idxs.status >= 0 ? row[idxs.status] ?? "" : "";

      return {
        filmmaker_name: idxs.filmmaker >= 0 ? row[idxs.filmmaker] ?? "" : "",
        film_title: idxs.film >= 0 ? row[idxs.film] : undefined,
        email: idxs.email >= 0 ? row[idxs.email] : undefined,
        website: idxs.website >= 0 ? row[idxs.website] : undefined,
        festival: idxs.festival >= 0 ? row[idxs.festival] : undefined,
        genre: idxs.genre >= 0 ? row[idxs.genre] : undefined,
        completion_year: year,
        country: idxs.country >= 0 ? row[idxs.country] : undefined,
        source_url: idxs.source >= 0 ? row[idxs.source] : undefined,
        why_it_may_fit: idxs.why >= 0 ? row[idxs.why] : undefined,
        personalized_note: idxs.note >= 0 ? row[idxs.note] : undefined,
        status: mapStatus(statusRaw),
      } satisfies CsvLeadRow;
    });
  }, [rawRows]);

  function handleFile(file: File | null) {
    setFeedback(null);
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setRawRows(parseCsv(text));
    };
    reader.readAsText(file);
  }

  function handleImport() {
    setFeedback(null);
    startTransition(async () => {
      const result = await importLeadsCsv(mapped);
      setFeedback(result.message ?? (result.success ? "Imported." : "Import failed."));
      if (result.success) {
        router.push("/admin/outreach");
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/admin/outreach"
          className="text-xs tracking-[0.12em] text-slate uppercase no-underline hover:text-ivory"
        >
          ← Outreach
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ivory">CSV import</h1>
        <p className="mt-2 text-sm text-slate">
          Manual import only. Expected columns: {EXPECTED_HEADERS.join(", ")}.
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-start gap-3 border border-dashed border-line-strong bg-surface px-6 py-10">
        <span className="text-xs tracking-[0.14em] text-warm-metal uppercase">Choose CSV file</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="text-sm text-slate"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
        {fileName ? <span className="text-sm text-ivory">{fileName}</span> : null}
      </label>

      {mapped.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate">
            Parsed <span className="text-ivory">{mapped.length}</span> data rows.
          </p>
          <div className="overflow-x-auto border border-line-strong bg-surface">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line-strong text-slate uppercase tracking-[0.08em]">
                  <th className="px-3 py-2 font-normal">Filmmaker</th>
                  <th className="px-3 py-2 font-normal">Film</th>
                  <th className="px-3 py-2 font-normal">Email</th>
                  <th className="px-3 py-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {mapped.slice(0, 20).map((row, index) => (
                  <tr key={`${row.filmmaker_name}-${index}`} className="border-b border-line">
                    <td className="px-3 py-2 text-ivory">{row.filmmaker_name || "—"}</td>
                    <td className="px-3 py-2 text-slate">{row.film_title || "—"}</td>
                    <td className="px-3 py-2 text-slate">{row.email || "—"}</td>
                    <td className="px-3 py-2 text-slate">{row.status || "discovered"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" disabled={isPending} onClick={handleImport}>
            {isPending ? "Importing…" : `Import ${mapped.length} leads`}
          </Button>
        </div>
      ) : null}

      {feedback ? <p className="text-sm text-warm-metal">{feedback}</p> : null}
    </div>
  );
}
