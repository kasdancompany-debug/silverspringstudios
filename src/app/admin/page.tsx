import type { Metadata } from "next";
import {
  Inbox,
  Clock3,
  MessageCircleQuestion,
  CalendarClock,
  Handshake,
  BadgeCheck,
  XCircle,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { getDashboardMetrics } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { data: metrics, configured, error } = await getDashboardMetrics();

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Overview</p>
          <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">Acquisitions Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm text-slate">
            A snapshot of where every submission stands right now, from first contact through signed
            title.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admin/reports" variant="ghost" size="sm">
            View reports
          </ButtonLink>
          <ButtonLink href="/admin/submissions" variant="secondary" size="sm">
            View all submissions
          </ButtonLink>
        </div>
      </div>

      {!configured ? (
        <ConfigNotice />
      ) : error ? (
        <EmptyState
          tone="warning"
          title="Dashboard data is unavailable"
          description={`We could not load submission metrics: ${error}. The tables may not exist yet, or row-level security may be blocking this query.`}
        />
      ) : (
        <>
          {metrics.hasDemoData ? (
            <div className="flex items-start gap-3 border border-warm-metal/40 bg-warm-metal/10 px-4 py-3">
              <AlertTriangle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warm-metal" />
              <p className="text-sm leading-relaxed text-warm-metal">
                Some of the submissions behind these metrics are marked as demo data — treat these numbers
                as a sample of the dashboard, not real acquisitions activity.
              </p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="New Submissions"
              value={metrics.newSubmissions}
              hint="Submitted, awaiting first triage."
              icon={<Inbox size={16} strokeWidth={1.75} />}
            />
            <MetricCard
              label="Awaiting Screener Review"
              value={metrics.awaitingScreenerReview}
              hint="Materials in queue for a full watch."
              icon={<Clock3 size={16} strokeWidth={1.75} />}
            />
            <MetricCard
              label="Needs Information"
              value={metrics.needsInformation}
              hint="Waiting on the filmmaker to respond."
              icon={<MessageCircleQuestion size={16} strokeWidth={1.75} />}
              tone={metrics.needsInformation > 0 ? "warning" : "default"}
            />
            <MetricCard
              label="Meetings Requested"
              value={metrics.meetingsRequested}
              hint="A call or meeting has been proposed."
              icon={<CalendarClock size={16} strokeWidth={1.75} />}
            />
            <MetricCard
              label="Offers Under Consideration"
              value={metrics.offersUnderConsideration}
              hint="Internally weighing an acquisition offer."
              icon={<Handshake size={16} strokeWidth={1.75} />}
              tone={metrics.offersUnderConsideration > 0 ? "warning" : "default"}
            />
            <MetricCard
              label="Signed Titles"
              value={metrics.signedTitles}
              hint="Agreement executed."
              icon={<BadgeCheck size={16} strokeWidth={1.75} />}
              tone="success"
            />
            <MetricCard
              label="Declined Titles"
              value={metrics.declinedTitles}
              hint="Passed on, with reason on file."
              icon={<XCircle size={16} strokeWidth={1.75} />}
            />
            <MetricCard
              label="Avg. Response Time"
              value={metrics.averageResponseTimeLabel}
              hint={
                metrics.averageResponseTimeSampleSize > 0
                  ? `Based on ${metrics.averageResponseTimeSampleSize} submission${metrics.averageResponseTimeSampleSize === 1 ? "" : "s"}, from submission to first status change.`
                  : "Calculated from submission date to first status change once data is available."
              }
              icon={<Timer size={16} strokeWidth={1.75} />}
            />
          </div>

          {metrics.newSubmissions === 0 &&
          metrics.awaitingScreenerReview === 0 &&
          metrics.needsInformation === 0 &&
          metrics.meetingsRequested === 0 &&
          metrics.offersUnderConsideration === 0 &&
          metrics.signedTitles === 0 &&
          metrics.declinedTitles === 0 ? (
            <EmptyState
              title="No submissions yet"
              description="Once filmmakers begin submitting through the public site, activity will appear here in real time."
            />
          ) : null}
        </>
      )}
    </div>
  );
}
