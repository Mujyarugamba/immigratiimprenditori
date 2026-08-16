-- M1.1 — create business core
-- Implements the minimal Aggregate Root structure for the Imprese domain
-- (docs/architecture/migrations/imprese-migration-plan.md §12–§13;
--  docs/architecture/physical/domain-mapping/imprese.md §3–§6).
--
-- Scope of this unit only:
--   stable identity, legal_name (denominazione), public_name,
--   summary (descrizione sintetica), description (presentazione estesa),
--   organization_form (C03), size_band (C03 placeholder column),
--   founding_year, created_at / updated_at, soft deletion via deleted_at.
--
-- Explicitly out of scope (M1.2+ / other domains):
--   lifecycle axes (S01/S02/S04/S07), publication, visibility, verification,
--   locations, sectors, operational languages, services, products, channels,
--   certifications, media, Appartenenze, Mercati, Opportunità FK, fiscal IDs,
--   Marchio entity, previous-name history table, seed data, public read access.
--
-- No dependency on profiles, business_sectors, languages, or any other domain table.
-- Table name public.businesses matches the AR name anticipated by Opportunità
-- (opaque business_id → future FK to public.businesses(id)).

create table public.businesses (
  id uuid primary key default gen_random_uuid (),
  legal_name text not null,
  public_name text not null,
  summary text,
  description text,
  organization_form text,
  size_band text,
  founding_year integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint businesses_legal_name_not_blank_check check (length(trim(legal_name)) > 0),
  constraint businesses_public_name_not_blank_check check (length(trim(public_name)) > 0),
  -- Forma organizzativa: C03 local controlled list from Logical §2 / Physical §6.
  -- Text check (not a PostgreSQL ENUM) keeps the vocabulary evolvable without
  -- freezing a database type. NULL allowed for incomplete census drafts.
  constraint businesses_organization_form_check check (
    organization_form is null
    or organization_form in (
      'sole_proprietorship',
      'company',
      'cooperative',
      'startup',
      'organized_professional_activity',
      'social_enterprise',
      'economic_entity',
      'commercial_or_craft_activity'
    )
  ),
  -- Dimensione: Logical §2 describes size as scale bands but does not enumerate
  -- closed values. Column is present for the C03 concept; closed vocabulary
  -- CHECK is intentionally omitted until bands are explicitly decided.
  -- Non-blank when provided.
  constraint businesses_size_band_not_blank_check check (
    size_band is null
    or length(trim(size_band)) > 0
  ),
  -- Anno di avvio (T03). Nullable. Year-only integer; clock-independent bounds.
  constraint businesses_founding_year_check check (
    founding_year is null
    or (
      founding_year >= 1000
      and founding_year <= 9999
    )
  )
);

comment on table public.businesses is
  'Aggregate Root of the Imprese domain: economic subject identity and core presentation. M1.1 core only — no lifecycle axes, publication, verification, owned entities, or inter-domain FK. Soft-deleted via deleted_at; never hard-deleted by this unit. Independent of Persone/Appartenenze.';

comment on column public.businesses.id is
  'Stable internal identity of the Business. Independent of legal_name, public_name, presentation, people, memberships, markets, or opportunities. Not reused.';

comment on column public.businesses.legal_name is
  'Denominazione: administrative/legal name of the economic subject. Required even for incomplete drafts. Distinct from public_name. Not a fiscal identifier.';

comment on column public.businesses.public_name is
  'Nome pubblico: platform-facing display/search name. May coincide with legal_name or be a commercial name. Not required to be globally unique (Physical §5). Required in M1.1 so a census draft always has a human-facing label.';

comment on column public.businesses.summary is
  'Descrizione sintetica: optional short presentation for lists and search. Nullable so an incomplete draft can exist before later units complete the sheet.';

comment on column public.businesses.description is
  'Presentazione estesa: optional longer presentation of what the business does. Not an editorial StoriaImpresa (Contenuti Editoriali).';

comment on column public.businesses.organization_form is
  'Forma organizzativa (C03): sole_proprietorship, company, cooperative, startup, organized_professional_activity, social_enterprise, economic_entity, commercial_or_craft_activity. Nullable for incomplete drafts. Not a shared taxonomy (C02). Not verification state.';

comment on column public.businesses.size_band is
  'Dimensione (C03 concept): optional scale band declaration. Logical does not enumerate closed bands; no closed CHECK in M1.1. Not a precise headcount or accounting figure. Not a shared taxonomy.';

comment on column public.businesses.founding_year is
  'Anno di avvio: optional year the business began operating (credibility/context). Year-only; not a full date interval. Not substantial-status (active/ceased — M1.2).';

comment on column public.businesses.created_at is
  'Census/creation timestamp of the business row. System-managed default.';

comment on column public.businesses.updated_at is
  'Last update timestamp. Maintained by businesses_set_updated_at; not a client-owned field.';

comment on column public.businesses.deleted_at is
  'Technical/administrative soft deletion of the row. Distinct from future lifecycle axes (M1.2) and from publication/visibility. Preserves identity and row; no hard delete in M1.1. No previous-name history table in this unit.';

alter table public.businesses enable row level security;

-- Defense in depth: no policies in M1.1 (publication/visibility and business
-- permissions belong to later units / Identità & Accessi + Appartenenze).
-- With RLS enabled and no policy, roles subject to RLS cannot read or write.
-- Explicit revoke removes table-level privileges that might otherwise be
-- inherited by anon/authenticated. service_role and owner privileges are
-- not revoked.
revoke all on table public.businesses from anon, authenticated;

-- Keeps updated_at current on every row update. Table-local function, same
-- pattern as opportunities / business_sectors / profiles (no shared helper
-- required or assumed). SECURITY INVOKER; empty search_path; does not touch
-- created_at or deleted_at.
create or replace function public.set_businesses_updated_at ()
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

create trigger businesses_set_updated_at
before update on public.businesses
for each row
execute function public.set_businesses_updated_at ();
