-- M1.3 — create professional source kinds
-- Implements the normative C03 source-kind catalog of Professionisti:
--   public.professional_source_kinds
-- (docs/architecture/migrations/professionisti-migration-plan.md §12 M1.3;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.2, §29.3.3,
--  §29.12, §29.21, §29.22, §29.27;
--  docs/architecture/logical/professionisti.md §11).
--
-- Scope of this unit only: catalog structure and 13 normative seed rows.
-- Explicitly out of scope: professional_profile_sources / evidences /
-- verifications, Storage, URLs, concrete source instances, categories,
-- practice modes, service natures, profiles, credentials, demo data,
-- RLS policies, GRANT. Does not create or alter M1.1/M1.2 tables.
-- Future consumer: M6.1 professional_profile_sources.source_kind_code.

create table public.professional_source_kinds (
  code text not null,
  label_it text not null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_source_kinds_pkey primary key (code),
  constraint professional_source_kinds_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint professional_source_kinds_label_it_not_blank_check check (
    length(btrim(label_it)) > 0
  ),
  constraint professional_source_kinds_sort_order_check check (sort_order >= 0)
);

comment on table public.professional_source_kinds is
  'Normative local controlled catalog (C03) of source kinds for Professionisti FEV. Owned by Professionisti. Each row classifies a type of source (Logical §11), not a concrete source instance, not an evidence, not a verification outcome, not a named Order/College, not a Storage object, and not a URL. Referenced later by professional_profile_sources.source_kind_code (M6.1). Does not confer publication, verification, visibility, badge, or score. M1.3 seed is normative, not demo (M8.1 SKIP).';

comment on column public.professional_source_kinds.code is
  'Stable technical English identifier of the source kind. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced by future professional_profile_sources.';

comment on column public.professional_source_kinds.label_it is
  'Italian display label aligned to Logical Professionisti §11 source-kind names. Descriptive only; not unique and not identity.';

comment on column public.professional_source_kinds.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.professional_source_kinds.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.professional_source_kinds.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_source_kinds.updated_at is
  'Last update timestamp. Maintained by professional_source_kinds_set_updated_at.';

alter table public.professional_source_kinds enable row level security;

-- Defense in depth: no policies in M1.3. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_source_kinds from public;
revoke all on table public.professional_source_kinds from anon, authenticated;

create or replace function public.set_professional_source_kinds_updated_at ()
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

comment on function public.set_professional_source_kinds_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_source_kinds. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger professional_source_kinds_set_updated_at
before update on public.professional_source_kinds
for each row
execute function public.set_professional_source_kinds_updated_at ();

-- Normative seed from Logical §11 / Physical §29.27 / Migration Plan M1.3.
-- Exactly 13 source kinds. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.professional_source_kinds (
  code,
  label_it,
  sort_order,
  is_active
)
values
  ('professional_declaration', 'Dichiarazione del Professionista', 10, true),
  ('order_college', 'Ordine o Collegio', 20, true),
  ('public_register', 'Registro pubblico', 30, true),
  ('university', 'Università', 40, true),
  ('certifier', 'Ente certificatore', 50, true),
  ('professional_organization', 'Organizzazione professionale', 60, true),
  ('business', 'Impresa', 70, true),
  ('professional_firm', 'Studio professionale', 80, true),
  ('client', 'Cliente', 90, true),
  ('partner_body', 'Ente partner', 100, true),
  ('editorial', 'Redazione', 110, true),
  ('public_source', 'Fonte pubblica', 120, true),
  ('official_document', 'Documento ufficiale', 130, true);
