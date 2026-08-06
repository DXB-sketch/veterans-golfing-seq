# SEQDVGC — Auth Email Verification Checklist

Tick only after verifying. Report unchecked items with a reason.

## MCP work (Claude Code)
- [x] Resend domain `seqdvgc.com.au` created; exact DNS records surfaced to Dexter (see `SEQDVGC_AUTH_EMAIL_COMPLETE.md`)
- [x] Domain verify step available and re-runnable; status reported (status `not_started` — awaiting DNS; domain ID recorded in the handoff)
- [x] Resend API key created ONLY if manual SMTP chosen (skipped — native integration is the recommended path; key on request)
- [x] Supabase advisors run; `members`/`profiles`/RLS intact; no unintended schema change
- [x] Types regenerated only if schema touched (schema untouched — not regenerated)
- [x] Deployment build/serve confirmed via Vercel MCP; auth pages have no runtime errors

## Codebase
- [x] Branded templates in `/email-templates/`: invite, reset password, magic link, confirm signup, change email
- [x] Crest loads from a stable absolute public URL in emails (`https://www.seqdvgc.com.au/SEQDVGC-logo-transparent.png`, served from `/public`; verified HTTP 200 — note the bare apex domain is NOT on Vercel, see the handoff's domain finding)
- [x] Templates use Supabase variables (`{{ .ConfirmationURL }}`, `{{ .NewEmail }}`), inline styles, club footer + ABN, no address/phone
- [x] Invite-accept / set-password page exists, on-brand, handles the invite token, activates the member (`/member/welcome` — pre-existing, verified)
- [x] Password reset request + set-new-password pages exist and work (`/member/reset`, `/member/reset/confirm`)
- [x] Email confirmation / auth callback handled (`/auth/callback`)
- [x] All auth redirects point to production `seqdvgc.com.au` paths; code matches the dashboard allowlist (production pinned in both invite APIs; allowlist entries listed in the handoff for Dexter to set — dashboard side pending below)
- [x] Membership success copy tells the member to check email to set up login (pre-existing, verified; degrades honestly if the invite fails)
- [x] End-to-end path traced in code: paid → invite → set password → active → dashboard

## Manual (Dexter) — confirm each is done
- [ ] Resend DNS records added in Vercel DNS; domain verified — *pending Dexter (records handed over)*
- [ ] Resend wired as Supabase custom SMTP (native integration or manual creds); sender = noreply@seqdvgc.com.au — *pending Dexter*
- [ ] Branded templates + subjects pasted into Supabase Auth templates — *pending Dexter*
- [ ] Site URL + redirect allowlist set to production; email rate limit raised (~30/hr) — *pending Dexter*
- [ ] Tested with a real external address: invite + reset arrive branded from the club domain and complete — *pending (needs the four steps above)*

## Handoff
- [x] `SEQDVGC_AUTH_EMAIL_COMPLETE.md` written, including the DNS records handed over and pending manual confirmations
