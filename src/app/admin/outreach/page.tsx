import type { Metadata } from "next";
import Link from "next/link";
import { listOutreachLeads } from "@/lib/admin/outreach-data";
import {
  OUTREACH_LEAD_STATUSES,
  OUTREACH_LEAD_STATUS_LABELS,
  type OutreachLeadStatus,
} from "@/lib/constants";
import { EmptyState } from "@/components/admin/EmptyState";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "Outreach" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminOutreachPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusParam = firstParam(params.status) ?? "all";
  const status =
    statusParam === "all" || OUTREACH_LEAD_STATUSES.includes(statusParam as OutreachLeadStatus)
      ? (statusParam as OutreachLeadStatus | "all")
      : "all";

  const { data: leads, demo, error } = await listOutreachLeads(status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Acquisition Engine</p>
          <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">Outreach</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate">
            Manual CRM for discovered filmmakers. Import CSV only — no scraping, no bulk auto-email.
          </p>
        </div>
        <ButtonLink href="/admin/outreach/import" variant="secondary" size="sm">
          CSV import
        </ButtonLink>
      </div>

      {demo ? (
        <p className="border border-line-strong bg-surface px-4 py-3 text-xs text-warm-metal">
          Demo mode — sample leads loaded in memory. Mutations log to the server console.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <FilterChip href="/admin/outreach" active={status === "all"} label="All" />
        {OUTREACH_LEAD_STATUSES.map((value) => (
          <FilterChip
            key={value}
            href={`/admin/outreach?status=${value}`}
            active={status === value}
            label={OUTREACH_LEAD_STATUS_LABELS[value]}
          />
        ))}
      </div>

      {error ? (
        <EmptyState tone="warning" title="Outreach unavailable" description={error} />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads"
          description="Import a CSV or wait for discoveries to appear here."
        />
      ) : (
        <div className="overflow-x-auto border border-line-strong bg-surface">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line-strong text-[0.65rem] tracking-[0.1em] text-slate uppercase">
                <th className="px-4 py-3 font-normal">Filmmaker</th>
                <th className="px-4 py-3 font-normal">Film</th>
                <th className="px-4 py-3 font-normal">Festival</th>
                <th className="px-4 py-3 font-normal">Genre</th>
                <th className="px-4 py-3 font-normal">Country</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line last:border-b-0 hover:bg-ivory/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/outreach/${lead.id}`}
                      className="font-display text-base text-ivory no-underline hover:text-warm-metal"
                    >
                      {lead.filmmaker_name}
                    </Link>
                    {lead.email ? <p className="mt-1 text-xs text-slate">{lead.email}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-slate">{lead.film_title ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{lead.festival ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{lead.genre ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{lead.country ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="border border-line-strong px-2.5 py-1 text-[0.65rem] tracking-[0.08em] text-slate uppercase">
                      {OUTREACH_LEAD_STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate">{lead.next_follow_up_at ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "border border-warm-metal bg-warm-metal/10 px-3 py-1.5 text-[0.65rem] tracking-[0.1em] text-ivory uppercase no-underline"
          : "border border-line-strong px-3 py-1.5 text-[0.65rem] tracking-[0.1em] text-slate uppercase no-underline hover:text-ivory"
      }
    >
      {label}
    </Link>
  );
}
