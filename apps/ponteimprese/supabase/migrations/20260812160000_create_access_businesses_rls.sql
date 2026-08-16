-- A4.3 — Access/RLS v1 foundation: businesses + owned tipiche
-- Plan §7.5; A2 §7. INSERT scheda ≠ grant. Write Impresa = ACT.
-- Out of scope: memberships; authorizations; FORCE RLS; DELETE policies.

grant select on table public.businesses to anon, authenticated;
grant insert, update on table public.businesses to authenticated;

create policy businesses_select_public
  on public.businesses
  for select
  to anon, authenticated
  using (
    publication_status = 'public'
    and deleted_at is null
    and is_archived = false
  );

create policy businesses_select_context
  on public.businesses
  for select
  to authenticated
  using (
    public.access_has_active_business_membership(id)
    or public.access_can_act_for_business(id)
  );

create policy businesses_insert_owner
  on public.businesses
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and public.access_current_person_id() is not null
  );

create policy businesses_update_business
  on public.businesses
  for update
  to authenticated
  using (public.access_can_act_for_business(id))
  with check (public.access_can_act_for_business(id));

-- Owned helper macros (repeated per table): public via parent public; write via ACT(business_id)

-- business_locations
grant select on table public.business_locations to anon, authenticated;
grant insert, update on table public.business_locations to authenticated;

create policy business_locations_select_public
  on public.business_locations for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_locations.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_locations_select_context
  on public.business_locations for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_locations_insert_business
  on public.business_locations for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_locations_update_business
  on public.business_locations for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_channels
grant select on table public.business_channels to anon, authenticated;
grant insert, update on table public.business_channels to authenticated;

create policy business_channels_select_public
  on public.business_channels for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_channels.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_channels_select_context
  on public.business_channels for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_channels_insert_business
  on public.business_channels for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_channels_update_business
  on public.business_channels for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_media
grant select on table public.business_media to anon, authenticated;
grant insert, update on table public.business_media to authenticated;

create policy business_media_select_public
  on public.business_media for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_media.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_media_select_context
  on public.business_media for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_media_insert_business
  on public.business_media for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_media_update_business
  on public.business_media for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_products
grant select on table public.business_products to anon, authenticated;
grant insert, update on table public.business_products to authenticated;

create policy business_products_select_public
  on public.business_products for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_products.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_products_select_context
  on public.business_products for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_products_insert_business
  on public.business_products for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_products_update_business
  on public.business_products for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_services
grant select on table public.business_services to anon, authenticated;
grant insert, update on table public.business_services to authenticated;

create policy business_services_select_public
  on public.business_services for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_services.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_services_select_context
  on public.business_services for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_services_insert_business
  on public.business_services for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_services_update_business
  on public.business_services for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_sector_declarations
grant select on table public.business_sector_declarations to anon, authenticated;
grant insert, update on table public.business_sector_declarations to authenticated;

create policy business_sector_declarations_select_public
  on public.business_sector_declarations for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_sector_declarations.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_sector_declarations_select_context
  on public.business_sector_declarations for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_sector_declarations_insert_business
  on public.business_sector_declarations for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_sector_declarations_update_business
  on public.business_sector_declarations for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_operational_language_declarations
grant select on table public.business_operational_language_declarations to anon, authenticated;
grant insert, update on table public.business_operational_language_declarations to authenticated;

create policy business_operational_language_declarations_select_public
  on public.business_operational_language_declarations for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_operational_language_declarations.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_operational_language_declarations_select_context
  on public.business_operational_language_declarations for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_operational_language_declarations_insert_business
  on public.business_operational_language_declarations for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_operational_language_declarations_update_business
  on public.business_operational_language_declarations for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_certifications (private-leaning; context/ACT + public parent)
grant select on table public.business_certifications to anon, authenticated;
grant insert, update on table public.business_certifications to authenticated;

create policy business_certifications_select_public
  on public.business_certifications for select to anon, authenticated
  using (
    exists (
      select 1 from public.businesses as b
      where b.id = business_certifications.business_id
        and b.publication_status = 'public' and b.deleted_at is null and b.is_archived = false
    )
  );

create policy business_certifications_select_context
  on public.business_certifications for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
  );

create policy business_certifications_insert_business
  on public.business_certifications for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_certifications_update_business
  on public.business_certifications for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));

-- business_verifications — SELECT ristretto (context/ACT); write ACT
grant select on table public.business_verifications to authenticated;
grant insert, update on table public.business_verifications to authenticated;

create policy business_verifications_select_context
  on public.business_verifications for select to authenticated
  using (
    public.access_has_active_business_membership(business_id)
    or public.access_can_act_for_business(business_id)
    or public.access_is_application_admin()
  );

create policy business_verifications_insert_business
  on public.business_verifications for insert to authenticated
  with check (public.access_can_act_for_business(business_id));

create policy business_verifications_update_business
  on public.business_verifications for update to authenticated
  using (public.access_can_act_for_business(business_id))
  with check (public.access_can_act_for_business(business_id));
