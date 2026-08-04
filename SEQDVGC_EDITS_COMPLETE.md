# SEQDVGC — Post-Review Edits + Event Booking System — COMPLETE

**Date:** 4 August 2026 · **Brief:** `PROMPT.md` · **Verified against:** `SEQDVGC_Verification_Checklist.md`

---

## Phase A — content, copy & membership form (commit 1)

- **Journey timeline (`src/pages/About.jsx`):** the "Late 2026 / Second club event / details TBC" node is now **"30 August 2026 — Keperra Open Day"**, in correct order after the 31 July Gold Coast node, matching the existing node tone.
- **Homepage:** no code change needed for the next-event card — it is DB-driven (first non-finalised event) and now shows Keperra because the event is seeded and published (see Phase B). The membership teaser blurb was updated to hat-only.
- **Membership page (`src/pages/Membership.jsx`):**
  - Gold price panel: "Includes a club hat"; benefits list is hat-only.
  - Added: "Your club hat will be given to you at your first event." (as info text in the form, replacing the removed fields).
  - Added the approved fees line to the intro: "Membership fees help cover administrative costs, championship accommodation and fees, and event prizes."
  - Form: removed "Hat or t-shirt?", "Size (if t-shirt)" and "Pickup or delivery?" (no dangling state/payload refs). Added "Do you have a GA handicap?" (Yes/No select, required) and optional "Golf Links number" (free text, submits fine blank).
  - Payload now sends `ga_handicap` + `golf_links_number`; the three old columns were dropped from `membership_enquiries` (table had 0 rows).
- **Committee enquiries view (`AdminSubmissions.jsx`):** shows GA handicap + Golf Links number instead of the hat/size/delivery rows.
- **Footer:** real ABN — "· ABN 35 714 983 753" (placeholder removed).
- **Small consistency fixes (deliberate, minor deviations):** `Merch.jsx`, `Terms.jsx` and the Home teaser also said membership includes "a club hat or t-shirt" — updated to hat-only so no page contradicts the corrected offer. `Privacy.jsx`'s "information we collect" section was updated to match the new membership form and to disclose booking data (it previously described the removed apparel/delivery fields). `Terms.jsx` still contains an "[ABN: ______]" placeholder in its intro if Matt wants it there too.

## Phase B — event booking system (commit 2)

### B0 findings (stated per brief)
1. **Events were already DB-driven**, not hardcoded — Supabase `events` table → `src/lib/events.js` → `useEvents` hook. Phase B extended this rather than migrating.
2. **Supabase was already wired**: Vite env convention (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`), client in `src/lib/supabase.js`, RLS already on all existing tables. Same env vars are already set in Vercel (the live site reads events from the DB); **no new env vars were introduced**.
3. **Committee login is real Supabase Auth** (email/password; any authenticated user = admin; public signups disabled) — not a client-side gate — so booking PII is protected by RLS tied to the `authenticated` role.

### Database (applied to the live project; SQL committed under `supabase/migrations/`)
- **`events`** gained `course`, `cart_fee`, `side_comp_note`, `is_locked`, `is_full`. The `status` column changed meaning: it is now the lifecycle **`draft` | `published` | `completed`** (old "spots" meaning moved to the `is_full` boolean; existing rows migrated). Timing (Upcoming / On now / Finalised) is still derived client-side in AEST; `completed` forces Finalised.
- **`tee_slots`** and **`bookings`** created per the brief's schema (booking fields are the fixed six — no per-event field builder).
- **RLS** (verified live with the anon key, not just by reading policies):
  - anon **can** read published/completed events + their tee slots; **cannot** see `draft` events (returns empty), **cannot** update/delete anything (PATCH silently affects 0 rows).
  - anon **can** INSERT a booking (tested: 201) but **cannot** SELECT bookings (returns `[]` even with rows present).
- **Overbooking is prevented server-side**: a `BEFORE INSERT` trigger (`enforce_booking_rules`, SECURITY DEFINER) takes a `FOR UPDATE` row lock on the tee slot — serialising simultaneous requests — then checks count < capacity and that the event is published + locked + not past (AEST). Verified live: 4 inserts succeed, the 5th fails with `SLOT_FULL`; booking a completed event fails with `EVENT_NOT_BOOKABLE`. Chosen over an RPC so the brief's "anon INSERT" policy stays honest — clients insert normally and cannot bypass the check. All test rows were deleted afterwards.
- **Availability without PII**: `get_slot_availability(event_id)` SECURITY DEFINER function returns slot times + counts only, so the public slot picker never reads the bookings table.

### Front-end
- **Data layer:** `src/lib/bookings.js` + `src/hooks/useBookings.js` (same `{data, loading, error}` pattern as `useEvents`); `mapEvent` gained `course`, `cartFee`, `sideCompNote`, `lifecycle`, `isLocked`, `bookable`.
- **Public (`EventDetail.jsx`, `EventCard.jsx`):** published + locked + upcoming events show **"Book event"** buttons (homepage card + Events list) linking to `/events/:id#book`, and a booking section on the event page: fee summary (green fee / cart / side comp + "Handicap members only" note), tee-slot picker showing remaining spots with full slots disabled, the six fixed fields, success confirmation, and a friendly "That slot just filled up — please pick another time" + auto-refresh on a lost race. Past/completed events keep the existing "This one's been played" state with no booking UI.
- **Committee admin:**
  - `AdminEventForm.jsx`: new Course / Cart hire / Side comp note fields; new events save as **drafts** (clearly labelled as not on the website); tee-slot editor (add/edit/remove, capacity default 4) while draft; confirm-gated **"Publish & lock"** (slots are saved while still draft, then the event flips live — a half-failed publish can't strand a live event with a broken tee sheet); after locking, slots render read-only while other fields stay editable; delete warns bookings go too.
  - `AdminBookings.jsx` (new, auth-gated at `/admin/events/:id/bookings`, linked from the events list): bookings grouped by tee slot with per-slot "X of Y spots taken", all six fields per player, confirm-gated Remove, and a total-players line — the spreadsheet replacement.
- **Seeded:** Keperra Open Day (30 Aug 2026, Brisbane, Keperra Country Golf Club, Old Course, meet 7:30am, first tee 8:24am, $65 / $50 cart / $10 side comp "Handicap members only") — `published` + `is_locked`, **10 empty tee slots** 8:24–9:36am @ 8 min, capacity 4. Gold Coast (31 July) set to `completed`. **No real member data anywhere** — spreadsheet import deliberately excluded per the brief.

### Deviations from the brief
- Overbooking guard is a **trigger**, not an RPC (reason above — keeps anon INSERT policy real while making bypass impossible).
- The brief's suggested `meet_time`/`first_tee`/`venue_name` column names were adapted to the table's existing columns (`meet_time`, `first_tee`, `venue`); `holes` etc. reused. Booking Yes/No fields stored as booleans per the brief's schema.
- Hat-only wording was also fixed on Merch/Terms/Home/Privacy (details in Phase A above) — these restated the membership offer and would otherwise have contradicted the approved copy.

## For the next round
- **Square:** payment links pending from Matt ($50 membership, $10 comp fee, merch). Existing inert Square shells untouched; nothing new built.
- **MiScore:** nothing built; plan remains a simple hyperlink once the club's MiScore page exists.
- **Sponsorship tiers & values wording:** untouched, still with the client.
- **Spreadsheet bookings:** enter via the admin UI or import separately — never commit them.
- **Terms/Privacy placeholders:** bracketed items (renewal terms, Terms ABN slot) still await Matt's copy.
- If the committee ever needs to **unlock** a published event's tee sheet (e.g. a venue reshuffle), that's deliberately not in the UI — do it in Supabase directly (`is_locked = false`, ideally after clearing bookings with the players told).
