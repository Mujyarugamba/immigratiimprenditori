-- M1.1 — create business membership roles
-- Implements the normative C03 role catalog of the Appartenenze domain:
--   public.business_membership_roles
-- (docs/architecture/migrations/appartenenze-migration-plan.md §14 M1.1;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.1;
--  docs/architecture/logical/appartenenze.md §4).
--
-- Scope of this unit only: catalog structure and 11 normative seed rows.
-- Explicitly out of scope: business_memberships AR, qualifications, sources,
-- evidences, management authorizations, responsibility declarations,
-- aspect verifications, Opportunità FK/integration, Organizations,
-- responsibilities as powers, technical permissions, demo data.

create table public.business_membership_roles (
  code text not null,
  label_it text not null,
  typical_natures text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmr_pkey primary key (code),
  constraint bmr_code_not_blank_check check (length(btrim(code)) > 0),
  constraint bmr_code_format_check check (code ~ '^[a-z][a-z0-9_]*$'),
  constraint bmr_label_it_not_blank_check check (length(btrim(label_it)) > 0),
  constraint bmr_typical_natures_not_blank_check check (length(btrim(typical_natures)) > 0),
  constraint bmr_sort_order_check check (sort_order >= 0)
);

comment on table public.business_membership_roles is
  'Normative controlled catalog (C03) of organizational roles for Persona–Impresa memberships. Owned by Appartenenze. Role is distinct from declared responsibilities, from management authorization (business fact), and from technical permissions, RLS policies, or JWT claims. contact_referent does not imply uniqueness of referent per Impresa. sheet_manager does not grant platform access or policies by itself.';

comment on column public.business_membership_roles.code is
  'Stable technical English identifier of the role. Primary key (unique) referenced by future business_memberships.role_id. Not a localized label.';

comment on column public.business_membership_roles.label_it is
  'Italian display label aligned to Logical §4 role names.';

comment on column public.business_membership_roles.typical_natures is
  'Descriptive typical nature(s) of the role from Logical §4. Classification aid only; does not confer ownership, representation, sheet management, contact referent responsibility, or any technical access.';

comment on column public.business_membership_roles.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority and not identity.';

comment on column public.business_membership_roles.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not alter membership lifecycle axes.';

comment on column public.business_membership_roles.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_membership_roles.updated_at is
  'Last update timestamp. Maintained by business_membership_roles_set_updated_at.';

alter table public.business_membership_roles enable row level security;

-- Defense in depth: no policies in M1.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_membership_roles from anon, authenticated;

create or replace function public.set_business_membership_roles_updated_at ()
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

comment on function public.set_business_membership_roles_updated_at () is
  'BEFORE UPDATE trigger function for public.business_membership_roles. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at.';

create trigger business_membership_roles_set_updated_at
before update on public.business_membership_roles
for each row
execute function public.set_business_membership_roles_updated_at ();

-- Normative seed from Logical §4 / Migration Plan §14 M1.1.
-- Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.business_membership_roles (
  code,
  label_it,
  typical_natures,
  sort_order,
  is_active
)
values
  (
    'founder',
    'Fondatore',
    'Proprietà, spesso anche Rappresentanza',
    10,
    true
  ),
  (
    'owner',
    'Titolare',
    'Proprietà, spesso anche Rappresentanza',
    20,
    true
  ),
  (
    'partner',
    'Socio',
    'Proprietà',
    30,
    true
  ),
  (
    'administrator',
    'Amministratore',
    'Rappresentanza',
    40,
    true
  ),
  (
    'legal_representative',
    'Legale rappresentante',
    'Rappresentanza',
    50,
    true
  ),
  (
    'executive',
    'Dirigente',
    'Lavoro',
    60,
    true
  ),
  (
    'employee',
    'Dipendente',
    'Lavoro',
    70,
    true
  ),
  (
    'consultant',
    'Consulente',
    'Consulenza',
    80,
    true
  ),
  (
    'collaborator',
    'Collaboratore',
    'Collaborazione',
    90,
    true
  ),
  (
    'contact_referent',
    'Referente',
    'Lavoro o Collaborazione, secondo il caso',
    100,
    true
  ),
  (
    'sheet_manager',
    'Gestore della scheda',
    'Gestione della scheda',
    110,
    true
  );
