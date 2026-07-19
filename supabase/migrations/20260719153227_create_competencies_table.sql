-- Create public.competencies, the minimal catalog of declarable competency
-- areas backing the CompetenzaDichiarata entity of the Persone domain
-- (public.profile_competencies, not created by this migration). Implements
-- M3 of docs/architecture/migrations/persone-migration-plan.md, per
-- docs/architecture/physical/persone.md (§5.2, "Modello fisico finale").
--
-- Same governance pattern already validated for public.languages: a
-- centrally governed catalog, no user writes, public read access limited to
-- active rows. Deliberately minimal (indicatively 15-25 broad entries per
-- §5.1/§5.2 of the physical model): the exact seed list is out of scope for
-- this migration and is not inserted here. Has no dependency on profiles or
-- on any other Persone-domain table.

create table public.competencies (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competencies_slug_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint competencies_name_check check (length(trim(name)) > 0)
);

comment on table public.competencies is
  'Minimal, centrally governed catalog of declarable competency areas (e.g. "Export e internazionalizzazione", "Digital marketing"), backing profile_competencies (CompetenzaDichiarata). Deliberately broad and non-exhaustive: not a full taxonomy. No user writes; only active rows are publicly readable.';

comment on column public.competencies.slug is
  'Stable, URL-safe identifier for the competency, unique across the catalog.';

comment on column public.competencies.is_active is
  'Governs catalog visibility and usability: only active competencies can be newly declared by a profile and are publicly readable. Existing declarations referencing a since-deactivated competency are not deleted (see the on delete restrict foreign key on profile_competencies.competency_id, defined when that table is created).';

comment on column public.competencies.sort_order is
  'Manual display ordering hint for catalog listings, lower values first. Not a uniqueness key: ties are expected and broken by name.';

-- No index on is_active or sort_order: on a deliberately minimal catalog
-- (15-25 rows, physical model §5.1), a sequential scan is at least as fast
-- as using either, and the physical model's own §9 does not list them as
-- indispensable for this table. slug already has one via its unique
-- constraint.

alter table public.competencies enable row level security;

-- Anyone (anonymous or authenticated) can read active competencies only.
create policy "Public can view active competencies"
  on public.competencies
  for select
  to public
  using (is_active = true);

grant select on public.competencies to anon, authenticated;

-- Explicit defense in depth: without this, anon/authenticated would still
-- be unable to write (RLS above defines no insert/update/delete policy for
-- any role, so those operations are already denied by default), but this
-- removes the underlying table-level privilege too, in case RLS is ever
-- disabled by mistake.
revoke insert, update, delete
on public.competencies
from anon, authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_competencies_updated_at ()
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

create trigger competencies_set_updated_at
before update on public.competencies
for each row
execute function public.set_competencies_updated_at ();
