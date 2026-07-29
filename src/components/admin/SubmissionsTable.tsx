"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search, X } from "lucide-react";
import { GENRES, SUBMISSION_STATUSES, SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/constants";
import type { SubmissionListItem } from "@/types/database";
import type { SubmissionListFilters } from "@/lib/admin/data";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type SortableColumn = NonNullable<SubmissionListFilters["sortBy"]>;

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function formatRuntime(minutes: number | null): string {
  if (!minutes) return "—";
  return `${minutes} min`;
}

export function SubmissionsTable({
  items,
  total,
  countries,
  filters,
}: {
  items: SubmissionListItem[];
  total: number;
  countries: string[];
  filters: SubmissionListFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(filters.search ?? "");

  const pageSize = filters.pageSize ?? 25;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pushWithParams(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  function handleFilterChange(key: string, value: string) {
    pushWithParams({ [key]: value, page: undefined });
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    pushWithParams({ search: searchInput, page: undefined });
  }

  function handleSort(column: SortableColumn) {
    const nextDir = filters.sortBy === column && filters.sortDir === "desc" ? "asc" : "desc";
    pushWithParams({ sortBy: column, sortDir: nextDir, page: undefined });
  }

  function handleClearFilters() {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.genre && filters.genre !== "all") params.set("genre", filters.genre);
    if (filters.country && filters.country !== "all") params.set("country", filters.country);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    const query = params.toString();
    return query ? `/api/admin/export?${query}` : "/api/admin/export";
  }, [filters]);

  const hasActiveFilters = Boolean(
    filters.search ||
      (filters.status && filters.status !== "all") ||
      (filters.genre && filters.genre !== "all") ||
      (filters.country && filters.country !== "all") ||
      filters.dateFrom ||
      filters.dateTo,
  );

  function sortIcon(column: SortableColumn) {
    if (filters.sortBy !== column) return <ArrowUpDown size={12} className="opacity-40" />;
    return filters.sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border border-line-strong bg-surface p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 md:max-w-sm">
            <div className="relative flex-1">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title, filmmaker, reference…"
                className="w-full border border-line-strong bg-ink px-9 py-2.5 text-sm text-ivory placeholder:text-slate/60 outline-none transition-colors focus:border-silver"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </form>

          <a
            href={exportHref}
            className="inline-flex items-center justify-center gap-2 border border-line-strong bg-transparent px-4 py-2.5 text-xs tracking-[0.12em] text-ivory uppercase no-underline transition-colors hover:border-silver"
          >
            <Download size={13} strokeWidth={1.75} />
            Export CSV
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <select
            value={filters.status ?? "all"}
            onChange={(event) => handleFilterChange("status", event.target.value)}
            className="border border-line-strong bg-ink px-3 py-2 text-xs text-ivory uppercase tracking-[0.06em] outline-none focus:border-silver"
          >
            <option value="all">All statuses</option>
            {SUBMISSION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {SUBMISSION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <select
            value={filters.genre ?? "all"}
            onChange={(event) => handleFilterChange("genre", event.target.value)}
            className="border border-line-strong bg-ink px-3 py-2 text-xs text-ivory uppercase tracking-[0.06em] outline-none focus:border-silver"
          >
            <option value="all">All genres</option>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <select
            value={filters.country ?? "all"}
            onChange={(event) => handleFilterChange("country", event.target.value)}
            className="border border-line-strong bg-ink px-3 py-2 text-xs text-ivory uppercase tracking-[0.06em] outline-none focus:border-silver"
          >
            <option value="all">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(event) => handleFilterChange("dateFrom", event.target.value)}
            aria-label="Submitted from"
            className="border border-line-strong bg-ink px-3 py-2 text-xs text-ivory outline-none focus:border-silver [color-scheme:dark]"
          />

          <input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(event) => handleFilterChange("dateTo", event.target.value)}
            aria-label="Submitted to"
            className="border border-line-strong bg-ink px-3 py-2 text-xs text-ivory outline-none focus:border-silver [color-scheme:dark]"
          />
        </div>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex w-fit items-center gap-1.5 text-xs text-slate transition-colors hover:text-ivory"
          >
            <X size={12} />
            Clear filters
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No submissions match these filters" : "No submissions yet"}
          description={
            hasActiveFilters
              ? "Try widening your search or clearing a filter."
              : "Once filmmakers submit through the public site, their films will appear here."
          }
        />
      ) : (
        <div className={cn("overflow-x-auto border border-line-strong bg-surface transition-opacity", isPending && "opacity-60")}>
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line-strong text-[0.65rem] tracking-[0.1em] text-slate uppercase">
                <th className="px-4 py-3 font-normal">
                  <button type="button" onClick={() => handleSort("film_title")} className="flex items-center gap-1.5 hover:text-ivory">
                    Film {sortIcon("film_title")}
                  </button>
                </th>
                <th className="px-4 py-3 font-normal">Filmmaker</th>
                <th className="px-4 py-3 font-normal">Genre</th>
                <th className="px-4 py-3 font-normal">Runtime</th>
                <th className="px-4 py-3 font-normal">Year</th>
                <th className="px-4 py-3 font-normal">Country</th>
                <th className="px-4 py-3 font-normal">Budget Range</th>
                <th className="px-4 py-3 font-normal">Festival History</th>
                <th className="px-4 py-3 font-normal">
                  <button type="button" onClick={() => handleSort("status")} className="flex items-center gap-1.5 hover:text-ivory">
                    Status {sortIcon("status")}
                  </button>
                </th>
                <th className="px-4 py-3 font-normal">
                  <button type="button" onClick={() => handleSort("internal_score")} className="flex items-center gap-1.5 hover:text-ivory">
                    Score {sortIcon("internal_score")}
                  </button>
                </th>
                <th className="px-4 py-3 font-normal">
                  <button type="button" onClick={() => handleSort("submitted_at")} className="flex items-center gap-1.5 hover:text-ivory">
                    Submitted {sortIcon("submitted_at")}
                  </button>
                </th>
                <th className="px-4 py-3 font-normal">Reviewer</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line last:border-b-0 hover:bg-ivory/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/submissions/${item.id}`}
                      className="font-display text-base text-ivory no-underline hover:text-warm-metal"
                    >
                      {item.film_title ?? "Untitled"}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate">{item.reference_number}</p>
                  </td>
                  <td className="px-4 py-3 text-slate">
                    <span className="text-ivory">{item.filmmaker_name ?? "—"}</span>
                    {item.filmmaker_email ? (
                      <p className="mt-0.5 text-xs text-slate">{item.filmmaker_email}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate">{item.genre ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{formatRuntime(item.runtime_minutes)}</td>
                  <td className="px-4 py-3 text-slate">{item.completion_year ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{item.country_of_origin ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{item.budget_range ?? "—"}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate" title={item.festival_history ?? undefined}>
                    {item.festival_history ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as SubmissionStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate">
                    {item.internal_score !== null ? `${item.internal_score}/100` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate">{formatDate(item.submitted_at)}</td>
                  <td className="px-4 py-3 text-slate">{item.reviewer_name ?? "Unassigned"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate sm:flex-row">
          <p>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => pushWithParams({ page: String(page - 1) })}
            >
              Previous
            </Button>
            <span className="px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => pushWithParams({ page: String(page + 1) })}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
