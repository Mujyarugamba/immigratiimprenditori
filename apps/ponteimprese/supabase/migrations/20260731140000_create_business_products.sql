-- M4.2 — create business products
-- Persists ProdottoImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §16 M4.2;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §4, §8B, §11.2, §15;
-- Logical imprese.md §2 / §10 regola 16.
--
-- Scope:
--   owned declarative product offers or product lines of a Business:
--   obligatory name; optional description;
--   own publication status (S04 — draft|published);
--   removal retention (S08 — active|removed via product_status).
--
-- Explicitly out of scope:
--   ServizioImpresa / business_services; e-commerce; price/currency/stock;
--   structured product categories; target_audience; served_territory; languages;
--   media; MercatoImpresa; Territori; SedeImpresa; Opportunità;
--   ServizioProfessionale; SKU/slug/public_id; visibility_status;
--   UNIQUE on name; JSON/array; publication gates (M7.1).
--
-- Precondition: public.businesses (M1.1+). No dependency on M4.1 or M2–M3.

create table public.business_products (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Nome del prodotto (Physical §8B.1; Logical §10 regola 16).
  name text not null,
  -- Descrizione dichiarativa facoltativa (Physical §8B.1).
  description text,
  -- S04 of ProdottoImpresa (Physical §8B.2 / §11.2): Bozza / Pubblicato.
  -- Ceiling vs Impresa publication is an M7.1 gate, not a composite CHECK here.
  publication_status text not null default 'draft',
  -- Existence/removal of the dependent product (Physical §8B.2 / §11.2 S08).
  -- Distinct from businesses.deleted_at and from M2 declaration_status.
  product_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_products_name_check check (
    length(btrim(name)) > 0
  ),
  constraint business_products_publication_status_check check (
    publication_status in (
      'draft',
      'published'
    )
  ),
  constraint business_products_product_status_check check (
    product_status in (
      'active',
      'removed'
    )
  )
);

comment on table public.business_products is
  'ProdottoImpresa (E02) owned by the Imprese Aggregate Root: a declarative product offer or product line of the business. Not ServizioImpresa, not an e-commerce catalog, not a structured category taxonomy. No price, availability, media, languages, or territories in M4.2. Cardinality 0..N per business.';

comment on column public.business_products.id is
  'Local stable identity of this ProdottoImpresa within the Aggregate. Not a public autonomous identity, slug, SKU, or catalog code.';

comment on column public.business_products.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_products.name is
  'Declarative obligatory name of the product or product line (Logical §10 regola 16; Physical §8B.1). Free-form, non-blank. Same name may appear on multiple rows for one business. Retained when product_status = removed.';

comment on column public.business_products.description is
  'Optional declarative text describing the product. Not autonomous editorial content. Nullable; empty string not constrained in M4.2. Retained when product_status = removed.';

comment on column public.business_products.publication_status is
  'S04 own publication status: draft | published. Not visibility_status. Ceiling vs Impresa publication is M7.1. Independent of product_status.';

comment on column public.business_products.product_status is
  'S08 existence in the Aggregate composition: active | removed. removed retains the row and content fields including publication_status. Reactivation allowed. Not publication, not verification, not businesses.deleted_at.';

comment on column public.business_products.created_at is
  'Creation timestamp of the product row. System-managed default.';

comment on column public.business_products.updated_at is
  'Last update timestamp. Maintained by business_products_set_updated_at; not a client-owned field.';

create index business_products_business_id_idx
  on public.business_products using btree (business_id);

create or replace function public.set_business_products_updated_at ()
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

comment on function public.set_business_products_updated_at () is
  'BEFORE UPDATE trigger function for public.business_products.updated_at. SECURITY INVOKER; empty search_path. Does not enforce publication or lifecycle gates.';

create trigger business_products_set_updated_at
before update on public.business_products
for each row
execute function public.set_business_products_updated_at ();

alter table public.business_products enable row level security;

-- Defense in depth: no policies in M4.2. Deny-by-default for anon/authenticated.
revoke all on table public.business_products from anon, authenticated;
