-- Create public.profile_languages, implementing the LinguaParlata entity of
-- the Persone domain: the business languages a Persona knows or uses,
-- their general context of use, their declared proficiency, and at most
-- one language marked as primary. This table does NOT represent
-- professional translation/interpreting services between language pairs
-- (see the separate, still unapplied public.profile_language_services in
-- the Servizi domain) nor the site's interface languages. Implements the
-- M2 correction of docs/architecture/migrations/persone-migration-plan.md,
-- per docs/architecture/physical/persone.md (§4, §9.1, §10.2, §11).
--
-- This file was never applied: it replaces its previous version entirely
-- (is_working_language, can_assist_clients, notes and
-- profile_languages_has_usage_check are removed; they described a
-- Servizi-oriented approximation, not the general LinguaParlata concept).
-- Depends on public.profiles (extended by
-- 20260718113000_extend_profiles_for_person_domain.sql) and on
-- public.languages, both applied or applied-pending in that order.

create table public.profile_languages (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  language_id bigint not null references public.languages (id) on delete restrict,
  usage_context text not null default 'both',
  proficiency_level text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, language_id),
  constraint profile_languages_usage_context_check check (
    usage_context in ('personal', 'professional', 'both')
  ),
  -- proficiency_level stays optional: not every profile (e.g. a business or
  -- institution) has a personal language proficiency to report.
  constraint profile_languages_proficiency_level_check check (
    proficiency_level is null
    or proficiency_level in ('native', 'fluent', 'intermediate', 'basic')
  )
);

comment on table public.profile_languages is
  'Business languages known or used by a Persona (LinguaParlata): general context of use and declared proficiency. Does not represent translation or interpreting services (see public.profile_language_services) nor the site''s interface languages. Visibility is not stored here: a row is publicly visible only when both the linked profile is published and the linked language is active (see the public select policy below).';

comment on column public.profile_languages.usage_context is
  'General context in which the Persona uses this language: personal, professional or both. Describes only the context of use; it never implies the ability or availability to offer a paid language service in that language, which belongs exclusively to public.profile_language_services (Servizi domain).';

comment on column public.profile_languages.proficiency_level is
  'Self-declared proficiency in the language: native, fluent, intermediate or basic. NULL when not applicable (e.g. a business or institution profile).';

comment on column public.profile_languages.is_primary is
  'True when this is the Persona''s primary declared language. At most one true row per profile_id is allowed, enforced by the partial unique index profile_languages_single_primary_idx below; the companion trigger enforce_single_primary_language automatically unsets any previous primary language when a new one is marked, so the owner never has to do it manually first.';

-- The composite primary key already indexes profile_id (as its leading
-- column); the index below covers the remaining lookup pattern ("who
-- speaks this language"). Indexes on proficiency_level/usage_context are
-- deliberately deferred (physical model, §9.2): no filtering UI exists yet.
create index profile_languages_language_id_idx on public.profile_languages using btree (language_id);

-- Data-integrity index, not just an optimization: guarantees at most one
-- primary language per Persona. A regular check constraint cannot express
-- this because the rule spans multiple rows of the same table.
create unique index profile_languages_single_primary_idx on public.profile_languages using btree (profile_id)
where
  is_primary = true;

alter table public.profile_languages enable row level security;

-- 1. Publicly readable only when the linked profile is published (not just
-- active: is_public = true, is_active = true, deleted_at is null, mirroring
-- the formula introduced for public.profiles) and the linked language is
-- active.
create policy "Public can view languages of published profiles"
  on public.profile_languages
  for select
  to public
  using (
    exists (
      select 1
      from public.profiles p
      where
        p.id = profile_languages.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = profile_languages.language_id
        and l.is_active = true
    )
  );

-- 2. A user can always read their own profile's languages, regardless of
-- the profile's publication, moderation or deletion state.
create policy "Users can view their own profile languages"
  on public.profile_languages
  for select
  to authenticated
  using (auth.uid () = profile_id);

-- 3. A user may add languages only to their own profile, and only for
-- languages that are currently active.
create policy "Users can add their own profile languages"
  on public.profile_languages
  for insert
  to authenticated
  with check (
    auth.uid () = profile_id
    and exists (
      select 1
      from public.languages l
      where
        l.id = language_id
        and l.is_active = true
    )
  );

-- 4. A user may update only their own profile's languages. Unlike insert,
-- update does not re-check languages.is_active: language_id/profile_id are
-- not updatable (no column grant), so an update never changes which
-- language a row is about. Requiring the language to still be active here
-- would also block the enforce_single_primary_language trigger from
-- demoting a previous primary language that was deactivated after being
-- declared, and that housekeeping update runs security invoker, not
-- security definer.
create policy "Users can update their own profile languages"
  on public.profile_languages
  for update
  to authenticated
  using (auth.uid () = profile_id)
  with check (auth.uid () = profile_id);

-- 5. A user may delete only their own profile's languages.
create policy "Users can delete their own profile languages"
  on public.profile_languages
  for delete
  to authenticated
  using (auth.uid () = profile_id);

grant select on public.profile_languages to anon;

-- Table-level UPDATE is intentionally not granted: created_at and
-- updated_at are system-managed, and profile_id/language_id identify which
-- Persona and which language a row is about, so they must not be
-- changeable in place either — to declare a different language, the owner
-- deletes the row and inserts a new one. Only the three columns the owner
-- is meant to edit are granted below.
grant select, insert, delete on public.profile_languages to authenticated;

grant update (
  usage_context,
  proficiency_level,
  is_primary
) on public.profile_languages to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_profile_languages_updated_at ()
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

create trigger profile_languages_set_updated_at
before update on public.profile_languages
for each row
execute function public.set_profile_languages_updated_at ();

-- When a row is marked as the primary language for a Persona, unsets
-- is_primary on any other language already marked primary for that same
-- profile_id, so the owner never has to manually unset the previous one
-- before setting a new one. This is a convenience only: the actual
-- invariant ("at most one primary language per Persona") is guaranteed by
-- profile_languages_single_primary_idx above, not by this trigger. The
-- recursive update below re-fires this trigger on the affected rows with
-- is_primary = false, which is a no-op for the branch below, so there is
-- no infinite recursion.
create or replace function public.enforce_single_primary_language ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.is_primary = true then
    update public.profile_languages
    set is_primary = false
    where
      profile_id = new.profile_id
      and language_id <> new.language_id
      and is_primary = true;
  end if;

  return new;
end;
$$;

create trigger profile_languages_enforce_single_primary
before insert or update on public.profile_languages
for each row
execute function public.enforce_single_primary_language ();
