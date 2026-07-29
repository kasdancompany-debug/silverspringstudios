-- Run in Supabase → SQL Editor after migrations 001–005.
-- Replace the email/password workflow:
--   1. Authentication → Users → Add user
--      email: silverspringfilms@gmail.com
--      set a strong password
--   2. Copy the user's UUID
--   3. Replace AUTH_USER_UUID below and run this script

insert into public.profiles (id, email, full_name, role)
values (
  'AUTH_USER_UUID',
  'silverspringfilms@gmail.com',
  'Silver Spring Studios',
  'admin'
)
on conflict (id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role = 'admin';
