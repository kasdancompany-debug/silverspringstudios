-- =============================================================================
-- Silver Spring Studios — Submission Security Hardening
-- Adds: reference number uniqueness guarantee, screener access audit log,
-- and documentation of the private storage bucket requirement.
-- =============================================================================

-- =============================================================================
-- REFERENCE NUMBER UNIQUENESS
-- =============================================================================
-- `submissions.reference_number` already carries a UNIQUE constraint from
-- the initial schema migration (submissions_reference_number_unique), which
-- Postgres backs with a unique index automatically. This statement is a
-- defensive no-op that guarantees the index exists even if a deployment's
-- history diverged (e.g. the constraint was manually dropped), without
-- attempting to re-add a duplicate constraint.
CREATE UNIQUE INDEX IF NOT EXISTS submissions_reference_number_unique_idx
  ON public.submissions (reference_number);

-- =============================================================================
-- SUBMISSION ACCESS LOG
-- =============================================================================
-- Audit trail for sensitive, per-submission reveals — most importantly
-- screener credentials. Every reveal of a screener password or direct view
-- of a screener URL by an admin/reviewer should be recorded here so access
-- to filmmakers' private materials is fully auditable.

CREATE TABLE IF NOT EXISTS public.submission_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.submissions (id) ON DELETE CASCADE,
  accessed_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  access_type text NOT NULL, -- e.g. 'screener_password_reveal', 'screener_url_view'
  created_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  CONSTRAINT submission_access_log_access_type_not_empty CHECK (char_length(trim(access_type)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_submission_access_log_submission_id
  ON public.submission_access_log (submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_access_log_accessed_by
  ON public.submission_access_log (accessed_by);
CREATE INDEX IF NOT EXISTS idx_submission_access_log_access_type
  ON public.submission_access_log (access_type);
CREATE INDEX IF NOT EXISTS idx_submission_access_log_created_at
  ON public.submission_access_log (created_at DESC);

ALTER TABLE public.submission_access_log ENABLE ROW LEVEL SECURITY;

-- RLS: only admin/reviewer profiles may read or write access-log rows.
-- Route handlers should generally use the service-role client to insert
-- (so a log entry cannot be blocked or altered by the requesting user's own
-- session), but these policies also allow an authenticated admin/reviewer
-- session to insert and read directly if needed.

DROP POLICY IF EXISTS "Admins and reviewers can select submission access log" ON public.submission_access_log;
CREATE POLICY "Admins and reviewers can select submission access log"
  ON public.submission_access_log FOR SELECT TO authenticated
  USING (public.is_admin_or_reviewer());

DROP POLICY IF EXISTS "Admins and reviewers can insert submission access log" ON public.submission_access_log;
CREATE POLICY "Admins and reviewers can insert submission access log"
  ON public.submission_access_log FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_reviewer());

-- No UPDATE or DELETE policies are defined — the access log is append-only
-- for authenticated admin/reviewer sessions. The service role key (used by
-- API routes) bypasses RLS entirely for server-side logging.

GRANT SELECT, INSERT ON public.submission_access_log TO authenticated;
GRANT ALL ON public.submission_access_log TO postgres, service_role;
REVOKE ALL ON public.submission_access_log FROM anon;

-- =============================================================================
-- STORAGE BUCKET REMINDER
-- =============================================================================
-- The `submission-files` storage bucket MUST remain private
-- (public: false). Uploaded materials (posters, EPKs, stills, PDFs, caption
-- files, etc.) are only ever served via short-lived signed URLs generated
-- server-side for authenticated admin/reviewer sessions
-- (see src/lib/admin/data.ts -> getSubmissionDetail). Never flip this
-- bucket to public, and never generate a signed URL with a long expiry for
-- an unauthenticated caller.
--
-- If the bucket does not exist yet, create it via the Supabase Dashboard or
-- CLI:
--   supabase storage create submission-files --public false
