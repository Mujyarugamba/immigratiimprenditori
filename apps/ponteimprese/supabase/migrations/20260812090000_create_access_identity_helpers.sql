-- A3.1 — Access/RLS v1 identity helpers
-- Implements the three frozen identity helpers from:
--   docs/architecture/access/application-access-physical-v1.md §2–§4
--   docs/architecture/access/application-access-migration-plan-v1.md §A3.1
--
-- Scope of this unit only:
--   public.access_current_account_id()
--   public.access_current_person_id()
--   public.access_is_active_account()
--
-- Explicitly out of scope: role helpers; business-context helpers; RPC;
-- policies; GRANT/REVOKE on tables; triggers; views; seeds; fixtures.
--
-- SECURITY DEFINER rationale (A2 §4): public.accounts has RLS enabled and
-- (currently) zero permissive policies. INVOKER lookup would fail for
-- authenticated callers. DEFINER resolves identity without exposing rows
-- and without recursion when future accounts policies call these helpers
-- (helpers read accounts as owner; they do not re-enter INVOKER policies).

-- ---------------------------------------------------------------------------
-- 1) Current applicative Account id
-- ---------------------------------------------------------------------------
create function public.access_current_account_id ()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select a.id
  from public.accounts as a
  where a.auth_user_id = auth.uid()
  limit 1;
$$;

comment on function public.access_current_account_id () is
  'Access/RLS v1 identity helper. Returns the applicative Account id (public.accounts.id) linked to auth.uid() via accounts.auth_user_id. Returns NULL for anonymous requests, missing auth.uid(), or absent Account. Does not require account_status = active. Does not write. Does not expose Account rows. Intended for future RLS policies that distinguish Auth (auth.users), Account (accounts), and Person (profiles via accounts.person_id). Read-only SECURITY DEFINER with empty search_path to bypass accounts RLS without recursion.';

revoke all on function public.access_current_account_id () from public;
grant execute on function public.access_current_account_id () to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Current Person id
-- ---------------------------------------------------------------------------
create function public.access_current_person_id ()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select a.person_id
  from public.accounts as a
  where a.auth_user_id = auth.uid()
    and a.person_id is not null
    and a.person_association_status in ('declared', 'verified')
    and a.account_status <> 'closed'
  limit 1;
$$;

comment on function public.access_current_person_id () is
  'Access/RLS v1 identity helper. Returns accounts.person_id for the Account linked to auth.uid() when association is declared|verified and account_status is not closed. Returns NULL for anonymous requests, absent Account, missing Person, contested association, or closed Account. Does not create or modify the Account–Person link. Does not require account_status = active. Does not read profiles directly. Does not write. Intended for future RLS owner-Person predicates. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_current_person_id () from public;
grant execute on function public.access_current_person_id () to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Active Account gate
-- ---------------------------------------------------------------------------
create function public.access_is_active_account ()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.accounts as a
    where a.auth_user_id = auth.uid()
      and a.account_status = 'active'
      and a.person_id is not null
      and a.person_association_status in ('declared', 'verified')
  );
$$;

comment on function public.access_is_active_account () is
  'Access/RLS v1 identity helper. Returns true only when an Account exists for auth.uid() with account_status = active, person_id set, and person_association_status in (declared, verified). Always returns false (never NULL) for anonymous requests, absent Account, registered|limited|suspended|disabled|closed, missing Person, or contested association. Presence in auth.users alone is never sufficient. Does not write. Intended as a write-path gate in future RLS policies. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_is_active_account () from public;
grant execute on function public.access_is_active_account () to anon, authenticated;
