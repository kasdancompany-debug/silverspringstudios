import type { EmailTemplate } from "@/types/database";

/**
 * Hardcoded fallback copies of the ten operational email templates,
 * mirroring the rows seeded by `supabase/migrations/003_acquisitions_dashboard.sql`.
 *
 * Used when the `email_templates` table is empty or unreachable (e.g. the
 * migration hasn't run yet, or the app is running in demo mode) so admins
 * always have a usable starting point. Once an admin edits a template via
 * `updateEmailTemplate`, the database row takes over automatically.
 */
const FALLBACK_TIMESTAMP = "2026-01-01T00:00:00.000Z";

function template(
  slug: string,
  name: string,
  subject: string,
  bodyHtml: string,
  bodyText: string,
  description: string,
): EmailTemplate {
  return {
    id: `fallback-${slug}`,
    slug,
    name,
    subject,
    body_html: bodyHtml,
    body_text: bodyText,
    description,
    is_active: true,
    updated_by: null,
    created_at: FALLBACK_TIMESTAMP,
    updated_at: FALLBACK_TIMESTAMP,
  };
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  template(
    "submission_received",
    "Submission received",
    "We received {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>Thank you for submitting <em>{{film_title}}</em> to Silver Spring Studios. We have received your materials and added them to our review queue.</p><p><strong>Reference:</strong> {{reference_number}}</p><p>Receiving this submission does not create a distribution agreement or obligation on either side.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nThank you for submitting "{{film_title}}" to Silver Spring Studios. We have received your materials and added them to our review queue.\n\nReference: {{reference_number}}\n\nReceiving this submission does not create a distribution agreement or obligation on either side.\n\nWarm regards,\nSilver Spring Studios',
    "Acknowledge receipt after triage begins.",
  ),
  template(
    "additional_information_requested",
    "Additional information requested",
    "Additional information needed — {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>Thank you again for submitting <em>{{film_title}}</em>. To continue our evaluation, we need a few additional items:</p><p>{{custom_message}}</p><p>Please reply to this email with the materials or clarifications when you can.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nThank you again for submitting "{{film_title}}". To continue our evaluation, we need a few additional items:\n\n{{custom_message}}\n\nPlease reply to this email with the materials or clarifications when you can.\n\nWarm regards,\nSilver Spring Studios',
    "Request missing materials or clarifications.",
  ),
  template(
    "screener_password_problem",
    "Screener-password problem",
    "Screener access issue — {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>We are reviewing <em>{{film_title}}</em>, but we are currently unable to access the private screener with the credentials provided.</p><p>{{custom_message}}</p><p>Could you please confirm the current screener link and password (or send an updated private link)?</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nWe are reviewing "{{film_title}}", but we are currently unable to access the private screener with the credentials provided.\n\n{{custom_message}}\n\nCould you please confirm the current screener link and password (or send an updated private link)?\n\nWarm regards,\nSilver Spring Studios',
    "Resolve screener access issues without exposing the password in the template body.",
  ),
  template(
    "meeting_requested",
    "Meeting requested",
    "Conversation request — {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>We have reviewed <em>{{film_title}}</em> and would like to schedule a direct conversation about expectations, strategy and possible next steps.</p><p>{{custom_message}}</p><p>Please reply with a few times that work for you over the coming days.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nWe have reviewed "{{film_title}}" and would like to schedule a direct conversation about expectations, strategy and possible next steps.\n\n{{custom_message}}\n\nPlease reply with a few times that work for you over the coming days.\n\nWarm regards,\nSilver Spring Studios',
    "Invite a discussion without implying acceptance.",
  ),
  template(
    "still_under_consideration",
    "Still under consideration",
    "Update on {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>A brief update: <em>{{film_title}}</em> remains under consideration. Our team is still evaluating materials, rights position and potential fit with our slate.</p><p>{{custom_message}}</p><p>We will follow up when we have a clearer next step. Thank you for your patience.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nA brief update: "{{film_title}}" remains under consideration. Our team is still evaluating materials, rights position and potential fit with our slate.\n\n{{custom_message}}\n\nWe will follow up when we have a clearer next step. Thank you for your patience.\n\nWarm regards,\nSilver Spring Studios',
    "Courteous status update while review continues.",
  ),
  template(
    "respectful_decline",
    "Respectful decline",
    "Decision on {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>Thank you again for trusting us with <em>{{film_title}}</em>. After careful consideration, we will not be moving forward with distribution at this time.</p><p>{{custom_message}}</p><p>This decision reflects our current slate capacity and priorities, not a judgment on the value of your work. We appreciate the opportunity to consider the film.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nThank you again for trusting us with "{{film_title}}". After careful consideration, we will not be moving forward with distribution at this time.\n\n{{custom_message}}\n\nThis decision reflects our current slate capacity and priorities, not a judgment on the value of your work. We appreciate the opportunity to consider the film.\n\nWarm regards,\nSilver Spring Studios',
    "Clear, respectful decline with no false hope.",
  ),
  template(
    "potential_offer_discussion",
    "Potential offer discussion",
    "Next steps for {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>Following our review of <em>{{film_title}}</em>, we would like to discuss a possible distribution relationship and what a release partnership could look like.</p><p>{{custom_message}}</p><p>This conversation is exploratory. No offer is final until a written distribution agreement is reviewed and signed by both sides.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nFollowing our review of "{{film_title}}", we would like to discuss a possible distribution relationship and what a release partnership could look like.\n\n{{custom_message}}\n\nThis conversation is exploratory. No offer is final until a written distribution agreement is reviewed and signed by both sides.\n\nWarm regards,\nSilver Spring Studios',
    "Open an offer conversation carefully — no guarantees.",
  ),
  template(
    "agreement_sent",
    "Agreement sent",
    "Distribution agreement for {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>Please find the draft distribution agreement for <em>{{film_title}}</em>. We encourage you to review it carefully, ideally with counsel.</p><p>{{custom_message}}</p><p>No release work begins until the agreement is signed by both parties.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nPlease find the draft distribution agreement for "{{film_title}}". We encourage you to review it carefully, ideally with counsel.\n\n{{custom_message}}\n\nNo release work begins until the agreement is signed by both parties.\n\nWarm regards,\nSilver Spring Studios',
    "Notify that a written agreement has been shared.",
  ),
  template(
    "project_accepted",
    "Project accepted",
    "Welcome — {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>We are pleased to confirm that we will move forward with <em>{{film_title}}</em> under the signed distribution agreement.</p><p>{{custom_message}}</p><p>Our next step is onboarding and release planning. We will be in touch shortly with deliverables and timeline details.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nWe are pleased to confirm that we will move forward with "{{film_title}}" under the signed distribution agreement.\n\n{{custom_message}}\n\nOur next step is onboarding and release planning. We will be in touch shortly with deliverables and timeline details.\n\nWarm regards,\nSilver Spring Studios',
    "Confirm acceptance only after signature.",
  ),
  template(
    "deliverables_requested",
    "Deliverables requested",
    "Deliverables for {{film_title}} ({{reference_number}})",
    "<p>Dear {{filmmaker_name}},</p><p>To prepare the release for <em>{{film_title}}</em>, please provide the following deliverables:</p><p>{{custom_message}}</p><p>Reply to this email or use the shared folder instructions we send separately. Thank you for your collaboration.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    'Dear {{filmmaker_name}},\n\nTo prepare the release for "{{film_title}}", please provide the following deliverables:\n\n{{custom_message}}\n\nReply to this email or use the shared folder instructions we send separately. Thank you for your collaboration.\n\nWarm regards,\nSilver Spring Studios',
    "Request post-agreement technical and publicity deliverables.",
  ),
];

export function getDefaultEmailTemplate(slug: string): EmailTemplate | null {
  return DEFAULT_EMAIL_TEMPLATES.find((t) => t.slug === slug) ?? null;
}
