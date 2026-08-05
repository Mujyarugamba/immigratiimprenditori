-- M1.1 — create organization types
-- Implements the normative C03 typology catalog of Organizzazioni:
--   public.organization_types
-- (docs/architecture/migrations/organizzazioni-migration-plan.md §10 M1.1;
--  docs/architecture/physical/domain-mapping/organizzazioni.md §10.1–§10.2;
--  docs/architecture/logical/organizzazioni.md).
--
-- Scope of this unit only: catalog structure and 11 normative seed rows.
-- Explicitly out of scope: activity scopes; organizations AR; officials;
-- membership; Org–Org; cooperative as typology; profiles.organization_type;
-- RLS policies; GRANT.

create table public.organization_types (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_types_pkey primary key (code),
  constraint organization_types_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint organization_types_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint organization_types_sort_order_check check (sort_order >= 0)
);

comment on table public.organization_types is
  'Normative local controlled catalog (C03) of institutional organization typologies for the Organizzazioni domain. Owned by Organizzazioni. Classifies Organizzazione via organizations.type_code. Not Impresa (businesses), not cooperative economic forms, not profiles.organization_type legacy, not membership/Appartenenze. Seed is normative, not demo (M8.1 SKIP).';

comment on column public.organization_types.code is
  'Stable technical English identifier of the organization typology. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced by organizations.type_code.';

comment on column public.organization_types.name_it is
  'Italian display label of the typology (Physical §10.2). Descriptive only; not unique and not identity.';

comment on column public.organization_types.description is
  'Optional governance description. Nullable when no authoritative text is provided. Not organization body text.';

comment on column public.organization_types.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.organization_types.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.organization_types.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.organization_types.updated_at is
  'Last update timestamp. Maintained by organization_types_set_updated_at.';

create index organization_types_is_active_idx
  on public.organization_types using btree (is_active);

create index organization_types_sort_order_idx
  on public.organization_types using btree (sort_order);

alter table public.organization_types enable row level security;

-- Defense in depth: no policies in M1.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.organization_types from public;
revoke all on table public.organization_types from anon, authenticated;

create or replace function public.set_organization_types_updated_at ()
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

comment on function public.set_organization_types_updated_at () is
  'BEFORE UPDATE trigger function for public.organization_types. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger organization_types_set_updated_at
before update on public.organization_types
for each row
execute function public.set_organization_types_updated_at ();

-- Normative seed from Physical §10.2 / Migration Plan M1.1.
-- Exactly 11 typologies. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.organization_types (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  ('association', 'Associazione', null, true, 10),
  ('foundation', 'Fondazione', null, true, 20),
  ('public_body', 'Ente / organismo pubblico', null, true, 30),
  ('chamber_of_commerce', 'Camera di commercio', null, true, 40),
  ('embassy_consulate', 'Ambasciata / Consolato', null, true, 50),
  ('professional_order', 'Ordine / Collegio professionale', null, true, 60),
  ('university', 'Università / ente di formazione', null, true, 70),
  ('ngo', 'ONG / ente non profit', null, true, 80),
  ('institutional_network', 'Rete / consorzio istituzionale', null, true, 90),
  ('organized_community', 'Comunità organizzata', null, true, 100),
  ('other', 'Altro', null, true, 110);
