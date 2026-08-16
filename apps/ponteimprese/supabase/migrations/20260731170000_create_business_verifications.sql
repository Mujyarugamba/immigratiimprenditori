-- M6.1 — create business verifications
-- Persists Impresa-owned S03 verification current-state (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §18 M6.1;
-- docs/architecture/physical/domain-mapping/imprese.md §11.1, §12, §12.1;
-- Logical imprese.md §8 / §10 regola 19.
--
-- Scope:
--   current-state verification rows owned by a Business for named aspects only:
--   existence, company_data, contested_profile;
--   at most one row per (business_id, aspect).
--
-- Explicitly out of scope:
--   certification verification (M5.1 certification_status);
--   identity / relationship / representation (other domains);
--   badge "Impresa verificata"; V05 reliability; Evidence / Fonte / documents;
--   history / audit; expires_at; publication gates (M7.1); seed (M8).
--
-- Precondition: public.businesses (M1.1+). No schema dependency on M2–M5.

create table public.business_verifications (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Named verification aspect (Physical §12.1 C05).
  aspect text not null,
  -- Current V04 outcome; vocabulary depends on aspect (Physical §12.1).
  status text not null,
  -- Conclusion timestamp when status is verified or flagged.
  verified_at timestamptz,
  -- Optional synthetic local note; not Fonte / Evidence / document FK.
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_verifications_aspect_check check (
    aspect in (
      'existence',
      'company_data',
      'contested_profile'
    )
  ),
  constraint business_verifications_aspect_status_check check (
    (
      aspect in ('existence', 'company_data')
      and status in ('unverified', 'self_declared', 'verified')
    )
    or (
      aspect = 'contested_profile'
      and status in ('not_flagged', 'flagged')
    )
  ),
  constraint business_verifications_status_verified_at_check check (
    (
      status in ('unverified', 'self_declared', 'not_flagged')
      and verified_at is null
    )
    or (
      status in ('verified', 'flagged')
      and verified_at is not null
    )
  ),
  constraint business_verifications_source_note_check check (
    source_note is null
    or length(btrim(source_note)) > 0
  ),
  constraint business_verifications_business_id_aspect_key unique (business_id, aspect)
);

comment on table public.business_verifications is
  'Impresa-owned S03 verification current-state (E02): at most one row per (business_id, aspect). Aspects: existence, company_data, contested_profile. Not a badge, not certification (M5.1), not Appartenenza/Identity verification, not Evidence/Fonte, not history, not publication (M7.1). Absence of a row implies unverified / not_flagged.';

comment on column public.business_verifications.id is
  'Local stable identity of this verification current-state row. Not a public autonomous identity.';

comment on column public.business_verifications.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE. Soft-delete of the business (deleted_at) does not remove this row. Unique with aspect.';

comment on column public.business_verifications.aspect is
  'Named verification plane: existence | company_data | contested_profile. Closed vocabulary. Not certification, identity, relationship, representation, reliability, or publication.';

comment on column public.business_verifications.status is
  'Current outcome. For existence/company_data: unverified | self_declared | verified. For contested_profile: not_flagged | flagged. No global default. Not certification_status, publication, or Opportunità pending/failed/expired.';

comment on column public.business_verifications.verified_at is
  'Conclusion timestamp of the current verification. Must be NULL for unverified, self_declared, not_flagged; must be NOT NULL for verified and flagged. Not auto-filled by trigger; not expires_at; not verified_by.';

comment on column public.business_verifications.source_note is
  'Optional synthetic local note about the verification context. Anti-blank when set. Not a Fonte entity, not Evidence, not a document FK, not JSON metadata.';

comment on column public.business_verifications.created_at is
  'Creation timestamp of the current-state verification row. System-managed default.';

comment on column public.business_verifications.updated_at is
  'Last update timestamp. Maintained by business_verifications_set_updated_at; not a client-owned field.';

create index business_verifications_business_id_idx
  on public.business_verifications using btree (business_id);

create or replace function public.set_business_verifications_updated_at ()
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

comment on function public.set_business_verifications_updated_at () is
  'BEFORE UPDATE trigger function for public.business_verifications.updated_at. SECURITY INVOKER; empty search_path. Does not set verified_at or enforce publication gates.';

create trigger business_verifications_set_updated_at
before update on public.business_verifications
for each row
execute function public.set_business_verifications_updated_at ();

alter table public.business_verifications enable row level security;

-- Defense in depth: no policies in M6.1. Deny-by-default for anon/authenticated.
revoke all on table public.business_verifications from anon, authenticated;
