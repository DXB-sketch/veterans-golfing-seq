# SEQDVGC — Final Build: COMPLETE (code) / PENDING (migration + manual steps)

Handoff for the Final Build Brief (`DO NOT TOUCH/SEQDVGC_Final_Build_Brief.md`).
Built 2026-08-06. Verified against `DO NOT TOUCH/SEQDVGC_Final_Verification_Checklist.md`
by an adversarial multi-agent review; results summarised at the end.

---

## What already existed (verified, not rebuilt)

- **Phase 1 (content)** — all six items were already done by the earlier Phase A work:
  Keperra 30 Aug 2026 on the About timeline and (data-driven) homepage card, hat-only
  membership copy + fees-support line, GA-handicap/Golf-Links enquiry fields, real ABN
  in the footer, no SEQDVCC anywhere, Veteran Resources populated with all five orgs.
- **Phase 4 (event booking)** — fully built and **applied to the live database** on
  2026-08-04: events lifecycle (draft/published/completed + is_locked), tee_slots,
  bookings, RLS, `enforce_booking_rules` BEFORE-INSERT trigger (row-locked capacity
  check), `get_slot_availability` RPC, admin publish-&-lock UI, grouped bookings view,
  and the Keperra seed (published + locked, 10 empty slots 8:24–9:36, capacity 4, no PII).
  One deliberate deviation: full slots show disabled + "Full" rather than hidden.
- **Committee auth** was already real Supabase Auth (email + password, signups disabled)
  — no client-side password gate existed, so the Phase 3 "migrate the gate" item was a
  no-op. The old model treated *any* authenticated user as admin.
- Embedded Square payment components (react-square-web-payments-sdk), the CSP in
  `vercel.json`, and a membership/donation-only `/api/create-payment` existed from the
  earlier phase; secrets were already server-side only.

## What this build added

- **Phase 2** — merch store removed entirely: page, data file, route, nav + footer
  links, Terms "Merchandise" section, Privacy wording. Membership-hat copy untouched.
- **Phase 3** — `supabase/migrations/20260806000001_roles_members_payments_sponsors_volunteers.sql`
  (see *Migration status* below): `profiles` (role member|committee, seeded committee
  for all existing users, `on_auth_user_created` trigger, role not self-editable),
  `is_committee()`, sponsor-logos Storage bucket (public read / committee write), and
  the **RLS tightening** — every legacy `to authenticated using(true)` policy on
  events/tee_slots/bookings/enquiries/contact_messages is swept (by name pattern,
  matched against the live `pg_policies`) and replaced with committee-gated policies,
  because invited members are also "authenticated".
- **Phase 5** — `payments` table (service-role writes only; committee read; member
  reads own by email). `/api/create-payment` rewritten: purposes
  membership ($50 fixed) / donation ($5–$7,000) / sponsorship ($250–$10,000, tier
  computed server-side), `location_id` + `buyer_email_address` on the Square call,
  fresh idempotency key per request, **pre-flight check that refuses to charge if the
  recording tables aren't reachable** (so no card is ever charged without a local
  record), payments row written *before* side effects, honest `recorded`/`inviteSent`
  flags returned to the UI.
- **Phase 6** — join-and-pay flow on the Membership page (details → $50 → member row
  upserted active +1 yr → Supabase Auth invite), `/member` dashboard (status/expiry,
  editable profile, own bookings via `bookings.created_by`), `/member/welcome`
  invite landing (set password), `/api/invite-member` for committee-recorded members.
  The enquiry ("register interest") form is untouched and still writes to the
  committee view.
- **Phase 7** — donation flow: preset chips + custom amount, optional donor
  name/email, $5 minimum enforced client- and server-side.
- **Phase 8** — `sponsors` table + `public_sponsors` view (public columns of active
  rows only; contact details/amounts never anon-readable; view made explicitly
  read-only), Appendix A tier config (`src/lib/tiers.js` display / `api/_lib/tiers.js`
  authority), sponsors page ordered by tier with logo + tier badge + noopener links,
  paid become-a-sponsor flow (pending row, committee approval), Urban Fairways West End
  seeded Bronze/active in the migration.
- **Phase 9** — volunteer form on the Contact page → `volunteer_enquiries` →
  committee view. No email anywhere.
- **Phase 10** — committee area: Overview (counts landing), Events (moved to
  `/admin/events`), Bookings, Members (add paid member manually → invite; per-row
  re-invite), Enquiries (membership + volunteer + contact, each with a new/handled
  state), Sponsors (logo upload to Storage, tier, order, active toggle), Payments
  (read-only). AdminLayout now gates on `profiles.role='committee'` with a narrow
  legacy fallback (only when the profiles table doesn't exist yet). The `admin-users`
  edge function now requires a committee caller and marks accounts it creates as
  committee.

## Auth-migration decision

Committee login was already Supabase Auth, so nothing migrated. The real decision was
the **role split**: a `profiles` table keyed to `auth.uid()`, `is_committee()` as a
SECURITY DEFINER helper used by every admin policy, all existing accounts seeded as
committee, and new accounts defaulting to member via an `auth.users` trigger (the
edge function overrides to committee for volunteer accounts it creates). Member
accounts are creatable **only** via `inviteUserByEmail` — post-payment in
`/api/create-payment` or committee-triggered via `/api/invite-member`, which requires
an existing paid `members` row. Open signup remains disabled at the project level.

## RLS approach

Appendix F implemented verbatim, with these notes:

- Legacy policies granted everything to `authenticated`; the migration sweeps them by
  `pg_policies` name pattern (live names verified) — not by guessed names.
- `public_sponsors` is an owner-rights view (bypasses sponsors RLS by design, exposing
  only public columns of active rows) with ALL privileges revoked and only SELECT
  re-granted — the project's default ACL would otherwise have made the view writable.
- Member "own bookings" uses a new `bookings.created_by uuid default auth.uid()`
  (the brief's six public fields have no email); the insert policy forbids forging it.
- `members_guard` trigger stops members editing status/expiry/email/linkage while
  letting committee and server-side (no `auth.uid()`) writes through.
- `payments` has no client insert path at all; writes are service-role only.

## Post-brief changes (club-requested, 2026-08-07)

- **Membership page:** the "register interest" enquiry form is retired; the paid
  join-and-pay flow is the primary (and only) membership path. Enquiry-style forms
  now belong to volunteering on the Contact page (`/contact#volunteer`).
- **Event bookings are pay-to-book:** the booking form leads to a confirm-and-pay
  step charging green fee + cart hire + side comp as selected (full listed cart fee
  per booking). The slot is reserved first (capacity trigger), then charged — a
  declined card releases the slot; a slot that fills mid-payment is never charged.
  Free events (no fees) still book directly. Committee bookings view shows who paid
  what; **removing a paid booking does not refund it** — refunds are manual in the
  Square dashboard. Migration `20260807000001` (applied live) added the
  `event_booking` payment purpose and `bookings.paid_cents`/`square_payment_id`.

## Deviations / judgement calls

- **The migration is NOT applied to the live database** (BACKEND.md golden rule 1 +
  the brief's Manual Steps assign that to Dexter). All new features degrade gracefully
  until then, and `/api/create-payment` refuses to charge rather than charge without
  a record.
- Booking slot picker disables + labels full slots instead of hiding them (pre-existing
  Phase B deviation, kept).
- Sponsorship has a $10,000 sanity cap (not in the brief) with a "email us for more"
  message.
- Donation optional donor name/email added (brief allowed it); Donate's DGR/tax
  placeholder replaced with neutral wording making no tax-deductibility claim.
- `VITE_SQUARE_ENVIRONMENT` is read as a server-side fallback for `SQUARE_ENVIRONMENT`;
  the client SDK infers sandbox/production from the app-ID prefix.
- Wallet buttons (Apple/Google Pay) remount on amount change so the sheet never shows
  a stale amount (SDK freezes the payment request at mount).
- Member dashboard lists only bookings made while signed in (`created_by`) — anonymous
  bookings made before the member had a login won't appear.

## Outstanding manual steps for Dexter

1. **Apply the migration** — DONE 2026-08-06: `20260806000001` plus follow-up
   `20260806000002_function_execute_hardening` are applied to the live project.
   Verified live: profiles seeded committee (2), Urban Fairways visible through
   `public_sponsors` (anon sees the view row but zero rows of the base table or
   payments), sponsor-logos bucket present, legacy admin policies gone.
2. **Sponsor-logos bucket** — DONE (created by the migration, verified live).
3. Committee roles — DONE: both existing accounts seeded committee; new /admin/team
   accounts are marked committee automatically.
4. **Urban Fairways logo**: DONE — committed at `public/sponsors/urban-fairways.jpeg`
   (the migration seed references it).
5. Vercel env — DONE per Dexter (server + public vars live).
6. Supabase Auth → URL configuration: add `https://seqdvgc.com.au/member/welcome` to
   the redirect allow-list so invite emails land on the set-password page. Also enable
   leaked-password protection (one click; flagged by the security advisor).
7. **Sandbox test**: run a full membership + donation + sponsorship payment with a
   Square sandbox card before flipping `SQUARE_ENVIRONMENT=production` (and Matt
   activates the production Square account).
8. Terms/Privacy still carry bracketed placeholders awaiting Matt (refund policy, GST
   line, waiver, cookies) — now more important since real money flows. The refunds
   section especially needs real copy before launch.
9. Consider Square risk rules / per-IP throttling on `/api/create-payment` before
   production (public endpoint; card-testing surface — noted by the security review).

## Verification summary

- `npm run build` completes clean; no merch references, no old payment contract
  (`itemType`) remain.
- 4-agent adversarial review (checklist / security / frontend / payments) ran over the
  final diff. All confirmed findings were fixed: edge-function privilege escalation,
  writable `public_sponsors` view, no-op legacy policy drops, `members_guard` blocking
  service-role renewals, stale wallet amounts, charge-without-record window,
  fail-open admin gate, wildcard email matching, UTC expiry dates, and assorted copy
  honesty fixes.
- Checklist items that remain unticked are exactly the ones gated on the manual steps
  above (apply migration, bucket, sandbox payment test, Urban Fairways logo).

## 2027 go-live flag

Paid membership is built and visible (low-pressure, below the interest form). If the
club prefers to keep membership as "register interest" until early 2027, hiding the
paid section is a one-line change in `src/pages/Membership.jsx` (see the comment on
`<JoinAndPay />`). Both paths coexist by design.
