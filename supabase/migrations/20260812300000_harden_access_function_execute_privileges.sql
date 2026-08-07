-- Access/RLS v1 — harden EXECUTE privileges on Access functions
-- Hosted Supabase may attach explicit EXECUTE grants to anon/authenticated/service_role
-- at CREATE FUNCTION time. REVOKE FROM PUBLIC alone does not remove those grants.
-- This migration reasserts the frozen A2 / A3.1–A3.4 privilege matrix only.
-- No function bodies, policies, tables, or triggers are modified.

-- ---------------------------------------------------------------------------
-- A3.1–A3.3 helpers (9): EXECUTE → anon, authenticated
-- ---------------------------------------------------------------------------
revoke all on function public.access_current_account_id () from public, anon, authenticated, service_role;
grant execute on function public.access_current_account_id () to anon, authenticated;

revoke all on function public.access_current_person_id () from public, anon, authenticated, service_role;
grant execute on function public.access_current_person_id () to anon, authenticated;

revoke all on function public.access_is_active_account () from public, anon, authenticated, service_role;
grant execute on function public.access_is_active_account () to anon, authenticated;

revoke all on function public.access_has_active_application_role (text) from public, anon, authenticated, service_role;
grant execute on function public.access_has_active_application_role (text) to anon, authenticated;

revoke all on function public.access_is_editor () from public, anon, authenticated, service_role;
grant execute on function public.access_is_editor () to anon, authenticated;

revoke all on function public.access_is_application_admin () from public, anon, authenticated, service_role;
grant execute on function public.access_is_application_admin () to anon, authenticated;

revoke all on function public.access_has_active_business_membership (uuid) from public, anon, authenticated, service_role;
grant execute on function public.access_has_active_business_membership (uuid) to anon, authenticated;

revoke all on function public.access_has_granted_business_management (uuid) from public, anon, authenticated, service_role;
grant execute on function public.access_has_granted_business_management (uuid) to anon, authenticated;

revoke all on function public.access_can_act_for_business (uuid) from public, anon, authenticated, service_role;
grant execute on function public.access_can_act_for_business (uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- A3.4 identity RPCs
-- ---------------------------------------------------------------------------
revoke all on function public.access_provision_account (uuid) from public, anon, authenticated, service_role;
grant execute on function public.access_provision_account (uuid) to service_role;

revoke all on function public.access_link_person (uuid, uuid) from public, anon, authenticated, service_role;
grant execute on function public.access_link_person (uuid, uuid) to authenticated, service_role;

revoke all on function public.access_close_account (uuid) from public, anon, authenticated, service_role;
grant execute on function public.access_close_account (uuid) to authenticated, service_role;

revoke all on function public.assign_application_role (uuid, text) from public, anon, authenticated, service_role;
grant execute on function public.assign_application_role (uuid, text) to authenticated, service_role;

revoke all on function public.revoke_application_role (uuid) from public, anon, authenticated, service_role;
grant execute on function public.revoke_application_role (uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- A3.4 business management RPCs
-- ---------------------------------------------------------------------------
revoke all on function public.access_bootstrap_business_grant (uuid) from public, anon, authenticated, service_role;
grant execute on function public.access_bootstrap_business_grant (uuid) to authenticated, service_role;

revoke all on function public.grant_business_management (uuid) from public, anon, authenticated, service_role;
grant execute on function public.grant_business_management (uuid) to authenticated, service_role;

revoke all on function public.revoke_business_management (uuid) from public, anon, authenticated, service_role;
grant execute on function public.revoke_business_management (uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Ownership immutability guard (trigger-only; no application EXECUTE)
-- ---------------------------------------------------------------------------
revoke all on function public.access_reject_owner_cols_mutation () from public, anon, authenticated, service_role;
