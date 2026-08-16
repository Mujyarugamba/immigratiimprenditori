-- M6.3 — create opportunity context references
-- Implements optional R02 professional, market/territory, and sector
-- context references of the Opportunità domain
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §17;
--  docs/architecture/physical/domain-mapping/opportunita.md §15.C §15.C.1–§15.C.8;
--  approved Physical §15 micro-review with non-blocking findings).
--
-- Depends on:
--   public.opportunities (M1.1)
--   public.profiles (Persone) — professional references
--   public.business_sectors — sector references
--
-- Creates (order):
--   public.opportunity_professional_references
--   public.opportunity_market_references
--   public.opportunity_sector_references
--
-- Scope of this unit only: optional contextual PF5 links (D16/D18 + shared
-- sector catalog). Explicitly out of scope: Appartenenza (M6.2), party roles
-- (M6.1), candidature, beneficiaries, platform publication/visibility (M7),
-- Events/Collaborations outbound, Presenza/Interesse/Esperienza markets,
-- professional verification/service delivery, seed data, policies, grants.
--
-- Context reference ≠ Persona ownership ≠ Mercato ownership ≠
-- Settore ownership ≠ Destinatario ≠ candidatura ≠ pubblicazione M7.
-- Soft deletion of opportunities (deleted_at) does not remove context rows;
-- physical delete of an opportunity cascades owned context composition rows.
-- market_id and service_ref are opaque UUIDs without FK until remote tables
-- exist.

-- ---------------------------------------------------------------------------
-- 1) Professional references (D16 via Persona)
-- ---------------------------------------------------------------------------

create table public.opportunity_professional_references (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  person_id uuid not null references public.profiles (id) on delete restrict,
  service_ref uuid,
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_professional_references_note_not_blank_check check (
    note is null
    or btrim(note) <> ''
  ),
  constraint opportunity_professional_references_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_professional_references is
  'R02 optional professional-context composition owned by an Opportunità: opaque PF5 link to a Persona whose professional qualification is relevant (D16). Not a Professionisti Aggregate, not ownership of Persona/Profilo/Servizio, not candidature, not platform publication (M7). Structural cardinality 0..N; current relationship state only.';

comment on column public.opportunity_professional_references.id is
  'Technical row identifier only. Does not confer autonomous professional-domain identity.';

comment on column public.opportunity_professional_references.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_professional_references.person_id is
  'Opaque Persona identity (D16 via Persone) through public.profiles. Required; ON DELETE RESTRICT. No copied anagraphic or professional attributes.';

comment on column public.opportunity_professional_references.service_ref is
  'Optional opaque future ServizioProfessionale identity. No foreign key in M6.3; not ownership or delivery of the service. FK may be added later when the Professionisti schema exists.';

comment on column public.opportunity_professional_references.note is
  'Optional declared local context note. Plain text; anti-blank when set; not a curriculum dump; not authoritative qualification data.';

comment on column public.opportunity_professional_references.sort_order is
  'Editorial display order among professional references on the sheet, lower values first. Not unique, not scoring, not identity.';

comment on column public.opportunity_professional_references.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_professional_references.updated_at is
  'Last update timestamp. Maintained by opportunity_professional_references_set_updated_at.';

create index opportunity_professional_references_opportunity_id_idx
  on public.opportunity_professional_references using btree (opportunity_id);

create index opportunity_professional_references_person_id_idx
  on public.opportunity_professional_references using btree (person_id);

create unique index opportunity_professional_references_opportunity_person_uidx
  on public.opportunity_professional_references using btree (opportunity_id, person_id);

create or replace function public.set_opportunity_professional_references_updated_at ()
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

create trigger opportunity_professional_references_set_updated_at
before update on public.opportunity_professional_references
for each row
execute function public.set_opportunity_professional_references_updated_at ();

alter table public.opportunity_professional_references enable row level security;

revoke all on table public.opportunity_professional_references from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) Market / territory references (D18)
-- ---------------------------------------------------------------------------

create table public.opportunity_market_references (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  market_id uuid,
  territory_label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_market_references_resolution_check check (
    (
      market_id is not null
      and territory_label is null
    )
    or (
      market_id is null
      and territory_label is not null
      and btrim(territory_label) <> ''
    )
  ),
  constraint opportunity_market_references_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_market_references is
  'R02 optional market/territory-context composition owned by an Opportunità: opaque PF5 link to a Mercato (UUID) or a declared territory/market label (D18). Not PresenzaInternazionale, InteresseMercato, or EsperienzaInternazionale; not ownership of Mercati; not platform publication (M7). Structural cardinality 0..N; exactly one resolution branch per row.';

comment on column public.opportunity_market_references.id is
  'Technical row identifier only. Does not confer autonomous market-domain identity.';

comment on column public.opportunity_market_references.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_market_references.market_id is
  'Opaque Mercato identity (D18) when known. No foreign key in M6.3 because Mercati tables are not yet in schema; a later additive migration may add FK ON DELETE RESTRICT. Mutually exclusive with territory_label.';

comment on column public.opportunity_market_references.territory_label is
  'Declared non-authoritative territory/market label when market_id is absent. Required (anti-blank) in the label branch. Not a local geopolitics catalog; not JSON. Mutually exclusive with market_id.';

comment on column public.opportunity_market_references.sort_order is
  'Editorial display order among market/territory references on the sheet, lower values first. Not unique, not scoring, not identity.';

comment on column public.opportunity_market_references.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_market_references.updated_at is
  'Last update timestamp. Maintained by opportunity_market_references_set_updated_at.';

create index opportunity_market_references_opportunity_id_idx
  on public.opportunity_market_references using btree (opportunity_id);

create unique index opportunity_market_references_opportunity_market_uidx
  on public.opportunity_market_references using btree (opportunity_id, market_id)
  where market_id is not null;

create unique index opportunity_market_references_opportunity_territory_label_uidx
  on public.opportunity_market_references using btree (opportunity_id, territory_label)
  where territory_label is not null;

create or replace function public.set_opportunity_market_references_updated_at ()
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

create trigger opportunity_market_references_set_updated_at
before update on public.opportunity_market_references
for each row
execute function public.set_opportunity_market_references_updated_at ();

alter table public.opportunity_market_references enable row level security;

revoke all on table public.opportunity_market_references from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) Sector references (shared catalog business_sectors)
-- ---------------------------------------------------------------------------

create table public.opportunity_sector_references (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  sector_id bigint not null references public.business_sectors (id) on delete restrict,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_sector_references_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_sector_references is
  'R02 optional sector-context composition owned by an Opportunità: PF5/VO03 link to the shared business_sectors catalog. Sheet classificatory context only — not Destinatario (M4.1), not Requisito text (M4.2), not ownership of the sector catalog, not platform publication (M7). Structural cardinality 0..N.';

comment on column public.opportunity_sector_references.id is
  'Technical row identifier only. Does not confer autonomous sector-domain identity.';

comment on column public.opportunity_sector_references.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_sector_references.sector_id is
  'Opaque reference to public.business_sectors (shared platform catalog). Required; ON DELETE RESTRICT. No copied sector name/slug attributes; catalog remains authoritative.';

comment on column public.opportunity_sector_references.sort_order is
  'Editorial display order among sector references on the sheet, lower values first. Not unique, not scoring, not identity.';

comment on column public.opportunity_sector_references.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_sector_references.updated_at is
  'Last update timestamp. Maintained by opportunity_sector_references_set_updated_at.';

create index opportunity_sector_references_opportunity_id_idx
  on public.opportunity_sector_references using btree (opportunity_id);

create unique index opportunity_sector_references_opportunity_sector_uidx
  on public.opportunity_sector_references using btree (opportunity_id, sector_id);

create or replace function public.set_opportunity_sector_references_updated_at ()
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

create trigger opportunity_sector_references_set_updated_at
before update on public.opportunity_sector_references
for each row
execute function public.set_opportunity_sector_references_updated_at ();

alter table public.opportunity_sector_references enable row level security;

-- Defense in depth: no policies in M6.3. Completeness gates for contextual
-- references belong to later units (M7) if required. With RLS enabled and no
-- policy, roles subject to RLS cannot read or write. service_role and owner
-- privileges are not revoked.
revoke all on table public.opportunity_sector_references from anon, authenticated;
