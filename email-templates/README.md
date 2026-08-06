# SEQDVGC — Supabase Auth email templates

Branded (navy + gold, crest, club voice) HTML templates for Supabase Auth.
Paste each file's contents into **Supabase dashboard → Authentication → Email
Templates**, and set the subject line shown below. The crest loads from the
stable public URL `https://www.seqdvgc.com.au/SEQDVGC-logo-transparent.png`
(served from `/public` in this repo), because email clients can't use bundled
assets.

| Supabase template       | File                  | Subject line                                  |
| ----------------------- | --------------------- | --------------------------------------------- |
| **Invite user**         | `invite-user.html`    | You're in — set up your SEQDVGC login         |
| **Reset password**      | `reset-password.html` | Reset your SEQDVGC password                   |
| **Magic Link**          | `magic-link.html`     | Your SEQDVGC sign-in link                     |
| **Confirm signup**      | `confirm-signup.html` | Confirm your SEQDVGC email address            |
| **Change email address**| `change-email.html`   | Confirm your new SEQDVGC email address        |

Notes:

- All links use Supabase's `{{ .ConfirmationURL }}` variable (and
  `{{ .NewEmail }}` in the change-email template) — nothing is hardcoded.
- Layout is table-based with inline styles only, for email-client safety.
- The invite email lands on `/member/welcome`; the reset email lands on
  `/member/reset/confirm` (via each auth call's `redirectTo`). Both paths —
  plus `/auth/callback` — must be on the Supabase redirect allowlist
  (Auth → URL Configuration).
- Footer identity is `South East Queensland Defence Veterans Golf Club Inc. ·
  ABN 35 714 983 753` with the club email only — no home address, no phone.
