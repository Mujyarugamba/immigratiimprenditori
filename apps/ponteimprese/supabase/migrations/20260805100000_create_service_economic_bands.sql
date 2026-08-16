-- M1.2 — create service economic bands
-- Implements the normative C03 indicative economic-band catalog of Servizi:
--   public.service_economic_bands
-- (docs/architecture/migrations/servizi-migration-plan.md §10 M1.2;
--  docs/architecture/physical/domain-mapping/servizi.md §9.2, §18, §23–§27;
--  docs/architecture/logical/servizi.md §15).
--
-- Scope of this unit only: catalog structure and 4 normative seed rows.
-- Explicitly out of scope: service_categories alterations (M1.1); Servizi aggregate
-- roots and owned tables (M2+); numeric prices; currencies; hourly rates;
-- transactions; payments; invoices; commissions; orders; marketplace; demo data;
-- RLS policies; GRANT.

create table public.service_economic_bands (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_economic_bands_pkey primary key (code),
  constraint service_economic_bands_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint service_economic_bands_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint service_economic_bands_sort_order_check check (sort_order >= 0)
);

comment on table public.service_economic_bands is
  'Normative local controlled catalog (C03) of indicative economic bands for the Servizi domain. Owned by Servizi. Labels only — not prices, amounts, currencies, tariffs, transactions, payments, invoices, commissions, or orders. Not a marketplace price list. Seed is normative, not demo (M8.1 SKIP).';

comment on column public.service_economic_bands.code is
  'Stable technical English identifier of the indicative band. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced later by Servizi aggregate roots via economic_band_code when economic_kind = indicative_band.';

comment on column public.service_economic_bands.name_it is
  'Italian display label of the indicative band (Physical §9.2). Descriptive only; not unique and not identity.';

comment on column public.service_economic_bands.description is
  'Optional governance description. Nullable when no authoritative text is provided. Not a monetary amount and not a quote.';

comment on column public.service_economic_bands.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.service_economic_bands.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.service_economic_bands.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_economic_bands.updated_at is
  'Last update timestamp. Maintained by service_economic_bands_set_updated_at.';

create index service_economic_bands_is_active_idx
  on public.service_economic_bands using btree (is_active);

create index service_economic_bands_sort_order_idx
  on public.service_economic_bands using btree (sort_order);

alter table public.service_economic_bands enable row level security;

-- Defense in depth: no policies in M1.2. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.service_economic_bands from public;
revoke all on table public.service_economic_bands from anon, authenticated;

create or replace function public.set_service_economic_bands_updated_at ()
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

comment on function public.set_service_economic_bands_updated_at () is
  'BEFORE UPDATE trigger function for public.service_economic_bands. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger service_economic_bands_set_updated_at
before update on public.service_economic_bands
for each row
execute function public.set_service_economic_bands_updated_at ();

-- Normative seed from Physical §9.2 / Migration Plan M1.2.
-- Exactly 4 bands. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.service_economic_bands (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  ('low', 'Fascia bassa', null, true, 10),
  ('medium', 'Fascia media', null, true, 20),
  ('high', 'Fascia alta', null, true, 30),
  ('variable', 'Variabile / da concordare', null, true, 40);
