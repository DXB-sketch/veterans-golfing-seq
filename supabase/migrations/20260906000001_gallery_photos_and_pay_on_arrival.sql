-- Site revisions, 2026-09-06 (committee requests via Matt):
--   1. gallery_photos table + a public 'gallery' storage bucket so the
--      committee can upload and manage the site's photos from the admin area
--      (photos are no longer hardcoded in the repo). Seeded with the five
--      Gold Coast Open Day photos that already ship with the site, keeping
--      their captions, placements and event link.
--   2. events.payment_mode — per-event control of how players pay for a
--      booking: must pay online to book ('online_required'), the player
--      chooses online or at the course ('online_choice', the new default),
--      or everyone pays at the course on the day ('on_arrival').
--   3. enforce_booking_rules: a direct (unpaid) client insert is rejected on
--      events that require online payment — the payment server (service
--      role) is the only way onto those sheets. Committee adds still bypass
--      the window; capacity still applies to everyone.

-- ---------------------------------------------------------------------------
-- 1. gallery_photos — committee-managed photo library.
-- ---------------------------------------------------------------------------
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_path text,   -- object path in the 'gallery' bucket (committee uploads)
  legacy_src text,   -- site-relative path for photos committed to the repo
  title text not null,
  alt text,          -- screen-reader description; falls back to title on site
  orientation text not null default 'landscape'
    check (orientation in ('landscape','portrait')),
  -- Where the photo is used beyond the gallery grid: the home hero and the
  -- About page photo are picked from here (most recently updated wins).
  placement text not null default 'gallery'
    check (placement in ('gallery','home_hero','about')),
  event_id uuid references public.events (id) on delete set null,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(image_path, legacy_src) = 1)
);

create trigger gallery_photos_updated_at
  before update on public.gallery_photos
  for each row execute function public.set_updated_at();

-- Covers the event_id foreign key (recap lookups; keeps the advisor quiet).
create index if not exists gallery_photos_event_id_idx
  on public.gallery_photos (event_id);

alter table public.gallery_photos enable row level security;
-- Anon must not touch is_committee() — its EXECUTE was revoked from anon in
-- 20260806000002, so a combined anon+authenticated policy would error out
-- for every logged-out visitor. Split reads instead.
create policy "gallery anon read" on public.gallery_photos
  for select to anon
  using (is_published);
create policy "gallery authenticated read" on public.gallery_photos
  for select to authenticated
  using (is_published or public.is_committee());
create policy "gallery committee insert" on public.gallery_photos
  for insert to authenticated with check (public.is_committee());
create policy "gallery committee update" on public.gallery_photos
  for update to authenticated
  using (public.is_committee()) with check (public.is_committee());
create policy "gallery committee delete" on public.gallery_photos
  for delete to authenticated using (public.is_committee());

-- Storage: gallery bucket — public read, committee write (same shape as
-- sponsor-logos).
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

create policy "gallery photos public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'gallery');
create policy "gallery photos committee insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_committee());
create policy "gallery photos committee update" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_committee())
  with check (bucket_id = 'gallery' and public.is_committee());
create policy "gallery photos committee delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_committee());

-- Seed: the five photos previously hardcoded in src/lib/photos.js /
-- captions.json, linked to the Gold Coast Open Day event. Consent notes per
-- the original manifest: the group banner photo has faces with consent
-- confirmed by the club (3 Aug 2026); the rest are faces-obscured or
-- from-behind shots.
do $$
declare v_event uuid;
begin
  select id into v_event from public.events
  where region = 'gold_coast' and event_date = '2026-07-31'
  limit 1;

  if not exists (select 1 from public.gallery_photos) then
    insert into public.gallery_photos
      (legacy_src, title, alt, orientation, placement, event_id, sort_order)
    values
      ('/images/events/gold-coast-open-2026/gc-open-2026-fourball-wide.jpg',
       'Four-ball on the tee',
       'Four club members lined up across the tee preparing to play, with a scenic fairway and bushland beyond',
       'landscape', 'home_hero', v_event, 1),
      ('/images/events/gold-coast-open-2026/gc-open-2026-group-banner.jpg',
       'Members group photo (with club banner)',
       'South East Queensland Defence Veterans Golf Club members gathered at the tee beside the club banner, Gold Coast Open Day',
       'landscape', 'about', v_event, 2),
      ('/images/events/gold-coast-open-2026/gc-open-2026-water-tree.jpg',
       'Tee overlooking the water hazard',
       'Two club members at the tee looking down the fairway toward a water hazard on a clear morning',
       'portrait', 'gallery', v_event, 3),
      ('/images/events/gold-coast-open-2026/gc-open-2026-hillside-tee.jpg',
       'Golfer on the tee, hillside fairway',
       'A club member addressing the ball on the tee with a grassed hill and gum trees behind',
       'portrait', 'gallery', v_event, 4),
      ('/images/events/gold-coast-open-2026/gc-open-2026-shot-tracer.jpg',
       'Tee shot with shot-tracer',
       'A club member mid-swing on the fairway, the ball''s flight traced by a red arc',
       'portrait', 'gallery', v_event, 5);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2. events.payment_mode — how players pay for a booking on this event.
--    Existing events pick up the default: the player chooses online or at
--    the course (the committee's new preference).
-- ---------------------------------------------------------------------------
alter table public.events
  add column if not exists payment_mode text not null default 'online_choice'
    check (payment_mode in ('online_required','online_choice','on_arrival'));

-- ---------------------------------------------------------------------------
-- 3. enforce_booking_rules — as before, plus: a direct client insert on a
--    pay-to-book event is rejected (EVENT_REQUIRES_PAYMENT). The payment
--    server inserts with the service role and passes; the committee bypasses
--    the public window entirely. Capacity still applies to everyone.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_booking_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity int;
  v_event_id uuid;
  v_status text;
  v_locked boolean;
  v_date date;
  v_payment_mode text;
  v_fee numeric;
  v_taken int;
begin
  if tg_op = 'UPDATE' and new.tee_slot_id = old.tee_slot_id then
    return new;
  end if;
  select ts.capacity, ts.event_id into v_capacity, v_event_id
  from public.tee_slots ts
  where ts.id = new.tee_slot_id
  for update;
  if v_event_id is null or new.event_id is distinct from v_event_id then
    raise exception 'EVENT_NOT_BOOKABLE';
  end if;
  -- The committee manages the sheet directly, so the public booking window
  -- doesn't apply to them; the capacity check below applies to everyone.
  if not public.is_committee() then
    -- Only the payment server (service role) may stamp a booking as paid —
    -- a public insert carrying paid_cents would show as "Paid online" in
    -- admin and the fee would never be collected.
    if tg_op = 'INSERT' and coalesce(auth.role(), '') <> 'service_role' then
      new.paid_cents := null;
      new.square_payment_id := null;
    end if;
    -- What THIS booking owes: green fee plus the extras it ticked.
    select e.status, e.is_locked, e.event_date, e.payment_mode,
           coalesce(e.green_fee, 0)
             + case when coalesce(new.cart_hire, false)
                    then coalesce(e.cart_fee, 0) else 0 end
             + case when coalesce(new.playing_in_comp, false)
                    then coalesce(e.side_comp, 0) else 0 end
      into v_status, v_locked, v_date, v_payment_mode, v_fee
    from public.events e where e.id = v_event_id;
    if v_status <> 'published' or not v_locked or v_date is null
       or v_date < (now() at time zone 'Australia/Brisbane')::date then
      raise exception 'EVENT_NOT_BOOKABLE';
    end if;
    -- Pay-to-book events accept bookings that owe money only from the
    -- payment server — a direct insert would skip the charge.
    if tg_op = 'INSERT' and coalesce(v_payment_mode, 'online_choice') = 'online_required'
       and v_fee > 0 and coalesce(auth.role(), '') <> 'service_role' then
      raise exception 'EVENT_REQUIRES_PAYMENT';
    end if;
  end if;
  select count(*) into v_taken from public.bookings
  where tee_slot_id = new.tee_slot_id and id <> new.id;
  if v_taken >= v_capacity then
    raise exception 'SLOT_FULL';
  end if;
  return new;
end;
$$;
