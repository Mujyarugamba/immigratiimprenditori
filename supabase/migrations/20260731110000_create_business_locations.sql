-- M3.1 — create business locations
-- Persists SedeImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §15 M3.1;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §4, §7, §11.2, §15.
--
-- Scope:
--   owned locations of a Business: location type (C05), transitional
--   territorial declaration (Plan §9.1 / Physical §24.14 / dependency-map §14 —
--   declarative localization without creating a Territori domain; future remap
--   to VO03 when the shared catalog is mapped), principal-per-type role (VO01),
--   own visibility (S04), removal retention (S08 — active|removed; not
--   Dichiarata/Rimossa of M2).
--
-- Explicitly out of scope:
--   Territori catalog tables; street address / CAP / GPS / geocoding / maps;
--   MercatoImpresa; Event venues; profile addresses; channels (M3.2);
--   verification of location (none in Physical §12); publication gates (M7.1);
--   uniqueness enforcement beyond principal-per-type (Physical §24.12 → schema).
--
-- Precondition: public.businesses (M1.1+). No territory table dependency.

create table public.business_locations (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Transitional territorial declaration (Plan §9.1). Readable localization
  -- pending future VO03 remap. Not a FK. Not a future catalog PK type.
  -- Not street address / CAP / GPS. Not a local Territori catalog.
  territory_reference text not null,
  location_type text not null,
  is_primary boolean not null default false,
  -- S04 of SedeImpresa (Physical §11.2): Non pubblico / Pubblico.
  -- Ceiling vs Impresa publication is an M7.1 gate, not a composite CHECK here.
  visibility_status text not null default 'non_public',
  -- Existence/removal of the dependent location (Physical §11.2 S01 N/A as a
  -- distinct real-world axis; S08 historization on removal §14/§217).
  -- Distinct from businesses.deleted_at and from Settore/Lingua declaration_status.
  location_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Tipologia di sede (Physical §4/§6 C05; Logical §2).
  constraint business_locations_location_type_check check (
    location_type in (
      'legal',
      'operational',
      'retail_point',
      'laboratory',
      'plant',
      'warehouse',
      'office',
      'secondary'
    )
  ),
  constraint business_locations_visibility_status_check check (
    visibility_status in (
      'non_public',
      'public'
    )
  ),
  constraint business_locations_location_status_check check (
    location_status in (
      'active',
      'removed'
    )
  ),
  constraint business_locations_territory_reference_check check (
    length(btrim(territory_reference)) > 0
  )
);

comment on table public.business_locations is
  'SedeImpresa (E02) owned by the Imprese Aggregate Root: a physical/operational place where the business is present. Localization via transitional territory_reference (declarative; Territori catalog not yet mapped; future remap to VO03). Not MercatoImpresa, not Event venue, not profile address, not street geocoding. Cardinality 0..N per business; each location belongs to exactly one business.';

comment on column public.business_locations.id is
  'Local stable identity of this SedeImpresa within the Aggregate (Physical §7/§215). Distinguishes seats of the same business. Not a public autonomous identity.';

comment on column public.business_locations.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_locations.territory_reference is
  'Transitional territorial declaration for this seat (Logical R12: exactly one Territory per seat). Readable free-form localization pending future reconciliation to shared Territori VO03 when that catalog is physically mapped. Not a foreign key. Does not anticipate the identity type of the future Territori catalog. Not street address, CAP, GPS, structured geography, or a local Territori catalog owned by Imprese.';

comment on column public.business_locations.location_type is
  'Tipologia di sede (C05): legal | operational | retail_point | laboratory | plant | warehouse | office | secondary. One type per location row; multiple locations of the same type may coexist unless constrained by is_primary rules.';

comment on column public.business_locations.is_primary is
  'Ruolo di sede principale for this location_type (VO01; Logical §10 regola 4). At most one active primary per (business, location_type). Not verification, not MercatoImpresa.';

comment on column public.business_locations.visibility_status is
  'S04 own visibility of the seat: non_public | public. May be stricter than Impresa publication (Physical §9/§15); ceiling coherence is M7.1. Not RLS.';

comment on column public.business_locations.location_status is
  'Existence of this seat in the Aggregate composition: active | removed. removed retains the row (S08/PF8). Distinct from businesses.is_archived, businesses.deleted_at, and M2 declaration_status.';

comment on column public.business_locations.created_at is
  'Creation timestamp of the location row. System-managed default.';

comment on column public.business_locations.updated_at is
  'Last update timestamp. Maintained by business_locations_set_updated_at; not a client-owned field.';

create index business_locations_business_id_idx
  on public.business_locations using btree (business_id);

create index business_locations_territory_reference_idx
  on public.business_locations using btree (territory_reference);

create index business_locations_location_type_idx
  on public.business_locations using btree (location_type);

-- At most one active primary seat per typology per business
-- (Physical §10 regola 4; mechanism deferred at §24.12 → this schema unit).
create unique index business_locations_one_primary_active_uidx
  on public.business_locations using btree (business_id, location_type)
  where is_primary = true
    and location_status = 'active';

create or replace function public.set_business_locations_updated_at ()
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

create trigger business_locations_set_updated_at
before update on public.business_locations
for each row
execute function public.set_business_locations_updated_at ();

alter table public.business_locations enable row level security;

-- Defense in depth: no policies in M3.1. Deny-by-default for anon/authenticated.
revoke all on table public.business_locations from anon, authenticated;
