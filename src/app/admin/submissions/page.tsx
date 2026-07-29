import type { Metadata } from "next";
import { getSubmissionsList, type SubmissionListFilters } from "@/lib/admin/data";
import { SubmissionsTable } from "@/components/admin/SubmissionsTable";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";
import type { SubmissionStatus } from "@/lib/constants";

export const metadata: Metadata = { title: "Submissions" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: SubmissionListFilters = {
    search: firstParam(params.search) ?? "",
    status: (firstParam(params.status) as SubmissionStatus | "all" | undefined) ?? "all",
    genre: firstParam(params.genre) ?? "all",
    country: firstParam(params.country) ?? "all",
    dateFrom: firstParam(params.dateFrom) ?? "",
    dateTo: firstParam(params.dateTo) ?? "",
    sortBy: (firstParam(params.sortBy) as SubmissionListFilters["sortBy"]) ?? "submitted_at",
    sortDir: (firstParam(params.sortDir) as SubmissionListFilters["sortDir"]) ?? "desc",
    page: Number(firstParam(params.page) ?? "1") || 1,
    pageSize: 25,
  };

  const { data, configured, error } = await getSubmissionsList(filters);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Pipeline</p>
        <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">Submissions</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Every film that has come through the door — searchable and filterable by status, genre,
          country and date.
        </p>
      </div>

      {!configured ? (
        <ConfigNotice />
      ) : error ? (
        <EmptyState
          tone="warning"
          title="Submissions are unavailable"
          description={`We could not load submissions: ${error}.`}
        />
      ) : (
        <SubmissionsTable
          items={data.items}
          total={data.total}
          countries={data.countries}
          filters={filters}
        />
      )}
    </div>
  );
}
