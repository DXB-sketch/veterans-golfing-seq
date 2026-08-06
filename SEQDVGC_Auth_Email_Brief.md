# SEQDVGC — Claude Code Brief: Branded Auth Emails (Resend SMTP) + Auth Frontend

**Context:** The site is built (final brief complete, its manual steps done). The one remaining gap: Supabase Auth emails. Member accounts are created by **server-side invite** after payment, but Supabase's default email service is rate-limited, unbranded, and — critically — **refuses to send to addresses outside the project team unless custom SMTP is configured**. So today, member invites to real people won't send. This brief wires **Resend as custom SMTP**, brands the auth emails, and completes the **auth landing pages** those emails link to.

**MCPs available:** Resend, Supabase, Vercel (all connected). Use them where they apply; the brief marks what they can and can't do.

---

## READ FIRST
1. Read `CLAUDE.md`, `Context.md`, and `SEQDVGC_FINAL_COMPLETE.md`.
2. **Inspect what the final brief already built** — the member invite flow (`supabase.auth.admin.inviteUserByEmail` or equivalent), the set-password/invite-accept page, member dashboard, and any auth routes. **Verify and complete; do not rebuild.**
3. Match the existing design system (navy + gold, serif headings, crest).

### Guardrails
- **No schema changes are expected here.** This is auth config + email templates + frontend. If you think a migration is genuinely needed, **flag it before running it** — the Supabase MCP can execute SQL/migrations, so treat it as read-only verification (advisors, list tables, logs, type generation) unless told otherwise.
- No new Vercel env var is needed: the Resend key lives in **Supabase's SMTP settings**, not Vercel (the app itself sends no email — enquiries go to the committee view).
- Secrets never land in the repo or client bundle.

---

## PART 1 — What Claude Code does via MCP

### 1A. Resend (Resend MCP)
- **Create the sending domain** `seqdvgc.com.au` in Resend. Capture the exact **DNS records** it returns (SPF/DKIM/return-path) and surface them clearly in your output — Dexter adds them to DNS manually (Part 3, step 1).
- Provide a **verify-domain** step you can re-run once Dexter says the records are live; report verified/pending status.
- **API key:** if Dexter is wiring SMTP manually, create a Resend API key and surface it once (for the Supabase SMTP password). If Dexter uses the native Resend↔Supabase integration instead (recommended, Part 3 step 2), **skip key creation** — the integration makes its own. Ask which path before creating a key.

### 1B. Supabase (Supabase MCP — verification only)
- Confirm `members`, `profiles`, and RLS from the final brief are intact (`list_tables`, `get_advisors` for security lints).
- Regenerate TypeScript types **only if** the schema was touched.
- Pull auth-related logs via `get_logs` if you need to debug delivery during testing.
- **Note:** the Supabase MCP does **not** expose Auth SMTP settings, email templates, Site URL/redirect config, or rate limits. Those are dashboard steps (Part 3) — do not attempt them via SQL; they aren't in the database.

### 1C. Vercel (Vercel MCP — verification only)
- After the codebase changes, confirm the deployment builds and serves (`list_deployments`, `get_deployment`, `get_deployment_build_logs`), and check `get_runtime_logs`/`get_runtime_errors` on the auth pages.
- **Note:** the Vercel MCP does not manage DNS records or env vars here — DNS is a manual dashboard step (Part 3, step 1).

---

## PART 2 — Frontend / codebase changes

### 2A. Branded auth email templates (author in the repo)
Create on-brand HTML templates under `/email-templates/` (one file each), navy/gold, club voice, with the crest and a clear call-to-action button. These are what Dexter pastes into the Supabase dashboard (Part 3, step 3). Cover:
- **Invite user** — the primary member-onboarding email ("You're in — set up your SEQDVGC login"). Most important one.
- **Reset password**
- **Magic link** (if the app uses passwordless anywhere)
- **Confirm signup** and **Change email address** — for completeness.

Requirements:
- The crest must load from a **stable absolute public URL** (emails can't use bundled/relative assets). Confirm the crest's production URL (e.g. `https://seqdvgc.com.au/<logo path>`) and use it. If it isn't reliably public, place a copy in `/public` so it is.
- Use Supabase's template variables (e.g. `{{ .ConfirmationURL }}`) — don't hardcode links.
- Keep them simple and email-client-safe (inline styles, table layout); don't pull in a heavy framework.
- Include the club footer identity (SEQDVGC Inc. · ABN 35 714 983 753). No home address, no phone.

### 2B. Auth landing pages (verify, then complete)
The links in those emails must land on real pages. Inspect what exists from the final brief and add/fix what's missing so all of these work and match the design:
- **Invite acceptance / set-password page** — where an invited paid member lands from the invite email, sets a password, and becomes active. This is the make-or-break page for membership onboarding.
- **Password reset** — request page + set-new-password page.
- **Email confirmation / auth callback** route handling.
- Ensure every auth call's redirect (`emailRedirectTo` / invite `redirectTo`) points to the **production** URLs of these pages on `seqdvgc.com.au`. (The matching allowlist is set dashboard-side in Part 3, step 4 — the code and the dashboard must agree.)
- Post-payment membership success copy should tell the member to check their email to set up their login.

### 2C. Confirm the end-to-end member flow
Trace it in code so it's ready for live testing: membership paid → server invite sent → member receives branded invite → clicks → set-password page → active member → dashboard. Fix any break.

---

## PART 3 — Manual steps for Dexter (dashboard-only; sequence matters)

These can't be done by the MCPs. Do them in this order — some depend on Claude Code's output.

1. **Add the Resend DNS records to your DNS** (you said DNS is on Vercel → Vercel dashboard → the domain → DNS records). Use the exact SPF/DKIM/return-path values Claude Code retrieved from Resend. Then tell Claude Code they're live so it can verify the domain (allow a little propagation time).
2. **Wire Resend as custom SMTP in Supabase** — dashboard → Project Settings → Authentication → SMTP Settings. Easiest is the **native Resend integration** (auto-fills SMTP + makes the key). Otherwise enable "Custom SMTP" manually: host `smtp.resend.com`, port `465`, username `resend`, password = the Resend API key Claude Code created. Set **sender** `noreply@seqdvgc.com.au` and a sender name (e.g. "SEQDVGC").
3. **Paste the branded templates** Claude Code wrote (from `/email-templates/`) into Supabase → Auth → Email Templates, and set each subject line. (Templates aren't reachable via the MCP, so this is copy-paste.)
4. **Set Site URL + Redirect URLs** — Supabase → Auth → URL Configuration → set to `https://seqdvgc.com.au` and add the auth page paths (invite/set-password, reset, callback) to the redirect allowlist, matching what Claude Code used in code. Also bump the **email rate limit** (Auth → Rate Limits) to ~30/hr (or your Resend plan's rate).
5. **Test end-to-end** with a real external email address: trigger a member invite (or `supabase.auth.admin` invite), a password reset, and (if used) a magic link. Confirm they arrive from `noreply@seqdvgc.com.au`, look branded, and their links land on the right pages and complete.

*(For immediate testing before DNS verifies, Resend's shared onboarding domain works; switch the sender to `noreply@seqdvgc.com.au` once the domain shows verified.)*

---

## ACCEPTANCE
```
[ ] Resend domain seqdvgc.com.au created via MCP; DNS records surfaced for Dexter; domain verifies once records are live
[ ] Branded templates authored in /email-templates/ (invite, reset, magic link, confirm, change email), crest from a public URL, using Supabase template vars
[ ] Invite-accept/set-password, password-reset, and callback pages exist, match design, and use production redirects
[ ] Code redirects and the dashboard Site URL/allowlist agree
[ ] Supabase advisors show no new security issues; no unintended schema changes
[ ] Deployment builds/serves (verified via Vercel MCP); no runtime errors on auth pages
[ ] End-to-end (manual): invite + reset arrive from noreply@seqdvgc.com.au, branded, links complete the flow
```

## HANDOFF
Write `SEQDVGC_AUTH_EMAIL_COMPLETE.md`: what was created via MCP, the templates + pages authored, the exact DNS records handed to Dexter, and the manual dashboard steps still pending confirmation (SMTP wired, templates pasted, URLs set, tested).
