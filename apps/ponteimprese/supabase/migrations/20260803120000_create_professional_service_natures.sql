-- M1.4 — create professional service natures
-- Implements the normative C03 service-nature catalog of Professionisti:
--   public.professional_service_natures
-- (docs/architecture/migrations/professionisti-migration-plan.md §12 M1.4;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.2, §29.3.4,
--  §29.12, §29.15, §29.22, §29.27;
--  docs/architecture/logical/professionisti.md §7).
--
-- Scope of this unit only: catalog structure and 7 normative seed rows.
-- Explicitly out of scope: professional_services, commercial offers, prices,
-- tariffs, bookings, contracts, payments, marketplace, profiles, credentials,
-- categories, practice modes, source kinds, demo data, RLS policies, GRANT.
-- Does not create or alter M1.1/M1.2/M1.3 tables.
-- Future consumer: M4.3 professional_services.service_nature_code.

create table public.professional_service_natures (
  code text not null,
  label_it text not null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_service_natures_pkey primary key (code),
  constraint professional_service_natures_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint professional_service_natures_label_it_not_blank_check check (
    length(btrim(label_it)) > 0
  ),
  constraint professional_service_natures_sort_order_check check (sort_order >= 0)
);

comment on table public.professional_service_natures is
  'Normative local controlled catalog (C03) of service natures for Professionisti. Owned by Professionisti. Each row classifies the descriptive nature of a declared professional service (Logical §7), not a concrete service instance, not a commercial offer, not a purchasable product or performance, not a price, tariff, booking, contract, or payment. Referenced later by professional_services.service_nature_code (M4.3). Does not confer publication, verification, visibility, badge, or score. M1.4 seed is normative, not demo (M8.1 SKIP).';

comment on column public.professional_service_natures.code is
  'Stable technical English identifier of the service nature. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced by future professional_services.';

comment on column public.professional_service_natures.label_it is
  'Italian display label aligned to Logical Professionisti §7 service-nature names. Descriptive only; not unique and not identity.';

comment on column public.professional_service_natures.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.professional_service_natures.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.professional_service_natures.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_service_natures.updated_at is
  'Last update timestamp. Maintained by professional_service_natures_set_updated_at.';

alter table public.professional_service_natures enable row level security;

-- Defense in depth: no policies in M1.4. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_service_natures from public;
revoke all on table public.professional_service_natures from anon, authenticated;

create or replace function public.set_professional_service_natures_updated_at ()
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

comment on function public.set_professional_service_natures_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_service_natures. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger professional_service_natures_set_updated_at
before update on public.professional_service_natures
for each row
execute function public.set_professional_service_natures_updated_at ();

-- Normative seed from Logical §7 / Physical §29.27 / Migration Plan M1.4.
-- Exactly 7 service natures. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.professional_service_natures (
  code,
  label_it,
  sort_order,
  is_active
)
values
  ('consulting', 'Consulenza', 10, true),
  ('training', 'Formazione', 20, true),
  ('assistance', 'Assistenza', 30, true),
  ('representation', 'Rappresentanza', 40, true),
  ('design', 'Progettazione', 50, true),
  ('verification', 'Verifica', 60, true),
  ('accompaniment', 'Accompagnamento', 70, true);
