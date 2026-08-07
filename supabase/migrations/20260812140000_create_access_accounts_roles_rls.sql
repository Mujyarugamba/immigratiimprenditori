-- A4.1 — Access/RLS v1 foundation: accounts + account_role_assignments
-- Plan: application-access-migration-plan-v1.md §7.2–§7.3
-- A2: application-access-physical-v1.md §10–§11
--
-- Scope: SELECT policies self/admin; GRANT SELECT; writes remain RPC-only.
-- Out of scope: INSERT/UPDATE/DELETE policies; FORCE RLS; seeds; helpers/RPC.

-- ---------------------------------------------------------------------------
-- accounts
-- ---------------------------------------------------------------------------
grant select on table public.accounts to authenticated;

create policy accounts_select_self
  on public.accounts
  for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy accounts_select_admin
  on public.accounts
  for select
  to authenticated
  using (public.access_is_application_admin());

-- ---------------------------------------------------------------------------
-- account_role_assignments
-- ---------------------------------------------------------------------------
grant select on table public.account_role_assignments to authenticated;

create policy account_role_assignments_select_self
  on public.account_role_assignments
  for select
  to authenticated
  using (account_id = public.access_current_account_id());

create policy account_role_assignments_select_admin
  on public.account_role_assignments
  for select
  to authenticated
  using (public.access_is_application_admin());
