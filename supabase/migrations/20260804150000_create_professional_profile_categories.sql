-- M4.1 — create professional profile categories
-- Implements owned category declarations of Professionisti:
--   public.professional_profile_categories
-- (docs/architecture/migrations/professionisti-migration-plan.md §15 M4.1;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.6,
--  §29.5, §29.6, §29.22.10, §29.23–§29.26, §29.32;
--  docs/architecture/logical/professionisti.md §5 — Categoria vs
--  Specializzazione vs Competenza vs Qualifica vs Servizio).
--
-- Scope of this unit only: one owned declaration table under
-- professional_profiles, constraints, partial UNIQUE indexes, indexes,
-- updated_at function/trigger, RLS, REVOKE.
-- Explicitly out of scope: specialization catalog; specializations FK;
-- competencies; services; M5 coverage; M6 FEV; Appartenenze; seed;
-- policies; GRANT; alterations to M1–M3.

create table public.professional_profile_categories (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  category_code text not null,
  specialization_label text null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  declaration_status text not null default 'declared',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_profile_categories_pkey primary key (id),
  constraint professional_profile_categories_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_profile_categories_category_code_fkey
    foreign key (category_code)
    references public.professional_categories (code)
    on update cascade
    on delete restrict,
  constraint prof_profile_categories_declaration_status_check check (
    declaration_status in ('declared', 'removed')
  ),
  constraint prof_profile_categories_sort_order_check check (
    sort_order >= 0
  ),
  constraint prof_profile_categories_specialization_label_check check (
    specialization_label is null
    or length(btrim(specialization_label)) > 0
  )
);

comment on table public.professional_profile_categories is
  'Owned link/E02 of professional_profiles: declared professional category with optional textual specialization. Distinct from qualifications (M3), competencies (M4.2), services (M4.3), and from a deferred specializations C03 catalog. specialization_label is opaque text — not a specializations FK. Lifecycle via declaration_status (declared|removed); at most one primary declared category per profile; historical rows retained; no soft-delete.';

comment on column public.professional_profile_categories.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_profile_categories.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — category declarations do not outlive the profile.';

comment on column public.professional_profile_categories.category_code is
  'FK to public.professional_categories(code). Required. ON UPDATE CASCADE; ON DELETE RESTRICT. Top-level governed professional ambit.';

comment on column public.professional_profile_categories.specialization_label is
  'Optional textual specialization refinement of the category (ciclo 1). Nullable. Not a specializations catalog FK. Blank/whitespace strings rejected when present; use NULL when absent.';

comment on column public.professional_profile_categories.is_primary is
  'Whether this declared category is the primary ambit of the profile. Default false. At most one primary among declared rows (partial UNIQUE).';

comment on column public.professional_profile_categories.sort_order is
  'Display/order weight among categories of the same profile. Default 0. Must be >= 0.';

comment on column public.professional_profile_categories.declaration_status is
  'Light declaration lifecycle: declared | removed. Default declared. removed is terminal for the row; historical retention applies. Partial UNIQUE constraints apply only to declared rows.';

comment on column public.professional_profile_categories.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_profile_categories.updated_at is
  'Last update timestamp. Maintained by professional_profile_categories_set_updated_at.';

create unique index prof_profile_categories_declared_uidx
  on public.professional_profile_categories (professional_profile_id, category_code)
  where declaration_status = 'declared';

create unique index prof_profile_categories_primary_uidx
  on public.professional_profile_categories (professional_profile_id)
  where is_primary = true
    and declaration_status = 'declared';

create index prof_profile_categories_professional_profile_id_idx
  on public.professional_profile_categories (professional_profile_id);

create index prof_profile_categories_category_code_idx
  on public.professional_profile_categories (category_code);

create or replace function public.set_professional_profile_categories_updated_at ()
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

comment on function public.set_professional_profile_categories_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_profile_categories. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce FEV, specializations catalog, or M5 coverage.';

create trigger professional_profile_categories_set_updated_at
before update on public.professional_profile_categories
for each row
execute function public.set_professional_profile_categories_updated_at ();

alter table public.professional_profile_categories enable row level security;

-- Defense in depth: no policies in M4.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_profile_categories from public;
revoke all on table public.professional_profile_categories from anon, authenticated;
