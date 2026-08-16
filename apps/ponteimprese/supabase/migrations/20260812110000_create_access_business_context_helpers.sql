-- A3.3 — Access/RLS v1 business-context helpers
-- Implements the three frozen Impresa helpers from:
--   docs/architecture/access/application-access-physical-v1.md §2–§4
--   docs/architecture/access/application-access-migration-plan-v1.md §A3.3
--
-- Scope of this unit only:
--   public.access_has_active_business_membership(p_business_id uuid)
--   public.access_has_granted_business_management(p_business_id uuid)
--   public.access_can_act_for_business(p_business_id uuid)
--
-- Explicitly out of scope: RPC; policies; GRANT/REVOKE on tables; triggers;
-- views; seeds; bootstrap grants; new business roles; membership mutations;
-- Organization helpers.
--
-- Depends on A3.1 identity helpers. Does not depend on A3.2 role helpers.
--
-- SECURITY DEFINER rationale (A2 §4): public.business_memberships and
-- public.business_membership_management_authorizations have RLS enabled and
-- zero permissive policies. DEFINER resolves context/grant without exposing
-- rows and without RLS recursion when future policies call these helpers.
--
-- Semantica (A1 §9 / A2 §3):
--   CTX  = active Account ∧ usable Person ∧ membership relation_status=active
--   ACT  = CTX ∧ authorization_status=granted on that membership/business
-- Descriptive membership role_id / titles never confer management rights.
-- Authorization has no direct business_id FK: Impresa is derived via membership.

-- ---------------------------------------------------------------------------
-- 1) Active business membership (Contesto Impresa — not management)
-- ---------------------------------------------------------------------------
create function public.access_has_active_business_membership (p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    p_business_id is not null
    and public.access_is_active_account()
    and exists (
      select 1
      from public.business_memberships as m
      where m.person_id = public.access_current_person_id()
        and m.business_id = p_business_id
        and m.relation_status = 'active'
    )
  );
$$;

comment on function public.access_has_active_business_membership (uuid) is
  'Access/RLS v1 business-context helper (CTX). Returns true only when the current Account is active, the current Person is usable (via access_current_person_id), and an Appartenenza exists for that Person and p_business_id with relation_status = active. Expresses Impresa context only — not sheet management, not ownership transfer. Descriptive role_id/title never confers rights. Always false (never NULL) for anonymous callers, inactive Accounts, contested/absent Person, null/unknown business_id, or non-active membership. Does not write. Does not expose membership rows. Intended for future RLS predicates. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_has_active_business_membership (uuid) from public;
grant execute on function public.access_has_active_business_membership (uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Granted business management authorization
-- ---------------------------------------------------------------------------
create function public.access_has_granted_business_management (p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    public.access_has_active_business_membership(p_business_id)
    and exists (
      select 1
      from public.business_memberships as m
      join public.business_membership_management_authorizations as auth
        on auth.membership_id = m.id
      where m.person_id = public.access_current_person_id()
        and m.business_id = p_business_id
        and m.relation_status = 'active'
        and auth.authorization_status = 'granted'
    )
  );
$$;

comment on function public.access_has_granted_business_management (uuid) is
  'Access/RLS v1 business-context helper. Returns true only when CTX holds for p_business_id and a business_membership_management_authorizations row owned by that Appartenenza has authorization_status = granted. Impresa identity is derived from the membership (no direct business_id on the authorization table). Does not transfer ownership to the Person. Descriptive membership roles never substitute for granted authorization. Always false (never NULL) when membership inactive, authorization revoked/absent, or Account/Person gates fail. Does not write. Does not expose authorization rows. Intended for future RLS predicates. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_has_granted_business_management (uuid) from public;
grant execute on function public.access_has_granted_business_management (uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Can act for business (ACT = granted management)
-- ---------------------------------------------------------------------------
create function public.access_can_act_for_business (p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.access_has_granted_business_management(p_business_id);
$$;

comment on function public.access_can_act_for_business (uuid) is
  'Access/RLS v1 business-context helper (ACT). Returns true only when active Account, usable Person, active membership, and granted management authorization all hold for the same p_business_id. Thin composition over access_has_granted_business_management (A2). Does not transfer Impresa ownership to the Person. Descriptive membership role ≠ management right. Always false (never NULL) for anonymous callers or incomplete gates. Does not write. Intended for future Impresa write/publish RLS predicates. Read-only SECURITY DEFINER with empty search_path.';

revoke all on function public.access_can_act_for_business (uuid) from public;
grant execute on function public.access_can_act_for_business (uuid) to anon, authenticated;
