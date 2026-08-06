-- Follow-up hardening: the earlier revokes missed the implicit PUBLIC grant
-- (functions default to EXECUTE for PUBLIC), so trigger functions were still
-- callable via /rest/v1/rpc. Close that, pin tier_from_amount_cents's
-- search_path, and drop anon execute on is_committee (no anon policy uses it).
-- Applied to the live project on 2026-08-06.
revoke execute on function public.enforce_booking_rules() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.members_guard() from public, anon, authenticated;
revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

revoke execute on function public.is_committee() from public, anon;
-- authenticated keeps EXECUTE: the committee policies evaluate it as the caller.

alter function public.tier_from_amount_cents(int) set search_path = public;
revoke execute on function public.tier_from_amount_cents(int) from public;

-- get_slot_availability stays anon-executable on purpose: the public booking
-- form's slot picker reads counts (never player details) through it.
