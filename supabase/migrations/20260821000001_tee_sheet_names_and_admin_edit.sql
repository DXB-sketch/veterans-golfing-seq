-- Tee sheet revisions, 2026-08-21:
--   1. get_slot_players: anon-safe list of who's booked each slot, first
--      initial + last name only, so people booking can see who they'd play
--      with. Mobiles, Golf Links numbers and full first names stay private.
--   2. enforce_booking_rules now also lets the committee add players outside
--      the public booking window (capacity still applies to everyone), and
--      fires when a booking is moved to another slot so a move can't
--      overfill it.

create or replace function public.get_slot_players(p_event_id uuid)
returns table (tee_slot_id uuid, display_name text)
language sql
stable
security definer
set search_path = public
as $$
  select b.tee_slot_id,
         case
           when array_length(p.parts, 1) >= 2
             then upper(left(p.parts[1], 1)) || '. ' || p.parts[array_length(p.parts, 1)]
           else p.parts[1]
         end as display_name
  from public.bookings b
  join public.events e on e.id = b.event_id
  cross join lateral (
    select regexp_split_to_array(trim(b.player_name), '\s+') as parts
  ) p
  where b.event_id = p_event_id and e.status <> 'draft'
  order by b.created_at;
$$;

revoke all on function public.get_slot_players(uuid) from public;
grant execute on function public.get_slot_players(uuid) to anon, authenticated;

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
    select e.status, e.is_locked, e.event_date into v_status, v_locked, v_date
    from public.events e where e.id = v_event_id;
    if v_status <> 'published' or not v_locked or v_date is null
       or v_date < (now() at time zone 'Australia/Brisbane')::date then
      raise exception 'EVENT_NOT_BOOKABLE';
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

drop trigger if exists bookings_enforce_rules on public.bookings;
create trigger bookings_enforce_rules
  before insert or update of tee_slot_id on public.bookings
  for each row execute function public.enforce_booking_rules();
