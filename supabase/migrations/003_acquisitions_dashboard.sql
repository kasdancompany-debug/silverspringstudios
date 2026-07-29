-- =============================================================================
-- Silver Spring Studios — Acquisitions Dashboard Extensions
-- =============================================================================

-- Outlook / readiness categorical selectors
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commercial_outlook') THEN
    CREATE TYPE public.commercial_outlook AS ENUM (
      'very_limited', 'limited', 'uncertain', 'moderate', 'strong'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'strategic_fit') THEN
    CREATE TYPE public.strategic_fit AS ENUM (
      'poor', 'weak', 'possible', 'good', 'excellent'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rights_readiness_level') THEN
    CREATE TYPE public.rights_readiness_level AS ENUM (
      'not_ready', 'significant_concerns', 'more_information_required', 'mostly_ready', 'ready'
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'technical_readiness') THEN
    CREATE TYPE public.technical_readiness AS ENUM (
      'not_deliverable', 'major_work_required', 'moderate_work_required', 'minor_work_required', 'ready'
    );
  END IF;
END $$;

-- Extend submissions for triage workflow
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_date date,
  ADD COLUMN IF NOT EXISTS meeting_date timestamptz,
  ADD COLUMN IF NOT EXISTS last_contact_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_action text,
  ADD COLUMN IF NOT EXISTS internal_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS commercial_outlook public.commercial_outlook,
  ADD COLUMN IF NOT EXISTS strategic_fit public.strategic_fit,
  ADD COLUMN IF NOT EXISTS rights_readiness_level public.rights_readiness_level,
  ADD COLUMN IF NOT EXISTS technical_readiness public.technical_readiness,
  ADD COLUMN IF NOT EXISTS offer_summary_draft text,
  ADD COLUMN IF NOT EXISTS economics jsonb;

CREATE INDEX IF NOT EXISTS submissions_is_demo_idx ON public.submissions (is_demo);
CREATE INDEX IF NOT EXISTS submissions_follow_up_date_idx ON public.submissions (follow_up_date);
CREATE INDEX IF NOT EXISTS submissions_meeting_date_idx ON public.submissions (meeting_date);

-- Editable internal email templates (manual send only)
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  subject text NOT NULL,
  body_html text NOT NULL,
  body_text text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS email_templates_set_updated_at ON public.email_templates;
CREATE TRIGGER email_templates_set_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS email_templates_admin_all ON public.email_templates;
CREATE POLICY email_templates_admin_all ON public.email_templates
  FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

-- Outbound email log (manual sends only)
CREATE TABLE IF NOT EXISTS public.submission_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  template_slug text,
  to_email text NOT NULL,
  subject text NOT NULL,
  body_html text,
  body_text text,
  sent_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS submission_email_log_submission_id_idx
  ON public.submission_email_log (submission_id);

ALTER TABLE public.submission_email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS submission_email_log_admin_all ON public.submission_email_log;
CREATE POLICY submission_email_log_admin_all ON public.submission_email_log
  FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

-- Seed the ten operational templates (idempotent)
INSERT INTO public.email_templates (slug, name, subject, body_html, body_text, description)
VALUES
(
  'submission_received',
  'Submission received',
  'We received {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>Thank you for submitting <em>{{film_title}}</em> to Silver Spring Studios. We have received your materials and added them to our review queue.</p><p><strong>Reference:</strong> {{reference_number}}</p><p>Receiving this submission does not create a distribution agreement or obligation on either side.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nThank you for submitting "{{film_title}}" to Silver Spring Studios. We have received your materials and added them to our review queue.\n\nReference: {{reference_number}}\n\nReceiving this submission does not create a distribution agreement or obligation on either side.\n\nWarm regards,\nSilver Spring Studios',
  'Acknowledge receipt after triage begins.'
),
(
  'additional_information_requested',
  'Additional information requested',
  'Additional information needed — {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>Thank you again for submitting <em>{{film_title}}</em>. To continue our evaluation, we need a few additional items:</p><p>{{custom_message}}</p><p>Please reply to this email with the materials or clarifications when you can.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nThank you again for submitting "{{film_title}}". To continue our evaluation, we need a few additional items:\n\n{{custom_message}}\n\nPlease reply to this email with the materials or clarifications when you can.\n\nWarm regards,\nSilver Spring Studios',
  'Request missing materials or clarifications.'
),
(
  'screener_password_problem',
  'Screener-password problem',
  'Screener access issue — {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>We are reviewing <em>{{film_title}}</em>, but we are currently unable to access the private screener with the credentials provided.</p><p>{{custom_message}}</p><p>Could you please confirm the current screener link and password (or send an updated private link)?</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nWe are reviewing "{{film_title}}", but we are currently unable to access the private screener with the credentials provided.\n\n{{custom_message}}\n\nCould you please confirm the current screener link and password (or send an updated private link)?\n\nWarm regards,\nSilver Spring Studios',
  'Resolve screener access issues without exposing the password in the template body.'
),
(
  'meeting_requested',
  'Meeting requested',
  'Conversation request — {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>We have reviewed <em>{{film_title}}</em> and would like to schedule a direct conversation about expectations, strategy and possible next steps.</p><p>{{custom_message}}</p><p>Please reply with a few times that work for you over the coming days.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nWe have reviewed "{{film_title}}" and would like to schedule a direct conversation about expectations, strategy and possible next steps.\n\n{{custom_message}}\n\nPlease reply with a few times that work for you over the coming days.\n\nWarm regards,\nSilver Spring Studios',
  'Invite a discussion without implying acceptance.'
),
(
  'still_under_consideration',
  'Still under consideration',
  'Update on {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>A brief update: <em>{{film_title}}</em> remains under consideration. Our team is still evaluating materials, rights position and potential fit with our slate.</p><p>{{custom_message}}</p><p>We will follow up when we have a clearer next step. Thank you for your patience.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nA brief update: "{{film_title}}" remains under consideration. Our team is still evaluating materials, rights position and potential fit with our slate.\n\n{{custom_message}}\n\nWe will follow up when we have a clearer next step. Thank you for your patience.\n\nWarm regards,\nSilver Spring Studios',
  'Courteous status update while review continues.'
),
(
  'respectful_decline',
  'Respectful decline',
  'Decision on {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>Thank you again for trusting us with <em>{{film_title}}</em>. After careful consideration, we will not be moving forward with distribution at this time.</p><p>{{custom_message}}</p><p>This decision reflects our current slate capacity and priorities, not a judgment on the value of your work. We appreciate the opportunity to consider the film.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nThank you again for trusting us with "{{film_title}}". After careful consideration, we will not be moving forward with distribution at this time.\n\n{{custom_message}}\n\nThis decision reflects our current slate capacity and priorities, not a judgment on the value of your work. We appreciate the opportunity to consider the film.\n\nWarm regards,\nSilver Spring Studios',
  'Clear, respectful decline with no false hope.'
),
(
  'potential_offer_discussion',
  'Potential offer discussion',
  'Next steps for {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>Following our review of <em>{{film_title}}</em>, we would like to discuss a possible distribution relationship and what a release partnership could look like.</p><p>{{custom_message}}</p><p>This conversation is exploratory. No offer is final until a written distribution agreement is reviewed and signed by both sides.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nFollowing our review of "{{film_title}}", we would like to discuss a possible distribution relationship and what a release partnership could look like.\n\n{{custom_message}}\n\nThis conversation is exploratory. No offer is final until a written distribution agreement is reviewed and signed by both sides.\n\nWarm regards,\nSilver Spring Studios',
  'Open an offer conversation carefully — no guarantees.'
),
(
  'agreement_sent',
  'Agreement sent',
  'Distribution agreement for {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>Please find the draft distribution agreement for <em>{{film_title}}</em>. We encourage you to review it carefully, ideally with counsel.</p><p>{{custom_message}}</p><p>No release work begins until the agreement is signed by both parties.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nPlease find the draft distribution agreement for "{{film_title}}". We encourage you to review it carefully, ideally with counsel.\n\n{{custom_message}}\n\nNo release work begins until the agreement is signed by both parties.\n\nWarm regards,\nSilver Spring Studios',
  'Notify that a written agreement has been shared.'
),
(
  'project_accepted',
  'Project accepted',
  'Welcome — {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>We are pleased to confirm that we will move forward with <em>{{film_title}}</em> under the signed distribution agreement.</p><p>{{custom_message}}</p><p>Our next step is onboarding and release planning. We will be in touch shortly with deliverables and timeline details.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nWe are pleased to confirm that we will move forward with "{{film_title}}" under the signed distribution agreement.\n\n{{custom_message}}\n\nOur next step is onboarding and release planning. We will be in touch shortly with deliverables and timeline details.\n\nWarm regards,\nSilver Spring Studios',
  'Confirm acceptance only after signature.'
),
(
  'deliverables_requested',
  'Deliverables requested',
  'Deliverables for {{film_title}} ({{reference_number}})',
  '<p>Dear {{filmmaker_name}},</p><p>To prepare the release for <em>{{film_title}}</em>, please provide the following deliverables:</p><p>{{custom_message}}</p><p>Reply to this email or use the shared folder instructions we send separately. Thank you for your collaboration.</p><p>Warm regards,<br/>Silver Spring Studios</p>',
  'Dear {{filmmaker_name}},\n\nTo prepare the release for "{{film_title}}", please provide the following deliverables:\n\n{{custom_message}}\n\nReply to this email or use the shared folder instructions we send separately. Thank you for your collaboration.\n\nWarm regards,\nSilver Spring Studios',
  'Request post-agreement technical and publicity deliverables.'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  description = EXCLUDED.description,
  updated_at = now();

COMMENT ON COLUMN public.submissions.is_demo IS 'Demo/sample records for internal training — never treat as live acquisitions.';
COMMENT ON COLUMN public.submissions.economics IS 'Internal release-economics planning JSON. Estimates only — never filmmaker promises.';
COMMENT ON TABLE public.email_templates IS 'Editable internal templates. Emails are sent only when an admin explicitly triggers send.';
