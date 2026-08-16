-- M1.3 — create internationalization need types
-- Implements the normative C03 need-type catalog of Mercati Internazionali:
--   public.internationalization_need_types
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M1.3;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.3;
--  docs/architecture/logical/mercati-internazionali.md §8).
--
-- Scope of this unit only: catalog structure and 19 normative seed rows.
-- Explicitly out of scope: markets, countries, support resources, presences,
-- interests, activities, commercial relations, need instances, sources,
-- evidences, verifications, Opportunities, Services, demo data.
-- Does not alter M1.1 or M1.2.

create table public.internationalization_need_types (
  code text not null,
  label_it text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intnt_pkey primary key (code),
  constraint intnt_code_not_blank_check check (length(btrim(code)) > 0),
  constraint intnt_label_it_not_blank_check check (length(btrim(label_it)) > 0),
  constraint intnt_sort_order_check check (sort_order >= 0)
);

comment on table public.internationalization_need_types is
  'Normative controlled catalog (C03) of internationalization need types for Mercati Internazionali. Owned by Mercati Internazionali. Each row defines a stable need-type vocabulary entry, not a concrete need instance declared by a subject, not an Opportunity, not a Service, and not a market support resource. Does not confer priority, status, publication, visibility, verification, badge, score, or technical permission. M1.3 seed is normative, not demo (M8.1).';

comment on column public.internationalization_need_types.code is
  'Stable technical English identifier of the need type. Primary key. Not a localized label. Immutable by convention; referenced by future internationalization_needs.need_type_code.';

comment on column public.internationalization_need_types.label_it is
  'Italian display label aligned to Logical §8 need-type names. Descriptive only; not unique and not identity.';

comment on column public.internationalization_need_types.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority of a need instance, not identity, and not unique.';

comment on column public.internationalization_need_types.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, visibility, or verification.';

comment on column public.internationalization_need_types.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.internationalization_need_types.updated_at is
  'Last update timestamp. Maintained by internationalization_need_types_set_updated_at.';

alter table public.internationalization_need_types enable row level security;

-- Defense in depth: no policies in M1.3. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.internationalization_need_types from anon, authenticated;

create or replace function public.set_internationalization_need_types_updated_at ()
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

comment on function public.set_internationalization_need_types_updated_at () is
  'BEFORE UPDATE trigger function for public.internationalization_need_types. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger internationalization_need_types_set_updated_at
before update on public.internationalization_need_types
for each row
execute function public.set_internationalization_need_types_updated_at ();

-- Normative seed from Logical §8 / Physical §35.3 / Migration Plan M1.3.
-- Exactly 19 need types. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.internationalization_need_types (
  code,
  label_it,
  sort_order,
  is_active
)
values
  (
    'find_customers',
    'Ricerca clienti',
    10,
    true
  ),
  (
    'find_suppliers',
    'Ricerca fornitori',
    20,
    true
  ),
  (
    'find_distributors',
    'Ricerca distributori',
    30,
    true
  ),
  (
    'find_agents',
    'Ricerca agenti',
    40,
    true
  ),
  (
    'find_industrial_partners',
    'Ricerca partner industriali',
    50,
    true
  ),
  (
    'find_investors',
    'Ricerca investitori',
    60,
    true
  ),
  (
    'find_financing',
    'Ricerca finanziamenti',
    70,
    true
  ),
  (
    'open_site',
    'Apertura di una sede',
    80,
    true
  ),
  (
    'access_trade_fairs',
    'Accesso a fiere',
    90,
    true
  ),
  (
    'regulatory_adaptation',
    'Adeguamento normativo',
    100,
    true
  ),
  (
    'certifications',
    'Certificazioni',
    110,
    true
  ),
  (
    'logistics',
    'Logistica',
    120,
    true
  ),
  (
    'international_payments',
    'Pagamenti internazionali',
    130,
    true
  ),
  (
    'contractual_protection',
    'Tutela contrattuale',
    140,
    true
  ),
  (
    'ip_protection',
    'Tutela della proprietà intellettuale',
    150,
    true
  ),
  (
    'language_mediation',
    'Traduzione e mediazione linguistica',
    160,
    true
  ),
  (
    'intercultural_training',
    'Formazione interculturale',
    170,
    true
  ),
  (
    'find_staff',
    'Ricerca di personale',
    180,
    true
  ),
  (
    'access_institutional_networks',
    'Accesso a reti istituzionali',
    190,
    true
  );
