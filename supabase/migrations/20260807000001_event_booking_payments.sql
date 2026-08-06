-- Online payment at booking time (club decision 2026-08-07): booking an event
-- now requires paying green fee + selected extras via Square. The server
-- (service role) inserts the booking, charges, and stamps the payment here.
-- Applied to the live project on 2026-08-07.

alter table public.payments drop constraint payments_purpose_check;
alter table public.payments
  add constraint payments_purpose_check
  check (purpose in ('membership','donation','sponsorship','event_booking'));

-- Paid bookings carry their charge; null = unpaid (legacy row, or a booking
-- whose card was declined and is about to be cleaned up).
alter table public.bookings
  add column if not exists paid_cents int,
  add column if not exists square_payment_id text;
