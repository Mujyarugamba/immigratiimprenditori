-- A4.4 — Access/RLS v1 foundation: business_memberships + satellite SELECT
-- Plan §7.6; A2 §8.1. Membership = CTX, not grant. Role descriptive ≠ right.
-- Out of scope: management authorizations (A4.5); role-change RPC; DELETE.

grant select on table public.business_memberships to anon, authenticated;
grant insert, update on table public.business_memberships to authenticated;

create policy business_memberships_select_public
  on public.business_memberships
  for select
  to anon, authenticated
  using (visibility_status = 'public');

create policy business_memberships_select_self
  on public.business_memberships
  for select
  to authenticated
  using (person_id = public.access_current_person_id());

create policy business_memberships_select_manager
  on public.business_memberships
  for select
  to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_memberships_select_admin
  on public.business_memberships
  for select
  to authenticated
  using (public.access_is_application_admin());

create policy business_memberships_insert_self
  on public.business_memberships
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and person_id = public.access_current_person_id()
  );

create policy business_memberships_update_self
  on public.business_memberships
  for update
  to authenticated
  using (
    public.access_is_active_account()
    and person_id = public.access_current_person_id()
  )
  with check (
    public.access_is_active_account()
    and person_id = public.access_current_person_id()
  );

create policy business_memberships_update_admin
  on public.business_memberships
  for update
  to authenticated
  using (public.access_is_application_admin())
  with check (public.access_is_application_admin());

-- Satellite SELECT-only (restricted)
-- business_membership_sources
grant select on table public.business_membership_sources to authenticated;

create policy business_membership_sources_select_related
  on public.business_membership_sources for select to authenticated
  using (
    exists (
      select 1 from public.business_memberships as m
      where m.id = business_membership_sources.membership_id
        and (
          m.person_id = public.access_current_person_id()
          or public.access_has_active_business_membership(m.business_id)
          or public.access_can_act_for_business(m.business_id)
          or public.access_is_application_admin()
        )
    )
  );

grant select on table public.business_membership_evidences to authenticated;

create policy business_membership_evidences_select_related
  on public.business_membership_evidences for select to authenticated
  using (
    exists (
      select 1 from public.business_memberships as m
      where m.id = business_membership_evidences.membership_id
        and (
          m.person_id = public.access_current_person_id()
          or public.access_has_active_business_membership(m.business_id)
          or public.access_can_act_for_business(m.business_id)
          or public.access_is_application_admin()
        )
    )
  );

grant select on table public.business_membership_qualifications to authenticated;

create policy business_membership_qualifications_select_related
  on public.business_membership_qualifications for select to authenticated
  using (
    exists (
      select 1 from public.business_memberships as m
      where m.id = business_membership_qualifications.membership_id
        and (
          m.person_id = public.access_current_person_id()
          or public.access_has_active_business_membership(m.business_id)
          or public.access_can_act_for_business(m.business_id)
          or public.access_is_application_admin()
        )
    )
  );

grant select on table public.business_membership_responsibility_declarations to authenticated;

create policy business_membership_responsibility_declarations_select_related
  on public.business_membership_responsibility_declarations for select to authenticated
  using (
    exists (
      select 1 from public.business_memberships as m
      where m.id = business_membership_responsibility_declarations.membership_id
        and (
          m.person_id = public.access_current_person_id()
          or public.access_has_active_business_membership(m.business_id)
          or public.access_can_act_for_business(m.business_id)
          or public.access_is_application_admin()
        )
    )
  );

grant select on table public.business_membership_verifications to authenticated;

create policy business_membership_verifications_select_related
  on public.business_membership_verifications for select to authenticated
  using (
    exists (
      select 1 from public.business_memberships as m
      where m.id = business_membership_verifications.membership_id
        and (
          m.person_id = public.access_current_person_id()
          or public.access_has_active_business_membership(m.business_id)
          or public.access_can_act_for_business(m.business_id)
          or public.access_is_application_admin()
        )
    )
  );
