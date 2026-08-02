-- M1.2 — create professional practice modes
-- Implements the normative C03 practice-mode catalog of Professionisti:
--   public.professional_practice_modes
-- (docs/architecture/migrations/professionisti-migration-plan.md §12 M1.2;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.2, §29.3.2,
--  §29.12, §29.22, §29.27;
--  docs/architecture/logical/professionisti.md §4).
--
-- Scope of this unit only: catalog structure and 11 normative seed rows.
-- Explicitly out of scope: categories, source kinds, service natures,
-- professional profiles, memberships, employment contracts, availability,
-- specializations, qualifications, services, FEV, demo data, RLS policies,
-- GRANT. Does not create or alter public.professional_categories.

create table public.professional_practice_modes (
  code text not null,
  label_it text not null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_practice_modes_pkey primary key (code),
  constraint professional_practice_modes_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint professional_practice_modes_label_it_not_blank_check check (
    length(btrim(label_it)) > 0
  ),
  constraint professional_practice_modes_sort_order_check check (sort_order >= 0)
);

comment on table public.professional_practice_modes is
  'Normative local controlled catalog (C03) of professional practice modes for Professionisti. Owned by Professionisti. Each row declares how a Persona exercises professionally (Logical §4), not a Persona–Impresa membership, not an employment contract, not a corporate legal form catalog, not availability, not a professional category, and not a service offer. Does not confer publication, verification, visibility, badge, or score. M1.2 seed is normative, not demo (M8.1 SKIP).';

comment on column public.professional_practice_modes.code is
  'Stable technical English identifier of the practice mode. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced optionally by professional_profiles.practice_mode_code.';

comment on column public.professional_practice_modes.label_it is
  'Italian display label aligned to Logical Professionisti §4 practice-mode names. Descriptive only; not unique and not identity.';

comment on column public.professional_practice_modes.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.professional_practice_modes.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.professional_practice_modes.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_practice_modes.updated_at is
  'Last update timestamp. Maintained by professional_practice_modes_set_updated_at.';

alter table public.professional_practice_modes enable row level security;

-- Defense in depth: no policies in M1.2. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_practice_modes from public;
revoke all on table public.professional_practice_modes from anon, authenticated;

create or replace function public.set_professional_practice_modes_updated_at ()
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

comment on function public.set_professional_practice_modes_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_practice_modes. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger professional_practice_modes_set_updated_at
before update on public.professional_practice_modes
for each row
execute function public.set_professional_practice_modes_updated_at ();

-- Normative seed from Logical §4 / Physical §29.27 / Migration Plan M1.2.
-- Exactly 11 practice modes. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.professional_practice_modes (
  code,
  label_it,
  sort_order,
  is_active
)
values
  ('individual', 'Esercizio individuale', 10, true),
  ('individual_firm', 'Studio individuale', 20, true),
  ('associated_firm', 'Studio associato', 30, true),
  ('professional_company', 'Società tra professionisti', 40, true),
  ('consulting_company', 'Società di consulenza', 50, true),
  ('business_collaboration', 'Collaborazione con Impresa', 60, true),
  ('specialist_employee', 'Dipendente che svolge funzioni specialistiche', 70, true),
  ('professional_network', 'Rete professionale', 80, true),
  ('external_professional', 'Professionista esterno', 90, true),
  ('occasional', 'Attività occasionale compatibile con il dominio', 100, true),
  ('international_cross_border', 'Attività internazionale o transfrontaliera', 110, true);
