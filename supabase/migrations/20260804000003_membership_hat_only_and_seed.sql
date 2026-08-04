-- Membership is hat-only: drop apparel/delivery fields, add GA handicap + Golf Links.
-- Seed the Keperra Open Day (structure only — never any personal data).
-- Applied to the live project on 2026-08-04.
alter table public.membership_enquiries
  drop column if exists apparel_choice,
  drop column if exists apparel_size,
  drop column if exists delivery_pref,
  add column if not exists ga_handicap text,
  add column if not exists golf_links_number text;

-- The 31 July Gold Coast Open Day has been played.
update public.events
set status = 'completed', side_comp_note = 'Handicap members only'
where title = 'Gold Coast Open Day' and event_date = '2026-07-31';

-- Keperra Open Day: published + locked, 10 empty tee slots (8-minute intervals).
with ev as (
  insert into public.events
    (title, region, event_date, venue, address, course, meet_time, first_tee,
     holes, green_fee, cart_fee, side_comp, side_comp_note, description, status, is_locked)
  values
    ('Keperra Open Day', 'brisbane', '2026-08-30', 'Keperra Country Golf Club',
     'Duggan Street, Keperra QLD 4054', 'Old Course', '7:30am', '8:24am',
     18, 65, 50, 10, 'Handicap members only',
     'Our second club open day of 2026, on the Old Course at Keperra Country Golf Club. 18 holes with an optional $10 side competition for handicap members, and shared carts available. All veterans — serving and non-serving — and their families welcome.',
     'published', true)
  returning id
)
insert into public.tee_slots (event_id, tee_time, capacity, sort_order)
select ev.id, t.tee_time, 4, t.sort_order
from ev, (values
  ('8:24am', 1), ('8:32am', 2), ('8:40am', 3), ('8:48am', 4), ('8:56am', 5),
  ('9:04am', 6), ('9:12am', 7), ('9:20am', 8), ('9:28am', 9), ('9:36am', 10)
) as t(tee_time, sort_order);
