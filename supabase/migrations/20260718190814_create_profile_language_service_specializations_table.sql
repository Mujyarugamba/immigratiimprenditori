-- Create public.profile_language_service_specializations, a bridge table
-- tagging a profile's language service (public.profile_language_services)
-- with one or more subject-area specializations
-- (public.language_service_specializations). E.g. an Italian -> English
-- translation service can be tagged legal, contracts and public_procurement
-- at the same time.

create table public.profile_language_service_specializations (
  profile_language_service_id uuid not null references public.profile_language_services (id) on delete cascade,
  specialization_id bigint not null references public.language_service_specializations (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (profile_language_service_id, specialization_id)
);

comment on table public.profile_language_service_specializations is
  'Bridge table tagging a profile_language_services row with one or more subject-area specializations (public.language_service_specializations). A single service can carry several specializations.';

comment on column public.profile_language_service_specializations.profile_language_service_id is
  'The tagged service offered by a profile (see public.profile_language_services).';

comment on column public.profile_language_service_specializations.specialization_id is
  'The subject-area specialization applied to the service (see public.language_service_specializations).';

-- The primary key already indexes profile_language_service_id (as its
-- leading column), covering "specializations of a given service". The
-- reverse lookup ("services tagged with a given specialization", e.g.
-- legal translators IT -> EN) needs its own index since
-- specialization_id is not a leading column of any existing index.
create index profile_language_service_specializations_specialization_idx on public.profile_language_service_specializations using btree (specialization_id);

alter table public.profile_language_service_specializations enable row level security;

-- 1. Publicly readable only when the underlying service is itself publicly
-- visible (active profile, active service type, any linked language
-- active) and the specialization is active.
create policy "Public can view specializations of active services"
  on public.profile_language_service_specializations
  for select
  to public
  using (
    exists (
      select 1
      from public.profile_language_services pls
      join public.profiles p on p.id = pls.profile_id
      join public.language_service_types t on t.id = pls.service_type_id
      where
        pls.id = profile_language_service_specializations.profile_language_service_id
        and p.is_active = true
        and t.is_active = true
        and (
          pls.source_language_id is null
          or exists (
            select 1
            from public.languages sl
            where
              sl.id = pls.source_language_id
              and sl.is_active = true
          )
        )
        and (
          pls.target_language_id is null
          or exists (
            select 1
            from public.languages tl
            where
              tl.id = pls.target_language_id
              and tl.is_active = true
          )
        )
    )
    and exists (
      select 1
      from public.language_service_specializations s
      where
        s.id = profile_language_service_specializations.specialization_id
        and s.is_active = true
    )
  );

-- 2. A user can always read the specializations of their own services,
-- even when the underlying service or profile is not otherwise publicly
-- visible.
create policy "Users can view their own service specializations"
  on public.profile_language_service_specializations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profile_language_services pls
      where
        pls.id = profile_language_service_specializations.profile_language_service_id
        and pls.profile_id = auth.uid ()
    )
  );

-- 3. A user may tag only their own services, and only with specializations
-- that are currently active.
create policy "Users can add specializations to their own services"
  on public.profile_language_service_specializations
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profile_language_services pls
      where
        pls.id = profile_language_service_id
        and pls.profile_id = auth.uid ()
    )
    and exists (
      select 1
      from public.language_service_specializations s
      where
        s.id = specialization_id
        and s.is_active = true
    )
  );

-- 4. A user may remove a specialization only from their own services.
create policy "Users can remove specializations from their own services"
  on public.profile_language_service_specializations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profile_language_services pls
      where
        pls.id = profile_language_service_specializations.profile_language_service_id
        and pls.profile_id = auth.uid ()
    )
  );

-- No update policy: a tag is either present or absent, it is not edited
-- in place (remove and re-add instead). There is no updated_at column
-- either.
grant select on public.profile_language_service_specializations to anon;

grant select, insert, delete on public.profile_language_service_specializations to authenticated;
