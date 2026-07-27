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

## What's mocked (V1 build replaces these)

- **Events** read from `src/data/events.js` → will read live from Supabase, with a password-protected volunteer admin page.
- **Membership & contact forms** show a success state only → will post to Supabase / an email endpoint.
- **Hero imagery** is a placeholder gradient → real club photos arrive after the 31 July 2026 event; the slot is data-driven so they drop in without layout changes.
- **Values** (`src/data/values.js`) are the placeholder set — canonical wording still to be confirmed by the club.
- ABN in the footer is a placeholder.

Phase 2 (separate scope): Square payments, merch store, sponsor packages, Wall of Honour.

## Design reference

See `DESIGN.md` for the full design system (colour tokens, type scale, the ribbon-rule motif, page blueprints and hard content constraints) and `CONTEXT.md` for project context.
