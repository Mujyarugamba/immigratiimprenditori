-- M6.1 — create professional profile sources
-- Implements domain-local Fonte (FEV) owned by Professionisti Aggregate Root:
--   public.professional_profile_sources
-- (docs/architecture/migrations/professionisti-migration-plan.md §17 M6.1;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.15,
--  §29.21, §29.23–§29.26, §29.34;
--  docs/architecture/logical/professionisti.md §11 — Fonte ≠ Evidenza ≠ Verifica).
--
-- Scope of this unit only: typed provenance rows under professional_profiles,
-- FK to local catalog professional_source_kinds(code), indexes, updated_at
-- function/trigger, RLS, REVOKE, COMMENT ON.
-- Explicitly out of scope: evidences (M6.2); verifications (M6.3); Storage;
-- URL/MIME/hash/file metadata; JSONB; entity_type/entity_id; seed; policies;
-- GRANT; FEV per-credenziale; overall profile verification projection;
-- alterations to M1–M5.
-- Depends on M2.1 public.professional_profiles and M1.3
-- public.professional_source_kinds.

create table public.professional_profile_sources (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  source_kind_code text not null,
  reference_label text null,
  reliability_note text null,
  declared_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_profile_sources_pkey primary key (id),
  constraint professional_profile_sources_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_profile_sources_source_kind_code_fkey
    foreign key (source_kind_code)
    references public.professional_source_kinds (code)
    on update cascade
    on delete restrict
);

comment on table public.professional_profile_sources is
  'Domain-local Fonte (FEV) owned by professional_profiles: typed informative provenance for the professional profile. Distinct from Evidenza and Verifica. Not Storage, not a URL field, not a reliability score, not an Evidence, not a Verification outcome, and not a per-credential FEV table. Deleted with the profile (ON DELETE CASCADE).';

comment on column public.professional_profile_sources.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_profile_sources.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON UPDATE NO ACTION; ON DELETE CASCADE — sources do not outlive the profile.';

comment on column public.professional_profile_sources.source_kind_code is
  'FK to local catalog public.professional_source_kinds(code). Required. ON UPDATE CASCADE; ON DELETE RESTRICT. Classifies provenance type; not a concrete evidence or verification.';

comment on column public.professional_profile_sources.reference_label is
  'Optional opaque descriptive citation label for the source material. Free text; not a structured URL field, external identifier, Storage path, or natural key.';

comment on column public.professional_profile_sources.reliability_note is
  'Optional qualitative reliability note. Free text only; not a numeric score, confidence enum, or verification status.';

comment on column public.professional_profile_sources.declared_at is
  'Optional timestamp when the source was declared or indicated. Distinct from created_at/updated_at. Not observed_at, verified_at, or published_at.';

comment on column public.professional_profile_sources.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_profile_sources.updated_at is
  'Last update timestamp. Maintained by professional_profile_sources_set_updated_at.';

create index prof_profile_sources_professional_profile_id_idx
  on public.professional_profile_sources (professional_profile_id);

create index prof_profile_sources_source_kind_code_idx
  on public.professional_profile_sources (source_kind_code);

create or replace function public.set_professional_profile_sources_updated_at ()
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

comment on function public.set_professional_profile_sources_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_profile_sources. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch evidences, verifications, or Aggregate Root axes.';

create trigger professional_profile_sources_set_updated_at
before update on public.professional_profile_sources
for each row
execute function public.set_professional_profile_sources_updated_at ();

alter table public.professional_profile_sources enable row level security;

-- Defense in depth: no policies in M6.1. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_profile_sources from public;
revoke all on table public.professional_profile_sources from anon, authenticated;
