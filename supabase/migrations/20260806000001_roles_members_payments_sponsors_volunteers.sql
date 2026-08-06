-- Final-build foundation: roles (profiles), members, payments, sponsors,
-- volunteer enquiries, sponsor-logo storage, and the RLS tightening that the
-- two-role model requires.
--
-- NOT YET APPLIED TO THE LIVE PROJECT. Per BACKEND.md golden rule 1 and the
-- Final Build Brief "Manual steps", run this in the Supabase SQL editor (or
-- `supabase db push`) after review. It is written to be safe to run once on
-- the current live schema (events/tee_slots/bookings/membership_enquiries/
-- contact_messages already exist).
--
-- WHY THE TIGHTENING MATTERS: until now every authenticated user was a
-- committee admin, so policies used `to authenticated using (true)`. This
-- migration introduces invited *member* logins — also authenticated — so every
-- admin-grade policy below is rewritten to require the committee role.

-- ---------------------------------------------------------------------------
-- 1. members — the club's register of paid members (not the enquiry form).
-- ---------------------------------------------------------------------------
create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  service_branch text,
  ga_handicap boolean,
  golf_links_number text,
  status text not null default 'active' check (status in ('active','expired')),
  joined_at date not null default (now() at time zone 'Australia/Brisbane')::date,
  expires_at date not null,
  auth_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. profiles — one row per auth user; the role RLS keys off. Role is set by
--    the committee / server only, never by the user themself (trigger below).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('member','committee')),
  member_id uuid references public.members (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Every account that exists today is a committee volunteer (the pre-role
-- model), so seed them as such.
insert into public.profiles (id, role)
select u.id, 'committee' from auth.users u
on conflict (id) do nothing;

create or replace function public.is_committee()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'committee'
  );
$$;
revoke all on function public.is_committee() from public;
grant execute on function public.is_committee() to anon, authenticated;

-- New auth users (member invites) get a member profile automatically and are
-- linked to their members row by email. Committee accounts created via the
-- admin-users edge function are upgraded to 'committee' by that function.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role) values (new.id, 'member')
  on conflict (id) do nothing;
  update public.members
    set auth_user_id = new.id
    where auth_user_id is null and lower(email) = lower(new.email);
  return new;
end;
$$;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- profiles RLS: users see their own row; only committee may change roles.
alter table public.profiles enable row level security;
create policy "profiles own read" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles committee read" on public.profiles
  for select to authenticated using (public.is_committee());
create policy "profiles committee write" on public.profiles
  for all to authenticated
  using (public.is_committee()) with check (public.is_committee());
-- Deliberately NO self-update policy: the only user-editable data lives in
-- members, so a member has nothing to edit here and the role stays locked.

-- members RLS: committee everything; a member may read + edit their own row,
-- but the guard trigger stops them touching status/expiry/email/linkage.
alter table public.members enable row level security;
create policy "members committee all" on public.members
  for all to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "members own read" on public.members
  for select to authenticated
  using (auth_user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "members own update" on public.members
  for update to authenticated
  using (auth_user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (auth_user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.members_guard()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_committee() then
    if new.status is distinct from old.status
       or new.expires_at is distinct from old.expires_at
       or new.joined_at is distinct from old.joined_at
       or new.email is distinct from old.email
       or new.auth_user_id is distinct from old.auth_user_id then
      raise exception 'MEMBER_FIELD_LOCKED';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.members_guard() from public, anon, authenticated;
create trigger members_guard before update on public.members
  for each row execute function public.members_guard();

-- ---------------------------------------------------------------------------
-- 3. Tighten the pre-role policies: authenticated no longer means committee.
-- ---------------------------------------------------------------------------
-- events
drop policy if exists "events admin read" on public.events;
drop policy if exists "events admin write" on public.events;
create policy "events authenticated read" on public.events
  for select to authenticated
  using (status <> 'draft' or public.is_committee());
create policy "events committee write" on public.events
  for insert to authenticated with check (public.is_committee());
create policy "events committee update" on public.events
  for update to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "events committee delete" on public.events
  for delete to authenticated using (public.is_committee());

-- tee_slots
drop policy if exists "tee slots admin all" on public.tee_slots;
create policy "tee slots authenticated read" on public.tee_slots
  for select to authenticated
  using (
    public.is_committee()
    or exists (select 1 from public.events e where e.id = event_id and e.status <> 'draft')
  );
create policy "tee slots committee write" on public.tee_slots
  for insert to authenticated with check (public.is_committee());
create policy "tee slots committee update" on public.tee_slots
  for update to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "tee slots committee delete" on public.tee_slots
  for delete to authenticated using (public.is_committee());

-- bookings: anon insert stays (capacity trigger guards it); committee manages;
-- a signed-in member can see the bookings they made themselves.
alter table public.bookings
  add column if not exists created_by uuid default auth.uid();

drop policy if exists "bookings admin read" on public.bookings;
drop policy if exists "bookings admin update" on public.bookings;
drop policy if exists "bookings admin delete" on public.bookings;
create policy "bookings committee read" on public.bookings
  for select to authenticated using (public.is_committee());
create policy "bookings member read own" on public.bookings
  for select to authenticated using (created_by = auth.uid());
create policy "bookings committee update" on public.bookings
  for update to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "bookings committee delete" on public.bookings
  for delete to authenticated using (public.is_committee());

-- enquiry tables gain a handled state for the committee view, and their
-- read/manage policies move to the committee role.
alter table public.membership_enquiries
  add column if not exists status text not null default 'new'
    check (status in ('new','handled'));
alter table public.contact_messages
  add column if not exists status text not null default 'new'
    check (status in ('new','handled'));

drop policy if exists "enquiries admin read" on public.membership_enquiries;
create policy "enquiries committee read" on public.membership_enquiries
  for select to authenticated using (public.is_committee());
create policy "enquiries committee update" on public.membership_enquiries
  for update to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "enquiries committee delete" on public.membership_enquiries
  for delete to authenticated using (public.is_committee());

drop policy if exists "messages admin read" on public.contact_messages;
drop policy if exists "contact admin read" on public.contact_messages;
do $$
declare p record;
begin
  -- whatever the original authenticated-read policy was called, replace it
  for p in select policyname from pg_policies
           where schemaname = 'public' and tablename = 'contact_messages'
             and cmd = 'SELECT'
  loop
    execute format('drop policy %I on public.contact_messages', p.policyname);
  end loop;
end $$;
create policy "messages committee read" on public.contact_messages
  for select to authenticated using (public.is_committee());
create policy "messages committee update" on public.contact_messages
  for update to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "messages committee delete" on public.contact_messages
  for delete to authenticated using (public.is_committee());

-- ---------------------------------------------------------------------------
-- 4. payments — written only by the server (service role); committee reads,
--    a member may see their own receipts. No anon access of any kind.
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  square_payment_id text unique,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'AUD',
  purpose text not null check (purpose in ('membership','donation','sponsorship')),
  reference_id uuid,
  payer_name text,
  payer_email text,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create policy "payments committee read" on public.payments
  for select to authenticated using (public.is_committee());
create policy "payments member read own" on public.payments
  for select to authenticated
  using (lower(coalesce(payer_email, '')) = lower(coalesce(auth.jwt() ->> 'email', '')));
-- No insert/update/delete policies: writes happen with the service role only.

-- ---------------------------------------------------------------------------
-- 5. volunteer_enquiries — same shape as the other public forms.
-- ---------------------------------------------------------------------------
create table public.volunteer_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new','handled')),
  created_at timestamptz not null default now()
);
alter table public.volunteer_enquiries enable row level security;
create policy "volunteers anon insert" on public.volunteer_enquiries
  for insert to anon, authenticated with check (true);
create policy "volunteers committee read" on public.volunteer_enquiries
  for select to authenticated using (public.is_committee());
create policy "volunteers committee update" on public.volunteer_enquiries
  for update to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "volunteers committee delete" on public.volunteer_enquiries
  for delete to authenticated using (public.is_committee());

-- ---------------------------------------------------------------------------
-- 6. sponsors — base table committee-only; the public reads a column-limited
--    view. Tier bands are computed server-side by tier_from_amount_cents.
-- ---------------------------------------------------------------------------
create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  website_url text,
  logo_path text,
  description text,
  tier text check (tier in ('bronze','silver','gold','platinum','platinum_plus')),
  amount_cents int,
  contact_name text,
  contact_email text,
  display_order int,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.sponsors enable row level security;
create policy "sponsors committee all" on public.sponsors
  for all to authenticated
  using (public.is_committee()) with check (public.is_committee());
-- No anon policy at all: anon reads go through the view below.

create or replace function public.tier_from_amount_cents(cents int)
returns text
language sql immutable
as $$
  select case
    when cents is null then null
    when cents >= 250000 then 'platinum_plus'
    when cents >= 150000 then 'platinum'
    when cents >= 100000 then 'gold'
    when cents >= 50000 then 'silver'
    when cents >= 25000 then 'bronze'
    else null
  end;
$$;
revoke all on function public.tier_from_amount_cents(int) from public;
grant execute on function public.tier_from_amount_cents(int) to anon, authenticated;

-- Owner (postgres) view => bypasses sponsors RLS by design, exposing ONLY the
-- public columns of active sponsors. Contact details and amounts never leave
-- the base table.
create view public.public_sponsors as
  select id, company_name, website_url, logo_path, description, tier, display_order
  from public.sponsors
  where is_active;
grant select on public.public_sponsors to anon, authenticated;

-- First sponsor: Urban Fairways West End (Appendix B). Bronze, active.
-- Logo file is supplied by Dexter at public/sponsors/urban-fairways.png —
-- flagged in the handoff if absent.
insert into public.sponsors
  (company_name, website_url, logo_path, description, tier, amount_cents,
   display_order, is_active)
select
  'Urban Fairways West End',
  'https://urbanfairways.com.au',
  '/sponsors/urban-fairways.png',
  'Defence veteran–owned golf simulator business in West End, Brisbane — coaching and state-of-the-art equipment.',
  'bronze', 25000, 1, true
where not exists (
  select 1 from public.sponsors where company_name = 'Urban Fairways West End'
);

-- ---------------------------------------------------------------------------
-- 7. Storage: sponsor-logos bucket — public read, committee write.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('sponsor-logos', 'sponsor-logos', true)
on conflict (id) do update set public = true;

create policy "sponsor logos public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'sponsor-logos');
create policy "sponsor logos committee insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'sponsor-logos' and public.is_committee());
create policy "sponsor logos committee update" on storage.objects
  for update to authenticated
  using (bucket_id = 'sponsor-logos' and public.is_committee())
  with check (bucket_id = 'sponsor-logos' and public.is_committee());
create policy "sponsor logos committee delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'sponsor-logos' and public.is_committee());

-- ---------------------------------------------------------------------------
-- 8. Security-advisor cleanup: trigger functions must not be callable via the
--    REST rpc endpoint. (get_slot_availability stays anon-executable — the
--    public slot picker depends on it.)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regprocedure('public.enforce_booking_rules()') is not null then
    revoke execute on function public.enforce_booking_rules() from anon, authenticated;
  end if;
  if to_regprocedure('public.set_updated_at()') is not null then
    revoke execute on function public.set_updated_at() from anon, authenticated;
  end if;
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from anon, authenticated;
  end if;
end $$;
