-- Create public.profile_language_services: professional linguistic and
-- intercultural services a profile offers (public.language_service_types),
-- optionally between a pair of business languages (public.languages), e.g.
-- sworn translation from Italian to English, simultaneous interpreting
-- between French and Wolof, or trade fair accompaniment with no fixed
-- language pair. A profile can offer several services on the same
-- combination of type/pair/direction as long as they are otherwise
-- distinguishable (see public.profile_language_service_specializations for
-- tagging a service with one or more subject-area specializations, e.g.
-- legal vs. technical IT -> EN translation). Unrelated to the site's
-- interface languages, which are not managed here.

create table public.profile_language_services (
  id uuid primary key default gen_random_uuid (),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  service_type_id bigint not null references public.language_service_types (id) on delete restrict,
  source_language_id bigint references public.languages (id) on delete restrict,
  target_language_id bigint references public.languages (id) on delete restrict,
  direction text not null default 'one_way',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_language_services_direction_check check (
    direction in ('one_way', 'bidirectional')
  ),
  -- A language pair is either fully absent or fully present: a service
  -- can never carry only a source or only a target language. Whether a
  -- pair is actually required depends on the service type
  -- (requires_language_pair) and is enforced by the trigger below, since a
  -- plain CHECK cannot query another table.
  constraint profile_language_services_language_pair_completeness_check check (
    (
      source_language_id is null
      and target_language_id is null
    )
    or (
      source_language_id is not null
      and target_language_id is not null
    )
  ),
  -- When a pair is present, the two languages must be distinct.
  constraint profile_language_services_distinct_languages_check check (
    source_language_id is null
    or target_language_id is null
    or source_language_id <> target_language_id
  ),
  -- Collapses a bidirectional pair (e.g. Italian<->English) into a single
  -- canonical row, ordered by language id. one_way rows keep their
  -- semantically meaningful source -> target order and are not affected.
  constraint profile_language_services_bidirectional_order_check check (
    direction <> 'bidirectional'
    or source_language_id is null
    or source_language_id < target_language_id
  ),
  -- The logical identity of a service is profile + type + language pair +
  -- direction. NULLS NOT DISTINCT treats two rows that both have NULL
  -- source_language_id/target_language_id (a service type that has no
  -- language pair, e.g. trade fair accompaniment) as duplicates of each
  -- other too, not as distinct "unknown" values.
  constraint profile_language_services_unique_service unique nulls not distinct (
    profile_id,
    service_type_id,
    source_language_id,
    target_language_id,
    direction
  )
);

comment on table public.profile_language_services is
  'Linguistic and intercultural services a profile offers (see public.language_service_types), optionally between a source and a target business language. profile_id is a generic reference to public.profiles: the offering profile may be an individual professional, an enterprise, a professional firm, an association or another type of organization, not only a single person. Whether a language pair is required depends on the service type. A profile may offer multiple services with the same type/pair/direction only if distinguished by specialization (see public.profile_language_service_specializations). Does not manage the site''s interface languages.';

comment on column public.profile_language_services.service_type_id is
  'Type of professional service offered (see public.language_service_types), e.g. sworn translation, simultaneous interpreting, cultural mediation.';

comment on column public.profile_language_services.source_language_id is
  'Source language of the service (see public.languages). NULL when the service type does not require a language pair. Never set without target_language_id.';

comment on column public.profile_language_services.target_language_id is
  'Target language of the service (see public.languages). NULL when the service type does not require a language pair. Never set without source_language_id.';

comment on column public.profile_language_services.direction is
  'Whether the service is offered only from source to target (one_way) or in both directions (bidirectional). Only meaningful when a language pair is present.';

comment on column public.profile_language_services.description is
  'Optional free-form description of the service as offered by this profile.';

-- The unique constraint above already provides a composite index leading
-- with profile_id, which fully covers "all services of a profile" lookups;
-- a standalone profile_id index would be redundant.
--
-- Covers "profiles by service type" (leftmost prefix) and combined
-- type + language-pair searches (e.g. legal translators IT -> EN, once
-- joined with profile_language_service_specializations).
create index profile_language_services_type_pair_idx on public.profile_language_services using btree (
  service_type_id,
  source_language_id,
  target_language_id
);

-- Covers "profiles by source language" (leftmost prefix) and "profiles by
-- language pair".
create index profile_language_services_language_pair_idx on public.profile_language_services using btree (source_language_id, target_language_id);

-- "Profiles by target language" is not a prefix of any index above, so it
-- needs its own index.
create index profile_language_services_target_language_idx on public.profile_language_services using btree (target_language_id);

-- Validates business rules that a plain CHECK cannot express because they
-- depend on other tables: whether the service type requires a language
-- pair, and whether the service type/languages are currently active.
-- security invoker + RLS on language_service_types/languages means an
-- inactive (and therefore invisible) type or language is correctly
-- rejected as "unknown or inactive" for the inserting/updating user.
create or replace function public.validate_profile_language_service ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_requires_pair boolean;
  v_type_active boolean;
begin
  select requires_language_pair, is_active
    into v_requires_pair, v_type_active
  from public.language_service_types
  where id = new.service_type_id;

  if v_type_active is null or v_type_active = false then
    raise exception 'service_type_id % is unknown or not active', new.service_type_id;
  end if;

  if v_requires_pair and (new.source_language_id is null or new.target_language_id is null) then
    raise exception 'This service type requires both a source and a target language';
  end if;

  if (new.source_language_id is null) <> (new.target_language_id is null) then
    raise exception 'source_language_id and target_language_id must both be set or both be null';
  end if;

  if new.source_language_id is not null and new.source_language_id = new.target_language_id then
    raise exception 'source_language_id and target_language_id must be different';
  end if;

  if new.direction = 'bidirectional' then
    if new.source_language_id is null then
      raise exception 'A bidirectional service requires a language pair';
    end if;
    if new.source_language_id > new.target_language_id then
      raise exception 'Bidirectional language pairs must be stored with source_language_id < target_language_id';
    end if;
  end if;

  if new.source_language_id is not null and not exists (
    select 1 from public.languages where id = new.source_language_id and is_active = true
  ) then
    raise exception 'source_language_id % is unknown or not active', new.source_language_id;
  end if;

  if new.target_language_id is not null and not exists (
    select 1 from public.languages where id = new.target_language_id and is_active = true
  ) then
    raise exception 'target_language_id % is unknown or not active', new.target_language_id;
  end if;

  return new;
end;
$$;

create trigger profile_language_services_validate
before insert or update on public.profile_language_services
for each row
execute function public.validate_profile_language_service ();

alter table public.profile_language_services enable row level security;

-- 1. Publicly readable only when the linked profile is published (not
-- just active: is_public = true, is_active = true, deleted_at is null,
-- the unified visibility formula used across the Persone domain), the
-- service type is active, and any linked language is active.
create policy "Public can view services of active profiles"
  on public.profile_language_services
  for select
  to public
  using (
    exists (
      select 1
      from public.profiles p
      where
        p.id = profile_language_services.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
    and exists (
      select 1
      from public.language_service_types t
      where
        t.id = profile_language_services.service_type_id
        and t.is_active = true
    )
    and (
      profile_language_services.source_language_id is null
      or exists (
        select 1
        from public.languages sl
        where
          sl.id = profile_language_services.source_language_id
          and sl.is_active = true
      )
    )
    and (
      profile_language_services.target_language_id is null
      or exists (
        select 1
        from public.languages tl
        where
          tl.id = profile_language_services.target_language_id
          and tl.is_active = true
      )
    )
  );

-- 2. A user can always read their own profile's language services, even
-- when the profile is inactive or not otherwise publicly visible.
create policy "Users can view their own language services"
  on public.profile_language_services
  for select
  to authenticated
  using (auth.uid () = profile_id);

-- 3. A user may add services only to their own profile.
create policy "Users can add their own language services"
  on public.profile_language_services
  for insert
  to authenticated
  with check (auth.uid () = profile_id);

-- 4. A user may update only their own profile's language services.
create policy "Users can update their own language services"
  on public.profile_language_services
  for update
  to authenticated
  using (auth.uid () = profile_id)
  with check (auth.uid () = profile_id);

-- 5. A user may delete only their own profile's language services.
create policy "Users can delete their own language services"
  on public.profile_language_services
  for delete
  to authenticated
  using (auth.uid () = profile_id);

grant select on public.profile_language_services to anon;

grant select, insert, update, delete on public.profile_language_services to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_profile_language_services_updated_at ()
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

create trigger profile_language_services_set_updated_at
before update on public.profile_language_services
for each row
execute function public.set_profile_language_services_updated_at ();
