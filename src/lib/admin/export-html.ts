import { format } from "date-fns";
import { SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { computeEconomics } from "@/lib/admin/economics";
import type { SubmissionDetail } from "@/lib/admin/data";

function esc(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

function field(label: string, value: unknown): string {
  return `<div class="field"><p class="field-label">${esc(label)}</p><p class="field-value">${esc(value)}</p></div>`;
}

function section(title: string, body: string): string {
  return `<section class="section"><h2>${esc(title)}</h2>${body}</section>`;
}

/**
 * Builds a self-contained, print-ready HTML document for a single
 * submission — for admins to save as a PDF (via the browser print
 * dialog). Internal use only; never exposes the screener password.
 */
export function buildSubmissionExportHtml(detail: SubmissionDetail): string {
  const { submission, contact, film, rights, materials, expectations, notes } = detail;

  const economicsHtml = submission.economics
    ? (() => {
        const economics = submission.economics!;
        const summary = computeEconomics(economics);
        return section(
          "Release Economics (Internal Planning Estimate)",
          `<p class="disclaimer">Internal planning estimate — not a filmmaker promise.</p>
           <div class="grid">
             ${field("Expected Gross", formatCurrency(economics.expected_gross))}
             ${field("Distributable After Investment", formatCurrency(summary.remainingAfterInvestment))}
             ${field("Filmmaker Share", formatCurrency(summary.filmmakerShare))}
             ${field("Studio Share", formatCurrency(summary.studioShare))}
             ${field("Recoupment Threshold", formatCurrency(summary.recoupmentThreshold))}
             ${field("Estimated Break-even Gross", summary.breakEvenReceipts !== null ? formatCurrency(summary.breakEvenReceipts) : "—")}
           </div>`,
        );
      })()
    : "";

  const notesHtml =
    notes.length > 0
      ? notes
          .map(
            (note) =>
              `<div class="note"><p>${esc(note.note)}</p><p class="note-meta">${esc(note.author_name ?? "Unknown")} · ${fmtDate(note.created_at)}</p></div>`,
          )
          .join("")
      : "<p>No internal notes on file.</p>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(film?.title ?? "Submission")} — ${esc(submission.reference_number)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; margin: 0; padding: 40px; background: #ffffff; }
  h1 { font-size: 24px; margin: 0 0 4px; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin: 0 0 16px; }
  .eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8b7355; margin: 0 0 8px; }
  .status { display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #999; padding: 3px 10px; margin-top: 8px; }
  .section { margin-bottom: 28px; page-break-inside: avoid; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #666; margin: 0; }
  .field-value { font-size: 14px; margin: 2px 0 0; white-space: pre-wrap; }
  .field { margin-bottom: 8px; }
  .disclaimer { font-size: 12px; font-style: italic; color: #8b7355; margin: 0 0 12px; }
  .note { border-left: 2px solid #ccc; padding-left: 12px; margin-bottom: 12px; }
  .note-meta { font-size: 11px; color: #777; margin: 4px 0 0; }
  .print-bar { position: sticky; top: 0; background: #f7f5f2; padding: 10px 0; margin-bottom: 24px; text-align: right; }
  .print-bar button { font-family: inherit; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 16px; border: 1px solid #1a1a1a; background: #1a1a1a; color: #fff; cursor: pointer; }
  .demo-watermark { position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); font-size: 120px; font-weight: bold; letter-spacing: 0.15em; color: rgba(139, 115, 85, 0.16); z-index: -1; pointer-events: none; white-space: nowrap; }
  .demo-banner { border: 1px solid #8b7355; background: #f7f0e6; color: #6b4f2f; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; margin-bottom: 20px; display: inline-block; }
  @media print { .print-bar { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <div class="print-bar"><button onclick="window.print()">Print / Save as PDF</button></div>
  ${submission.is_demo ? '<div class="demo-watermark">DEMO</div><p class="demo-banner">Demo record — sample data only, not a real acquisition</p>' : ""}

  <p class="eyebrow">Silver Spring Studios — Internal Acquisitions Record</p>
  <h1>${esc(film?.title ?? "Untitled Submission")}</h1>
  <p>${esc(submission.reference_number)}${submission.is_demo ? " · DEMO RECORD" : ""}</p>
  <span class="status">${esc(SUBMISSION_STATUS_LABELS[submission.status as SubmissionStatus] ?? submission.status)}</span>

  ${section(
    "Filmmaker",
    `<div class="grid">
      ${field("Full Name", contact?.full_name)}
      ${field("Email", contact?.email)}
      ${field("Phone", contact?.phone)}
      ${field("Company", contact?.company)}
      ${field("Location", [contact?.city, contact?.province_state, contact?.country].filter(Boolean).join(", "))}
      ${field("Role on Film", contact?.role_on_film)}
    </div>`,
  )}

  ${section(
    "Film Overview",
    `<div class="grid">
      ${field("Format", film?.format)}
      ${field("Genre", [film?.genre, film?.secondary_genre].filter(Boolean).join(" / "))}
      ${field("Runtime", film?.runtime_minutes ? `${film.runtime_minutes} min` : null)}
      ${field("Completion Year", film?.completion_year)}
      ${field("Country of Origin", film?.country_of_origin)}
      ${field("Primary Language", film?.primary_language)}
      ${field("Budget Range", film?.budget_range)}
      ${field("Director", film?.director)}
    </div>
    ${field("Logline", film?.logline)}
    ${field("Synopsis", film?.synopsis)}`,
  )}

  ${section(
    "Rights",
    `<div class="grid">
      ${field("Controls Rights", rights?.controls_rights === null || rights?.controls_rights === undefined ? null : rights.controls_rights ? "Yes" : "No")}
      ${field("Rights Available Date", fmtDate(rights?.rights_available_date ?? null))}
      ${field("Available Territories", rights?.available_territories)}
      ${field("Previous Distributor", rights?.previous_distributor)}
      ${field("Platform Availability", rights?.platform_availability)}
      ${field("Chain of Title Status", rights?.chain_of_title_status)}
    </div>`,
  )}

  ${section(
    "Materials",
    `<div class="grid">
      ${field("Screener URL", materials?.screener_url)}
      ${field("Screener Password", materials?.screener_password ? "On file" : "Not provided")}
      ${field("Trailer URL", materials?.trailer_url)}
      ${field("Master Resolution", materials?.master_resolution)}
      ${field("Audio Configuration", materials?.audio_configuration)}
    </div>`,
  )}

  ${section(
    "Distribution Expectations",
    `<div class="grid">
      ${field("Primary Release Goal", expectations?.primary_release_goal)}
      ${field("Most Important Territory", expectations?.most_important_territory)}
      ${field("Desired Release Timing", expectations?.desired_release_timing)}
      ${field("Revenue Expectations", expectations?.revenue_expectations)}
    </div>`,
  )}

  ${section(
    "Internal Evaluation",
    `<p class="disclaimer">Score informs judgment — it is never an automatic acquisition decision.</p>
     <div class="grid">
       ${field("Score", submission.internal_score !== null ? `${submission.internal_score}/100` : null)}
       ${field("Commercial Outlook", submission.commercial_outlook)}
       ${field("Strategic Fit", submission.strategic_fit)}
       ${field("Rights Readiness", submission.rights_readiness_level)}
       ${field("Technical Readiness", submission.technical_readiness)}
       ${field("Proposed Investment Cap", submission.proposed_investment_cap != null ? formatCurrency(submission.proposed_investment_cap) : null)}
     </div>
     ${field("Recommendation", submission.recommendation)}
     ${field("Key Concerns", submission.key_concerns)}
     ${field("Required Follow-up", submission.required_follow_up)}
     ${field("Acquisition Decision", submission.acquisition_decision)}`,
  )}

  ${economicsHtml}

  ${
    submission.offer_summary_draft
      ? section(
          "Offer Summary Draft",
          `<p class="disclaimer">Internal draft — not an offer or promise made to the filmmaker.</p>
           <div class="field-value">${esc(submission.offer_summary_draft)}</div>`,
        )
      : ""
  }

  ${section("Internal Notes", notesHtml)}

  <p style="margin-top: 32px; font-size: 11px; color: #999;">Generated ${fmtDate(new Date().toISOString())} for internal use only. Not for external distribution.</p>
</body>
</html>`;
}
