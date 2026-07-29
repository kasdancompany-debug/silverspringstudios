import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { getFunnelReports, type CountBucket } from "@/lib/admin/data";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";
import { DetailSection } from "@/components/admin/DetailSection";
import { MetricCard } from "@/components/admin/MetricCard";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };
export const dynamic = "force-dynamic";

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function BarList({
  items,
  emptyLabel = "No data yet.",
}: {
  items: CountBucket[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-ivory">{item.label}</span>
            <span className="shrink-0 text-slate">{item.count}</span>
          </div>
          <div className="h-1.5 w-full bg-ink">
            <div
              className="h-1.5 bg-warm-metal"
              style={{ width: `${Math.max(4, Math.round((item.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ReportCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <DetailSection title={title}>
      <div className="pt-1">{children}</div>
    </DetailSection>
  );
}

export default async function AdminReportsPage() {
  const { data: reports, configured, error } = await getFunnelReports();

  if (!configured) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <ConfigNotice />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <EmptyState tone="warning" title="Reports are unavailable" description={error} />
      </div>
    );
  }

  if (reports.totalSubmissions === 0) {
    return (
      <div className="space-y-8">
        <PageHeader />
        <EmptyState
          title="No submissions to report on yet"
          description="Funnel, conversion and exposure reports will populate here once submissions start coming in."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader />

      {reports.isDemoData ? (
        <div className="flex items-start gap-3 border border-warm-metal/40 bg-warm-metal/10 px-4 py-3">
          <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warm-metal" />
          <p className="text-sm leading-relaxed text-warm-metal">
            Some or all of the underlying submissions are marked as demo data — treat these figures as a
            sample of the reporting surface, not real acquisitions activity.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Total Submissions"
          value={reports.totalSubmissions}
          hint="Excludes unfinished drafts."
        />
        <MetricCard
          label="Acceptance Rate"
          value={formatPercent(reports.acceptanceRate)}
          hint={`Signed vs. declined, of ${reports.decisionedCount} decided submission${reports.decisionedCount === 1 ? "" : "s"}.`}
        />
        <MetricCard label="Avg. Review Time" value={reports.avgReviewTimeLabel} hint="Submission to first status change." />
        <MetricCard
          label="Meeting Conversion"
          value={formatPercent(reports.meetingConversionRate)}
          hint="Share of submissions that reached a meeting request or later."
        />
        <MetricCard
          label="Agreement Conversion"
          value={formatPercent(reports.agreementConversionRate)}
          hint="Share of submissions that reached an agreement or later."
        />
        <MetricCard
          label="Projected Investment Exposure"
          value={formatCurrency(reports.projectedInvestmentExposure)}
          hint="Sum of proposed release-investment caps across the active pipeline."
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ReportCard title="Submissions by Month">
          <BarList items={reports.submissionsByMonth} />
        </ReportCard>
        <ReportCard title="Submissions by Source">
          <BarList items={reports.submissionsBySource} emptyLabel="No source data on file." />
        </ReportCard>
        <ReportCard title="Submissions by Genre">
          <BarList items={reports.submissionsByGenre} />
        </ReportCard>
        <ReportCard title="Submissions by Country">
          <BarList items={reports.submissionsByCountry} />
        </ReportCard>
        <ReportCard title="Decline Reasons">
          <BarList items={reports.declineReasons} emptyLabel="No declines recorded yet." />
        </ReportCard>
        <ReportCard title="Acquisitions by Reviewer">
          <BarList items={reports.acquisitionsByReviewer} emptyLabel="No signed titles yet." />
        </ReportCard>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Analytics</p>
      <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">Acquisitions Reports</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate">
        Funnel, conversion and exposure figures across every non-draft submission. Internal use only.
      </p>
    </div>
  );
}
