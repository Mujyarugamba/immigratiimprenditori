-- A4.5 — Access/RLS v1 foundation: business_membership_management_authorizations
-- Plan §7.7; A2 §8.2. CRUD deny for authenticated writes; mutate via RPC B1/B3.
-- Out of scope: last-manager trigger; INSERT/UPDATE/DELETE policies; seeds.

grant select on table public.business_membership_management_authorizations to authenticated;

create policy business_membership_management_authorizations_select_self
  on public.business_membership_management_authorizations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.business_memberships as m
      where m.id = business_membership_management_authorizations.membership_id
        and m.person_id = public.access_current_person_id()
    )
  );

create policy business_membership_management_authorizations_select_manager
  on public.business_membership_management_authorizations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.business_memberships as m
      where m.id = business_membership_management_authorizations.membership_id
        and public.access_can_act_for_business(m.business_id)
    )
  );

create policy business_membership_management_authorizations_select_admin
  on public.business_membership_management_authorizations
  for select
  to authenticated
  using (public.access_is_application_admin());
