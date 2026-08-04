-- Events gain a publish lifecycle plus the booking-era columns.
-- Applied to the live project on 2026-08-04.
alter table public.events
  add column if not exists course text,
  add column if not exists cart_fee numeric,
  add column if not exists side_comp_note text,
  add column if not exists is_locked boolean not null default false,
  add column if not exists is_full boolean not null default false;

-- Preserve the old manual "full" flag, then migrate status to the new lifecycle:
-- draft (hidden from the public) | published (live) | completed (history).
update public.events set is_full = true where status = 'full';
alter table public.events drop constraint if exists events_status_check;
update public.events set status = case
  when status = 'past' then 'completed'
  when status in ('upcoming','full') then 'published'
  else status end;
alter table public.events
  add constraint events_status_check check (status in ('draft','published','completed'));
alter table public.events alter column status set default 'draft';

-- Public must never see drafts; committee (authenticated) sees everything.
drop policy if exists "events public read" on public.events;
create policy "events public read" on public.events
  for select to anon using (status <> 'draft');
create policy "events admin read" on public.events
  for select to authenticated using (true);
