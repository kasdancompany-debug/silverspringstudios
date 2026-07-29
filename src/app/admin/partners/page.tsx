import type { Metadata } from "next";
import Link from "next/link";
import { listAllPartners } from "@/lib/partners/data";
import { PartnerEditor } from "@/components/admin/PartnerEditor";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";

export const metadata: Metadata = { title: "Partners" };
export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const { data: partners, configured, demo, error } = await listAllPartners();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Acquisition Engine</p>
        <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">Partners</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Landing pages for festivals, schools, producer orgs and genre communities. Public pages live
          at{" "}
          <Link href="/partners/midnight-circuit" className="text-silver underline underline-offset-4">
            /partners/[slug]
          </Link>
          .
        </p>
      </div>

      {!configured && !demo ? (
        <ConfigNotice />
      ) : error ? (
        <EmptyState tone="warning" title="Partners unavailable" description={error} />
      ) : (
        <>
          {demo ? (
            <p className="border border-line-strong bg-surface px-4 py-3 text-xs text-warm-metal">
              Demo mode — changes log to the server console and are not persisted to Supabase.
            </p>
          ) : null}
          <PartnerEditor partners={partners} />
        </>
      )}
    </div>
  );
}
