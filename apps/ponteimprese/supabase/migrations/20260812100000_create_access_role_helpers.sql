-- A3.2 — Access/RLS v1 applicative role helpers
-- Implements the three frozen role helpers from:
--   docs/architecture/access/application-access-physical-v1.md §2–§4
--   docs/architecture/access/application-access-migration-plan-v1.md §A3.2
--
-- Scope of this unit only:
--   public.access_has_active_application_role(p_role text)
--   public.access_is_editor()
--   public.access_is_application_admin()
--
-- Explicitly out of scope: business-context helpers; RPC; policies;
-- GRANT/REVOKE on tables; triggers; views; seeds; role bootstrap;
-- account_registrato persistence; additional role codes.
--
-- Depends on A3.1 identity helpers (active Account + current Account id).
--
-- SECURITY DEFINER rationale (A2 §4): public.accounts and
-- public.account_role_assignments have RLS enabled and zero permissive
-- policies. DEFINER resolves role presence without exposing assignment
-- rows and without RLS recursion when future policies call these helpers.
--
-- Role-code decision (A2 §3 behaviours + §4 hardenization): Option A —
-- closed whitelist in the generic helper. Codes other than
-- redattore | amministratore_applicativo always yield false.
--
-- Account gate: access_is_active_account() (A2 pseudocode first conjunct;
-- Plan A3.2; write-path operational Account). Suspended/closed/disabled/
-- registered/limited therefore yield false. Adm ≠ Red (B4).

-- ---------------------------------------------------------------------------
-- 1) Generic active applicative role
-- ---------------------------------------------------------------------------
create function public.access_has_active_application_role (p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    p_role is not null
    and public.access_is_active_account()
    and p_role in ('redattore', 'amministratore_applicativo')
    and exists (
      select 1
      from public.account_role_assignments as a
      where a.account_id = public.access_current_account_id()
        and a.role_code = p_role
        and a.assignment_status = 'active'
    )
  );
$$;

comment on function public.access_has_active_application_role (text) is
  'Access/RLS v1 role helper. Returns true only when the current Account is active (via access_is_active_account), p_role is exactly redattore or amministratore_applicativo, and an account_role_assignments row for that Account has role_code = p_role and assignment_status = active (revoked_at NULL by table CHECK). Always returns false (never NULL) for anonymous callers, inactive Accounts, null/empty/unknown role codes, or revoked assignments. Exact equality only; no case folding. Does not write. Does not expose assignment rows. Intended for future RLS predicates. Adm and Red are distinct codes. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_has_active_application_role (text) from public;
grant execute on function public.access_has_active_application_role (text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Wrapper — redattore
-- ---------------------------------------------------------------------------
create function public.access_is_editor ()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.access_has_active_application_role('redattore');
$$;

comment on function public.access_is_editor () is
  'Access/RLS v1 role helper. Returns true only when the current active Account has an active redattore assignment. Always false for anonymous callers, inactive Accounts, or revoked/missing redattore. Does not imply amministratore_applicativo (Adm ≠ Red). Does not write. Intended for future editorial RLS predicates. Thin wrapper over access_has_active_application_role. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_is_editor () from public;
grant execute on function public.access_is_editor () to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Wrapper — amministratore_applicativo
-- ---------------------------------------------------------------------------
create function public.access_is_application_admin ()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.access_has_active_application_role('amministratore_applicativo');
$$;

comment on function public.access_is_application_admin () is
  'Access/RLS v1 role helper. Returns true only when the current active Account has an active amministratore_applicativo assignment. Always false for anonymous callers, inactive Accounts, or revoked/missing admin role. Does not imply redattore (Adm ≠ Red) and does not grant business-fact sovereignty. Does not write. Intended for future administrative RLS predicates. Thin wrapper over access_has_active_application_role. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_is_application_admin () from public;
grant execute on function public.access_is_application_admin () to anon, authenticated;
