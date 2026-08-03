-- M5.2 — create professional operational languages
-- Implements owned professional operational/support language declarations:
--   public.professional_operational_languages
-- (docs/architecture/migrations/professionisti-migration-plan.md §16 M5.2;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.12,
--  §29.5, §29.6, §29.10, §29.22.11, §29.23–§29.26, §29.33;
--  docs/architecture/logical/professionisti.md §8 — Lingue operative vs
--  supporto; non-automatismo vs origine/nazionalità).
--
-- Scope of this unit only: one owned table under professional_profiles,
-- FK to shared public.languages(id) bigint, partial UNIQUE, indexes,
-- updated_at function/trigger, RLS, REVOKE.
-- Explicitly out of scope: profile_languages (Persone); UI/i18n languages;
-- business_operational_language_declarations; per-service languages;
-- language certifications as M3 credentials; M6 FEV; seed; policies; GRANT;
-- alterations to M1–M5.1; copying legacy GRANT/policy from languages.

create table public.professional_operational_languages (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  language_id bigint not null,
  proficiency_level text not null default 'working',
  usage_role text not null default 'operational',
  declaration_status text not null default 'declared',
  verification_status text not null default 'unverified',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_operational_languages_pkey primary key (id),
  constraint professional_operational_languages_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_operational_languages_language_id_fkey
    foreign key (language_id)
    references public.languages (id)
    on update no action
    on delete restrict,
  constraint prof_op_languages_proficiency_level_check check (
    proficiency_level in (
      'elementary',
      'working',
      'professional',
      'native_equivalent'
    )
  ),
  constraint prof_op_languages_usage_role_check check (
    usage_role in ('operational', 'support')
  ),
  constraint prof_op_languages_declaration_status_check check (
    declaration_status in ('declared', 'removed')
  ),
  constraint prof_op_languages_verification_status_check check (
    verification_status in ('unverified', 'verified', 'contested')
  ),
  constraint prof_op_languages_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.professional_operational_languages is
  'Owned Entity (E02) of professional_profiles: declared professional operational or support language linked to shared public.languages. Distinct from Persone profile_languages (spoken languages), UI/i18n languages, and Imprese business_operational_language_declarations. Same language may appear under different usage_role values. Row-level verification_status is unverified|verified|contested (no in_review). Lifecycle via declaration_status; historical rows retained; no soft-delete.';

comment on column public.professional_operational_languages.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_operational_languages.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — language declarations do not outlive the profile.';

comment on column public.professional_operational_languages.language_id is
  'FK to shared public.languages(id) bigint. Required. ON UPDATE NO ACTION; ON DELETE RESTRICT. Catalog remains authoritative; not inferred from Persona origin or profile_languages.';

comment on column public.professional_operational_languages.proficiency_level is
  'Closed proficiency level: elementary | working | professional | native_equivalent. Default working. Not CEFR codes.';

comment on column public.professional_operational_languages.usage_role is
  'Closed usage role: operational | support. Default operational. Part of the declared UNIQUE key with language_id.';

comment on column public.professional_operational_languages.declaration_status is
  'Light declaration lifecycle: declared | removed. Default declared. Partial UNIQUE applies only to declared rows.';

comment on column public.professional_operational_languages.verification_status is
  'Row-level verification S03: unverified | verified | contested. Default unverified. Intentionally without in_review. Not FEV profile aspect persistence (M6).';

comment on column public.professional_operational_languages.sort_order is
  'Display/order weight among languages of the same profile. Default 0. Must be >= 0.';

comment on column public.professional_operational_languages.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_operational_languages.updated_at is
  'Last update timestamp. Maintained by professional_operational_languages_set_updated_at.';

create unique index prof_op_languages_declared_uidx
  on public.professional_operational_languages (professional_profile_id, language_id, usage_role)
  where declaration_status = 'declared';

create index prof_op_languages_professional_profile_id_idx
  on public.professional_operational_languages (professional_profile_id);

create index prof_op_languages_language_id_idx
  on public.professional_operational_languages (language_id);

create or replace function public.set_professional_operational_languages_updated_at ()
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

comment on function public.set_professional_operational_languages_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_operational_languages. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not sync profile_languages, business operational languages, or M6 FEV.';

create trigger professional_operational_languages_set_updated_at
before update on public.professional_operational_languages
for each row
execute function public.set_professional_operational_languages_updated_at ();

alter table public.professional_operational_languages enable row level security;

-- Defense in depth: no policies in M5.2. Do not copy legacy SELECT grants
-- from public.languages. Access policies belong to Identità & Accessi.
revoke all on table public.professional_operational_languages from public;
revoke all on table public.professional_operational_languages from anon, authenticated;
