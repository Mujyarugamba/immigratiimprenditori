-- A4.2 — Access/RLS v1 foundation: profiles + Persona owned tables
-- Plan §7.4 / §10.1 REPLACE legacy auth.uid() → access_current_person_id()
-- A2 §6 column-level GRANT for self UPDATE whitelist.
--
-- Out of scope: training_*; Account–Persona link (RPC); FORCE RLS; new helpers.

-- ---------------------------------------------------------------------------
-- profiles — REPLACE legacy policies
-- ---------------------------------------------------------------------------
drop policy if exists "Public can view active profiles" on public.profiles;
drop policy if exists "Public can view published profiles" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy profiles_select_public
  on public.profiles
  for select
  to anon, authenticated
  using (
    is_public = true
    and is_active = true
    and deleted_at is null
  );

create policy profiles_select_self
  on public.profiles
  for select
  to authenticated
  using (id = public.access_current_person_id());

create policy profiles_update_self
  on public.profiles
  for update
  to authenticated
  using (
    id = public.access_current_person_id()
    and public.access_is_active_account()
  )
  with check (
    id = public.access_current_person_id()
    and public.access_is_active_account()
  );

revoke insert, delete on table public.profiles from authenticated;
revoke update on table public.profiles from authenticated;
grant select on table public.profiles to anon, authenticated;
grant update (
  display_name,
  slug,
  bio,
  organization_name,
  organization_type,
  role_description,
  city,
  province,
  region,
  country,
  website,
  phone,
  avatar_url,
  is_public
) on table public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- helper predicate notes:
-- public parent: profiles.is_public ∧ is_active ∧ deleted_at IS NULL
-- self: profile_id = access_current_person_id()
-- ---------------------------------------------------------------------------

-- profile_languages
drop policy if exists "Public can view languages of published profiles" on public.profile_languages;
drop policy if exists "Users can view their own profile languages" on public.profile_languages;
drop policy if exists "Users can add their own profile languages" on public.profile_languages;
drop policy if exists "Users can update their own profile languages" on public.profile_languages;
drop policy if exists "Users can delete their own profile languages" on public.profile_languages;

grant select on table public.profile_languages to anon, authenticated;
grant insert, update, delete on table public.profile_languages to authenticated;

create policy profile_languages_select_public
  on public.profile_languages
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = profile_languages.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
  );

create policy profile_languages_select_self
  on public.profile_languages
  for select
  to authenticated
  using (profile_id = public.access_current_person_id());

create policy profile_languages_insert_self
  on public.profile_languages
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy profile_languages_update_self
  on public.profile_languages
  for update
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  )
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy profile_languages_delete_self
  on public.profile_languages
  for delete
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

-- profile_competencies
drop policy if exists "Public can view competencies of published profiles" on public.profile_competencies;
drop policy if exists "Users can view their own profile competencies" on public.profile_competencies;
drop policy if exists "Users can add their own profile competencies" on public.profile_competencies;
drop policy if exists "Users can update their own profile competencies" on public.profile_competencies;
drop policy if exists "Users can delete their own profile competencies" on public.profile_competencies;

grant select on table public.profile_competencies to anon, authenticated;
grant insert, update, delete on table public.profile_competencies to authenticated;

create policy profile_competencies_select_public
  on public.profile_competencies
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = profile_competencies.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
  );

create policy profile_competencies_select_self
  on public.profile_competencies
  for select
  to authenticated
  using (profile_id = public.access_current_person_id());

create policy profile_competencies_insert_self
  on public.profile_competencies
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy profile_competencies_update_self
  on public.profile_competencies
  for update
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  )
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy profile_competencies_delete_self
  on public.profile_competencies
  for delete
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

-- personal_stories
drop policy if exists "Public can view published stories" on public.personal_stories;
drop policy if exists "Users can view their own stories" on public.personal_stories;
drop policy if exists "Users can add their own stories" on public.personal_stories;
drop policy if exists "Users can update their own stories" on public.personal_stories;

grant select on table public.personal_stories to anon, authenticated;
grant insert, update, delete on table public.personal_stories to authenticated;

create policy personal_stories_select_public
  on public.personal_stories
  for select
  to anon, authenticated
  using (
    deleted_at is null
    and status = 'published'
    and exists (
      select 1
      from public.profiles as p
      where p.id = personal_stories.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
  );

create policy personal_stories_select_self
  on public.personal_stories
  for select
  to authenticated
  using (profile_id = public.access_current_person_id());

create policy personal_stories_insert_self
  on public.personal_stories
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy personal_stories_update_self
  on public.personal_stories
  for update
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  )
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy personal_stories_delete_self
  on public.personal_stories
  for delete
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

-- profile_language_services
drop policy if exists "Public can view services of active profiles" on public.profile_language_services;
drop policy if exists "Users can view their own language services" on public.profile_language_services;
drop policy if exists "Users can add their own language services" on public.profile_language_services;
drop policy if exists "Users can update their own language services" on public.profile_language_services;
drop policy if exists "Users can delete their own language services" on public.profile_language_services;

grant select on table public.profile_language_services to anon, authenticated;
grant insert, update, delete on table public.profile_language_services to authenticated;

create policy profile_language_services_select_public
  on public.profile_language_services
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.profiles as p
      where p.id = profile_language_services.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
  );

create policy profile_language_services_select_self
  on public.profile_language_services
  for select
  to authenticated
  using (profile_id = public.access_current_person_id());

create policy profile_language_services_insert_self
  on public.profile_language_services
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy profile_language_services_update_self
  on public.profile_language_services
  for update
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  )
  with check (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

create policy profile_language_services_delete_self
  on public.profile_language_services
  for delete
  to authenticated
  using (
    public.access_is_active_account()
    and profile_id = public.access_current_person_id()
  );

-- profile_language_service_specializations (owned via service → profile)
drop policy if exists "Public can view specializations of active services" on public.profile_language_service_specializations;
drop policy if exists "Users can view their own service specializations" on public.profile_language_service_specializations;
drop policy if exists "Users can add specializations to their own services" on public.profile_language_service_specializations;
drop policy if exists "Users can remove specializations from their own services" on public.profile_language_service_specializations;

grant select on table public.profile_language_service_specializations to anon, authenticated;
grant insert, delete on table public.profile_language_service_specializations to authenticated;

create policy profile_language_service_specializations_select_public
  on public.profile_language_service_specializations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.profile_language_services as pls
      join public.profiles as p on p.id = pls.profile_id
      where pls.id = profile_language_service_specializations.profile_language_service_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
  );

create policy profile_language_service_specializations_select_self
  on public.profile_language_service_specializations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profile_language_services as pls
      where pls.id = profile_language_service_specializations.profile_language_service_id
        and pls.profile_id = public.access_current_person_id()
    )
  );

create policy profile_language_service_specializations_insert_self
  on public.profile_language_service_specializations
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1
      from public.profile_language_services as pls
      where pls.id = profile_language_service_specializations.profile_language_service_id
        and pls.profile_id = public.access_current_person_id()
    )
  );

create policy profile_language_service_specializations_delete_self
  on public.profile_language_service_specializations
  for delete
  to authenticated
  using (
    public.access_is_active_account()
    and exists (
      select 1
      from public.profile_language_services as pls
      where pls.id = profile_language_service_specializations.profile_language_service_id
        and pls.profile_id = public.access_current_person_id()
    )
  );
