# Silver Spring Studios

Boutique independent film distribution website and acquisitions platform.

**Independent films deserve a real release.**

This repository contains the production foundation for the Silver Spring Studios public site, filmmaker submission system, resource centre, partner landings, outreach CRM foundation, and internal acquisitions dashboard.

## Tech stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Auth, Postgres, Storage, RLS)
- React Hook Form + Zod
- Framer Motion (respects `prefers-reduced-motion`)
- Resend-compatible transactional email
- Vercel deployment target

## Financial model (canonical wording)

Use this language everywhere public or contractual:

- Standard release investment: **$3,500** ($2,000 poster design + $1,500 trailer/publicity support)
- Recouped **from the film’s receipts**, not invoiced to the filmmaker personally
- After recoupment, remaining **distributable / net receipts** typically split **60% filmmaker / 40% studio**
- Exact terms are controlled only by a **signed distribution agreement**
- Never substitute “profit” for contract-defined receipts
- Never guarantee acceptance, revenue, reviews, or platform placement

## Features

### Public site

- Marketing homepage with model explanation, illustrative revenue waterfall, FAQ, submission CTA
- `/our-approach` credibility page for a new company (no invented catalogue)
- Multi-step submission with autosave, private uploads, referral attribution, confirmation architecture
- Resource centre (`/resources`) with topic hubs and detailed draft-outline guides
- Lead magnet checklist (`/checklist` + print HTML)
- Newsletter: The Release Notes
- Partner landings (`/partners/[slug]`) — only published partners appear publicly
- Legal drafts: privacy, terms, submission terms (marked draft + `noIndex` until counsel-approved)

### Admin acquisitions desk

- Auth-gated `/admin` for `admin` / `reviewer` roles (fail-closed role checks)
- Submission queue, two-column detail, scorecard, economics calculator, email templates
- Reports, outreach CRM foundation (CSV import, manual outreach approval — no bulk auto-send)
- Partner page editor
- Demo sample data **only outside production** when Supabase is not configured

## Local setup

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Required for production / real persistence:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (must not end in `.example`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public acquisitions email |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service role (never expose to client) |
| `RESEND_API_KEY` | Transactional email |
| `EMAIL_FROM` | From address for outbound mail |
| `ADMIN_NOTIFICATION_EMAIL` | Inbox for new submission / contact alerts |
| `NEXT_PUBLIC_TWITTER_HANDLE` | Optional; leave empty if unused |

Development without Supabase: public forms + admin demo data work locally. Demo mode is **disabled in production** even if `NEXT_PUBLIC_DEMO_MODE=true`.

### 3. Database migrations

Apply in order (SQL editor or Supabase CLI):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_submission_security.sql`
3. `supabase/migrations/003_acquisitions_dashboard.sql`
4. `supabase/migrations/004_acquisition_engine.sql`
5. `supabase/migrations/005_storage_policies.sql` (after creating the bucket)

```bash
supabase db push
```

### 4. Storage

1. Create a **private** Storage bucket named `submission-files`
2. Apply `005_storage_policies.sql`
3. Public uploads go through `/api/upload` using the service role — do not grant anon INSERT

### 5. Admin user

1. Create a user in Supabase Authentication
2. Upsert a matching profile:

```sql
insert into public.profiles (id, email, full_name, role)
values ('AUTH_USER_UUID', 'you@example.com', 'Your Name', 'admin')
on conflict (id) do update set role = 'admin';
```

### 6. Run locally

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin (demo desk if Supabase env is missing)

## Verification commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
# or all of the above:
npm run verify
```

## Production deployment (Vercel)

1. Push the repository to GitHub and import the project in Vercel
2. Set **all** production env vars (no `.example` placeholders)
3. Confirm `NODE_ENV=production` (Vercel default) so demo mode stays off
4. Deploy; confirm migrations + storage bucket exist on the linked Supabase project
5. Smoke-test:
   - `/` metadata and OG image
   - `/submit` draft save + submit
   - `/admin/login` with a real admin profile
   - `/api/admin/*` rejects unauthenticated callers
6. Before public launch:
   - Replace draft legal pages with counsel-approved copy and remove `noIndex`
   - Publish only real partner pages from admin
   - Finish resource articles (`status: "published"`) before expecting sitemap inclusion
   - Confirm Resend domain authentication for `EMAIL_FROM`

## Security notes

- Admin middleware requires an authenticated user **and** `profiles.role` of `admin` or `reviewer` (fail closed)
- `/api/admin/*` routes re-check staff session
- Screener passwords never return to public draft APIs; staff reveal is audited
- Rate limits + honeypots on contact, newsletter, lead-magnet, and submission endpoints
- RLS enabled on acquisition-engine tables; newsletter/lead inserts use service role from API routes

## Important product constraints

- Submission does not create a distribution relationship
- No platform placement, revenue, or acceptance guarantees
- Do not invent films, filmmakers, testimonials, partnerships, or catalogue claims
- Admin demo records are labeled; unpublished demo partners never appear on the public site

## Project layout

```
src/app/(public)/     # marketing, submit, resources, checklist, partners
src/app/admin/        # acquisitions desk, outreach, partners, reports
src/app/api/          # contact, newsletter, lead-magnet, submissions, admin
src/components/       # UI, home, submit, admin, resources
src/lib/              # actions, validations, admin data, resources, email
supabase/migrations/  # schema + RLS + storage policies
tests/                # production-guard unit tests
```
