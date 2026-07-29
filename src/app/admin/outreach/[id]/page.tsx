import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOutreachLeadDetail } from "@/lib/admin/outreach-data";
import { OutreachLeadDetailClient } from "@/components/admin/OutreachLeadDetail";
import { EmptyState } from "@/components/admin/EmptyState";

export const metadata: Metadata = { title: "Outreach Lead" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOutreachDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await getOutreachLeadDetail(id);

  if (error && !data) {
    return <EmptyState tone="warning" title="Lead unavailable" description={error} />;
  }

  if (!data) {
    notFound();
  }

  return <OutreachLeadDetailClient detail={data} />;
}
