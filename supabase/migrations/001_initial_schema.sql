-- =============================================================================
-- Silver Spring Studios — Initial Schema Migration
-- Independent film distribution company platform
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role') THEN
    CREATE TYPE public.profile_role AS ENUM ('admin', 'reviewer', 'filmmaker');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE public.submission_status AS ENUM (
      'draft',
      'submitted',
      'initial_review',
      'screener_review',
      'needs_information',
      'meeting_requested',
      'declined',
      'offer_considered',
      'agreement_sent',
      'signed',
      'onboarding',
      'released',
      'archived'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_file_type') THEN
    CREATE TYPE public.submission_file_type AS ENUM ('poster', 'epk', 'still', 'other');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contact_message_status') THEN
    CREATE TYPE public.contact_message_status AS ENUM ('new', 'read', 'replied', 'archived');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'film_payment_status') THEN
    CREATE TYPE public.film_payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
  END IF;
END
$$;

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'::public.profile_role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_reviewer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin'::public.profile_role, 'reviewer'::public.profile_role)
  );
$$;

-- =============================================================================
-- PROFILES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role public.profile_role NOT NULL DEFAULT 'filmmaker'::public.profile_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_email_not_empty CHECK (char_length(trim(email)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text NOT NULL,
  status public.submission_status NOT NULL DEFAULT 'draft'::public.submission_status,
  draft_token text,
  current_step integer NOT NULL DEFAULT 1,
  assigned_reviewer_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  internal_score numeric(5, 2),
  recommendation text,
  estimated_revenue_low numeric(14, 2),
  estimated_revenue_base numeric(14, 2),
  estimated_revenue_high numeric(14, 2),
  proposed_investment_cap numeric(14, 2),
  key_concerns text,
  required_follow_up text,
  acquisition_decision text,
  decline_reason text,
  scorecard jsonb,
  consent_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  honeypot text,
  ip_hash text,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submissions_reference_number_unique UNIQUE (reference_number),
  CONSTRAINT submissions_draft_token_unique UNIQUE (draft_token),
  CONSTRAINT submissions_current_step_positive CHECK (current_step >= 1),
  CONSTRAINT submissions_internal_score_range CHECK (
    internal_score IS NULL OR (internal_score >= 0 AND internal_score <= 100)
  )
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions (submitted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_submissions_reference_number ON public.submissions (reference_number);
CREATE INDEX IF NOT EXISTS idx_submissions_draft_token ON public.submissions (draft_token) WHERE draft_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_assigned_reviewer_id ON public.submissions (assigned_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions (created_at DESC);

DROP TRIGGER IF EXISTS trg_submissions_updated_at ON public.submissions;
CREATE TRIGGER trg_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSION CONTACTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  city text,
  province_state text,
  country text,
  role_on_film text,
  website text,
  imdb_profile text,
  how_heard text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_contacts_submission_id_unique UNIQUE (submission_id),
  CONSTRAINT submission_contacts_full_name_not_empty CHECK (char_length(trim(full_name)) > 0),
  CONSTRAINT submission_contacts_email_not_empty CHECK (char_length(trim(email)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_submission_contacts_submission_id ON public.submission_contacts (submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_contacts_email ON public.submission_contacts (email);

DROP TRIGGER IF EXISTS trg_submission_contacts_updated_at ON public.submission_contacts;
CREATE TRIGGER trg_submission_contacts_updated_at
  BEFORE UPDATE ON public.submission_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSION FILMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_films (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  title text NOT NULL,
  alternative_title text,
  format text,
  genre text,
  secondary_genre text,
  runtime_minutes integer,
  completion_year integer,
  country_of_origin text,
  primary_language text,
  subtitle_availability text,
  logline text,
  synopsis text,
  director text,
  producers text,
  principal_cast text,
  budget_range text,
  notable_awards text,
  festival_history text,
  press_coverage text,
  target_audience text,
  comparable_films text,
  audience_rationale text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_films_submission_id_unique UNIQUE (submission_id),
  CONSTRAINT submission_films_title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT submission_films_runtime_positive CHECK (
    runtime_minutes IS NULL OR runtime_minutes > 0
  ),
  CONSTRAINT submission_films_completion_year_range CHECK (
    completion_year IS NULL OR (completion_year >= 1900 AND completion_year <= 2100)
  )
);

CREATE INDEX IF NOT EXISTS idx_submission_films_submission_id ON public.submission_films (submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_films_genre ON public.submission_films (genre);
CREATE INDEX IF NOT EXISTS idx_submission_films_secondary_genre ON public.submission_films (secondary_genre);
CREATE INDEX IF NOT EXISTS idx_submission_films_title ON public.submission_films (title);

DROP TRIGGER IF EXISTS trg_submission_films_updated_at ON public.submission_films;
CREATE TRIGGER trg_submission_films_updated_at
  BEFORE UPDATE ON public.submission_films
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSION RIGHTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_rights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  controls_rights boolean,
  available_territories text,
  rights_available text,
  existing_agreements text,
  previous_distributor text,
  platform_availability text,
  current_sales_agent text,
  music_clearance_status text,
  chain_of_title_status text,
  union_guild_obligations text,
  existing_debts_liens text,
  rights_available_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_rights_submission_id_unique UNIQUE (submission_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_rights_submission_id ON public.submission_rights (submission_id);

DROP TRIGGER IF EXISTS trg_submission_rights_updated_at ON public.submission_rights;
CREATE TRIGGER trg_submission_rights_updated_at
  BEFORE UPDATE ON public.submission_rights
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSION MATERIALS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  screener_url text,
  screener_password text,
  trailer_url text,
  caption_availability text,
  master_resolution text,
  audio_configuration text,
  prores_available boolean,
  closed_caption_available boolean,
  dialogue_list_available boolean,
  music_cue_sheet_available boolean,
  eo_insurance_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_materials_submission_id_unique UNIQUE (submission_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_materials_submission_id ON public.submission_materials (submission_id);

DROP TRIGGER IF EXISTS trg_submission_materials_updated_at ON public.submission_materials;
CREATE TRIGGER trg_submission_materials_updated_at
  BEFORE UPDATE ON public.submission_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSION EXPECTATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_expectations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  primary_release_goal text,
  most_important_territory text,
  existing_audience_size text,
  mailing_list_size text,
  social_following text,
  marketing_participation text,
  desired_release_timing text,
  revenue_expectations text,
  partnership_success text,
  additional_context text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_expectations_submission_id_unique UNIQUE (submission_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_expectations_submission_id ON public.submission_expectations (submission_id);

DROP TRIGGER IF EXISTS trg_submission_expectations_updated_at ON public.submission_expectations;
CREATE TRIGGER trg_submission_expectations_updated_at
  BEFORE UPDATE ON public.submission_expectations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSION FILES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  file_type public.submission_file_type NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_files_file_size_positive CHECK (file_size > 0),
  CONSTRAINT submission_files_file_name_not_empty CHECK (char_length(trim(file_name)) > 0),
  CONSTRAINT submission_files_file_path_not_empty CHECK (char_length(trim(file_path)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON public.submission_files (submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_files_file_type ON public.submission_files (file_type);
CREATE INDEX IF NOT EXISTS idx_submission_files_file_path ON public.submission_files (file_path);

-- =============================================================================
-- SUBMISSION NOTES (INTERNAL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  note text NOT NULL,
  is_internal boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT submission_notes_note_not_empty CHECK (char_length(trim(note)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_submission_notes_submission_id ON public.submission_notes (submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_notes_author_id ON public.submission_notes (author_id);
CREATE INDEX IF NOT EXISTS idx_submission_notes_created_at ON public.submission_notes (created_at DESC);

DROP TRIGGER IF EXISTS trg_submission_notes_updated_at ON public.submission_notes;
CREATE TRIGGER trg_submission_notes_updated_at
  BEFORE UPDATE ON public.submission_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- SUBMISSION STATUS HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.submission_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions (id) ON DELETE CASCADE,
  from_status public.submission_status,
  to_status public.submission_status NOT NULL,
  changed_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_status_history_submission_id ON public.submission_status_history (submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_status_history_to_status ON public.submission_status_history (to_status);
CREATE INDEX IF NOT EXISTS idx_submission_status_history_created_at ON public.submission_status_history (created_at DESC);

-- =============================================================================
-- FILMS (SIGNED TITLES / FILMMAKER PORTAL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.films (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.submissions (id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  synopsis text,
  genre text,
  runtime_minutes integer,
  release_year integer,
  filmmaker_profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  release_investment numeric(14, 2),
  recouped_amount numeric(14, 2) NOT NULL DEFAULT 0,
  filmmaker_share_percent numeric(5, 2),
  studio_share_percent numeric(5, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT films_slug_unique UNIQUE (slug),
  CONSTRAINT films_title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT films_runtime_positive CHECK (
    runtime_minutes IS NULL OR runtime_minutes > 0
  ),
  CONSTRAINT films_share_percent_range CHECK (
    (filmmaker_share_percent IS NULL OR (filmmaker_share_percent >= 0 AND filmmaker_share_percent <= 100))
    AND (studio_share_percent IS NULL OR (studio_share_percent >= 0 AND studio_share_percent <= 100))
  )
);

CREATE INDEX IF NOT EXISTS idx_films_submission_id ON public.films (submission_id);
CREATE INDEX IF NOT EXISTS idx_films_filmmaker_profile_id ON public.films (filmmaker_profile_id);
CREATE INDEX IF NOT EXISTS idx_films_genre ON public.films (genre);
CREATE INDEX IF NOT EXISTS idx_films_status ON public.films (status);
CREATE INDEX IF NOT EXISTS idx_films_slug ON public.films (slug);

DROP TRIGGER IF EXISTS trg_films_updated_at ON public.films;
CREATE TRIGGER trg_films_updated_at
  BEFORE UPDATE ON public.films
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_filmmaker_for_film(p_film_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.films
    WHERE id = p_film_id
      AND filmmaker_profile_id = auth.uid()
  );
$$;

-- =============================================================================
-- FILM RELEASES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.film_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid NOT NULL REFERENCES public.films (id) ON DELETE CASCADE,
  platform text NOT NULL,
  territory text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT film_releases_platform_not_empty CHECK (char_length(trim(platform)) > 0),
  CONSTRAINT film_releases_territory_not_empty CHECK (char_length(trim(territory)) > 0),
  CONSTRAINT film_releases_date_order CHECK (
    start_date IS NULL OR end_date IS NULL OR end_date >= start_date
  )
);

CREATE INDEX IF NOT EXISTS idx_film_releases_film_id ON public.film_releases (film_id);
CREATE INDEX IF NOT EXISTS idx_film_releases_platform ON public.film_releases (platform);
CREATE INDEX IF NOT EXISTS idx_film_releases_territory ON public.film_releases (territory);
CREATE INDEX IF NOT EXISTS idx_film_releases_status ON public.film_releases (status);

DROP TRIGGER IF EXISTS trg_film_releases_updated_at ON public.film_releases;
CREATE TRIGGER trg_film_releases_updated_at
  BEFORE UPDATE ON public.film_releases
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- FILM REVENUE STATEMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.film_revenue_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid NOT NULL REFERENCES public.films (id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_receipts numeric(14, 2) NOT NULL DEFAULT 0,
  deductions numeric(14, 2) NOT NULL DEFAULT 0,
  net_receipts numeric(14, 2) NOT NULL DEFAULT 0,
  statement_date date NOT NULL,
  notes text,
  document_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT film_revenue_statements_period_order CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_film_revenue_statements_film_id ON public.film_revenue_statements (film_id);
CREATE INDEX IF NOT EXISTS idx_film_revenue_statements_period ON public.film_revenue_statements (period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_film_revenue_statements_statement_date ON public.film_revenue_statements (statement_date DESC);

DROP TRIGGER IF EXISTS trg_film_revenue_statements_updated_at ON public.film_revenue_statements;
CREATE TRIGGER trg_film_revenue_statements_updated_at
  BEFORE UPDATE ON public.film_revenue_statements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- FILM EXPENSES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.film_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid NOT NULL REFERENCES public.films (id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  is_recoupable boolean NOT NULL DEFAULT true,
  incurred_date date,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT film_expenses_category_not_empty CHECK (char_length(trim(category)) > 0),
  CONSTRAINT film_expenses_description_not_empty CHECK (char_length(trim(description)) > 0),
  CONSTRAINT film_expenses_amount_non_negative CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_film_expenses_film_id ON public.film_expenses (film_id);
CREATE INDEX IF NOT EXISTS idx_film_expenses_category ON public.film_expenses (category);
CREATE INDEX IF NOT EXISTS idx_film_expenses_approved ON public.film_expenses (approved);
CREATE INDEX IF NOT EXISTS idx_film_expenses_incurred_date ON public.film_expenses (incurred_date DESC NULLS LAST);

DROP TRIGGER IF EXISTS trg_film_expenses_updated_at ON public.film_expenses;
CREATE TRIGGER trg_film_expenses_updated_at
  BEFORE UPDATE ON public.film_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- FILM DOCUMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.film_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid NOT NULL REFERENCES public.films (id) ON DELETE CASCADE,
  title text NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  visible_to_filmmaker boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT film_documents_title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT film_documents_document_type_not_empty CHECK (char_length(trim(document_type)) > 0),
  CONSTRAINT film_documents_file_path_not_empty CHECK (char_length(trim(file_path)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_film_documents_film_id ON public.film_documents (film_id);
CREATE INDEX IF NOT EXISTS idx_film_documents_document_type ON public.film_documents (document_type);
CREATE INDEX IF NOT EXISTS idx_film_documents_visible_to_filmmaker ON public.film_documents (visible_to_filmmaker);

DROP TRIGGER IF EXISTS trg_film_documents_updated_at ON public.film_documents;
CREATE TRIGGER trg_film_documents_updated_at
  BEFORE UPDATE ON public.film_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- FILM PAYMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.film_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid NOT NULL REFERENCES public.films (id) ON DELETE CASCADE,
  amount numeric(14, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  payment_type text NOT NULL,
  payment_method text,
  reference_number text,
  payment_date date NOT NULL,
  status public.film_payment_status NOT NULL DEFAULT 'pending'::public.film_payment_status,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT film_payments_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT film_payments_payment_type_not_empty CHECK (char_length(trim(payment_type)) > 0),
  CONSTRAINT film_payments_currency_not_empty CHECK (char_length(trim(currency)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_film_payments_film_id ON public.film_payments (film_id);
CREATE INDEX IF NOT EXISTS idx_film_payments_payment_date ON public.film_payments (payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_film_payments_status ON public.film_payments (status);
CREATE INDEX IF NOT EXISTS idx_film_payments_reference_number ON public.film_payments (reference_number);

DROP TRIGGER IF EXISTS trg_film_payments_updated_at ON public.film_payments;
CREATE TRIGGER trg_film_payments_updated_at
  BEFORE UPDATE ON public.film_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- FILM UPDATES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.film_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  film_id uuid NOT NULL REFERENCES public.films (id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  update_type text NOT NULL DEFAULT 'general',
  published_at timestamptz,
  visible_to_filmmaker boolean NOT NULL DEFAULT true,
  author_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT film_updates_title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT film_updates_body_not_empty CHECK (char_length(trim(body)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_film_updates_film_id ON public.film_updates (film_id);
CREATE INDEX IF NOT EXISTS idx_film_updates_published_at ON public.film_updates (published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_film_updates_visible_to_filmmaker ON public.film_updates (visible_to_filmmaker);
CREATE INDEX IF NOT EXISTS idx_film_updates_update_type ON public.film_updates (update_type);

DROP TRIGGER IF EXISTS trg_film_updates_updated_at ON public.film_updates;
CREATE TRIGGER trg_film_updates_updated_at
  BEFORE UPDATE ON public.film_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- CONTACT MESSAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  status public.contact_message_status NOT NULL DEFAULT 'new'::public.contact_message_status,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contact_messages_full_name_not_empty CHECK (char_length(trim(full_name)) > 0),
  CONSTRAINT contact_messages_email_not_empty CHECK (char_length(trim(email)) > 0),
  CONSTRAINT contact_messages_message_not_empty CHECK (char_length(trim(message)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages (status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages (email);

DROP TRIGGER IF EXISTS trg_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- RATE LIMIT ENTRIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key text NOT NULL,
  action text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rate_limit_entries_rate_key_action_unique UNIQUE (rate_key, action),
  CONSTRAINT rate_limit_entries_attempt_count_positive CHECK (attempt_count >= 0),
  CONSTRAINT rate_limit_entries_rate_key_not_empty CHECK (char_length(trim(rate_key)) > 0),
  CONSTRAINT rate_limit_entries_action_not_empty CHECK (char_length(trim(action)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_entries_rate_key_action ON public.rate_limit_entries (rate_key, action);
CREATE INDEX IF NOT EXISTS idx_rate_limit_entries_expires_at ON public.rate_limit_entries (expires_at);

DROP TRIGGER IF EXISTS trg_rate_limit_entries_updated_at ON public.rate_limit_entries;
CREATE TRIGGER trg_rate_limit_entries_updated_at
  BEFORE UPDATE ON public.rate_limit_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- STORAGE BUCKET: submission-files
-- =============================================================================
-- Create the bucket via Supabase Dashboard or CLI:
--   supabase storage create submission-files --public false
--
-- Recommended storage policies (apply in Dashboard or a follow-up migration):
--
-- 1. Service role (API routes): full access via service_role key — bypasses RLS.
--
-- 2. Admin/reviewer upload and read:
--    CREATE POLICY "Admins and reviewers can read submission files"
--      ON storage.objects FOR SELECT
--      TO authenticated
--      USING (
--        bucket_id = 'submission-files'
--        AND public.is_admin_or_reviewer()
--      );
--
--    CREATE POLICY "Admins and reviewers can upload submission files"
--      ON storage.objects FOR INSERT
--      TO authenticated
--      WITH CHECK (
--        bucket_id = 'submission-files'
--        AND public.is_admin_or_reviewer()
--      );
--
-- 3. Draft uploads via API (service role) store paths like:
--      {submission_id}/{file_type}/{filename}
--    Never expose service role key to the client.
--
-- 4. Optional signed URL generation for screener review — server-side only.
--
-- 5. File size limit: enforce 10 MB in API (matches MAX_UPLOAD_BYTES constant).
--    Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf.

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_expectations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.films ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_revenue_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.film_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PROFILES
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (
      SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- SUBMISSIONS & RELATED TABLES
-- Service role (API) bypasses RLS for draft creation and public submission flow.
-- No anon/authenticated INSERT policies — all public writes go through API routes.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins and reviewers can select submissions" ON public.submissions;
CREATE POLICY "Admins and reviewers can select submissions"
  ON public.submissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can update submissions" ON public.submissions;
CREATE POLICY "Admins and reviewers can update submissions"
  ON public.submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can insert submissions" ON public.submissions;
CREATE POLICY "Admins and reviewers can insert submissions"
  ON public.submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_reviewer());

-- Submission child tables: admin/reviewer access only

DROP POLICY IF EXISTS "Admins and reviewers can select submission contacts" ON public.submission_contacts;
CREATE POLICY "Admins and reviewers can select submission contacts"
  ON public.submission_contacts FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can manage submission contacts" ON public.submission_contacts;
CREATE POLICY "Admins and reviewers can manage submission contacts"
  ON public.submission_contacts FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can select submission films" ON public.submission_films;
CREATE POLICY "Admins and reviewers can select submission films"
  ON public.submission_films FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can manage submission films" ON public.submission_films;
CREATE POLICY "Admins and reviewers can manage submission films"
  ON public.submission_films FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can select submission rights" ON public.submission_rights;
CREATE POLICY "Admins and reviewers can select submission rights"
  ON public.submission_rights FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can manage submission rights" ON public.submission_rights;
CREATE POLICY "Admins and reviewers can manage submission rights"
  ON public.submission_rights FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can select submission materials" ON public.submission_materials;
CREATE POLICY "Admins and reviewers can select submission materials"
  ON public.submission_materials FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can manage submission materials" ON public.submission_materials;
CREATE POLICY "Admins and reviewers can manage submission materials"
  ON public.submission_materials FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can select submission expectations" ON public.submission_expectations;
CREATE POLICY "Admins and reviewers can select submission expectations"
  ON public.submission_expectations FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can manage submission expectations" ON public.submission_expectations;
CREATE POLICY "Admins and reviewers can manage submission expectations"
  ON public.submission_expectations FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can select submission files" ON public.submission_files;
CREATE POLICY "Admins and reviewers can select submission files"
  ON public.submission_files FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can manage submission files" ON public.submission_files;
CREATE POLICY "Admins and reviewers can manage submission files"
  ON public.submission_files FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can select submission notes" ON public.submission_notes;
CREATE POLICY "Admins and reviewers can select submission notes"
  ON public.submission_notes FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can manage submission notes" ON public.submission_notes;
CREATE POLICY "Admins and reviewers can manage submission notes"
  ON public.submission_notes FOR ALL TO authenticated
  USING (public.is_admin_or_reviewer())
  WITH CHECK (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can select submission status history" ON public.submission_status_history;
CREATE POLICY "Admins and reviewers can select submission status history"
  ON public.submission_status_history FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can insert submission status history" ON public.submission_status_history;
CREATE POLICY "Admins and reviewers can insert submission status history"
  ON public.submission_status_history FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_reviewer());

-- -----------------------------------------------------------------------------
-- FILMS & PORTAL DATA
-- Filmmakers see only their signed films and related portal data.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Admins and reviewers can select all films" ON public.films;
CREATE POLICY "Admins and reviewers can select all films"
  ON public.films FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Filmmakers can select own films" ON public.films;
CREATE POLICY "Filmmakers can select own films"
  ON public.films FOR SELECT TO authenticated
  USING (filmmaker_profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage films" ON public.films;
CREATE POLICY "Admins can manage films"
  ON public.films FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Film releases

DROP POLICY IF EXISTS "Admins and reviewers can select all film releases" ON public.film_releases;
CREATE POLICY "Admins and reviewers can select all film releases"
  ON public.film_releases FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Filmmakers can select own film releases" ON public.film_releases;
CREATE POLICY "Filmmakers can select own film releases"
  ON public.film_releases FOR SELECT TO authenticated
  USING (public.is_filmmaker_for_film(film_id));

DROP POLICY IF EXISTS "Admins can manage film releases" ON public.film_releases;
CREATE POLICY "Admins can manage film releases"
  ON public.film_releases FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Film revenue statements

DROP POLICY IF EXISTS "Admins and reviewers can select all revenue statements" ON public.film_revenue_statements;
CREATE POLICY "Admins and reviewers can select all revenue statements"
  ON public.film_revenue_statements FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Filmmakers can select own revenue statements" ON public.film_revenue_statements;
CREATE POLICY "Filmmakers can select own revenue statements"
  ON public.film_revenue_statements FOR SELECT TO authenticated
  USING (public.is_filmmaker_for_film(film_id));

DROP POLICY IF EXISTS "Admins can manage revenue statements" ON public.film_revenue_statements;
CREATE POLICY "Admins can manage revenue statements"
  ON public.film_revenue_statements FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Film expenses

DROP POLICY IF EXISTS "Admins and reviewers can select all film expenses" ON public.film_expenses;
CREATE POLICY "Admins and reviewers can select all film expenses"
  ON public.film_expenses FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Filmmakers can select own film expenses" ON public.film_expenses;
CREATE POLICY "Filmmakers can select own film expenses"
  ON public.film_expenses FOR SELECT TO authenticated
  USING (public.is_filmmaker_for_film(film_id));

DROP POLICY IF EXISTS "Admins can manage film expenses" ON public.film_expenses;
CREATE POLICY "Admins can manage film expenses"
  ON public.film_expenses FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Film documents

DROP POLICY IF EXISTS "Admins and reviewers can select all film documents" ON public.film_documents;
CREATE POLICY "Admins and reviewers can select all film documents"
  ON public.film_documents FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Filmmakers can select visible film documents" ON public.film_documents;
CREATE POLICY "Filmmakers can select visible film documents"
  ON public.film_documents FOR SELECT TO authenticated
  USING (
    visible_to_filmmaker = true
    AND public.is_filmmaker_for_film(film_id)
  );

DROP POLICY IF EXISTS "Admins can manage film documents" ON public.film_documents;
CREATE POLICY "Admins can manage film documents"
  ON public.film_documents FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Film payments

DROP POLICY IF EXISTS "Admins and reviewers can select all film payments" ON public.film_payments;
CREATE POLICY "Admins and reviewers can select all film payments"
  ON public.film_payments FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Filmmakers can select own film payments" ON public.film_payments;
CREATE POLICY "Filmmakers can select own film payments"
  ON public.film_payments FOR SELECT TO authenticated
  USING (
    status = 'completed'::public.film_payment_status
    AND public.is_filmmaker_for_film(film_id)
  );

DROP POLICY IF EXISTS "Admins can manage film payments" ON public.film_payments;
CREATE POLICY "Admins can manage film payments"
  ON public.film_payments FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Film updates

DROP POLICY IF EXISTS "Admins and reviewers can select all film updates" ON public.film_updates;
CREATE POLICY "Admins and reviewers can select all film updates"
  ON public.film_updates FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Filmmakers can select visible film updates" ON public.film_updates;
CREATE POLICY "Filmmakers can select visible film updates"
  ON public.film_updates FOR SELECT TO authenticated
  USING (
    visible_to_filmmaker = true
    AND (published_at IS NULL OR published_at <= now())
    AND public.is_filmmaker_for_film(film_id)
  );

DROP POLICY IF EXISTS "Admins can manage film updates" ON public.film_updates;
CREATE POLICY "Admins can manage film updates"
  ON public.film_updates FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- CONTACT MESSAGES
-- Public contact form inserts via service role API; optional anon insert below.
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- RATE LIMIT ENTRIES
-- Service role only — no client-facing policies.
-- -----------------------------------------------------------------------------

-- =============================================================================
-- GRANTS
-- =============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.set_updated_at() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_reviewer() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_filmmaker_for_film(uuid) TO postgres, anon, authenticated, service_role;

-- Revoke direct anon/authenticated access to rate_limit_entries (service role only)
REVOKE ALL ON TABLE public.rate_limit_entries FROM anon, authenticated;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO postgres, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO postgres, anon, authenticated, service_role;
