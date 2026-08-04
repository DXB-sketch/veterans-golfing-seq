# SEQDVGC — Self-Verification Checklist

Work through this **after** implementing the brief. Tick each box only after you've actually verified it (checked the code, run the build, or tested the behaviour — not just assumed). Report the results back at the end, calling out anything unchecked with a reason.

---

## Phase A — content & membership form

- [ ] **Timeline** — the second-event node reads **Keperra, 30 August 2026**; the "Late 2026 / details TBC" placeholder is gone; the node sits in correct date order (after 31 July).
- [ ] **Homepage** — the upcoming/next-event card shows **Keperra 30 Aug 2026**, not the now-past 31 July event.
- [ ] **Membership page** — no "t-shirt" or "size" wording remains; reads **"Includes a club hat"**.
- [ ] **Membership page** — includes **"Your club hat will be given to you at your first event."**
- [ ] **Membership page** — includes the fees-support line: administrative costs, championship accommodation and fees, event prizes.
- [ ] **Membership form** — **"Do you have a GA handicap? (Y/N)"** field present.
- [ ] **Membership form** — **"Golf Links number"** field present and **optional** (submits fine when blank).
- [ ] **Membership form** — **"Hat or t-shirt?"**, **"Size (if t-shirt)"** and **"Pickup or delivery?"** fully removed; no leftover state, props, or console warnings referencing them.
- [ ] **Membership form** — submit payload updated: new fields captured, removed fields no longer sent.
- [ ] **Footer** — ABN shows as **35 714 983 753** (if added).

## Phase B — booking system

- [ ] **B0 findings stated:** events hardcoded vs DB? Supabase already wired? Committee auth type (Supabase Auth vs client-side gate)?
- [ ] Tables `events`, `tee_slots`, `bookings` created with the intended columns.
- [ ] **RLS enabled** on all three tables.
- [ ] **RLS behaviour verified** (test with the anon key):
  - [ ] anon **can** SELECT a published event and its tee slots
  - [ ] anon **can** INSERT a booking
  - [ ] anon **cannot** SELECT any row from `bookings`
  - [ ] anon **cannot** SELECT/modify draft events
- [ ] **Overbooking prevented server-side** (RPC or trigger) — filling the last spot in two near-simultaneous requests does not exceed capacity.
- [ ] **Admin create event** works: title, region, date, venue, course, meet/first-tee times, holes, fees (green/cart/side-comp + note), description.
- [ ] **Admin tee slots** — can add/edit/remove slots with time + capacity.
- [ ] **Publish & lock** sets `status='published'` + `is_locked=true`; event then appears publicly and structure is frozen.
- [ ] **Booking fields are a fixed set** (no per-event custom-field builder was built).
- [ ] **Public Events page** — published/locked/upcoming events show a working **"Book event"** button.
- [ ] **Past events** (date < today / completed) show **no** booking button.
- [ ] **Booking form** — tee-slot picker shows remaining spots; full slots are hidden/disabled.
- [ ] **Booking form** collects all six fields: Name, Mobile, GA Handicap Y/N, Golf Links (optional), Playing in comp Y/N, Cart hire Y/N.
- [ ] **Fees shown** near the booking form (green fee, cart, side comp + "handicap members only").
- [ ] **Successful booking** writes to the DB and shows a clear confirmation; full-slot race shows a friendly "pick another slot" message.
- [ ] **Committee bookings view** lists bookings grouped by tee slot with count vs capacity, and is auth-protected.
- [ ] **Keperra seeded**: event present, `published`+`locked`, 10 empty tee slots (8:24–9:36 @ 8 min), fees $65 / $50 / $10.
- [ ] **(Optional)** Palmer 31 July seeded as `completed`.

## Data flow / code quality

- [ ] Reads go through the project's data pattern (hooks in `src/hooks/` returning `{data, loading, error}`, or the project's existing convention).
- [ ] `jsonb` columns (if any) are read as already-parsed values — no `JSON.parse` on them; `JSON.stringify` only used for `text` columns.
- [ ] New components reuse existing Tailwind tokens/components; **no new hex values** where tokens already exist; **no new component library** added.
- [ ] Env vars follow the project's convention (`VITE_*` or `NEXT_PUBLIC_*`) and are set locally + in Vercel.

## Privacy & scope guards

- [ ] **No real member data** (names / mobiles / Golf Links numbers) from the spreadsheet is committed anywhere — repo, migration, or seed.
- [ ] **Bookings are never publicly readable** (confirmed via the RLS check above).
- [ ] The home address **"7 Winnett Street, Woorim"** appears **nowhere** in the site or code.
- [ ] **No public phone number** was added.
- [ ] **Nothing was built** for Square, MiScore, sponsorship, or the values wording.
- [ ] No functionality outside Phase A / Phase B was changed.

## Build & handoff

- [ ] `npm run build` (or the project's build command) completes with **no errors**.
- [ ] No new console errors/warnings introduced on the affected pages.
- [ ] **`SEQDVGC_EDITS_COMPLETE.md`** written at the repo root: Phase A changes, Phase B build, B0 findings, Supabase/RLS/auth decisions, deviations, and what the next round needs (Square links, MiScore, sponsorship, pickup/delivery decision).
