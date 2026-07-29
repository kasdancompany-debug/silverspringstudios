import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { getFilmDetail } from "@/lib/admin/data";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";
import { DetailSection } from "@/components/admin/DetailSection";
import { PlatformsTerritories } from "@/components/films/PlatformsTerritories";
import { RevenueStatements } from "@/components/films/RevenueStatements";
import { RecoupmentSummary } from "@/components/films/RecoupmentSummary";
import { ApprovedExpenses } from "@/components/films/ApprovedExpenses";
import { FilmDocuments } from "@/components/films/FilmDocuments";
import { PaymentHistory } from "@/components/films/PaymentHistory";
import { FilmUpdates } from "@/components/films/FilmUpdates";
import { FilmEditForm } from "@/components/films/FilmEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getFilmDetail(id);
  return { title: data?.film?.title ?? "Film" };
}

export default async function FilmDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data, configured, error } = await getFilmDetail(id);

  if (!configured) {
    return (
      <div className="space-y-6">
        <BackLink />
        <ConfigNotice />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <BackLink />
        <EmptyState tone="warning" title="Film is unavailable" description={error} />
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const { film, filmmakerName, releases, revenueStatements, expenses, documents, payments, updates } = data;

  return (
    <div className="space-y-8">
      <BackLink />

      <div className="border-b border-line pb-8">
        <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Film Portal Preview</p>
        <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">{film.title}</h1>
        <p className="mt-2 text-sm text-slate">
          {[film.genre, film.release_year, filmmakerName].filter(Boolean).join(" · ") || "No additional details yet."}
        </p>

        <div className="mt-5 flex items-start gap-3 border border-warm-metal/30 bg-warm-metal/5 px-4 py-3">
          <Lock size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-warm-metal" />
          <p className="text-xs leading-relaxed text-warm-metal">
            This is an internal preview of the data model that will power the future filmmaker portal.
            Filmmakers cannot see this page — it exists here so the team can review and prepare the
            underlying records ahead of that feature shipping.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <DetailSection title="Platforms & Territories">
            <PlatformsTerritories releases={releases} />
          </DetailSection>

          <DetailSection title="Revenue Statements">
            <RevenueStatements statements={revenueStatements} />
          </DetailSection>

          <DetailSection title="Approved Expenses">
            <ApprovedExpenses expenses={expenses} />
          </DetailSection>

          <DetailSection title="Payment History">
            <PaymentHistory payments={payments} />
          </DetailSection>

          <DetailSection title="News & Updates">
            <FilmUpdates updates={updates} />
          </DetailSection>
        </div>

        <div className="space-y-8">
          <DetailSection title="Recoupment Balance">
            <RecoupmentSummary film={film} />
          </DetailSection>

          <DetailSection title="Documents">
            <FilmDocuments documents={documents} />
          </DetailSection>

          <DetailSection title="Edit Film">
            <FilmEditForm film={film} />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/films"
      className="inline-flex items-center gap-2 text-xs tracking-[0.1em] text-slate uppercase no-underline transition-colors hover:text-ivory"
    >
      <ArrowLeft size={14} strokeWidth={1.75} />
      All Films
    </Link>
  );
}
