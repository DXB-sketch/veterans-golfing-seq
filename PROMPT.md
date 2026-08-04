# SEQDVGC — Claude Code Brief: Post-Review Edits + Event Booking System

**Project:** South East Queensland Defence Veterans Golf Club Inc. (SEQDVGC) website
**Stack:** React/JSX + Tailwind, deployed on Vercel. Backend: Supabase (Postgres).
**Live:** veterans-golfing-seq.vercel.app
**This brief covers:** everything actionable from Matt's latest review round that needs **no further client input**. Two phases. Run Phase A first (fast, front-end only), then Phase B (the booking system).

---

## READ FIRST (before doing anything else)

1. Read `CLAUDE.md` (if present) and the most recent `*_COMPLETE.md` handoff at the repo root.
2. Read `Context.md` (project handoff) if it's in the repo.
3. **Inspect the codebase before writing code.** You do not yet know the exact component/file names, the routing setup, the current design tokens, the build tool (Vite vs Next), or how the existing committee login works. Discover these from the actual code — do not assume. This brief tells you *what* to achieve and *where to look*; the repo tells you the specifics.
4. Match the existing design system. This site uses navy + gold with serif display headings and the club crest. **Reuse existing Tailwind theme values, colour tokens, and existing form/card/button components.** Do not introduce a new visual language, do not hardcode new hex values if the project already defines tokens, and do not pull in a new component library.

### Hard scope guards — do NOT touch any of these
- **Values wording** (Mateship/Connection/Wellbeing vs the other sets) — still unresolved with the client. Leave as-is.
- **Sponsorship / sponsor tiers** — client is still deciding. Leave as-is.
- **Square payment integration** — pending (see "Out of scope / pending" at the end). Do not build live payment links.
- **MiScore integration** — pending (club doesn't have MiScore yet). Do not add MiScore links.
- **The club's home address (7 Winnett Street, Woorim)** — this is Matt's personal home. It must **never** appear anywhere on the site. If you find it anywhere in the code, flag it; do not surface it.
- **Public phone number** — V1 has no public phone. Contact stays email + form + Facebook only.
- Anything not explicitly listed in Phase A or Phase B below.

---
---

# PHASE A — Content, copy & membership-form edits (front-end only, no DB)

**Goal:** Bring the site's content in line with Matt's review, working front-of-site to back the way he did.

By the end of Phase A:
- The About/journey timeline shows the confirmed second event (Keperra, 30 Aug 2026) instead of the "details TBC" placeholder.
- The homepage's upcoming-event card points at the next upcoming event (Keperra 30 Aug 2026), because the 31 July event has now passed.
- Membership is hat-only (no t-shirt), with the correct copy about when the hat is given and what fees support.
- The membership enquiry form collects GA-handicap and Golf Links number, and no longer asks about t-shirt/size.

---

### STEP A1 — Update the journey timeline: confirmed second event

The About page timeline currently has a **"Second club event — Late 2026 — details to be confirmed"** node. Replace it with the confirmed event using the data in **Appendix 1 (Keperra)**.

- Change the node label from "Late 2026" to **"30 August 2026"** and place it in correct chronological order (it comes after the 31 July Gold Coast node).
- Title it as a Keperra open day (e.g. *"Keperra Open Day"*).
- Write 1–2 sentences in the existing timeline tone (match the wording style of the other nodes) using the confirmed venue, and keep detail light — the full detail lives on the Events page. Do not invent facts beyond Appendix 1.

---

### STEP A2 — Homepage: point the upcoming-event card at Keperra

Today's date is past 31 July 2026, so the **31 July Gold Coast (Palmer) event has already happened**. Wherever the homepage shows an "upcoming/next event" card or hero event reference, it must now show the **next upcoming event: Keperra, 30 August 2026** (Appendix 1).

- If the next event is currently hardcoded, update it to the Keperra details.
- Keep the hero clean per the existing design (logo, tagline, one upcoming-event card, a "Join the Club" button). Do not add clutter.
- (Dynamic wiring of this card to the database is an optional enhancement in Phase B — for now a correct static value is fine.)

---

### STEP A3 — Membership page copy: hat-only + what fees support

On the "Join the Club" / membership page:

1. **Drop all "t-shirt" wording.** The `$50 per year` block currently reads *"Includes a club hat or t-shirt"* — change it to **"Includes a club hat"**. Update any other "hat or t-shirt" references on the page (e.g. a "What membership gets you" list) to hat-only.
2. Add a short line that the hat is handed over in person: **"Your club hat will be given to you at your first event."**
3. Add a short, plain sentence on what fees support (approved copy from Matt): **"Membership fees help cover administrative costs, championship accommodation and fees, and event prizes."** Place it near the price block or in the membership intro, in the existing prose style.

---

### STEP A4 — Membership enquiry form: field changes

Locate the membership enquiry form component. Current fields (from the live form) are approximately: Name, Email, Phone, Service branch\*, Playing/handicap info, **Hat or t-shirt?\***, **Size (if t-shirt)**, Pickup or delivery?\*.

Make these changes:

**Remove:**
- The **"Hat or t-shirt?"** select field.
- The **"Size (if t-shirt)"** select field.
- The **"Pickup or delivery?"** select field. (No longer needed — the hat is handed over in person at the member's first event, so there's nothing to pick up or deliver.)

**Add:**
- **"Do you have a GA handicap?"** — Yes/No (select or radio). Keep the existing field styling.
- **"Golf Links number"** — optional free-text input (allow it to be left blank; some members won't have one). Show it after / near the handicap question. Do **not** make it required.

**Add (informational text, not a field):**
- Near where the hat/shirt fields used to be: **"Your club hat will be given to you at your first event."**

**Keep as-is:** Name, Email, Phone, Service branch, and the existing free-text "Playing / handicap info" field.

**Update the submit handler / payload** so the new fields are captured wherever the form currently sends its data, and the three removed fields (hat/shirt, size, pickup/delivery) are no longer referenced (no dangling state, no console warnings).

---

### STEP A5 — Footer: club ABN (optional, low-risk)

Matt provided the club's ABN: **35 714 983 753**. Displaying an ABN in the footer is standard and expected for a registered incorporated association.

- Add to the footer, in the existing footer style: **"SEQDVGC Inc. · ABN 35 714 983 753"** (or alongside the existing copyright line).
- This is a nice-to-have; if the footer layout makes it awkward, keep it minimal. Do **not** add the physical address.

---

### ACCEPTANCE CRITERIA — PHASE A

```
[ ] Timeline node for the second event shows Keperra, 30 August 2026 — no "TBC" placeholder remains
[ ] Homepage upcoming-event card shows Keperra 30 Aug 2026 (not the past 31 July event)
[ ] No "t-shirt" or "size" wording remains anywhere on the membership page or form
[ ] Membership page shows "Includes a club hat" + "given at your first event" + the fees-support sentence
[ ] Membership form has "Do you have a GA handicap? (Y/N)" and an optional "Golf Links number" field
[ ] "Hat or t-shirt?", "Size (if t-shirt)" and "Pickup or delivery?" fields are fully removed (no dangling state/props/warnings)
[ ] Footer shows ABN 35 714 983 753 (if added)
[ ] The home address (7 Winnett St, Woorim) appears nowhere; no public phone was added
[ ] Existing design system reused — no new hex values where tokens exist, no new component library
[ ] npm run build (or the project's build command) completes without errors
```

---
---

# PHASE B — Event booking system (Supabase-backed)

**Goal:** Replace Matt's manual spreadsheet workflow with an on-site booking system. Admins build an event (custom tee slots, times, venue, fees) and lock it; the public books a tee slot from the Events page; bookings are stored on the website and viewable in the committee login — **not** in a spreadsheet, because most members don't have the Excel app.

This mirrors exactly what Matt asked for and the fields on his current Keperra bookings sheet.

### Dexter pre-flight (manual infra — do these around the Claude Code run, not client questions)
- Confirm/create the Supabase project (dev project is fine for now; the club-owned migration is a later step).
- Add Supabase env vars locally **and** in Vercel, matching the project's existing env convention (`VITE_*` or `NEXT_PUBLIC_*`).
- Run the migration SQL (Supabase dashboard SQL editor or the Supabase CLI).
- Decide/confirm the committee-login auth approach (see STEP B0).

---

### STEP B0 — Inspect current data & auth setup first

Before building anything, determine from the code:
1. **Are events currently hardcoded** (a static array/JSON) or already coming from Supabase? This decides whether B is a migration or an extension.
2. **Is Supabase already wired up** (client, env, any existing tables/hooks)? Reuse what exists.
3. **How does the existing committee login work?** Is it Supabase Auth, or a client-side password gate? This is critical because **bookings contain personal data (names + mobile numbers)** and must be protected (see B1 RLS).

State what you found, then proceed. If the committee login is only a client-side password gate, **bookings must still be protected** — the anon key must not be able to read bookings. In that case, put the committee bookings view behind **Supabase Auth** (add a committee auth account) so RLS can protect the data. Document whichever approach you take in the handoff file.

---

### STEP B1 — Database schema + Row Level Security

Create three tables. Follow the project's existing migration/naming conventions; adjust types if the project has established patterns. Recommended schema:

**`events`**
- `id` uuid pk default `gen_random_uuid()`
- `title` text not null
- `region` text — e.g. 'Brisbane' | 'Gold Coast' | 'Sunshine Coast'
- `event_date` date not null
- `venue_name` text
- `venue_address` text
- `course` text — e.g. 'Old Course'
- `meet_time` text — e.g. '7:30 AM'
- `first_tee_time` text — e.g. '8:24 AM'
- `holes` int default 18
- `green_fee` numeric
- `cart_fee` numeric
- `side_comp_fee` numeric
- `side_comp_note` text — e.g. 'Handicap members only'
- `description` text
- `status` text default 'draft' — check in ('draft','published','completed')
- `is_locked` boolean default false — true = tee-slot structure frozen, bookings open
- `created_at` timestamptz default now()

**`tee_slots`**
- `id` uuid pk default `gen_random_uuid()`
- `event_id` uuid references events(id) on delete cascade
- `tee_time` text not null — e.g. '8:24 AM'
- `capacity` int not null default 4
- `sort_order` int
- `created_at` timestamptz default now()

**`bookings`**
- `id` uuid pk default `gen_random_uuid()`
- `event_id` uuid references events(id) on delete cascade
- `tee_slot_id` uuid references tee_slots(id) on delete cascade
- `player_name` text not null
- `mobile` text — "mobile for reminder"
- `ga_handicap` boolean — GA handicap Y/N
- `golf_links_number` text — optional; text (allows blank / leading zeros)
- `playing_in_comp` boolean — the optional side comp
- `cart_hire` boolean
- `created_at` timestamptz default now()

**Enable RLS on all three.** Policies:
- `events`: public (anon) **SELECT** where `status = 'published'`; authenticated committee: **ALL**.
- `tee_slots`: public (anon) **SELECT** (for published events); authenticated committee: **ALL**.
- `bookings`: public (anon) **INSERT** only; authenticated committee: **SELECT / UPDATE / DELETE**. **No anon SELECT** — booking PII must not be publicly readable.

**Capacity / overbooking:** a naive "count bookings client-side then insert" is racy (two people can grab the last spot at once). Prefer a Postgres function/RPC (e.g. `book_tee_slot(...)`) that checks `count(bookings for slot) < capacity` and inserts within one transaction, or a trigger that rejects inserts over capacity. Implement one of these rather than relying on client-side counting. Note the chosen approach in the handoff.

---

### STEP B2 — Committee admin: create / edit / lock an event

In the existing committee login area, add an event manager. An admin can:
- **Create an event** with: title, region, date, venue name, venue address, course (optional), meet time, first tee time, holes, and fee info (green fee, cart fee, side comp fee + side-comp note), description.
- **Define tee slots:** add any number of tee slots, each with a time and a capacity (default 4). Matt's events are 8-minute intervals starting at the first tee time, but let the admin add/edit/remove slots freely — every event is different.
- **Lock the event** ("Publish & lock"): sets `status='published'` and `is_locked=true`. Once locked, the tee-slot structure is frozen and the event goes live on the public Events page with booking open. Editing after lock should be constrained (e.g. can close/complete, but not silently change slot structure out from under existing bookings) — match Matt's "customised, then locked in" intent.

**Scope note (a decision I'm making so you don't over-build):** the six booking fields are the **same for every event** (they map 1:1 to Matt's spreadsheet), so treat them as a **fixed** booking form — do **not** build a per-event custom-field builder. What's customisable per event is: tee slots/times, venue, date, and fees. Keep it to that.

Follow the project's data pattern: reads via hooks in `src/hooks/` returning `{ data, loading, error }` (or the project's established convention); mutation saves inside the interactive admin component may call Supabase directly.

---

### STEP B3 — Public Events page: "Book event" + booking form

On the Events page:
- Each **published, locked, upcoming** event (event_date ≥ today) gets a **"Book event"** button.
- Past events (event_date < today, or `status='completed'`) show as history with **no** booking button.
- The Book button opens a booking form (modal or dedicated route — match existing patterns) where the member:
  1. **Picks a tee slot** — show each slot's time and remaining spots (capacity − current bookings); disable/hide full slots.
  2. Fills the fields (all mapping to Matt's sheet):
     - **Name** (required)
     - **Mobile for reminder**
     - **Do you have a GA handicap?** (Y/N)
     - **Golf Links number** (optional; only really relevant if they have a handicap)
     - **Playing in the side comp?** (Y/N) — surface the side-comp fee + "handicap members only" note
     - **Cart hire?** (Y/N) — surface the cart fee
  3. Submits → writes to `bookings` (via the capacity-safe RPC/trigger from B1) → clear success confirmation; on a full-slot race, show a friendly "that slot just filled — pick another" message.

Show the event's fee info (green fee, cart, side comp) near the form so members know what they're up for. Match the existing card/form styling.

---

### STEP B4 — Committee bookings view

In the committee login area, for each event show its **bookings, grouped by tee slot** (the same shape as Matt's spreadsheet): time slot → players with Name, Mobile, GA Handicap Y/N, Golf Links number, Playing in comp Y/N, Cart hire Y/N. Include a per-slot count vs capacity. Committee should be able to view (and ideally edit/remove) bookings. This view must be **auth-protected** (see B0/B1) since it exposes member contact details.

---

### STEP B5 — Seed the Keperra event (structure only — NO personal data)

Create the Keperra event and its tee slots using **Appendix 1**. Set `status='published'`, `is_locked=true` so it's immediately bookable.

**Tee slots (10 slots, 8-min intervals, capacity 4 each):** 8:24, 8:32, 8:40, 8:48, 8:56, 9:04, 9:12, 9:20, 9:28, 9:36 AM.

> **PRIVACY — important:** Matt's current spreadsheet contains real members' names, mobile numbers and Golf Links numbers. **Do NOT import or hardcode any of that personal data** into the codebase, migration, or seed. Seed **empty** tee slots only. Real bookings get entered through the app (or imported separately by the committee), never committed to the repo.

*(Optional)* Also seed the past **Gold Coast / Palmer event** (Appendix 2) as `status='completed'` so the Events page shows one upcoming + one past event. No tee slots or bookings needed for it.

---

### ACCEPTANCE CRITERIA — PHASE B

```
[ ] Stated findings from B0 (hardcoded vs DB events; existing Supabase; committee auth type)
[ ] events, tee_slots, bookings tables exist with RLS enabled
[ ] RLS verified: anon can SELECT published events/slots and INSERT a booking, but CANNOT SELECT bookings
[ ] Overbooking is prevented server-side (RPC or trigger), not just client-side counting
[ ] Committee can create an event, add tee slots with times/capacity, set fees, and "Publish & lock" it
[ ] Locked event appears on the public Events page with a working "Book event" button
[ ] Booking form collects all six spreadsheet fields; tee-slot picker shows remaining spots and hides full slots
[ ] A submitted booking writes to the DB and shows a success confirmation
[ ] Committee bookings view lists bookings grouped by tee slot, auth-protected
[ ] Keperra 30 Aug 2026 event is seeded with 10 empty tee slots (8:24–9:36) and correct fees ($65/$50/$10)
[ ] NO real member names/mobiles/Golf Links numbers committed anywhere in the repo or migration
[ ] Existing design system reused; no new hex where tokens exist; no new component library
[ ] npm run build (or project build) completes without errors
```

---
---

## OUT OF SCOPE / PENDING (do not build — waiting on the client or on info)

- **Square payments** — Matt is creating the Square items ($50 membership, $10 comp fee, merch) and will send Dexter the payment-link URLs. Until those URLs exist, **do not** add live Square buttons. If you want placeholders, they must be clearly disabled/marked TODO — do not fabricate links.
- **MiScore** — the club doesn't have MiScore set up yet and there's no URL. Decision is to **hyperlink** to their MiScore page later (like the BribieGolf site), not rebuild it. Nothing to add now.
- **Sponsorship / sponsor tiers** — Matt is still working it out with the committee.
- **Values canonical set** — still unresolved; leave existing wording untouched.
- **Importing existing spreadsheet bookings** — deliberately excluded (PII). Committee can enter/import separately.

---

## WORKING NOTES

- **Two commits minimum:** land Phase A as its own commit(s) before starting Phase B, so the quick content wins are shippable independently.
- **Don't rebuild what works.** The committee login, the membership page, and the Events page already exist — extend them, don't recreate them.
- **Reuse, don't reinvent, styling.** Pull colours/spacing/typography from the existing Tailwind config and existing components. The new event card, booking form, and admin forms should look like they were always part of this site.
- **Supabase gotchas:** if any column is `jsonb`, Supabase returns it already-parsed — don't `JSON.parse` it. Only `JSON.stringify` when writing to `text` columns. Consider RLS on every new query.
- **Privacy is non-negotiable here** — this is a veterans' club and the data includes personal contact details. Bookings must never be publicly readable, and the home address must never appear on the site.

When the work is complete, write **`SEQDVGC_EDITS_COMPLETE.md`** at the repo root covering: what was changed in Phase A, what was built in Phase B, the B0 findings, any Supabase/RLS/auth decisions and why, any deviations from this brief, and what the next round needs to know (Square links, MiScore, sponsorship).

---

## APPENDIX 1 — Keperra event (confirmed, from the flyer + booking sheet + MiScore)

```
Title:            Keperra Open Day  (second club open day of 2026)
Region:           Brisbane
Date:             30 August 2026  (2026-08-30)
Venue:            Keperra Country Golf Club
Address:          Duggan Street, Keperra QLD 4054
Course:           Old Course
Meet time:        7:30 AM
First tee:        8:24 AM
Holes:            18
Green fee:        $65
Shared cart:      $50
Side comp fee:    $10  (optional; handicap members only)
Audience:         All veterans (serving and non-serving) and family members welcome
Tee slots:        8:24, 8:32, 8:40, 8:48, 8:56, 9:04, 9:12, 9:20, 9:28, 9:36 AM
                  (10 slots, 8-min intervals, capacity 4 each = 40 players)
Booking fields:   Name · Mobile for reminder · GA Handicap Y/N ·
                  Golf Links number (optional) · Playing in comp Y/N · Cart hire Y/N
Status:           published + locked (bookable now)
```

## APPENDIX 2 — Gold Coast / Palmer event (past — optional seed as 'completed')

```
Title:            Gold Coast Open Day  (first official open day)
Region:           Gold Coast
Date:             31 July 2026  (2026-07-31) — already passed
Venue:            Palmer Gold Coast Golf Course
Address:          Ron Penhaligon Way, Robina QLD
Meet time:        8:30 AM
First tee:        9:04 AM
Holes:            18
Green fee:        $115  (shared cart)
Side comp fee:    $10  (handicap only)
Status:           completed  (no booking button, no tee slots needed)
```
