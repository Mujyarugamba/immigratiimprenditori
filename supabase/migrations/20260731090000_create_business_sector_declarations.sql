-- M2.1 — create business sector declarations
-- Persists SettoreImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §14 M2.1;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §5, §6, §11.3, §14.
--
-- Scope:
--   owned declarations linking public.businesses to the shared catalog
--   public.business_sectors (VO03); principal vs secondary (is_primary);
--   declaration lifecycle Dichiarata/Rimossa (declaration_status);
--   optional external institutional classification (C06, e.g. ATECO text);
--   uniqueness of (business, sector) among declared rows;
--   at most one declared primary per business.
--
-- Explicitly out of scope:
--   catalog ownership / seed / alter of business_sectors;
--   operational languages (M2.2); locations/channels/services/products;
--   certifications/media; verification model (M6.1); publication gates (M7.1);
--   ATECO as shared taxonomy (forbidden); MercatoImpresa; policies; frontend.
--
-- Precondition: public.businesses (M1.1+), public.business_sectors.

create table public.business_sector_declarations (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  sector_id bigint not null references public.business_sectors (id) on delete restrict,
  is_primary boolean not null default false,
  declaration_status text not null default 'declared',
  external_classification text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- S01 of SettoreImpresa (Physical §11.3): Dichiarata / Rimossa (terminale).
  -- Text check (not ENUM). Removal is a status transition that keeps the row
  -- (S08/PF8); not technical soft-delete and not catalog deactivation.
  constraint business_sector_declarations_declaration_status_check check (
    declaration_status in (
      'declared',
      'removed'
    )
  )
);

comment on table public.business_sector_declarations is
  'SettoreImpresa (E02) owned by the Imprese Aggregate Root: a business declaration that it operates in a sector from the shared public.business_sectors catalog (VO03/C02). Does not own the catalog. Not verification (M6.1). Not MercatoImpresa. Cardinality 0..N per business; at most one declared primary.';

comment on column public.business_sector_declarations.id is
  'Stable identity of this SettoreImpresa declaration (Physical §5). Distinct from business_id and from sector_id. Not reused.';

comment on column public.business_sector_declarations.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE: declaration exists only within the Aggregate. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_sector_declarations.sector_id is
  'VO03 reference to public.business_sectors.id (bigint catalog PK). Required. ON DELETE RESTRICT. No copied sector name/slug; catalog remains authoritative.';

comment on column public.business_sector_declarations.is_primary is
  'Principal vs secondary declaration (Logical R4 / Physical §6): true = settore principale; false = settore secondario. At most one declared primary per business (partial unique index). Not verification, not display order, not catalog ownership.';

comment on column public.business_sector_declarations.declaration_status is
  'S01 of SettoreImpresa: declared | removed. removed is terminal for this row; historical retention (Physical §11.3/§14). Distinct from businesses.deleted_at, businesses.is_archived, and business_sectors.is_active.';

comment on column public.business_sector_declarations.external_classification is
  'Optional C06 descriptive institutional classification declared for this SettoreImpresa (e.g. external official code such as ATECO). Not a shared taxonomy VO03; not verified in M2.1; not a second sector catalog.';

comment on column public.business_sector_declarations.created_at is
  'Creation timestamp of the declaration row. System-managed default.';

comment on column public.business_sector_declarations.updated_at is
  'Last update timestamp. Maintained by business_sector_declarations_set_updated_at; not a client-owned field.';

-- FK lookup patterns. Unique constraints below are partial (status-aware).
create index business_sector_declarations_business_id_idx
  on public.business_sector_declarations using btree (business_id);

create index business_sector_declarations_sector_id_idx
  on public.business_sector_declarations using btree (sector_id);

-- Same business cannot hold two declared rows for the same catalog sector.
-- Removed rows remain for history; a later re-declaration may insert a new row.
create unique index business_sector_declarations_business_sector_declared_uidx
  on public.business_sector_declarations using btree (business_id, sector_id)
  where declaration_status = 'declared';

-- At most one declared settore principale per Impresa (Physical §10 / Plan M2.1;
-- mechanism deferred from Physical §24.11 to concrete schema — this unit).
create unique index business_sector_declarations_one_primary_declared_uidx
  on public.business_sector_declarations using btree (business_id)
  where is_primary = true
    and declaration_status = 'declared';

create or replace function public.set_business_sector_declarations_updated_at ()
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

create trigger business_sector_declarations_set_updated_at
before update on public.business_sector_declarations
for each row
execute function public.set_business_sector_declarations_updated_at ();

alter table public.business_sector_declarations enable row level security;

-- Defense in depth: no policies in M2.1 (publication/visibility and business
-- permissions belong to later units / Identità & Accessi + Appartenenze).
-- Deny-by-default for anon/authenticated. service_role and owner unchanged.
revoke all on table public.business_sector_declarations from anon, authenticated;
