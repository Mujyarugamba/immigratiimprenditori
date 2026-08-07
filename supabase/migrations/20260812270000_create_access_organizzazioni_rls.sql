-- A6.2 — Access/RLS v1: Organizzazioni
-- Plan §9.2; A2 §16. Ternary ownership; officials owned ≠ gestori; ACT for Impresa.
-- Public: publication_status='published' AND visibility_status='public'.
-- Out of scope: organization_* catalogs (A6.4); DELETE policies.

-- ---------------------------------------------------------------------------
-- organizations — AR (ternary ownership)
-- ---------------------------------------------------------------------------
grant select on table public.organizations to anon, authenticated;
grant insert, update on table public.organizations to authenticated;

create policy organizations_select_public
  on public.organizations for select to anon, authenticated
  using (
    publication_status = 'published'
    and visibility_status = 'public'
  );

create policy organizations_select_owner_person
  on public.organizations for select to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and owned_by_editorial = false
  );

create policy organizations_select_owner_business
  on public.organizations for select to authenticated
  using (
    owner_business_id is not null
    and owned_by_editorial = false
    and (
      public.access_has_active_business_membership(owner_business_id)
      or public.access_can_act_for_business(owner_business_id)
    )
  );

create policy organizations_select_editorial
  on public.organizations for select to authenticated
  using (owned_by_editorial = true and public.access_is_editor());

create policy organizations_insert_owner_person
  on public.organizations for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_person_id = public.access_current_person_id()
    and owner_business_id is null
    and owned_by_editorial = false
  );

create policy organizations_insert_owner_business
  on public.organizations for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_business_id is not null
    and owner_person_id is null
    and owned_by_editorial = false
    and public.access_can_act_for_business(owner_business_id)
  );

create policy organizations_insert_editorial
  on public.organizations for insert to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and owned_by_editorial = true
    and owner_person_id is null
    and owner_business_id is null
  );

create policy organizations_update_owner_person
  on public.organizations for update to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and owned_by_editorial = false
    and public.access_is_active_account()
  )
  with check (
    owner_person_id = public.access_current_person_id()
    and owner_business_id is null
    and owned_by_editorial = false
  );

create policy organizations_update_owner_business
  on public.organizations for update to authenticated
  using (
    owner_business_id is not null
    and owned_by_editorial = false
    and public.access_can_act_for_business(owner_business_id)
  )
  with check (
    owner_business_id is not null
    and owner_person_id is null
    and owned_by_editorial = false
    and public.access_can_act_for_business(owner_business_id)
  );

create policy organizations_update_editorial
  on public.organizations for update to authenticated
  using (
    owned_by_editorial = true
    and public.access_is_editor()
    and public.access_is_active_account()
  )
  with check (
    owned_by_editorial = true
    and owner_person_id is null
    and owner_business_id is null
    and public.access_is_editor()
  );

-- ---------------------------------------------------------------------------
-- organization_officials — owned; does NOT confer ACT
-- ---------------------------------------------------------------------------
grant select on table public.organization_officials to anon, authenticated;
grant insert, update on table public.organization_officials to authenticated;

create policy organization_officials_select_public
  on public.organization_officials for select to anon, authenticated
  using (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and o.publication_status = 'published'
        and o.visibility_status = 'public'
    )
  );

create policy organization_officials_select_owner
  on public.organization_officials for select to authenticated
  using (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and (
          (o.owner_person_id = public.access_current_person_id() and o.owned_by_editorial = false)
          or (
            o.owner_business_id is not null and o.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(o.owner_business_id)
              or public.access_can_act_for_business(o.owner_business_id)
            )
          )
          or (o.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy organization_officials_insert_owner_person
  on public.organization_officials for insert to authenticated
  with check (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and o.owner_person_id = public.access_current_person_id()
        and o.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy organization_officials_insert_owner_business
  on public.organization_officials for insert to authenticated
  with check (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and o.owner_business_id is not null
        and o.owned_by_editorial = false
        and public.access_can_act_for_business(o.owner_business_id)
    )
  );

create policy organization_officials_insert_editorial
  on public.organization_officials for insert to authenticated
  with check (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and o.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy organization_officials_update_owner_person
  on public.organization_officials for update to authenticated
  using (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and o.owner_person_id = public.access_current_person_id()
        and o.owned_by_editorial = false
    )
  )
  with check (organization_id = organization_id);

create policy organization_officials_update_owner_business
  on public.organization_officials for update to authenticated
  using (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and o.owner_business_id is not null
        and o.owned_by_editorial = false
        and public.access_can_act_for_business(o.owner_business_id)
    )
  )
  with check (organization_id = organization_id);

create policy organization_officials_update_editorial
  on public.organization_officials for update to authenticated
  using (
    exists (
      select 1 from public.organizations as o
      where o.id = organization_officials.organization_id
        and o.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (organization_id = organization_id);
