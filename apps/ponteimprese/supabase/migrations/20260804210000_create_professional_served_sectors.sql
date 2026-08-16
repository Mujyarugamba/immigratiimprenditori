-- M5.4 — create professional served sectors
-- Implements owned economic-sector coverage declarations of Professionisti:
--   public.professional_served_sectors
-- (docs/architecture/migrations/professionisti-migration-plan.md §16 M5.4;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.14,
--  §29.5, §29.6, §29.22.10, §29.23–§29.26, §29.33;
--  docs/architecture/logical/professionisti.md — settori serviti vs categorie
--  professionali vs SettoreImpresa).
--
-- Scope of this unit only: one owned link table under professional_profiles,
-- FK to shared public.business_sectors(id) bigint, partial UNIQUE, indexes,
-- updated_at function/trigger, RLS, REVOKE.
-- Explicitly out of scope: business_sector_declarations (Imprese);
-- professional_categories (M4.1); per-service sectors; scoring/ranking;
-- is_primary; M6 FEV; seed; policies; GRANT; alterations to M1–M5.3.

create table public.professional_served_sectors (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  sector_id bigint not null,
  declaration_status text not null default 'declared',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_served_sectors_pkey primary key (id),
  constraint professional_served_sectors_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_served_sectors_sector_id_fkey
    foreign key (sector_id)
    references public.business_sectors (id)
    on update no action
    on delete restrict,
  constraint prof_served_sectors_declaration_status_check check (
    declaration_status in ('declared', 'removed')
  ),
  constraint prof_served_sectors_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.professional_served_sectors is
  'Owned link/E02 of professional_profiles: declared economic sector served by the professional profile, linked to shared public.business_sectors. Distinct from Imprese business_sector_declarations, from professional category declarations (M4.1), and from per-service sector links (deferred). No is_primary in cycle 1. Lifecycle via declaration_status; historical rows retained; no soft-delete.';

comment on column public.professional_served_sectors.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_served_sectors.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — sector declarations do not outlive the profile.';

comment on column public.professional_served_sectors.sector_id is
  'FK to shared public.business_sectors(id) bigint. Required. ON UPDATE NO ACTION; ON DELETE RESTRICT. Catalog remains authoritative; not a local Professionisti sector catalog.';

comment on column public.professional_served_sectors.declaration_status is
  'Light declaration lifecycle: declared | removed. Default declared. Partial UNIQUE applies only to declared rows.';

comment on column public.professional_served_sectors.sort_order is
  'Display/order weight among sectors of the same profile. Default 0. Must be >= 0.';

comment on column public.professional_served_sectors.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_served_sectors.updated_at is
  'Last update timestamp. Maintained by professional_served_sectors_set_updated_at.';

create unique index prof_served_sectors_declared_uidx
  on public.professional_served_sectors (professional_profile_id, sector_id)
  where declaration_status = 'declared';

create index prof_served_sectors_professional_profile_id_idx
  on public.professional_served_sectors (professional_profile_id);

create index prof_served_sectors_sector_id_idx
  on public.professional_served_sectors (sector_id);

create or replace function public.set_professional_served_sectors_updated_at ()
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

comment on function public.set_professional_served_sectors_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_served_sectors. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not sync business_sector_declarations, categories, or M6 FEV.';

create trigger professional_served_sectors_set_updated_at
before update on public.professional_served_sectors
for each row
execute function public.set_professional_served_sectors_updated_at ();

alter table public.professional_served_sectors enable row level security;

-- Defense in depth: no policies in M5.4. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_served_sectors from public;
revoke all on table public.professional_served_sectors from anon, authenticated;
