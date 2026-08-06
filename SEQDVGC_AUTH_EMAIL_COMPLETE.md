# SEQDVGC — Branded Auth Emails: COMPLETE (code + MCP) / PENDING (dashboard steps)

Handoff for `SEQDVGC_Auth_Email_Brief.md`. Built 2026-08-06.

---

## What was done via MCP

### Resend
- **Sending domain `seqdvgc.com.au` created** (region us-east-1, tracking off,
  status `not_started` until DNS is added). Domain ID:
  `8f36808c-a595-40e5-ba0d-c3fc08969bb5`.
- **API key: not created.** The brief's recommended path is the native
  Resend↔Supabase integration (Part 3 step 2), which creates its own key. If
  Dexter prefers to wire SMTP manually instead, ask Claude Code to create a
  Resend API key and it will surface it once for the SMTP password field.
- **Verify step is re-runnable**: once the DNS records below are live, tell
  Claude Code and it runs Resend's `verify-domain` on the ID above and reports
  verified/pending.

### DNS records for Dexter (add in Vercel dashboard → domain → DNS)

| Type | Name (host)         | Value | TTL | Priority |
| ---- | ------------------- | ----- | --- | -------- |
| TXT (DKIM) | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCo5HCubEBGAHjeHFD1zix/2JvYZZZnR9QzrMUj4Fthyu3nQ60rYR9KexzqRs/oMXgAQgDLLRPoKzFgR0kuHpN49wAS5lQbWG1sYXwR3sX1n8DBtPq5L40ATzQkrk8saM2wJv+m8j5VoNrzm2GWV6HWpm74Y3PnjlM+zj2jB1YrvQIDAQAB` | Auto | — |
| MX   | `send`              | `feedback-smtp.us-east-1.amazonses.com` | 60 | 10 |
| TXT (SPF) | `send`         | `v=spf1 include:amazonses.com ~all` | 60 | — |

(Names are relative to `seqdvgc.com.au` — e.g. the DKIM record's full host is
`resend._domainkey.seqdvgc.com.au`.)

### Supabase (verification only — nothing changed)
- `members`, `profiles` and all ten public tables present with **RLS enabled**.
- Security advisors show **no new issues** — only the pre-existing, documented
  ones: the deliberate `public_sponsors` owner-rights view, the intentional
  `get_slot_availability` / `is_committee` SECURITY DEFINER RPCs, and the
  leaked-password-protection toggle (already on Dexter's manual list; enable it
  while in the Auth dashboard).
- No schema changes → no type regeneration.

---

## Codebase changes (this commit)

### Email templates — `/email-templates/`
Five branded, email-client-safe (table layout, inline styles) templates in the
club voice, navy `#0B1E3F` + gold `#C8A02E`, ribbon rule, crest from the stable
public URL `https://www.seqdvgc.com.au/SEQDVGC-logo-transparent.png`, footer
`SEQDVGC Inc. · ABN 35 714 983 753` + club email (no address, no phone), all
links via `{{ .ConfirmationURL }}` (+ `{{ .NewEmail }}` where relevant):

- `invite-user.html` — "You're in — set up your SEQDVGC login" (primary)
- `reset-password.html`
- `magic-link.html` (completeness — the app is password-only today)
- `confirm-signup.html` (completeness — open signup is disabled)
- `change-email.html`
- `README.md` — subject lines + paste instructions.

### Auth pages
- **Invite accept / set password** — `/member/welcome` already existed from the
  final build; verified, not rebuilt.
- **Password reset request** — new `/member/reset`
  (`src/pages/member/ResetPassword.jsx`): sends
  `resetPasswordForEmail(email, { redirectTo: <origin>/member/reset/confirm })`,
  neutral "if that email belongs to a member" success copy.
- **Set new password** — new `/member/reset/confirm`
  (`src/pages/member/ResetConfirm.jsx`): recovery link lands here, hash tokens
  sign the visitor in, they choose a new password, expired/used links get the
  same friendly handling as the invite page.
- **Auth callback** — new `/auth/callback` (`src/pages/AuthCallback.jsx`) for
  email-confirmation / change-email links: confirms success or explains an
  expired link.
- **Member sign-in** (`/member`) now links "Forgotten your password? Reset it
  here" to `/member/reset` (previously "email us and we'll reset it").

### Redirects
- `api/create-payment.js` and `api/invite-member.js` now pin the invite
  `redirectTo` to **`https://www.seqdvgc.com.au/member/welcome` whenever
  `VERCEL_ENV === "production"`**; preview deployments still invite back to
  themselves.
- Client-side reset uses `window.location.origin`, which on production is the
  canonical domain.

### End-to-end flow (traced in code, ready for live test)
paid on `/membership` → `create-payment` upserts active member row → server
invite (`inviteUserByEmail`) → branded invite email → `/member/welcome` sets
password → `/member` dashboard (status, profile, bookings). Success panel
already tells the member to check their email (and degrades honestly when the
invite couldn't send). Reset: `/member` → `/member/reset` → branded email →
`/member/reset/confirm` → new password → `/member`.

`npm run build` passes clean.

---

## Manual dashboard steps still pending (Dexter — in order)

1. **DNS**: add the three records above in Vercel DNS, then tell Claude Code
   they're live so it can verify the Resend domain.
2. **SMTP**: Supabase → Project Settings → Authentication → SMTP Settings →
   use the **native Resend integration** (recommended; makes its own key), or
   manual: host `smtp.resend.com`, port `465`, username `resend`, password =
   a Resend API key (ask Claude Code to create one). Sender
   `noreply@seqdvgc.com.au`, sender name "SEQDVGC".
3. **Templates**: paste each file from `/email-templates/` into Supabase →
   Auth → Email Templates with the subjects in `email-templates/README.md`.
4. **URLs**: Supabase → Auth → URL Configuration → Site URL
   `https://www.seqdvgc.com.au`; redirect allowlist must include:
   - `https://www.seqdvgc.com.au/member/welcome`
   - `https://www.seqdvgc.com.au/member/reset/confirm`
   - `https://www.seqdvgc.com.au/auth/callback`
   Also raise the email rate limit (Auth → Rate Limits) to ~30/hr, and enable
   leaked-password protection while you're there.
5. **Test end-to-end** with a real external address: member invite + password
   reset arrive from `noreply@seqdvgc.com.au`, branded, and their links
   complete on the pages above. (Before DNS verifies, Resend's shared
   onboarding domain can be used for a first test; switch the sender to the
   club domain once verified.)

## ⚠️ Domain findings (discovered during verification — updated 2026-08-06)

1. **Resend domain: VERIFIED.** DKIM + SPF (MX) + SPF (TXT) all verified;
   sending from `noreply@seqdvgc.com.au` is live. The blocker turned out to be
   **split-brain DNS**: the .au registry delegated to five nameservers —
   VentraIP's three (serving the Resend records) *plus* two stale
   `ns1/ns2.vercel-dns.com` entries (serving a conflicting zone with no Resend
   records) — so Resend's checker randomly saw or missed the DKIM record.
   Dexter removed the two Vercel nameservers from the delegation; DKIM
   verified as soon as resolver caches drained. DNS truth now lives solely in
   the VentraIP zone.
2. **Apex domain**: originally served registrar parking. Dexter has repointed
   the apex A record at Vercel and DNS has propagated, but HTTPS on the bare
   domain still fails because `seqdvgc.com.au` isn't added to the Vercel
   project, so no certificate exists for it. Remaining step: Vercel dashboard
   → project → Settings → Domains → add `seqdvgc.com.au` → "Redirect to
   www.seqdvgc.com.au". Not required for the email flows — everything in this
   build (crest URL, redirects, allowlist) uses `www.`, which works today.
