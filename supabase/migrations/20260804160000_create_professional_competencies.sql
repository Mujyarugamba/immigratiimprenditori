-- M4.2 — create professional competencies
-- Implements owned professional competency declarations of Professionisti:
--   public.professional_competencies
-- (docs/architecture/migrations/professionisti-migration-plan.md §15 M4.2;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.9,
--  §29.5, §29.6, §29.14, §29.22.14, §29.23–§29.26, §29.32;
--  docs/architecture/logical/professionisti.md §5 — Competenza vs
--  CompetenzaDichiarata (Persone) vs Qualifica vs Categoria).
--
-- Scope of this unit only: one owned table under professional_profiles,
-- FK to shared public.competencies(id) bigint, partial UNIQUE, indexes,
-- updated_at function/trigger, RLS, REVOKE.
-- Explicitly out of scope: second competencies catalog; profile_competencies
-- (Persone); M3 credentials; M5 coverage; M6 FEV tables; seed; policies;
-- GRANT; alterations to M1–M4.1.

create table public.professional_competencies (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  competency_id bigint not null,
  level_code text null,
  years_experience numeric(5, 1) null,
  declaration_status text not null default 'declared',
  verification_status text not null default 'unverified',
  sort_order integer not null default 0,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_competencies_pkey primary key (id),
  constraint professional_competencies_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_competencies_competency_id_fkey
    foreign key (competency_id)
    references public.competencies (id)
    on update no action
    on delete restrict,
  constraint prof_competencies_declaration_status_check check (
    declaration_status in ('declared', 'removed')
  ),
  constraint prof_competencies_verification_status_check check (
    verification_status in ('unverified', 'verified', 'contested')
  ),
  constraint prof_competencies_level_code_check check (
    level_code is null
    or level_code in ('basic', 'intermediate', 'advanced', 'expert')
  ),
  constraint prof_competencies_years_experience_check check (
    years_experience is null
    or years_experience >= 0
  ),
  constraint prof_competencies_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.professional_competencies is
  'Owned Entity (E02) of professional_profiles: declared professional competency linked to the shared public.competencies catalog. Distinct from Persone profile_competencies (generic declared skills), from M3 formal credentials, from category declarations (M4.1), and from declared services (M4.3). No second local competencies catalog. Row-level verification_status is authoritative for this declaration only (unverified|verified|contested — no in_review). Lifecycle via declaration_status; historical rows retained; no soft-delete.';

comment on column public.professional_competencies.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_competencies.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — competency declarations do not outlive the profile.';

comment on column public.professional_competencies.competency_id is
  'FK to shared public.competencies(id) bigint. Required. ON UPDATE NO ACTION; ON DELETE RESTRICT. Same catalog as Persone; not a local Professionisti catalog and not profile_competencies.';

comment on column public.professional_competencies.level_code is
  'Optional closed proficiency level: basic | intermediate | advanced | expert. Nullable.';

comment on column public.professional_competencies.years_experience is
  'Optional years of experience for this competency (numeric 5,1). Nullable. Must be >= 0 when present. Distinct from profile-level experience_years.';

comment on column public.professional_competencies.declaration_status is
  'Light declaration lifecycle: declared | removed. Default declared. Partial UNIQUE applies only to declared rows.';

comment on column public.professional_competencies.verification_status is
  'Row-level verification S03 for this competency declaration: unverified | verified | contested. Default unverified. Intentionally narrower than credential verification_status (no in_review). Not FEV profile aspect persistence (M6).';

comment on column public.professional_competencies.sort_order is
  'Display/order weight among competencies of the same profile. Default 0. Must be >= 0.';

comment on column public.professional_competencies.notes is
  'Optional free-text note on this competency declaration. Nullable.';

comment on column public.professional_competencies.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_competencies.updated_at is
  'Last update timestamp. Maintained by professional_competencies_set_updated_at.';

create unique index prof_competencies_declared_uidx
  on public.professional_competencies (professional_profile_id, competency_id)
  where declaration_status = 'declared';

create index prof_competencies_professional_profile_id_idx
  on public.professional_competencies (professional_profile_id);

create index prof_competencies_competency_id_idx
  on public.professional_competencies (competency_id);

create or replace function public.set_professional_competencies_updated_at ()
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

comment on function public.set_professional_competencies_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_competencies. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not sync profile_competencies, FEV, or M3 credentials.';

create trigger professional_competencies_set_updated_at
before update on public.professional_competencies
for each row
execute function public.set_professional_competencies_updated_at ();

alter table public.professional_competencies enable row level security;

-- Defense in depth: no policies in M4.2. Do not copy legacy SELECT grants
-- from public.competencies. Access policies belong to Identità & Accessi.
revoke all on table public.professional_competencies from public;
revoke all on table public.professional_competencies from anon, authenticated;
