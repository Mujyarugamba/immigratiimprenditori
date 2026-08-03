-- M6.3 — create professional profile verifications
-- Implements domain-local Verifica (FEV) current-state owned by Professionisti
-- Aggregate Root:
--   public.professional_profile_verifications
-- (docs/architecture/migrations/professionisti-migration-plan.md §17 M6.3;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.15,
--  §29.21, §29.22.15, §29.23–§29.26, §29.34;
--  docs/architecture/logical/professionisti.md §11 — Verifica ≠ Fonte ≠ Evidenza).
--
-- Scope of this unit only: one current-state verification row per
-- (professional_profile_id, aspect), closed aspect/status vocabularies,
-- date CHECK, indexes, updated_at function/trigger, RLS, REVOKE, COMMENT ON.
-- Explicitly out of scope: FK to sources/evidences; history/supersession;
-- status values expired/revoked/superseded; auth.users verifier FK; overall
-- profile verification projection/badge; sync to M3–M5 verification_status
-- or is_contested; editorial/publication axes; Storage; seed; policies;
-- GRANT; alterations to M1–M6.2.
-- Depends on M2.1 public.professional_profiles only.
-- Stop point: cycle-1 SQL structure complete after this unit (then M8 docs).

create table public.professional_profile_verifications (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  aspect text not null,
  status text not null default 'unverified',
  verified_at timestamptz null,
  verifier_label text null,
  outcome_note text null,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_profile_verifications_pkey primary key (id),
  constraint professional_profile_verifications_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint prof_profile_verifications_profile_aspect_unique
    unique (professional_profile_id, aspect),
  constraint prof_profile_verifications_aspect_check check (
    aspect in (
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
  constraint prof_profile_verifications_status_check check (
    status in (
      'unverified',
      'in_review',
      'confirmed',
      'rejected'
    )
  ),
  constraint prof_profile_verifications_dates_check check (
    expires_at is null
    or verified_at is null
    or expires_at >= verified_at
  )
);

comment on table public.professional_profile_verifications is
  'Domain-local Verifica (FEV) current-state per closed aspect of a professional profile. Owned by professional_profiles; at most one row per (professional_profile_id, aspect); deleted with the profile (ON DELETE CASCADE). Distinct from Fonte and Evidenza. Does not sync credential/declaration verification_status, is_contested, editorial_status, publication_status, or visibility_status. Does not derive badge, score, or overall profile verification. History table excluded.';

comment on column public.professional_profile_verifications.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_profile_verifications.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON UPDATE NO ACTION; ON DELETE CASCADE. Unique with aspect.';

comment on column public.professional_profile_verifications.aspect is
  'Single closed profile verification aspect: professional_title, registration, authorization, qualification, certification, experience, service_declared, territory, language, availability, contacts, competency. Same vocabulary as evidence supported_aspect. Not a verification outcome and not an FK to M3–M5 rows.';

comment on column public.professional_profile_verifications.status is
  'Current verification outcome for this aspect: unverified | in_review | confirmed | rejected. Default unverified. Distinct from M3–M5 row verification_status and from editorial/publication/visibility axes. Does not include expired, revoked, or superseded.';

comment on column public.professional_profile_verifications.verified_at is
  'Optional timestamp when the aspect decision was recorded. Nullable. Not auto-filled. Does not require a specific status and does not sync Aggregate Root axes.';

comment on column public.professional_profile_verifications.verifier_label is
  'Optional opaque verifier label. Free text; not an FK to auth.users, Identità & Accessi account, or reviewer table.';

comment on column public.professional_profile_verifications.outcome_note is
  'Optional free-text note about the verification context or outcome. Not a structured Fonte, Evidence, FK, URL, file, or audit trail.';

comment on column public.professional_profile_verifications.expires_at is
  'Optional expiry timestamp of the current aspect verification. NULL means does not expire. When both expires_at and verified_at are set, expires_at must be >= verified_at. Does not automatically change status when elapsed.';

comment on column public.professional_profile_verifications.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_profile_verifications.updated_at is
  'Last update timestamp. Maintained by professional_profile_verifications_set_updated_at.';

create index prof_profile_verifications_professional_profile_id_idx
  on public.professional_profile_verifications (professional_profile_id);

create or replace function public.set_professional_profile_verifications_updated_at ()
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

comment on function public.set_professional_profile_verifications_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_profile_verifications. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not sync sources, evidences, credential verification_status, is_contested, or Aggregate Root axes.';

create trigger professional_profile_verifications_set_updated_at
before update on public.professional_profile_verifications
for each row
execute function public.set_professional_profile_verifications_updated_at ();

alter table public.professional_profile_verifications enable row level security;

-- Defense in depth: no policies in M6.3. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_profile_verifications from public;
revoke all on table public.professional_profile_verifications from anon, authenticated;
