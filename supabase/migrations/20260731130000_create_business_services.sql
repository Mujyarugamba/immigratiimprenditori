-- M4.1 — create business services
-- Persists ServizioImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §16 M4.1;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §4, §8A, §11.2, §15;
-- Logical imprese.md §2 / §10 regola 15.
--
-- Scope:
--   owned concrete service offers of a Business: obligatory name;
--   optional declarative description, target audience, served territory;
--   own publication status (S04 — draft|published);
--   removal retention (S08 — active|removed).
--
-- Explicitly out of scope:
--   ServizioProfessionale (Professionisti); ProdottoImpresa (M4.2);
--   Opportunità; Contatto; catalogo servizi piattaforma; lingue del servizio
--   (future relation to LinguaOperativaImpresa); FK to languages / M2.2;
--   FK to business_locations / M3.1; Territori; MercatoImpresa;
--   territory_id / location_id / market_id; ISO / GIS / addresses;
--   visibility_status (non_public|public — Sede/Canale vocabulary);
--   UNIQUE on name; JSON/array; price/category/slug; verification;
--   publication gates (M7.1).
--
-- Precondition: public.businesses (M1.1+). No dependency on M2.2 or M3.1.

create table public.business_services (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Nome del servizio (Physical §8A.1; Logical §10 regola 15).
  name text not null,
  -- Descrizione dichiarativa facoltativa (Physical §8A.1).
  description text,
  -- Destinatari: testo dichiarativo aperto (Physical §8A.1).
  target_audience text,
  -- Territorio servito: dichiarazione geografica (Physical §8A.1).
  -- Not SedeImpresa, not Territori VO03, not MercatoImpresa.
  served_territory text,
  -- S04 of ServizioImpresa (Physical §8A.3 / §11.2): Bozza / Pubblicato.
  -- Ceiling vs Impresa publication is an M7.1 gate, not a composite CHECK here.
  publication_status text not null default 'draft',
  -- Existence/removal of the dependent service (Physical §8A.3 / §11.2 S08).
  -- Distinct from businesses.deleted_at and from M2 declaration_status.
  service_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_services_name_check check (
    length(btrim(name)) > 0
  ),
  constraint business_services_served_territory_check check (
    served_territory is null
    or length(btrim(served_territory)) > 0
  ),
  constraint business_services_publication_status_check check (
    publication_status in (
      'draft',
      'published'
    )
  ),
  constraint business_services_service_status_check check (
    service_status in (
      'active',
      'removed'
    )
  )
);

comment on table public.business_services is
  'ServizioImpresa (E02) owned by the Imprese Aggregate Root: a concrete service offer declared by the business. Not an abstract service typology, not ServizioProfessionale (Professionisti), not ProdottoImpresa (M4.2), not Opportunità, not editorial content. Cardinality 0..N per business; each service belongs to exactly one business. Languages for a service are out of M4.1.';

comment on column public.business_services.id is
  'Local stable identity of this ServizioImpresa within the Aggregate (Physical §5/§8A). Distinguishes services of the same business. Not a public autonomous identity, slug, or public code.';

comment on column public.business_services.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_services.name is
  'Declarative obligatory name of the service offer (Logical §10 regola 15; Physical §8A.1). Free-form, non-blank. Not a category, taxonomy code, slug, or technical identifier. Same name may appear on multiple rows for one business. Retained when service_status = removed.';

comment on column public.business_services.description is
  'Optional declarative text describing the service. Not autonomous editorial content. Nullable; empty string not constrained in M4.1. Retained when service_status = removed.';

comment on column public.business_services.target_audience is
  'Optional open declarative description of intended recipients (e.g. PMI, famiglie e privati, enti). Not a closed vocabulary, not a relation to named subjects, not a Destinatari catalog, not array/JSON. Retained when service_status = removed.';

comment on column public.business_services.served_territory is
  'Optional declarative geographic area where the service is available (Physical §8A.1). Not SedeImpresa / business_locations, not Territori FK/VO03, not MercatoImpresa, not street address, not GIS/coordinates, not territory_id UUID. When set, must be non-blank. Retained when service_status = removed.';

comment on column public.business_services.publication_status is
  'S04 own publication status of the service: draft | published (Bozza/Pubblicato). Not visibility_status non_public|public (Sede/Canale vocabulary). May be stricter than Impresa publication; ceiling coherence is M7.1. Not RLS. Independent of service_status.';

comment on column public.business_services.service_status is
  'S08 existence of this service in the Aggregate composition: active | removed. removed retains the row and all content fields including publication_status. Reactivation (removed → active) is allowed. Not publication, not verification, not businesses.deleted_at.';

comment on column public.business_services.created_at is
  'Creation timestamp of the service row. System-managed default.';

comment on column public.business_services.updated_at is
  'Last update timestamp. Maintained by business_services_set_updated_at; not a client-owned field.';

create index business_services_business_id_idx
  on public.business_services using btree (business_id);

create or replace function public.set_business_services_updated_at ()
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

create trigger business_services_set_updated_at
before update on public.business_services
for each row
execute function public.set_business_services_updated_at ();

alter table public.business_services enable row level security;

-- Defense in depth: no policies in M4.1. Deny-by-default for anon/authenticated.
revoke all on table public.business_services from anon, authenticated;
