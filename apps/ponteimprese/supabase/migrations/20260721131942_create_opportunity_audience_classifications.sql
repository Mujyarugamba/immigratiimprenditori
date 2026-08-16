-- M4.1 — create opportunity audience classifications
-- Implements CategoriaDestinatario (declared audience) for the Opportunità
-- domain as a local Controlled List (C05) plus classificatory M:N bridge
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §15;
--  docs/architecture/physical/domain-mapping/opportunita.md §16.1–§16.10, §29).
--
-- Depends on:
--   public.opportunities (M1.1)
--
-- Creates:
--   public.opportunity_audience_types
--   public.opportunity_audience_type_assignments
--
-- Scope of this unit only: declared audience categories and their
-- association to opportunities. Explicitly out of scope: Requirements (M4.2),
-- Benefits (M4.3), temporal windows, promoters, verification, publication,
-- candidature, concrete subjects (Persona/Impresa/Professionista), eligibility
-- notes on the bridge, and minimum-one enforcement (publication gate → M7).
--
-- CategoriaDestinatario ≠ soggetto concreto ≠ Requisito ≠ Promotore ≠
-- beneficiario effettivo ≠ candidatura ≠ ammissibilità verificata.

-- ---------------------------------------------------------------------------
-- A. Catalog — public.opportunity_audience_types
-- ---------------------------------------------------------------------------

create table public.opportunity_audience_types (
  id bigint generated always as identity primary key,
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_audience_types_code_not_blank_check check (
    length(trim(code)) > 0
  ),
  constraint opportunity_audience_types_code_format_check check (
    code ~ '^[a-z][a-z0-9_]*$'
  ),
  constraint opportunity_audience_types_name_not_blank_check check (
    length(trim(name)) > 0
  ),
  constraint opportunity_audience_types_description_not_blank_check check (
    description is null
    or length(trim(description)) > 0
  ),
  constraint opportunity_audience_types_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_audience_types is
  'Local Controlled List (C05) CategoriaDestinatario for the Opportunità domain. Declared potential audience categories of an opportunity sheet. Not concrete subjects, not Requirements, not Promoters, not beneficiaries, not candidature. Owned by Opportunità; associations belong to opportunity_audience_type_assignments.';

comment on column public.opportunity_audience_types.id is
  'Stable internal identity of the catalog entry. Independent of code and display name.';

comment on column public.opportunity_audience_types.code is
  'Stable machine-readable English identifier, unique within this list. Not a localized label; not a menu entry. Code professionals is an audience category only — not a FK to the Professionisti domain.';

comment on column public.opportunity_audience_types.name is
  'Italian display name of the audience category, aligned to Physical Mapping §16.';

comment on column public.opportunity_audience_types.description is
  'Optional clarifying note for the declared audience category. Not a requirement, eligibility rule, or editorial CMS content.';

comment on column public.opportunity_audience_types.is_active is
  'Catalog activation flag. Deactivating a value does not soft-delete the row and does not change opportunity lifecycle axes. Preferred over physical delete when assignments exist.';

comment on column public.opportunity_audience_types.sort_order is
  'Canonical administrative display order within this list, lower values first. Not priority, not identity.';

comment on column public.opportunity_audience_types.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_audience_types.updated_at is
  'Last update timestamp. Maintained by opportunity_audience_types_set_updated_at.';

-- Case-insensitive uniqueness on the technical code (same pattern as M2.1).
create unique index opportunity_audience_types_code_uidx
  on public.opportunity_audience_types (lower(trim(code)));

alter table public.opportunity_audience_types enable row level security;

-- Defense in depth: no policies in M4.1. Publication/read access is deferred
-- to M7. With RLS enabled and no policy, roles subject to RLS cannot read or
-- write. service_role and owner privileges are not revoked.
revoke all on table public.opportunity_audience_types from anon, authenticated;

create or replace function public.set_opportunity_audience_types_updated_at ()
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

create trigger opportunity_audience_types_set_updated_at
before update on public.opportunity_audience_types
for each row
execute function public.set_opportunity_audience_types_updated_at ();

-- Normative initial values from Physical Mapping §16.6 (approved M4.1
-- micro-review). Explicit INSERT; fail-fast on unexpected conflict. Not
-- demo/menu labels. Sensitive demographic categories intentionally omitted.
insert into public.opportunity_audience_types (code, name, description, sort_order)
values
  (
    'natural_persons',
    'Persone fisiche',
    'Categoria dichiarata: pubblico di persone fisiche. Non elenca soggetti concreti.',
    10
  ),
  (
    'enterprises',
    'Imprese',
    'Categoria dichiarata: pubblico di imprese. Non elenca imprese concrete.',
    20
  ),
  (
    'startups',
    'Startup',
    'Categoria dichiarata: pubblico di startup. Non sostituisce requisiti dimensionali o di innovazione.',
    30
  ),
  (
    'cooperatives',
    'Cooperative',
    'Categoria dichiarata: pubblico di cooperative. Non sostituisce requisiti di forma giuridica dettagliati.',
    40
  ),
  (
    'professionals',
    'Professionisti',
    'Categoria dichiarata: pubblico di professionisti. Non è un riferimento al dominio Professionisti né a profili.',
    50
  ),
  (
    'aspiring_entrepreneurs',
    'Aspiranti imprenditori',
    'Categoria dichiarata: pubblico di aspiranti imprenditori. Non prova ammissibilità individuale.',
    60
  ),
  (
    'associations',
    'Associazioni',
    'Categoria dichiarata: pubblico di associazioni. Distinta da enti del Terzo settore quando la fonte lo richiede.',
    70
  ),
  (
    'third_sector_entities',
    'Enti del Terzo settore',
    'Categoria dichiarata: pubblico di enti del Terzo settore. Non elenca organizzazioni concrete.',
    80
  ),
  (
    'public_entities',
    'Enti pubblici',
    'Categoria dichiarata: pubblico di enti pubblici. Non elenca amministrazioni concrete.',
    90
  ),
  (
    'other_audience',
    'Altri destinatari',
    'Categoria residuale dichiarata: usare solo quando nessuna voce più precisa è applicabile. Non sostituisce i Requisiti e non rappresenta un soggetto concreto.',
    100
  );

-- ---------------------------------------------------------------------------
-- B. Bridge — public.opportunity_audience_type_assignments
-- ---------------------------------------------------------------------------

create table public.opportunity_audience_type_assignments (
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  opportunity_audience_type_id bigint not null references public.opportunity_audience_types (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, opportunity_audience_type_id)
);

comment on table public.opportunity_audience_type_assignments is
  'Classificatory bridge: Opportunità ↔ CategoriaDestinatario (C05). Multivalue declared audience; not a menu category, not an autonomous entity, not eligibility, not candidature. Structural cardinality 0..N; minimum one for publishability is not database-enforced in M4.1 (gate → M7).';

comment on column public.opportunity_audience_type_assignments.opportunity_id is
  'Referenced opportunity (Aggregate Root). Physical delete cascades associations; soft deletion of the opportunity (deleted_at) does not remove rows.';

comment on column public.opportunity_audience_type_assignments.opportunity_audience_type_id is
  'Referenced local audience category from public.opportunity_audience_types. Catalog deactivation uses is_active; physical catalog delete is restricted while assignments exist.';

comment on column public.opportunity_audience_type_assignments.created_at is
  'Assignment creation timestamp. System-managed default. No updated_at: the association is replaced by delete/insert, not mutated.';

-- Reverse lookup ("opportunities of a given audience type") and FK support.
create index opportunity_audience_type_assignments_type_idx
  on public.opportunity_audience_type_assignments using btree (opportunity_audience_type_id);

alter table public.opportunity_audience_type_assignments enable row level security;

-- Defense in depth: no policies in M4.1. Publication/visibility read paths
-- belong to later units (M7). With RLS enabled and no policy, roles subject
-- to RLS cannot read or write. service_role and owner are not revoked.
revoke all on table public.opportunity_audience_type_assignments from anon, authenticated;
