-- Booking revisions, 2026-10-19:
--   1. bookings gain email, home suburb, postcode and an email opt-in, with
--      format/length checks so a direct anon insert can't store junk. The
--      public form requires email + suburb + postcode; committee-added
--      players may leave them blank, so the columns stay nullable.
--   2. swap_bookings(): committee-only, swaps two players between tee times
--      in one transaction. A swap never changes a slot's head-count, but the
--      per-row capacity trigger can't see that mid-statement, so the swap
--      sets a transaction-local flag the trigger honours for committee only.
--   3. Retention (APP 11.2): contact details on bookings are cleared 12
--      months after the event (name + tee time kept for club history), via
--      a monthly pg_cron job.
--   4. Advisor fixes: covering indexes on foreign keys, and auth.*() calls in
--      RLS policies wrapped in (select …) so they're evaluated once per query.

-- ---------------------------------------------------------------------------
-- 1. New booking fields + sanity checks on the free-text ones.
-- ---------------------------------------------------------------------------
alter table public.bookings
  add column if not exists email text,
  add column if not exists suburb text,
  add column if not exists postcode text,
  add column if not exists email_opt_in boolean not null default false;

alter table public.bookings
  add constraint bookings_email_format
    check (email is null or (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  add constraint bookings_suburb_length
    check (suburb is null or length(suburb) between 1 and 80),
  add constraint bookings_postcode_format
    check (postcode is null or postcode ~ '^[0-9]{4}$'),
  add constraint bookings_player_name_length
    check (length(trim(player_name)) between 1 and 120),
  add constraint bookings_mobile_length
    check (mobile is null or length(mobile) <= 40),
  add constraint bookings_golf_links_length
    check (golf_links_number is null or length(golf_links_number) <= 40);

-- ---------------------------------------------------------------------------
-- 2. Swap two players between tee times (committee only).
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
  v_committee boolean := public.is_committee();
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
  -- swap_bookings() swaps two players; head-counts are unchanged, so the
  -- capacity check is skipped. Only honoured for a committee caller.
  if tg_op = 'UPDATE' and v_committee
     and coalesce(current_setting('app.swapping_bookings', true), '') = 'on' then
    return new;
  end if;
  -- The committee manages the sheet directly, so the public booking window
  -- doesn't apply to them; the capacity check below applies to everyone.
  if not v_committee then
    -- Only the payment server (service role) may stamp a booking as paid.
    if tg_op = 'INSERT' and coalesce(auth.role(), '') <> 'service_role' then
      new.paid_cents := null;
      new.square_payment_id := null;
    end if;
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

create or replace function public.swap_bookings(p_booking_a uuid, p_booking_b uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  a record;
  b record;
begin
  if not public.is_committee() then
    raise exception 'NOT_AUTHORISED';
  end if;
  select id, event_id, tee_slot_id into a from public.bookings where id = p_booking_a for update;
  select id, event_id, tee_slot_id into b from public.bookings where id = p_booking_b for update;
  if a.id is null or b.id is null or a.event_id <> b.event_id then
    raise exception 'SWAP_INVALID';
  end if;
  if a.tee_slot_id = b.tee_slot_id then
    return;
  end if;
  perform set_config('app.swapping_bookings', 'on', true);
  update public.bookings set tee_slot_id = b.tee_slot_id where id = a.id;
  update public.bookings set tee_slot_id = a.tee_slot_id where id = b.id;
  perform set_config('app.swapping_bookings', '', true);
end;
$$;

revoke all on function public.swap_bookings(uuid, uuid) from public, anon;
grant execute on function public.swap_bookings(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Retention: clear booking contact details 12 months after the event.
-- ---------------------------------------------------------------------------
create or replace function public.purge_old_booking_contact_details()
returns integer
language sql
security definer
set search_path = public
as $$
  with cleared as (
    update public.bookings b
       set email = null, mobile = null, suburb = null, postcode = null,
           golf_links_number = null, email_opt_in = false
      from public.events e
     where e.id = b.event_id
       and e.event_date < ((now() at time zone 'Australia/Brisbane')::date - interval '12 months')
       and (b.email is not null or b.mobile is not null or b.suburb is not null
            or b.postcode is not null or b.golf_links_number is not null)
    returning 1
  )
  select count(*)::int from cleared;
$$;

revoke all on function public.purge_old_booking_contact_details() from public, anon, authenticated;

create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'purge-booking-contact-details';
select cron.schedule(
  'purge-booking-contact-details',
  '0 17 1 * *', -- 3am Brisbane time on the 1st of each month (17:00 UTC)
  $$select public.purge_old_booking_contact_details()$$
);

-- ---------------------------------------------------------------------------
-- 4. Advisor fixes.
-- ---------------------------------------------------------------------------
create index if not exists bookings_event_id_idx on public.bookings (event_id);
create index if not exists bookings_tee_slot_id_idx on public.bookings (tee_slot_id);
create index if not exists tee_slots_event_id_idx on public.tee_slots (event_id);
create index if not exists members_auth_user_id_idx on public.members (auth_user_id);
create index if not exists profiles_member_id_idx on public.profiles (member_id);

alter policy "profiles own read" on public.profiles
  using (id = (select auth.uid()));
alter policy "members own read" on public.members
  using ((auth_user_id = (select auth.uid()))
         or (lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))));
alter policy "members own update" on public.members
  using ((auth_user_id = (select auth.uid()))
         or (lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))))
  with check ((auth_user_id = (select auth.uid()))
         or (lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))));
alter policy "bookings public insert" on public.bookings
  with check ((created_by is null) or (created_by = (select auth.uid())));
alter policy "bookings member read own" on public.bookings
  using (created_by = (select auth.uid()));
alter policy "payments member read own" on public.payments
  using ((payer_email is not null)
         and ((select auth.jwt() ->> 'email') is not null)
         and (lower(payer_email) = lower((select auth.jwt() ->> 'email'))));
