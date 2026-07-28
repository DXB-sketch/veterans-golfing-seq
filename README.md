# SEQDVGC — Website Mock-up

Visual front-end mock-up for the **South East Queensland Defence Veterans Golf Club Inc.** website. This is a client-review build: all data is static/mock and no backend is wired up yet.

## Stack

- React 18 + Vite
- Tailwind CSS 3 (design tokens from `DESIGN.md` in `tailwind.config.js`)
- React Router (SPA routing; `vercel.json` handles rewrites on Vercel)

## Running locally

```bash
npm install
npm run dev
```

## Pages

Home · About · Events (+ event detail) · Membership enquiry · Veteran Resources · Contact

## Backend (Supabase)

Live data comes from the club's Supabase project (see `BACKEND.md` for the full spec):

- **Events** are read live from the `events` table (public read via RLS). Committee members manage them at `/admin` (also linked as "Committee login" in the footer).
- **Membership & contact forms** insert into `membership_enquiries` / `contact_messages` (anon insert only; reads require sign-in). Volunteers can view them under `/admin/submissions`.
- **Auth**: Supabase email + password. No self-registration — keep "Allow new users to sign up" **disabled** in Auth settings, since any authenticated user can edit events. Committee members create and remove volunteer accounts themselves under `/admin/team`, which calls the `admin-users` Edge Function (`supabase/functions/admin-users/` — runs server-side with the service key and only accepts requests from a signed-in admin; it refuses self-removal and removal of the last account). Only the very first account needs creating in the dashboard (Authentication → Users → Add user).
- **Env vars** (`.env`, copy from `.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Set the same two in Vercel (Project → Settings → Environment Variables).
- **GitHub Actions**: `supabase-keepalive.yml` (stops the free-tier project pausing) and `supabase-backup.yml` (weekly JSON export to `/backups`). They need repo secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (backup only — never in front-end code).

## What's still mocked

- **Hero imagery** is a placeholder gradient → real club photos arrive after the 31 July 2026 event; the slot is data-driven so they drop in without layout changes.
- **Values** (`src/data/values.js`) are the placeholder set — canonical wording still to be confirmed by the club.
- ABN in the footer is a placeholder.

Phase 2 (separate scope): Square payments, merch store, sponsor packages, Wall of Honour.

## Design reference

See `DESIGN.md` for the full design system (colour tokens, type scale, the ribbon-rule motif, page blueprints and hard content constraints) and `CONTEXT.md` for project context.
