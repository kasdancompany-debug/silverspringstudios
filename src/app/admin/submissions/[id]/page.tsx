import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, ExternalLink, FileDown, Mail } from "lucide-react";
import { getSubmissionDetail, getReviewers, getEmailTemplates, getEmailLog } from "@/lib/admin/data";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DetailSection, DetailField, DetailGrid } from "@/components/admin/DetailSection";
import { NotesPanel } from "@/components/admin/NotesPanel";
import { ScorecardForm } from "@/components/admin/ScorecardForm";
import { SubmissionFiles } from "@/components/admin/SubmissionFiles";
import { ScreenerCredentials } from "@/components/admin/ScreenerCredentials";
import { SubmissionSidebar } from "@/components/admin/SubmissionSidebar";
import { ReleaseEconomicsCalculator } from "@/components/admin/ReleaseEconomicsCalculator";
import { OfferSummarySection } from "@/components/admin/OfferSummarySection";
import { EmailTemplatePanel } from "@/components/admin/EmailTemplatePanel";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await getSubmissionDetail(id);
  return { title: data?.film?.title ?? "Submission" };
}

function formatDate(value: string | null, withTime = false): string {
  if (!value) return "—";
  try {
    return format(new Date(value), withTime ? "MMM d, yyyy 'at' h:mm a" : "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function yesNo(value: boolean | null): string {
  if (value === null || value === undefined) return "—";
  return value ? "Yes" : "No";
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [detailResult, reviewersResult, templatesResult] = await Promise.all([
    getSubmissionDetail(id),
    getReviewers(),
    getEmailTemplates(),
  ]);
  const { data: detail, configured, error } = detailResult;

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
        <EmptyState tone="warning" title="Submission is unavailable" description={error} />
      </div>
    );
  }

  if (!detail) {
    notFound();
  }

  const { submission, contact, film, rights, materials, expectations, files, notes, statusHistory, reviewerName } =
    detail;

  const emailLogResult = await getEmailLog(submission.id);

  const filmTitle = film?.title ?? "Untitled Submission";
  const filmmakerName = contact?.full_name ?? "Filmmaker";
  const filmmakerEmail = contact?.email ?? null;
  const isDemo = Boolean(submission.is_demo);

  return (
    <div className="space-y-8">
      <BackLink />

      <div className="flex flex-col gap-4 border-b border-line pb-8 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">{submission.reference_number}</p>
            {isDemo ? (
              <span className="border border-warm-metal/50 bg-warm-metal/10 px-2 py-0.5 text-[0.65rem] tracking-[0.1em] text-warm-metal uppercase">
                Demo
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">{filmTitle}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate">
            <StatusBadge status={submission.status} />
            <span>Submitted {formatDate(submission.submitted_at)}</span>
            {reviewerName ? <span>· Reviewer: {reviewerName}</span> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {filmmakerEmail ? (
            <a
              href={`mailto:${filmmakerEmail}?subject=${encodeURIComponent(
                `Re: ${filmTitle} (${submission.reference_number})`,
              )}`}
              className="inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 text-xs tracking-[0.1em] text-ivory uppercase no-underline transition-colors hover:border-silver"
            >
              <Mail size={14} strokeWidth={1.75} />
              Email Filmmaker
            </a>
          ) : null}
          {materials?.screener_url ? (
            <a
              href={materials.screener_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-warm-metal/50 px-4 py-2.5 text-xs tracking-[0.1em] text-warm-metal uppercase no-underline transition-colors hover:border-warm-metal"
            >
              Watch Screener <ExternalLink size={13} strokeWidth={1.75} />
            </a>
          ) : null}
          <a
            href={`/api/admin/export-html?id=${submission.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-line-strong px-4 py-2.5 text-xs tracking-[0.1em] text-ivory uppercase no-underline transition-colors hover:border-silver"
          >
            <FileDown size={13} strokeWidth={1.75} />
            Export HTML
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <DetailSection title="Film Overview">
            <div className="space-y-6">
              <DetailField label="Logline" value={film?.logline} />
              <DetailField label="Synopsis" value={film?.synopsis} />
              <DetailGrid>
                <DetailField label="Format" value={film?.format} />
                <DetailField
                  label="Genre"
                  value={[film?.genre, film?.secondary_genre].filter(Boolean).join(" / ")}
                />
                <DetailField label="Runtime" value={film?.runtime_minutes ? `${film.runtime_minutes} min` : null} />
                <DetailField label="Completion Year" value={film?.completion_year} />
                <DetailField label="Country of Origin" value={film?.country_of_origin} />
                <DetailField label="Primary Language" value={film?.primary_language} />
                <DetailField label="Subtitle Availability" value={film?.subtitle_availability} />
                <DetailField label="Budget Range" value={film?.budget_range} />
                <DetailField label="Director" value={film?.director} />
                <DetailField label="Producers" value={film?.producers} />
              </DetailGrid>
              <DetailField label="Principal Cast / Subjects" value={film?.principal_cast} />
              <DetailField label="Notable Awards" value={film?.notable_awards} />
              <DetailField label="Festival History" value={film?.festival_history} />
              <DetailField label="Press Coverage" value={film?.press_coverage} />
              <DetailField label="Target Audience" value={film?.target_audience} />
              <DetailField label="Comparable Films" value={film?.comparable_films} />
              <DetailField label="Audience Rationale" value={film?.audience_rationale} />
            </div>
          </DetailSection>

          <DetailSection title="Rights">
            <DetailGrid>
              <DetailField label="Controls Rights" value={yesNo(rights?.controls_rights ?? null)} />
              <DetailField label="Rights Available Date" value={formatDate(rights?.rights_available_date ?? null)} />
              <DetailField label="Available Territories" value={rights?.available_territories} />
              <DetailField label="Rights Available" value={rights?.rights_available} />
              <DetailField label="Existing Agreements" value={rights?.existing_agreements} />
              <DetailField label="Previous Distributor" value={rights?.previous_distributor} />
              <DetailField label="Platform Availability" value={rights?.platform_availability} />
              <DetailField label="Current Sales Agent" value={rights?.current_sales_agent} />
              <DetailField label="Music Clearance Status" value={rights?.music_clearance_status} />
              <DetailField label="Chain of Title Status" value={rights?.chain_of_title_status} />
              <DetailField label="Union / Guild Obligations" value={rights?.union_guild_obligations} />
              <DetailField label="Existing Debts / Liens" value={rights?.existing_debts_liens} />
            </DetailGrid>
          </DetailSection>

          <DetailSection title="Materials & Technical">
            <div className="space-y-6">
              <DetailGrid>
                <ScreenerCredentials
                  submissionId={submission.id}
                  screenerUrl={materials?.screener_url ?? null}
                  hasPassword={Boolean(materials?.screener_password)}
                />
                <DetailField
                  label="Trailer"
                  value={
                    materials?.trailer_url ? (
                      <a
                        href={materials.trailer_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-warm-metal hover:text-ivory"
                      >
                        {materials.trailer_url}
                      </a>
                    ) : null
                  }
                />
                <DetailField label="Caption Availability" value={materials?.caption_availability} />
                <DetailField label="Master Resolution" value={materials?.master_resolution} />
                <DetailField label="Audio Configuration" value={materials?.audio_configuration} />
                <DetailField label="ProRes Available" value={yesNo(materials?.prores_available ?? null)} />
                <DetailField
                  label="Closed Captions Available"
                  value={yesNo(materials?.closed_caption_available ?? null)}
                />
                <DetailField
                  label="Dialogue List Available"
                  value={yesNo(materials?.dialogue_list_available ?? null)}
                />
                <DetailField
                  label="Music Cue Sheet Available"
                  value={yesNo(materials?.music_cue_sheet_available ?? null)}
                />
                <DetailField label="E&O Insurance Status" value={materials?.eo_insurance_status} />
              </DetailGrid>

              <div className="border-t border-line pt-5">
                <p className="mb-3 text-xs tracking-[0.08em] text-slate uppercase">Uploaded Files</p>
                <SubmissionFiles files={files} />
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Distribution Expectations">
            <DetailGrid>
              <DetailField label="Primary Release Goal" value={expectations?.primary_release_goal} />
              <DetailField label="Most Important Territory" value={expectations?.most_important_territory} />
              <DetailField label="Existing Audience Size" value={expectations?.existing_audience_size} />
              <DetailField label="Mailing List Size" value={expectations?.mailing_list_size} />
              <DetailField label="Social Following" value={expectations?.social_following} />
              <DetailField label="Marketing Participation" value={expectations?.marketing_participation} />
              <DetailField label="Desired Release Timing" value={expectations?.desired_release_timing} />
              <DetailField label="Revenue Expectations" value={expectations?.revenue_expectations} />
            </DetailGrid>
            <div className="mt-6 space-y-6">
              <DetailField label="Partnership Success Criteria" value={expectations?.partnership_success} />
              <DetailField label="Additional Context" value={expectations?.additional_context} />
            </div>
          </DetailSection>

          <DetailSection title="Evaluation">
            <ScorecardForm
              submissionId={submission.id}
              initialScorecard={submission.scorecard}
              initialRecommendation={submission.recommendation}
              initialRevenueLow={submission.estimated_revenue_low}
              initialRevenueBase={submission.estimated_revenue_base}
              initialRevenueHigh={submission.estimated_revenue_high}
              initialInvestmentCap={submission.proposed_investment_cap}
              initialKeyConcerns={submission.key_concerns}
              initialFollowUp={submission.required_follow_up}
              initialDecision={submission.acquisition_decision}
              initialCommercialOutlook={submission.commercial_outlook}
              initialStrategicFit={submission.strategic_fit}
              initialRightsReadiness={submission.rights_readiness_level}
              initialTechnicalReadiness={submission.technical_readiness}
            />
          </DetailSection>

          <DetailSection title="Release Economics">
            <ReleaseEconomicsCalculator
              submissionId={submission.id}
              initialEconomics={submission.economics ?? null}
            />
          </DetailSection>

          <div id="offer-summary">
            <DetailSection title="Offer Summary Draft">
              <OfferSummarySection
                submissionId={submission.id}
                filmTitle={filmTitle}
                referenceNumber={submission.reference_number}
                initialDraft={submission.offer_summary_draft ?? null}
                recommendation={submission.recommendation}
                revenueLow={submission.estimated_revenue_low}
                revenueBase={submission.estimated_revenue_base}
                revenueHigh={submission.estimated_revenue_high}
                investmentCap={submission.proposed_investment_cap}
                economics={submission.economics ?? null}
              />
            </DetailSection>
          </div>

          <div id="email-templates">
            <DetailSection title="Email Templates">
              <EmailTemplatePanel
                submissionId={submission.id}
                referenceNumber={submission.reference_number}
                filmTitle={filmTitle}
                filmmakerName={filmmakerName}
                filmmakerEmail={filmmakerEmail}
                templates={templatesResult.data}
                recentLog={emailLogResult.data}
              />
            </DetailSection>
          </div>
        </div>

        <div className="space-y-8">
          <SubmissionSidebar
            submissionId={submission.id}
            referenceNumber={submission.reference_number}
            filmTitle={filmTitle}
            isDemo={isDemo}
            currentStatus={submission.status}
            statusHistory={statusHistory}
            currentReviewerId={submission.assigned_reviewer_id}
            reviewers={reviewersResult.data}
            internalScore={submission.internal_score}
            recommendation={submission.recommendation}
            submittedAt={submission.submitted_at}
            lastContactAt={submission.last_contact_at ?? null}
            nextAction={submission.next_action ?? null}
            followUpDate={submission.follow_up_date ?? null}
            meetingDate={submission.meeting_date ?? null}
            rightsAvailableDate={rights?.rights_available_date ?? null}
            internalTags={submission.internal_tags ?? []}
            revenueLow={submission.estimated_revenue_low}
            revenueBase={submission.estimated_revenue_base}
            revenueHigh={submission.estimated_revenue_high}
            investmentCap={submission.proposed_investment_cap}
            economics={submission.economics ?? null}
            files={files.map((file) => ({ id: file.id, file_name: file.file_name, signedUrl: file.signedUrl }))}
          />

          <DetailSection title="Filmmaker">
            <div className="space-y-4">
              <DetailField label="Full Name" value={contact?.full_name} />
              <DetailField label="Email" value={contact?.email} />
              <DetailField label="Phone" value={contact?.phone} />
              <DetailField label="Company" value={contact?.company} />
              <DetailField
                label="Location"
                value={[contact?.city, contact?.province_state, contact?.country].filter(Boolean).join(", ")}
              />
              <DetailField label="Role on Film" value={contact?.role_on_film} />
              <DetailField
                label="Website"
                value={
                  contact?.website ? (
                    <a href={contact.website} target="_blank" rel="noreferrer" className="text-warm-metal hover:text-ivory">
                      {contact.website}
                    </a>
                  ) : null
                }
              />
              <DetailField
                label="IMDb Profile"
                value={
                  contact?.imdb_profile ? (
                    <a
                      href={contact.imdb_profile}
                      target="_blank"
                      rel="noreferrer"
                      className="text-warm-metal hover:text-ivory"
                    >
                      {contact.imdb_profile}
                    </a>
                  ) : null
                }
              />
              <DetailField label="How They Heard About Us" value={contact?.how_heard} />
            </div>
          </DetailSection>

          <DetailSection title="">
            <NotesPanel submissionId={submission.id} notes={notes} />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/submissions"
      className="inline-flex items-center gap-2 text-xs tracking-[0.1em] text-slate uppercase no-underline transition-colors hover:text-ivory"
    >
      <ArrowLeft size={14} strokeWidth={1.75} />
      All Submissions
    </Link>
  );
}
