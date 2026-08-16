-- M6.2 — create professional profile evidences
-- Implements domain-local Evidenza (FEV) owned by Professionisti Aggregate Root:
--   public.professional_profile_evidences
-- (docs/architecture/migrations/professionisti-migration-plan.md §17 M6.2;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.15,
--  §29.21, §29.22.15, §29.23–§29.26, §29.34;
--  docs/architecture/logical/professionisti.md §11 — Evidenza ≠ Fonte ≠ Verifica).
--
-- Scope of this unit only: descriptive evidence rows under professional_profiles,
-- optional FK to professional_profile_sources, closed supported_aspect vocabulary,
-- non-blank summary, indexes, updated_at function/trigger, RLS, REVOKE, COMMENT ON.
-- Explicitly out of scope: verifications (M6.3); Storage/URL/MIME/hash;
-- JSONB; entity_type/entity_id; FK to M3–M5 credential tables; verification
-- status; history/supersession; seed; policies; GRANT; alterations to M1–M6.1.
-- Depends on M2.1 public.professional_profiles and M6.1
-- public.professional_profile_sources.
--
-- Cycle-1 integrity note: separate FKs on professional_profile_id and source_id
-- do not enforce that the referenced source belongs to the same profile.
-- No composite FK/trigger is prescribed; application must keep owners aligned.

create table public.professional_profile_evidences (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  source_id uuid null,
  supported_aspect text not null,
  summary text not null,
  observed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_profile_evidences_pkey primary key (id),
  constraint professional_profile_evidences_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint professional_profile_evidences_source_id_fkey
    foreign key (source_id)
    references public.professional_profile_sources (id)
    on update no action
    on delete set null,
  constraint prof_profile_evidences_supported_aspect_check check (
    supported_aspect in (
      'professional_title',
      'registration',
      'authorization',
      'qualification',
      'certification',
      'experience',
      'service_declared',
      'territory',
      'language',
      'availability',
      'contacts',
      'competency'
    )
  ),
  constraint prof_profile_evidences_summary_not_blank_check check (
    length(btrim(summary)) > 0
  )
);

comment on table public.professional_profile_evidences is
  'Domain-local Evidenza (FEV) owned by professional_profiles: concrete textual riscontro supporting exactly one closed profile aspect. Distinct from Fonte (optional source_id) and from Verifica. Not Storage, not URL/MIME/hash, not JSONB payload, not a per-credential FEV table, and not a verification outcome. Multiple evidences may support the same aspect. Deleted with the profile (ON DELETE CASCADE).';

comment on column public.professional_profile_evidences.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_profile_evidences.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON UPDATE NO ACTION; ON DELETE CASCADE — evidences do not outlive the profile.';

comment on column public.professional_profile_evidences.source_id is
  'Optional local Fonte (public.professional_profile_sources). NULL when unlinked or after Fonte deletion (ON DELETE SET NULL). Cycle 1 does not enforce that source.professional_profile_id equals this row professional_profile_id.';

comment on column public.professional_profile_evidences.supported_aspect is
  'Single closed profile aspect supported by this evidence: professional_title, registration, authorization, qualification, certification, experience, service_declared, territory, language, availability, contacts, competency. Semantic link only — not an FK to M3–M5 rows. Not a verification outcome.';

comment on column public.professional_profile_evidences.summary is
  'Required free-text summary of the concrete riscontro. Must be non-blank after trim. Not a score, file, URL, structured payload, or verification status.';

comment on column public.professional_profile_evidences.observed_at is
  'Optional timestamp when the evidence element was observed or referred. Distinct from created_at/updated_at. Not declared_at, verified_at, or published_at.';

comment on column public.professional_profile_evidences.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_profile_evidences.updated_at is
  'Last update timestamp. Maintained by professional_profile_evidences_set_updated_at.';

create index prof_profile_evidences_professional_profile_id_idx
  on public.professional_profile_evidences (professional_profile_id);

create index prof_profile_evidences_source_id_idx
  on public.professional_profile_evidences (source_id);

create index prof_profile_evidences_supported_aspect_idx
  on public.professional_profile_evidences (supported_aspect);

create or replace function public.set_professional_profile_evidences_updated_at ()
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

comment on function public.set_professional_profile_evidences_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_profile_evidences. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not sync verifications, credential verification_status, or Aggregate Root axes.';

create trigger professional_profile_evidences_set_updated_at
before update on public.professional_profile_evidences
for each row
execute function public.set_professional_profile_evidences_updated_at ();

alter table public.professional_profile_evidences enable row level security;

-- Defense in depth: no policies in M6.2. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_profile_evidences from public;
revoke all on table public.professional_profile_evidences from anon, authenticated;
