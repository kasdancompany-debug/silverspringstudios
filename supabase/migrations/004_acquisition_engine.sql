-- 004: Filmmaker acquisition engine
-- Resources/content is file-backed in the app; this migration covers
-- lead capture, referral attribution, outreach CRM, and partner pages.

-- ---------------------------------------------------------------------------
-- Referral attribution on submissions
-- ---------------------------------------------------------------------------

alter table public.submissions
  add column if not exists referral_source text,
  add column if not exists referral_medium text,
  add column if not exists referral_campaign text,
  add column if not exists referral_festival text,
  add column if not exists referral_school text,
  add column if not exists referral_partner text,
  add column if not exists referral_referrer text,
  add column if not exists outreach_contact_id uuid,
  add column if not exists partner_slug text;

create index if not exists submissions_referral_source_idx
  on public.submissions (referral_source)
  where referral_source is not null;

create index if not exists submissions_partner_slug_idx
  on public.submissions (partner_slug)
  where partner_slug is not null;

-- ---------------------------------------------------------------------------
-- Newsletter: The Release Notes
-- ---------------------------------------------------------------------------

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  primary_role text,
  film_stage text,
  genre_interest text,
  consent boolean not null default false,
  source text,
  partner_slug text,
  ip_hash text,
  user_agent text,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_key unique (email)
);

create trigger newsletter_subscribers_set_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.set_updated_at();

alter table public.newsletter_subscribers enable row level security;

create policy "Admins manage newsletter_subscribers"
  on public.newsletter_subscribers
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Lead magnet downloads
-- ---------------------------------------------------------------------------

create table if not exists public.lead_magnet_downloads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  first_name text,
  primary_role text,
  film_stage text,
  resource_slug text not null default 'distribution-readiness-checklist',
  consent boolean not null default false,
  source text,
  partner_slug text,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists lead_magnet_downloads_email_idx
  on public.lead_magnet_downloads (email);

alter table public.lead_magnet_downloads enable row level security;

create policy "Admins read lead_magnet_downloads"
  on public.lead_magnet_downloads
  for select
  using (public.is_admin_or_reviewer());

-- ---------------------------------------------------------------------------
-- Partner landing pages
-- ---------------------------------------------------------------------------

create table if not exists public.partner_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  partner_name text not null,
  partner_type text not null default 'other',
  headline text,
  introduction text,
  seeking text,
  submission_cta_label text default 'Submit your film',
  resource_download_slug text,
  contact_email text,
  contact_note text,
  tracking_source text,
  tracking_medium text default 'partner',
  tracking_campaign text,
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger partner_pages_set_updated_at
  before update on public.partner_pages
  for each row execute function public.set_updated_at();

alter table public.partner_pages enable row level security;

create policy "Public read published partner_pages"
  on public.partner_pages
  for select
  using (is_published = true);

create policy "Admins manage partner_pages"
  on public.partner_pages
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Outreach CRM foundation
-- ---------------------------------------------------------------------------

create type public.outreach_lead_status as enum (
  'discovered',
  'research_needed',
  'qualified',
  'contacted',
  'replied',
  'meeting',
  'invited_to_submit',
  'submitted',
  'not_interested',
  'follow_up_later',
  'disqualified'
);

create table if not exists public.festivals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.film_schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.producer_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_type text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach_leads (
  id uuid primary key default gen_random_uuid(),
  filmmaker_name text not null,
  film_title text,
  email text,
  website text,
  festival text,
  genre text,
  completion_year integer,
  country text,
  source_url text,
  why_it_may_fit text,
  personalized_note text,
  status public.outreach_lead_status not null default 'discovered',
  festival_id uuid references public.festivals (id) on delete set null,
  film_school_id uuid references public.film_schools (id) on delete set null,
  producer_org_id uuid references public.producer_organizations (id) on delete set null,
  partner_slug text,
  assigned_to uuid references public.profiles (id) on delete set null,
  next_follow_up_at date,
  last_contacted_at timestamptz,
  submission_id uuid references public.submissions (id) on delete set null,
  import_batch_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outreach_leads_status_idx on public.outreach_leads (status);
create index if not exists outreach_leads_email_idx on public.outreach_leads (email);
create index if not exists outreach_leads_assigned_idx on public.outreach_leads (assigned_to);

create trigger outreach_leads_set_updated_at
  before update on public.outreach_leads
  for each row execute function public.set_updated_at();

-- Films discovered (may link to a lead or stand alone)
create table if not exists public.discovered_films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  filmmaker_name text,
  genre text,
  completion_year integer,
  country text,
  festival text,
  source_url text,
  notes text,
  lead_id uuid references public.outreach_leads (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger discovered_films_set_updated_at
  before update on public.discovered_films
  for each row execute function public.set_updated_at();

create table if not exists public.outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  partner_slug text,
  festival_id uuid references public.festivals (id) on delete set null,
  status text not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger outreach_campaigns_set_updated_at
  before update on public.outreach_campaigns
  for each row execute function public.set_updated_at();

create table if not exists public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.outreach_leads (id) on delete cascade,
  campaign_id uuid references public.outreach_campaigns (id) on delete set null,
  subject text not null,
  body text not null,
  status text not null default 'draft',
  -- draft | pending_approval | approved | sent | cancelled
  approved_by uuid references public.profiles (id) on delete set null,
  approved_at timestamptz,
  sent_by uuid references public.profiles (id) on delete set null,
  sent_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outreach_messages_no_auto_send check (status in (
    'draft', 'pending_approval', 'approved', 'sent', 'cancelled'
  ))
);

create trigger outreach_messages_set_updated_at
  before update on public.outreach_messages
  for each row execute function public.set_updated_at();

create table if not exists public.outreach_replies (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.outreach_leads (id) on delete cascade,
  message_id uuid references public.outreach_messages (id) on delete set null,
  body text not null,
  received_at timestamptz not null default now(),
  logged_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.outreach_follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.outreach_leads (id) on delete cascade,
  due_at date not null,
  note text,
  completed_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Link outreach contact on submissions once the FK target exists
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'submissions_outreach_contact_id_fkey'
  ) then
    alter table public.submissions
      add constraint submissions_outreach_contact_id_fkey
      foreign key (outreach_contact_id)
      references public.outreach_leads (id)
      on delete set null;
  end if;
end $$;

-- RLS for outreach tables
alter table public.festivals enable row level security;
alter table public.film_schools enable row level security;
alter table public.producer_organizations enable row level security;
alter table public.outreach_leads enable row level security;
alter table public.discovered_films enable row level security;
alter table public.outreach_campaigns enable row level security;
alter table public.outreach_messages enable row level security;
alter table public.outreach_replies enable row level security;
alter table public.outreach_follow_ups enable row level security;

create policy "Staff manage festivals" on public.festivals for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage film_schools" on public.film_schools for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage producer_organizations" on public.producer_organizations for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage outreach_leads" on public.outreach_leads for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage discovered_films" on public.discovered_films for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage outreach_campaigns" on public.outreach_campaigns for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage outreach_messages" on public.outreach_messages for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage outreach_replies" on public.outreach_replies for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
create policy "Staff manage outreach_follow_ups" on public.outreach_follow_ups for all
  using (public.is_admin_or_reviewer()) with check (public.is_admin_or_reviewer());
