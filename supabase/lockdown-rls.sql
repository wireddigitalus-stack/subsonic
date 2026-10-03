-- ============================================================================
-- SUBSONIC SOCIETY — DATA LOCKDOWN (Row Level Security)
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- After this, the PUBLIC anon key (shipped in the browser) can no longer read
-- or write members, shooters, invites or chat. The website server still has
-- full access because it uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- ============================================================================

-- 1. Turn on Row Level Security
alter table public.society_members enable row level security;
alter table public.shooters        enable row level security;
alter table public.invites         enable row level security;
alter table public.chat_messages   enable row level security;

-- 2. Remove any old "allow everyone" policies on these tables
do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('society_members', 'shooters', 'invites', 'chat_messages')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 3. Revoke direct table access from the public (anon) and logged-in browser roles
revoke all on public.society_members from anon, authenticated;
revoke all on public.shooters        from anon, authenticated;
revoke all on public.invites         from anon, authenticated;
revoke all on public.chat_messages   from anon, authenticated;

-- 4. Verify — every row should show rls_enabled = true and policies = 0
select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('society_members', 'shooters', 'invites', 'chat_messages')
order by c.relname;
