# SEQDVGC — BACKEND.md

**Supabase backend + volunteer admin ("V2"). Technical build spec for Claude Code.**

Read this together with `Context.md` (business requirements) and `DESIGN.md` (visual system). This file covers everything those two don't: the database, security, auth, admin page, form handling, and keeping the free-tier project alive. Where this file and Context.md disagree on detail, **this file wins** for anything technical.

The front-end already exists (React on Vercel, deployed from this repo). **This phase adds a backend and wires the existing pages to it — it does not rebuild the UI.**

---

## 0. Golden rules (read first)

1. **Show me the migration SQL and the RLS policies before applying anything.** Output them for review first. Do not push schema changes or run migrations against the live database until I've approved them.
2. **RLS is the security boundary, not an optional extra.** The anon/publishable key ships in the browser. Row Level Security is the *only* thing stopping the public from writing to or wiping these tables. Every table gets RLS enabled with explicit policies (§3). No table is left open.
3. **Never put the `service_role` key in client/front-end code or commit it to the repo.** Front-end uses the anon key only. The service key is for server-side jobs (backups) as a GitHub secret, nowhere else.
4. **Detect the framework first.** Read the repo, determine Vite vs Next.js (vs other), and use the correct env-var prefix and serverless/function location for that stack. State what you detected before writing code.
5. **Don't rebuild the front-end.** Reuse the existing components and the `DESIGN.md` tokens. Wire existing pages to live data; only build genuinely new UI (the admin page, form handlers).
6. **Don't invent data.** Only the Gold Coast Open Day is a real, fully-specified event. The second 2026 event is TBC — leave it out.

---

## 1. Environment & project setup

- The Supabase project lives in the **club's own account** (owned by the club, same principle as the domain). I'll provide the **project URL** and **anon/publishable key** — ask me for them if they're not already in the env.
- Set them as env vars with the **correct prefix for the detected framework** (e.g. `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` for Vite, `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Next).
- Add a `.env.example` listing the required vars (names only, no values). Confirm `.env` is in `.gitignore`.
- Tell me **exactly which env vars to add in the Vercel dashboard**, and where.
- **Migrations:** prefer Supabase CLI migration files committed under `supabase/migrations/`. If the project isn't linked to the CLI in this repo, instead output the complete SQL for me to run in the Supabase dashboard SQL editor, clearly labelled and in order.

---

## 2. Database schema

Three tables. Use `text` columns with `CHECK` constraints for the constrained fields (easier to extend later than Postgres enums). All ids `uuid` default `gen_random_uuid()`. All timestamps `timestamptz`.

### `events`
| column | type | notes |
|---|---|---|
| id | uuid pk | default gen_random_uuid() |
| region | text | CHECK in ('brisbane','sunshine_coast','gold_coast') |
| title | text | |
| event_date | date | |
| venue | text | |
| address | text | |
| meet_time | text | e.g. "8:30am" |
| first_tee | text | e.g. "9:04am" |
| holes | int | |
| green_fee | numeric | |
| side_comp | numeric | nullable |
| status | text | CHECK in ('upcoming','full','past'), default 'upcoming'. Now tracks **spots only** ('upcoming' = taking players, 'full'); 'past' is legacy and no longer set by the admin UI. Timing (Upcoming / On now / Finalised) is derived client-side from `event_date` + `meet_time`/`first_tee` in Australia/Brisbane time (AEST, UTC+10, no DST). |
| description | text | |
| sponsor | text | nullable |
| image_url | text | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now(), auto-update via trigger |

### `membership_enquiries`
`id`, `name`, `email`, `phone`, `service_branch`, `playing_info`, `apparel_choice`, `apparel_size`, `delivery_pref`, `created_at` (default now()).

### `contact_messages`
`id`, `name`, `email`, `message`, `created_at` (default now()).

### Seed row (real event — insert into `events`)
Gold Coast Open Day · region `gold_coast` · date `2026-07-31` · venue "Palmer Gold Coast Golf Course" · address "Ron Penhaligon Way, Robina QLD" · meet_time "8:30am" · first_tee "9:04am" · holes 18 · green_fee 115 · side_comp 10 · status `upcoming` · sponsor "Palmer Gold Coast" · description: short blurb ("All veterans — serving and non-serving — and their families welcome.").

---

## 3. Row Level Security (the critical part)

Enable RLS on **all three tables**, then add these policies. The intent:

- **`events` — public read, admin write.**
  - `SELECT`: allowed for everyone (anon + authenticated).
  - `INSERT` / `UPDATE` / `DELETE`: allowed only for authenticated users.
- **`membership_enquiries` — anon can submit, only admins can read.**
  - `INSERT`: allowed for anon (and authenticated).
  - `SELECT`: authenticated only. No `UPDATE`/`DELETE` for anon.
- **`contact_messages` — same pattern as enquiries.**
  - `INSERT`: anon allowed. `SELECT`: authenticated only.

This means a random visitor can view events and submit a form, but cannot read other people's submissions or modify anything. Example shape (adapt to final table/column names, show me before applying):

```sql
-- events: public read
alter table events enable row level security;

create policy "events public read"
  on events for select
  to anon, authenticated
  using (true);

create policy "events admin write"
  on events for all
  to authenticated
  using (true) with check (true);

-- enquiries: anon insert only, admin read
alter table membership_enquiries enable row level security;

create policy "enquiries anon insert"
  on membership_enquiries for insert
  to anon, authenticated
  with check (true);

create policy "enquiries admin read"
  on membership_enquiries for select
  to authenticated
  using (true);
```

(Apply the same insert-only / authenticated-read pair to `contact_messages`.)

After building, verify by attempting an anon write to `events` and an anon read of `membership_enquiries` — both must fail.

---

## 4. Authentication (admin access)

- Use **Supabase Auth, email + password.** Do **not** build a shared hardcoded password or store credentials in the repo.
- I will create the one or two volunteer admin accounts manually in the Supabase dashboard. Don't build a public sign-up flow — there's no self-registration for admins.
- The admin route must: redirect unauthenticated users to a login screen, gate all admin UI behind an active session, and provide a clean sign-out.

---

## 5. Admin page (`/admin`)

A simple, mobile-friendly CRUD interface aimed at a **non-technical volunteer**. Style it with the existing `DESIGN.md` tokens and components.

- **Events:** list all events; create / edit / delete. Form fields map to the `events` columns, with:
  - a date picker for `event_date`,
  - dropdowns for `region` and `status` (status = spots only: taking players / full — timing is automatic),
  - plain-language labels (not column names),
  - a **confirm step before delete**,
  - plain success/error messages ("Event saved", "Couldn't save — check your connection" — never a raw Postgres error).
- **Submissions (read-only):** a simple view of `membership_enquiries` and `contact_messages` so volunteers can see who's reached out. Newest first.
- Keep it forgiving: a volunteer should be able to add an event in under a minute without help.

---

## 6. Wiring the existing front-end to live data

- **Home** "next event" and the **Events page** read live from `events` via the anon key (RLS-protected), filterable by region and derived timing status (Upcoming / On now / Finalised, computed from event date + times in AEST), sorted sensibly (current by date ascending; finalised by date descending). Friendly empty state: "No events listed yet — check back soon or follow us on Facebook."
- **Membership** form inserts into `membership_enquiries`; **Contact** form inserts into `contact_messages`. Validate client-side, confirm success in plain language, handle failure gracefully.
- **No payment handling anywhere.** Square is a later phase. Forms capture info only.
- Must scale to the 2027 load (~25 events/year across three regions + a championship) without layout or query changes.

---

## 7. Keep-alive (free-tier projects pause after 7 days idle)

Free Supabase projects are paused after one week without database activity, which would take the public site's events offline until manually resumed. Prevent this:

- Add a **GitHub Action** (not Vercel cron — this repo may share a Vercel account with other projects) that runs on a schedule a few times a week (e.g. `cron: '0 6 * * 1,4'` — Mondays and Thursdays).
- The job makes a trivial authenticated-anon request (a `select` of one row from `events`) against the Supabase REST endpoint, enough to reset the inactivity timer.
- Store `SUPABASE_URL` and `SUPABASE_ANON_KEY` as **GitHub Actions secrets**.

---

## 8. Backups (free tier keeps none)

The free tier has zero backup retention, and the events data is volunteer-entered — so add cheap insurance:

- A **weekly GitHub Action** that exports all three tables to timestamped JSON (or CSV) and commits them to a `/backups` folder in the repo (or uploads as a workflow artifact).
- This job may use the **`service_role` key** stored as a **GitHub Actions secret** (server-side, never in client code) to read all rows reliably.
- Keep it simple: a small Node script selecting `*` from each table and writing the files.

---

## 9. Secrets checklist

| Secret | Where it lives | Never |
|---|---|---|
| Supabase URL | env var (framework prefix) + Vercel + GitHub secret | — |
| Anon / publishable key | env var (framework prefix) + Vercel + GitHub secret | fine to expose (RLS protects data) |
| `service_role` key | **GitHub Actions secret only** (backup job) | never in front-end, never committed |
| Admin login credentials | created by me in Supabase dashboard | never in the repo |

Confirm `.env` is gitignored and add `.env.example`.

---

## 10. Suggested build order

1. Confirm detected framework + env-var setup; add Supabase client.
2. Write schema migration + RLS policies + seed row → **show me for approval before applying.**
3. Apply (CLI or dashboard SQL), then verify RLS (anon write fails, anon read of submissions fails).
4. Auth + login screen + gated `/admin` shell.
5. Admin events CRUD (create/edit/delete + confirm-delete + friendly messages).
6. Admin read-only submissions view.
7. Wire Home + Events pages to live `events` data (filters, sort, empty state).
8. Wire Membership + Contact forms to their tables.
9. Keep-alive GitHub Action.
10. Weekly backup GitHub Action.
11. Tell me the exact env vars to set in Vercel + GitHub, and confirm the deploy reads live data.

---

*Anything genuinely ambiguous — ask me before guessing. The three things most worth pausing on: the final RLS policies (§3), the framework detection (§0.4), and anything that would touch the live database irreversibly.*

---

## 11. Addendum, 2026-08-21: tee sheet names + committee editing

- New RPC `get_slot_players(p_event_id uuid)` (SECURITY DEFINER, granted to anon + authenticated): returns `tee_slot_id` + `display_name` for every booking on a non-draft event, where `display_name` is **first initial + last name only** (e.g. "D. Bell"). This is the only public window into `bookings`; mobiles, Golf Links numbers and full first names remain committee-only. Shown on the public event page under the tee slot picker.
- `enforce_booking_rules` updated: fires on INSERT and on UPDATE of `tee_slot_id` (so moving a player can't overfill a slot); committee members (`is_committee()`) bypass the published/locked/date booking-window check but **capacity still applies to everyone**.
- Admin bookings page can now add players to a slot, edit a booking's details, and move players between slots, alongside the existing remove.
- CSV export (UTF-8 BOM, Excel-ready) added in the admin area: per-event tee sheet, members register, payments, and each enquiries list. Client-side only via `src/lib/csv.js`; no new server surface.
- Migration: `supabase/migrations/20260821000001_tee_sheet_names_and_admin_edit.sql`.
