-- M5.1 — create professional served territories
-- Implements owned territory coverage declarations of Professionisti:
--   public.professional_served_territories
-- (docs/architecture/migrations/professionisti-migration-plan.md §16 M5.1;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.11,
--  §29.5, §29.6, §29.9, §29.22.12, §29.23–§29.26, §29.33;
--  docs/architecture/logical/professionisti.md §8 — Territorio di esercizio
--  vs Territorio servito; presence modes; no Territori catalog).
--
-- Scope of this unit only: one owned table under professional_profiles,
-- opaque country_ref (no geographic FK), partial UNIQUE, indexes,
-- updated_at function/trigger, RLS, REVOKE.
-- Explicitly out of scope: territories/countries tables; coordinates;
-- offices/sedi; per-service coverage; temporal availability (AR); M6 FEV;
-- seed; policies; GRANT; alterations to M1–M4.

create table public.professional_served_territories (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  country_ref text not null,
  territory_label text null,
  coverage_kind text not null default 'served',
  presence_mode text not null default 'unspecified',
  declaration_status text not null default 'declared',
  verification_status text not null default 'unverified',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_served_territories_pkey primary key (id),
  constraint professional_served_territories_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint prof_served_territories_country_ref_not_blank_check check (
    length(btrim(country_ref)) > 0
  ),
  constraint prof_served_territories_territory_label_check check (
    territory_label is null
    or length(btrim(territory_label)) > 0
  ),
  constraint prof_served_territories_coverage_kind_check check (
    coverage_kind in ('exercise', 'served', 'both')
  ),
  constraint prof_served_territories_presence_mode_check check (
    presence_mode in ('in_person', 'remote', 'hybrid', 'unspecified')
  ),
  constraint prof_served_territories_declaration_status_check check (
    declaration_status in ('declared', 'removed')
  ),
  constraint prof_served_territories_verification_status_check check (
    verification_status in ('unverified', 'verified', 'contested')
  ),
  constraint prof_served_territories_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.professional_served_territories is
  'Owned Entity (E02) of professional_profiles: declared territory of exercise and/or service coverage with presence mode. country_ref is an opaque platform country reference (typically ISO 3166-1 alpha-2 convention) — not a FK to territories/countries (absent in cycle 1). Distinct from per-service coverage (deferred), offices/sedi, and temporal availability on the Aggregate Root. Row-level verification_status is unverified|verified|contested (no in_review). Lifecycle via declaration_status; historical rows retained; no soft-delete.';

comment on column public.professional_served_territories.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_served_territories.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — territory declarations do not outlive the profile.';

comment on column public.professional_served_territories.country_ref is
  'Opaque country reference (platform convention; typically ISO 3166-1 alpha-2). Required and non-blank. Not a FK to territories/countries. Future non-destructive evolution may add a nullable territory_id.';

comment on column public.professional_served_territories.territory_label is
  'Optional descriptive sub-area label (region/area). Nullable. Blank/whitespace rejected when present; use NULL when absent.';

comment on column public.professional_served_territories.coverage_kind is
  'Closed coverage role: exercise | served | both. Default served. Part of the declared UNIQUE key with country_ref.';

comment on column public.professional_served_territories.presence_mode is
  'Closed presence mode for this territory: in_person | remote | hybrid | unspecified. Default unspecified.';

comment on column public.professional_served_territories.declaration_status is
  'Light declaration lifecycle: declared | removed. Default declared. Partial UNIQUE applies only to declared rows.';

comment on column public.professional_served_territories.verification_status is
  'Row-level verification S03: unverified | verified | contested. Default unverified. Intentionally without in_review. Not FEV profile aspect persistence (M6).';

comment on column public.professional_served_territories.sort_order is
  'Display/order weight among territories of the same profile. Default 0. Must be >= 0.';

comment on column public.professional_served_territories.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_served_territories.updated_at is
  'Last update timestamp. Maintained by professional_served_territories_set_updated_at.';

create unique index prof_served_territories_declared_uidx
  on public.professional_served_territories (professional_profile_id, country_ref, coverage_kind)
  where declaration_status = 'declared';

create index prof_served_territories_professional_profile_id_idx
  on public.professional_served_territories (professional_profile_id);

create index prof_served_territories_country_ref_idx
  on public.professional_served_territories (country_ref);

create or replace function public.set_professional_served_territories_updated_at ()
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

comment on function public.set_professional_served_territories_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_served_territories. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce geographic catalogs, per-service coverage, or M6 FEV.';

create trigger professional_served_territories_set_updated_at
before update on public.professional_served_territories
for each row
execute function public.set_professional_served_territories_updated_at ();

alter table public.professional_served_territories enable row level security;

-- Defense in depth: no policies in M5.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_served_territories from public;
revoke all on table public.professional_served_territories from anon, authenticated;
