-- M1.1 — create professional categories
-- Implements the normative C03 category catalog of Professionisti:
--   public.professional_categories
-- (docs/architecture/migrations/professionisti-migration-plan.md §12 M1.1;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.2, §29.3.1,
--  §29.12, §29.22, §29.27;
--  docs/architecture/logical/professionisti.md §5).
--
-- Scope of this unit only: catalog structure and 33 normative seed rows.
-- Explicitly out of scope: practice modes, source kinds, service natures,
-- professional profiles, specializations, qualifications, registrations,
-- authorizations, certifications, services, territories, languages, markets,
-- sectors, FEV, demo data, RLS policies, GRANT.

create table public.professional_categories (
  code text not null,
  label_it text not null,
  group_code text not null,
  description text null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_categories_pkey primary key (code),
  constraint professional_categories_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint professional_categories_label_it_not_blank_check check (
    length(btrim(label_it)) > 0
  ),
  constraint professional_categories_sort_order_check check (sort_order >= 0),
  constraint professional_categories_group_code_check check (
    group_code in (
      'legal_tax_labor',
      'finance_credit',
      'technical_built',
      'digital_communication',
      'trade_international',
      'people_org',
      'real_estate',
      'linguistic_intercultural',
      'ip_innovation',
      'residual'
    )
  )
);

comment on table public.professional_categories is
  'Normative local controlled catalog (C03) of first-level professional categories for Professionisti. Owned by Professionisti. Each row is a stable category vocabulary entry, not a specialization catalog, not a qualification, not a professional profile, not an Order/College registry, not a shared competency taxonomy, not a business sector, and not a service offer. Does not confer publication, verification, visibility, badge, or score. M1.1 seed is normative, not demo (M8.1 SKIP).';

comment on column public.professional_categories.code is
  'Stable technical English identifier of the professional category. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced by professional_profile_categories.';

comment on column public.professional_categories.label_it is
  'Italian display label aligned to Logical Professionisti §5 category names. Descriptive only; not unique and not identity.';

comment on column public.professional_categories.group_code is
  'Closed vocabulary of the ten Logical §5 / Physical §29.22 professional groups. Not a foreign key; no separate groups table. Italian group labels must not be stored here.';

comment on column public.professional_categories.description is
  'Optional governance description. Nullable when no authoritative text is provided. Not a specialization and not a profile summary.';

comment on column public.professional_categories.sort_order is
  'Canonical administrative display order within this catalog (monotonic per Logical §5 group order), lower values first. Not priority, not identity, and not unique.';

comment on column public.professional_categories.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.professional_categories.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_categories.updated_at is
  'Last update timestamp. Maintained by professional_categories_set_updated_at.';

alter table public.professional_categories enable row level security;

-- Defense in depth: no policies in M1.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_categories from public;
revoke all on table public.professional_categories from anon, authenticated;

create or replace function public.set_professional_categories_updated_at ()
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

comment on function public.set_professional_categories_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_categories. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger professional_categories_set_updated_at
before update on public.professional_categories
for each row
execute function public.set_professional_categories_updated_at ();

-- Normative seed from Logical §5 / Physical §29.27 / Migration Plan M1.1.
-- Exactly 33 categories. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.professional_categories (
  code,
  label_it,
  group_code,
  description,
  sort_order,
  is_active
)
values
  ('legal_area', 'Area legale', 'legal_tax_labor', null, 10, true),
  ('tax_accounting', 'Fiscale e contabile', 'legal_tax_labor', null, 20, true),
  ('labor_welfare', 'Lavoro e previdenza', 'legal_tax_labor', null, 30, true),
  ('finance', 'Finanza', 'finance_credit', null, 40, true),
  ('subsidized_finance', 'Finanza agevolata', 'finance_credit', null, 50, true),
  ('credit', 'Credito', 'finance_credit', null, 60, true),
  ('insurance', 'Assicurazioni', 'finance_credit', null, 70, true),
  ('engineering', 'Ingegneria', 'technical_built', null, 80, true),
  ('architecture', 'Architettura', 'technical_built', null, 90, true),
  ('construction', 'Edilizia', 'technical_built', null, 100, true),
  ('energy', 'Energia', 'technical_built', null, 110, true),
  ('sustainability', 'Sostenibilità', 'technical_built', null, 120, true),
  ('safety', 'Sicurezza', 'technical_built', null, 130, true),
  ('digital', 'Digitale', 'digital_communication', null, 140, true),
  ('informatics', 'Informatica', 'digital_communication', null, 150, true),
  ('marketing', 'Marketing', 'digital_communication', null, 160, true),
  ('communication', 'Comunicazione', 'digital_communication', null, 170, true),
  ('commerce', 'Commercio', 'trade_international', null, 180, true),
  ('export', 'Export', 'trade_international', null, 190, true),
  ('internationalization', 'Internazionalizzazione', 'trade_international', null, 200, true),
  ('customs', 'Dogane', 'trade_international', null, 210, true),
  ('logistics', 'Logistica', 'trade_international', null, 220, true),
  ('training', 'Formazione', 'people_org', null, 230, true),
  ('human_resources', 'Risorse umane', 'people_org', null, 240, true),
  ('business_organization', 'Organizzazione aziendale', 'people_org', null, 250, true),
  ('real_estate', 'Immobiliare', 'real_estate', null, 260, true),
  ('translation', 'Traduzione', 'linguistic_intercultural', null, 270, true),
  ('interpreting', 'Interpretariato', 'linguistic_intercultural', null, 280, true),
  ('cultural_mediation', 'Mediazione culturale', 'linguistic_intercultural', null, 290, true),
  ('intellectual_property', 'Proprietà intellettuale', 'ip_innovation', null, 300, true),
  ('innovation', 'Innovazione', 'ip_innovation', null, 310, true),
  ('startup', 'Startup', 'ip_innovation', null, 320, true),
  ('other_professional', 'Altri ambiti professionali', 'residual', null, 330, true);
