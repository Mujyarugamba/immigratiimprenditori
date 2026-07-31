-- M2.2 — create business operational language declarations
-- Persists LinguaOperativaImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §14 M2.2;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §4, §5, §11.3.
--
-- Scope:
--   owned declarations that a Business is operationally capable in a language
--   from the shared public.languages catalog (VO03), qualified by usage
--   context (C05/VO01); declaration lifecycle Dichiarata/Rimossa;
--   uniqueness of (business, language, usage_context) among declared rows.
--
-- Explicitly out of scope:
--   catalog ownership / seed / alter of languages;
--   Person LinguaParlata / proficiency / CEFR / native;
--   UI/i18n / site translations; editorial content;
--   translation/interpreting services; verification (M6.1);
--   publication/visibility gates (M7.1); locations (M3+); is_primary
--   (not prescribed for LinguaOperativaImpresa — unlike SettoreImpresa).
--
-- Precondition: public.businesses (M1.1+), public.languages.

create table public.business_operational_language_declarations (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  language_id bigint not null references public.languages (id) on delete restrict,
  usage_context text not null,
  declaration_status text not null default 'declared',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Contesto d'uso (Physical §4): Tipologia C05 / VO01 on LinguaOperativaImpresa.
  -- Exact closed set from Logical §2 / Physical §4. Text check (not ENUM).
  -- NOT NULL without default: each declaration must state its usage context.
  constraint business_operational_language_declarations_usage_context_check check (
    usage_context in (
      'commercial',
      'administrative',
      'customer_service',
      'technical',
      'training'
    )
  ),
  -- S01 of LinguaOperativaImpresa (Physical §11.3): Dichiarata / Rimossa
  -- (terminale). Removal keeps the row (S08/PF8); not businesses.deleted_at
  -- and not languages.is_active.
  constraint business_operational_language_declarations_declaration_status_check check (
    declaration_status in (
      'declared',
      'removed'
    )
  )
);

comment on table public.business_operational_language_declarations is
  'LinguaOperativaImpresa (E02) owned by the Imprese Aggregate Root: a business declaration that it is operationally capable in a language from the shared public.languages catalog (VO03), for a given usage context. Organizational capability — not Persona LinguaParlata, not UI/i18n, not translation/interpreting services, not verification (M6.1). Cardinality 0..N; same language may appear under different contexts; same context may have multiple languages (Logical R8).';

comment on column public.business_operational_language_declarations.id is
  'Stable identity of this LinguaOperativaImpresa declaration (Physical §5). Distinct from business_id and from language_id. Not reused.';

comment on column public.business_operational_language_declarations.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE: declaration exists only within the Aggregate. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_operational_language_declarations.language_id is
  'VO03 reference to public.languages.id (bigint catalog PK). Required. ON DELETE RESTRICT. No copied language code/name; catalog remains authoritative. Not inferred from Person languages.';

comment on column public.business_operational_language_declarations.usage_context is
  'Usage context (C05) of this operational language declaration: commercial | administrative | customer_service | technical | training. Qualifies the declaration; not proficiency, not CEFR, not primary-language flag. Same business may declare the same language under more than one context.';

comment on column public.business_operational_language_declarations.declaration_status is
  'S01 of LinguaOperativaImpresa: declared | removed. removed is terminal for this row; historical retention (Physical §11.3). Distinct from businesses.deleted_at, businesses.is_archived, and languages.is_active.';

comment on column public.business_operational_language_declarations.created_at is
  'Creation timestamp of the declaration row. System-managed default.';

comment on column public.business_operational_language_declarations.updated_at is
  'Last update timestamp. Maintained by business_operational_language_declarations_set_updated_at; not a client-owned field.';

create index business_operational_language_declarations_business_id_idx
  on public.business_operational_language_declarations using btree (business_id);

create index business_operational_language_declarations_language_id_idx
  on public.business_operational_language_declarations using btree (language_id);

-- Same business cannot hold two declared rows for the same language in the
-- same usage context. Different contexts for the same language are allowed.
-- Removed rows remain for history; a later re-declaration may insert a new row.
create unique index business_operational_language_declarations_declared_uidx
  on public.business_operational_language_declarations
    using btree (business_id, language_id, usage_context)
  where declaration_status = 'declared';

create or replace function public.set_business_operational_language_declarations_updated_at ()
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

create trigger business_operational_language_declarations_set_updated_at
before update on public.business_operational_language_declarations
for each row
execute function public.set_business_operational_language_declarations_updated_at ();

alter table public.business_operational_language_declarations enable row level security;

-- Defense in depth: no policies in M2.2. Deny-by-default for anon/authenticated.
-- service_role and owner privileges are not revoked.
revoke all on table public.business_operational_language_declarations from anon, authenticated;
