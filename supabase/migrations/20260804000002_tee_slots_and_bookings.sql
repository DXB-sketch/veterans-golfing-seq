-- Tee slots + bookings for the on-site event booking system.
-- Applied to the live project on 2026-08-04.
create table public.tee_slots (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  tee_time text not null,
  capacity int not null default 4 check (capacity > 0),
  sort_order int,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  tee_slot_id uuid not null references public.tee_slots(id) on delete cascade,
  player_name text not null,
  mobile text,
  ga_handicap boolean,
  golf_links_number text,
  playing_in_comp boolean,
  cart_hire boolean,
  created_at timestamptz not null default now()
);

alter table public.tee_slots enable row level security;
alter table public.bookings enable row level security;

-- Slots of non-draft events are public; committee manages them.
create policy "tee slots public read" on public.tee_slots
  for select to anon
  using (exists (select 1 from public.events e where e.id = event_id and e.status <> 'draft'));
create policy "tee slots admin all" on public.tee_slots
  for all to authenticated using (true) with check (true);

-- Bookings hold PII: the public may only insert; never read.
create policy "bookings public insert" on public.bookings
  for insert to anon, authenticated with check (true);
create policy "bookings admin read" on public.bookings
  for select to authenticated using (true);
create policy "bookings admin update" on public.bookings
  for update to authenticated using (true) with check (true);
create policy "bookings admin delete" on public.bookings
  for delete to authenticated using (true);

-- Capacity + bookability are enforced here, not client-side. SECURITY DEFINER
-- so the check can see all bookings despite RLS; the row lock on the tee slot
-- serialises two people grabbing the last spot at once.
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
  v_taken int;
begin
  select ts.capacity, ts.event_id into v_capacity, v_event_id
  from public.tee_slots ts
  where ts.id = new.tee_slot_id
  for update;
  if v_event_id is null or new.event_id is distinct from v_event_id then
    raise exception 'EVENT_NOT_BOOKABLE';
  end if;
  select e.status, e.is_locked, e.event_date into v_status, v_locked, v_date
  from public.events e where e.id = v_event_id;
  if v_status <> 'published' or not v_locked or v_date is null
     or v_date < (now() at time zone 'Australia/Brisbane')::date then
    raise exception 'EVENT_NOT_BOOKABLE';
  end if;
  select count(*) into v_taken from public.bookings where tee_slot_id = new.tee_slot_id;
  if v_taken >= v_capacity then
    raise exception 'SLOT_FULL';
  end if;
  return new;
end;
$$;

create trigger bookings_enforce_rules
  before insert on public.bookings
  for each row execute function public.enforce_booking_rules();

-- Anon-safe availability: slot times and counts only, never player details.
create or replace function public.get_slot_availability(p_event_id uuid)
returns table (id uuid, tee_time text, capacity int, sort_order int, spots_taken bigint)
language sql
stable
security definer
set search_path = public
as $$
  select ts.id, ts.tee_time, ts.capacity, ts.sort_order, count(b.id) as spots_taken
  from public.tee_slots ts
  join public.events e on e.id = ts.event_id
  left join public.bookings b on b.tee_slot_id = ts.id
  where ts.event_id = p_event_id and e.status <> 'draft'
  group by ts.id, ts.tee_time, ts.capacity, ts.sort_order
  order by ts.sort_order nulls last, ts.tee_time;
$$;

revoke all on function public.get_slot_availability(uuid) from public;
grant execute on function public.get_slot_availability(uuid) to anon, authenticated;
