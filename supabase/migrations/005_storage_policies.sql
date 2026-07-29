-- 005: Private submission-files storage policies
-- Apply after creating the private bucket `submission-files` in the Supabase dashboard.
-- Without these policies, authenticated staff and token-bearing upload flows cannot
-- reliably enforce private object access.

-- Bucket should be created as PRIVATE (public = false).

drop policy if exists "Staff can read submission files" on storage.objects;
create policy "Staff can read submission files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'submission-files'
    and public.is_admin_or_reviewer()
  );

drop policy if exists "Staff can manage submission files" on storage.objects;
create policy "Staff can manage submission files"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'submission-files'
    and public.is_admin()
  )
  with check (
    bucket_id = 'submission-files'
    and public.is_admin()
  );

-- Uploads from the public submission flow use the service-role key on the
-- server (src/app/api/upload/route.ts) and therefore bypass RLS intentionally.
-- Do not grant anon INSERT on this bucket.
