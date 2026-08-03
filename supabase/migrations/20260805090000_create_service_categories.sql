-- M1.1 — create service categories
-- Implements the normative C03 category catalog of Servizi:
--   public.service_categories
-- (docs/architecture/migrations/servizi-migration-plan.md §10 M1.1;
--  docs/architecture/physical/domain-mapping/servizi.md §9.1, §23–§27;
--  docs/architecture/logical/servizi.md §12).
--
-- Scope of this unit only: catalog structure and 6 normative seed rows.
-- Explicitly out of scope: economic bands (M1.2); Servizi aggregate roots and owned
-- tables (M2+); professional_categories; professional_service_natures; business_sectors;
-- DV4 language_service_*; marketplace; prices; demo data; RLS policies; GRANT.

create table public.service_categories (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_categories_pkey primary key (code),
  constraint service_categories_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint service_categories_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint service_categories_sort_order_check check (sort_order >= 0)
);

comment on table public.service_categories is
  'Normative local controlled catalog (C03) of vertical service categories for the Servizi domain. Owned by Servizi. Classifies OffertaDiServizio and RichiestaDiServizio. Not professional_categories, not professional_service_natures, not business_sectors, not DV4 language_service_types, not a specialized vertical subdomain table, and not a marketplace taxonomy. Seed is normative, not demo (M8.1 SKIP).';

comment on column public.service_categories.code is
  'Stable technical English identifier of the service category. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced later by Servizi aggregate roots via category_code.';

comment on column public.service_categories.name_it is
  'Italian display label of the category (Physical §9.1). Descriptive only; not unique and not identity.';

comment on column public.service_categories.description is
  'Optional governance description. Nullable when no authoritative text is provided. Not an offer/request description.';

comment on column public.service_categories.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.service_categories.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.service_categories.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_categories.updated_at is
  'Last update timestamp. Maintained by service_categories_set_updated_at.';

create index service_categories_is_active_idx
  on public.service_categories using btree (is_active);

create index service_categories_sort_order_idx
  on public.service_categories using btree (sort_order);

alter table public.service_categories enable row level security;

-- Defense in depth: no policies in M1.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.service_categories from public;
revoke all on table public.service_categories from anon, authenticated;

create or replace function public.set_service_categories_updated_at ()
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

comment on function public.set_service_categories_updated_at () is
  'BEFORE UPDATE trigger function for public.service_categories. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger service_categories_set_updated_at
before update on public.service_categories
for each row
execute function public.set_service_categories_updated_at ();

-- Normative seed from Physical §9.1 / Migration Plan M1.1.
-- Exactly 6 categories. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.service_categories (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  ('linguistic', 'Servizi linguistici e interculturali', null, true, 10),
  ('training', 'Servizi formativi', null, true, 20),
  ('professional_generic', 'Servizi professionali generici', null, true, 30),
  ('financial', 'Servizi finanziari', null, true, 40),
  ('real_estate', 'Servizi immobiliari', null, true, 50),
  ('support_other', 'Supporto / altro', null, true, 90);
