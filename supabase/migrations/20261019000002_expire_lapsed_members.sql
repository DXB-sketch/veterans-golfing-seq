-- Memberships never expired on their own: status stayed 'active' after
-- expires_at passed, so the member area and committee counts overstated
-- who's current. A daily job now flips lapsed members to 'expired'.
create or replace function public.expire_lapsed_members()
returns integer
language sql
security definer
set search_path = public
as $$
  with lapsed as (
    update public.members
       set status = 'expired'
     where status = 'active'
       and expires_at is not null
       and expires_at < (now() at time zone 'Australia/Brisbane')::date
    returning 1
  )
  select count(*)::int from lapsed;
$$;

revoke all on function public.expire_lapsed_members() from public, anon, authenticated;

select cron.unschedule(jobid) from cron.job where jobname = 'expire-lapsed-members';
select cron.schedule(
  'expire-lapsed-members',
  '5 14 * * *', -- 00:05 Brisbane time daily (14:05 UTC)
  $$select public.expire_lapsed_members()$$
);

select public.expire_lapsed_members();
