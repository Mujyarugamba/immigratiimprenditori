-- A5.2 — Access/RLS v1: Professionisti
-- Plan §8.2; A2 §6. Self Persona 1:1; public published+visibility public; owned via profile.
-- Out of scope: training_*; professional_* catalogs (A6.4); DELETE policies.

-- ---------------------------------------------------------------------------
-- professional_profiles — AR (person_id self)
-- ---------------------------------------------------------------------------
grant select on table public.professional_profiles to anon, authenticated;
grant insert, update on table public.professional_profiles to authenticated;

create policy professional_profiles_select_public
  on public.professional_profiles
  for select
  to anon, authenticated
  using (
    publication_status = 'published'
    and visibility_status = 'public'
  );

create policy professional_profiles_select_self
  on public.professional_profiles
  for select
  to authenticated
  using (person_id = public.access_current_person_id());

create policy professional_profiles_insert_self
  on public.professional_profiles
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and person_id = public.access_current_person_id()
  );

create policy professional_profiles_update_self
  on public.professional_profiles
  for update
  to authenticated
  using (
    person_id = public.access_current_person_id()
    and public.access_is_active_account()
  )
  with check (
    person_id = public.access_current_person_id()
    and public.access_is_active_account()
  );

-- ---------------------------------------------------------------------------
-- owned macro: public via parent profile; write via profile self
-- tables: qualifications, services, competencies, operational_languages,
--   profile_categories, served_markets/sectors/territories,
--   association_memberships, authorizations, certifications, registrations
-- ---------------------------------------------------------------------------

-- professional_qualifications
grant select on table public.professional_qualifications to anon, authenticated;
grant insert, update on table public.professional_qualifications to authenticated;

create policy professional_qualifications_select_public
  on public.professional_qualifications for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_qualifications.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
    and visibility_status = 'public'
  );

create policy professional_qualifications_select_self
  on public.professional_qualifications for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_qualifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_qualifications_insert_self
  on public.professional_qualifications for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_qualifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_qualifications_update_self
  on public.professional_qualifications for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_qualifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (
    professional_profile_id = professional_profile_id
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_qualifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

-- professional_services
grant select on table public.professional_services to anon, authenticated;
grant insert, update on table public.professional_services to authenticated;

create policy professional_services_select_public
  on public.professional_services for select to anon, authenticated
  using (
    visibility_status = 'public'
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_services.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_services_select_self
  on public.professional_services for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_services.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_services_insert_self
  on public.professional_services for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_services.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_services_update_self
  on public.professional_services for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_services.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_competencies
grant select on table public.professional_competencies to anon, authenticated;
grant insert, update on table public.professional_competencies to authenticated;

create policy professional_competencies_select_public
  on public.professional_competencies for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_competencies.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_competencies_select_self
  on public.professional_competencies for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_competencies.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_competencies_insert_self
  on public.professional_competencies for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_competencies.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_competencies_update_self
  on public.professional_competencies for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_competencies.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_operational_languages
grant select on table public.professional_operational_languages to anon, authenticated;
grant insert, update on table public.professional_operational_languages to authenticated;

create policy professional_operational_languages_select_public
  on public.professional_operational_languages for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_operational_languages.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_operational_languages_select_self
  on public.professional_operational_languages for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_operational_languages.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_operational_languages_insert_self
  on public.professional_operational_languages for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_operational_languages.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_operational_languages_update_self
  on public.professional_operational_languages for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_operational_languages.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_profile_categories
grant select on table public.professional_profile_categories to anon, authenticated;
grant insert, update on table public.professional_profile_categories to authenticated;

create policy professional_profile_categories_select_public
  on public.professional_profile_categories for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_categories.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_profile_categories_select_self
  on public.professional_profile_categories for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_categories.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_categories_insert_self
  on public.professional_profile_categories for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_categories.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_categories_update_self
  on public.professional_profile_categories for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_categories.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_served_markets
grant select on table public.professional_served_markets to anon, authenticated;
grant insert, update on table public.professional_served_markets to authenticated;

create policy professional_served_markets_select_public
  on public.professional_served_markets for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_markets.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_served_markets_select_self
  on public.professional_served_markets for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_markets.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_served_markets_insert_self
  on public.professional_served_markets for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_markets.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_served_markets_update_self
  on public.professional_served_markets for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_markets.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_served_sectors
grant select on table public.professional_served_sectors to anon, authenticated;
grant insert, update on table public.professional_served_sectors to authenticated;

create policy professional_served_sectors_select_public
  on public.professional_served_sectors for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_sectors.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_served_sectors_select_self
  on public.professional_served_sectors for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_sectors.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_served_sectors_insert_self
  on public.professional_served_sectors for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_sectors.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_served_sectors_update_self
  on public.professional_served_sectors for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_sectors.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_served_territories
grant select on table public.professional_served_territories to anon, authenticated;
grant insert, update on table public.professional_served_territories to authenticated;

create policy professional_served_territories_select_public
  on public.professional_served_territories for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_territories.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_served_territories_select_self
  on public.professional_served_territories for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_territories.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_served_territories_insert_self
  on public.professional_served_territories for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_territories.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_served_territories_update_self
  on public.professional_served_territories for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_served_territories.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_association_memberships
grant select on table public.professional_association_memberships to anon, authenticated;
grant insert, update on table public.professional_association_memberships to authenticated;

create policy professional_association_memberships_select_public
  on public.professional_association_memberships for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_association_memberships.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_association_memberships_select_self
  on public.professional_association_memberships for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_association_memberships.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_association_memberships_insert_self
  on public.professional_association_memberships for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_association_memberships.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_association_memberships_update_self
  on public.professional_association_memberships for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_association_memberships.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_authorizations
grant select on table public.professional_authorizations to anon, authenticated;
grant insert, update on table public.professional_authorizations to authenticated;

create policy professional_authorizations_select_public
  on public.professional_authorizations for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_authorizations.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_authorizations_select_self
  on public.professional_authorizations for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_authorizations.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_authorizations_insert_self
  on public.professional_authorizations for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_authorizations.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_authorizations_update_self
  on public.professional_authorizations for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_authorizations.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_certifications
grant select on table public.professional_certifications to anon, authenticated;
grant insert, update on table public.professional_certifications to authenticated;

create policy professional_certifications_select_public
  on public.professional_certifications for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_certifications.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_certifications_select_self
  on public.professional_certifications for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_certifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_certifications_insert_self
  on public.professional_certifications for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_certifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_certifications_update_self
  on public.professional_certifications for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_certifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- professional_registrations
grant select on table public.professional_registrations to anon, authenticated;
grant insert, update on table public.professional_registrations to authenticated;

create policy professional_registrations_select_public
  on public.professional_registrations for select to anon, authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_registrations.professional_profile_id
        and pp.publication_status = 'published'
        and pp.visibility_status = 'public'
    )
  );

create policy professional_registrations_select_self
  on public.professional_registrations for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_registrations.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_registrations_insert_self
  on public.professional_registrations for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_registrations.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_registrations_update_self
  on public.professional_registrations for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_registrations.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

-- ---------------------------------------------------------------------------
-- restricted owned: evidences, sources, verifications (self only, not public)
-- ---------------------------------------------------------------------------
grant select on table public.professional_profile_evidences to authenticated;
grant insert, update on table public.professional_profile_evidences to authenticated;

create policy professional_profile_evidences_select_self
  on public.professional_profile_evidences for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_evidences.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_evidences_insert_self
  on public.professional_profile_evidences for insert to authenticated
  with check (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_evidences.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_evidences_update_self
  on public.professional_profile_evidences for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_evidences.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

grant select on table public.professional_profile_sources to authenticated;
grant insert, update on table public.professional_profile_sources to authenticated;

create policy professional_profile_sources_select_self
  on public.professional_profile_sources for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_sources.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_sources_insert_self
  on public.professional_profile_sources for insert to authenticated
  with check (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_sources.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_sources_update_self
  on public.professional_profile_sources for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_sources.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);

grant select on table public.professional_profile_verifications to authenticated;
grant insert, update on table public.professional_profile_verifications to authenticated;

create policy professional_profile_verifications_select_self
  on public.professional_profile_verifications for select to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_verifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_verifications_insert_self
  on public.professional_profile_verifications for insert to authenticated
  with check (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_verifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  );

create policy professional_profile_verifications_update_self
  on public.professional_profile_verifications for update to authenticated
  using (
    exists (
      select 1 from public.professional_profiles as pp
      where pp.id = professional_profile_verifications.professional_profile_id
        and pp.person_id = public.access_current_person_id()
    )
  )
  with check (professional_profile_id = professional_profile_id);
