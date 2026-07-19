-- Create public.profile_competencies, implementing the CompetenzaDichiarata
-- entity of the Persone domain: the competency areas a Persona declares
-- about themselves, selected from the public.competencies catalog (created
-- by 20260719153227_create_competencies_table.sql). Implements M4 of
-- docs/architecture/migrations/persone-migration-plan.md, per
-- docs/architecture/physical/persone.md (§5.3, §9.1, §10.3, §11, §13).
--
-- Depends on public.profiles (extended by
-- 20260718113000_extend_profiles_for_person_domain.sql, for is_public,
-- is_active, deleted_at) and on public.competencies, both applied or
-- applied-pending in that order. No verification workflow, no dedicated
-- visibility column and no staff/admin role are introduced: visibility is
-- always derived from the linked profile and competency, exactly as for
-- profile_languages (physical model §5.3, "Visibilità e ordinamento"), and
-- a verification status is explicitly deferred to a future extension
-- (physical model §8).

create table public.profile_competencies (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  competency_id bigint not null references public.competencies (id) on delete restrict,
  proficiency_level text,
  years_of_experience smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, competency_id),
  -- proficiency_level stays optional: declaring a competency without a
  -- self-assessed level is valid.
  constraint profile_competencies_proficiency_level_check check (
    proficiency_level is null
    or proficiency_level in ('basic', 'intermediate', 'advanced', 'expert')
  ),
  constraint profile_competencies_years_of_experience_check check (
    years_of_experience is null
    or years_of_experience between 0 and 80
  )
);

comment on table public.profile_competencies is
  'Competency areas declared by a Persona (CompetenzaDichiarata), selected from the public.competencies catalog. Has no verification workflow and no visibility column of its own: a row is publicly visible only when both the linked profile is published and the linked competency is active (see the public select policy below), exactly as for public.profile_languages.';

comment on column public.profile_competencies.proficiency_level is
  'Self-declared competency level: basic, intermediate, advanced or expert. Deliberately distinct from profile_languages.proficiency_level (native/fluent/intermediate/basic): they are two different scales for two different things. NULL when the Persona declares the competency without a self-assessed level.';

comment on column public.profile_competencies.years_of_experience is
  'Self-declared years of experience in this competency area (0-80). NULL when not declared.';

comment on column public.profile_competencies.notes is
  'Optional free-text detail the Persona may add to their declaration.';

-- The composite primary key already indexes profile_id (as its leading
-- column); the index below covers the remaining lookup pattern ("who
-- declares this competency"). An index on proficiency_level is deliberately
-- deferred (physical model, §9.2): no filtering UI exists yet.
create index profile_competencies_competency_id_idx on public.profile_competencies using btree (competency_id);

alter table public.profile_competencies enable row level security;

-- 1. Publicly readable only when the linked profile is published (is_public
-- = true, is_active = true, deleted_at is null, the same formula used for
-- profiles and profile_languages) and the linked competency is active.
create policy "Public can view competencies of published profiles"
  on public.profile_competencies
  for select
  to public
  using (
    exists (
      select 1
      from public.profiles p
      where
        p.id = profile_competencies.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
    and exists (
      select 1
      from public.competencies c
      where
        c.id = profile_competencies.competency_id
        and c.is_active = true
    )
  );

-- 2. A user can always read their own profile's declared competencies,
-- regardless of the profile's publication, moderation or deletion state.
create policy "Users can view their own profile competencies"
  on public.profile_competencies
  for select
  to authenticated
  using (auth.uid () = profile_id);

-- 3. A user may declare competencies only on their own profile, and only
-- competencies that are currently active in the catalog.
create policy "Users can add their own profile competencies"
  on public.profile_competencies
  for insert
  to authenticated
  with check (
    auth.uid () = profile_id
    and exists (
      select 1
      from public.competencies c
      where
        c.id = competency_id
        and c.is_active = true
    )
  );

-- 4. A user may update only their own declared competencies. Unlike
-- insert, update does not re-check competencies.is_active:
-- competency_id/profile_id are not updatable (no column grant), so an
-- update never changes which competency a row is about.
create policy "Users can update their own profile competencies"
  on public.profile_competencies
  for update
  to authenticated
  using (auth.uid () = profile_id)
  with check (auth.uid () = profile_id);

-- 5. A user may delete only their own declared competencies.
create policy "Users can delete their own profile competencies"
  on public.profile_competencies
  for delete
  to authenticated
  using (auth.uid () = profile_id);

grant select on public.profile_competencies to anon;

-- Explicit defense in depth: without this, anon/authenticated would still
-- be unable to write beyond what is granted back below (RLS defines no
-- policy allowing anon to write at all, and the grants below are the only
-- write surface for authenticated), but this removes the underlying
-- table-level privilege too, in case RLS is ever disabled by mistake.
revoke insert, update, delete
on public.profile_competencies
from anon, authenticated;

-- Table-level UPDATE is intentionally not granted: created_at and
-- updated_at are system-managed, and profile_id/competency_id identify
-- which Persona and which competency a row is about, so they must not be
-- changeable in place either — to declare a different competency, the
-- owner deletes the row and inserts a new one. Only the descriptive columns
-- the owner is meant to edit are granted below. There is no verification
-- status column to protect: verification is explicitly out of scope for
-- this migration (physical model §8) and no such field exists yet.
grant select, insert, delete on public.profile_competencies to authenticated;

grant update (
  proficiency_level,
  years_of_experience,
  notes
) on public.profile_competencies to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_profile_competencies_updated_at ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profile_competencies_set_updated_at
before update on public.profile_competencies
for each row
execute function public.set_profile_competencies_updated_at ();
