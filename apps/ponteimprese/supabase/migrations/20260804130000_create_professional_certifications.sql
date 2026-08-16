-- M3.4 — create professional certifications
-- Implements the owned credentials family Certificazione of Professionisti:
--   public.professional_certifications
-- (docs/architecture/migrations/professionisti-migration-plan.md §14 M3.4;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.7,
--  §29.5, §29.6, §29.19, §29.20, §29.22.8, §29.23–§29.26;
--  docs/architecture/logical/professionisti.md — Certificazione vs Qualifica /
--  Iscrizione / Abilitazione).
--
-- Scope of this unit only: one owned table under professional_profiles,
-- constraints, indexes, updated_at function/trigger, RLS infrastructure, REVOKE.
-- Explicitly out of scope: seed; qualifications; registrations; authorizations;
-- association memberships; certifier catalogs; Organization/business FK; FEV;
-- Storage; policies; GRANT; alterations to M3.1–M3.3, profiles, or catalogs.

create table public.professional_certifications (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  denomination text not null,
  certifier_label text null,
  issuer_label text null,
  external_identifier text null,
  issued_on date null,
  valid_from date null,
  valid_until date null,
  credential_status text not null default 'declared',
  verification_status text not null default 'unverified',
  visibility_status text not null default 'private',
  evidence_visibility text not null default 'private',
  origin_kind text not null default 'national',
  equivalence_status text null,
  notes text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prof_certifications_pkey primary key (id),
  constraint prof_certifications_professional_profile_id_fkey foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint prof_certifications_denomination_not_blank_check check (
    length(btrim(denomination)) > 0
  ),
  constraint prof_certifications_credential_status_check check (
    credential_status in ('declared', 'expired', 'revoked', 'withdrawn')
  ),
  constraint prof_certifications_verification_status_check check (
    verification_status in (
      'unverified',
      'in_review',
      'verified',
      'contested'
    )
  ),
  constraint prof_certifications_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_certifications_evidence_visibility_check check (
    evidence_visibility in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_certifications_origin_kind_check check (
    origin_kind in ('national', 'foreign')
  ),
  constraint prof_certifications_equivalence_status_check check (
    equivalence_status is null
    or equivalence_status in (
      'not_required',
      'in_progress',
      'obtained',
      'denied'
    )
  ),
  constraint prof_certifications_equivalence_origin_check check (
    (
      origin_kind = 'foreign'
      and equivalence_status is not null
    )
    or (
      origin_kind = 'national'
      and equivalence_status is null
    )
  ),
  constraint prof_certifications_valid_range_check check (
    valid_until is null
    or valid_from is null
    or valid_until >= valid_from
  ),
  constraint prof_certifications_issued_valid_from_check check (
    valid_from is null
    or issued_on is null
    or valid_from >= issued_on
  ),
  constraint prof_certifications_issued_valid_until_check check (
    valid_until is null
    or issued_on is null
    or valid_until >= issued_on
  ),
  constraint prof_certifications_sort_order_check check (sort_order >= 0)
);

comment on table public.professional_certifications is
  'Owned Entity (E02) of professional_profiles: declared professional certification issued by a certifying body, not necessarily tied to a regulated profession. Distinct from qualifications (study/professional titles), registrations (Orders/Colleges), authorizations, association memberships, competencies, business certifications, and FEV profile tables. certifier_label is an opaque optional certifying-body label — not a certifier catalog FK. Row-level verification_status is authoritative for this certification only. Lifecycle via credential_status (declared|expired|revoked|withdrawn); historical rows retained; no soft-delete.';

comment on column public.professional_certifications.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key and not the certification code.';

comment on column public.professional_certifications.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — certifications do not outlive the profile. No direct FK to profiles (Persona).';

comment on column public.professional_certifications.denomination is
  'Declared denomination of the certification. Required and non-blank. Not globally UNIQUE. Not a qualification, registration, authorization, category, or specialization.';

comment on column public.professional_certifications.certifier_label is
  'Optional opaque label of the certifying body (Physical §29.3.7 Extra). Nullable. Not a FK to Organizations, businesses, Orders, or any certifier catalog; not automatic authenticity proof.';

comment on column public.professional_certifications.issuer_label is
  'Optional additional opaque issuer/descriptive label from the common credentials set. Nullable. Distinct from certifier_label; not a catalog FK.';

comment on column public.professional_certifications.external_identifier is
  'Optional certification number / external code on the certification document (common credentials meaning). Attribute only — not a primary key, not globally UNIQUE, and not proof by itself.';

comment on column public.professional_certifications.issued_on is
  'Optional issuance date. Temporal coherence with valid_from/valid_until enforced by CHECK when both ends are present.';

comment on column public.professional_certifications.valid_from is
  'Optional start of effects. NULL when not applicable or unknown.';

comment on column public.professional_certifications.valid_until is
  'Optional end of validity. NULL means no known term / not applicable. Does not delete historical rows. No CHECK tying expired/revoked/withdrawn to dates (status is declarative; no now()-based rules).';

comment on column public.professional_certifications.credential_status is
  'Credential lifecycle S01 for certifications only: declared | expired | revoked | withdrawn. Default declared. Distinct from qualification (declared|expired|withdrawn without revoked), registration, and authorization status vocabularies, and from profile professional_status.';

comment on column public.professional_certifications.verification_status is
  'Authoritative per-row verification S03: unverified | in_review | verified | contested. Default unverified. Distinct from profile FEV tables and from any overall profile verification projection (not persisted).';

comment on column public.professional_certifications.visibility_status is
  'Visibility of this certification declaration (VIS). Default private. Distinct from evidence_visibility and from profile-level visibility_status.';

comment on column public.professional_certifications.evidence_visibility is
  'Visibility of evidence linked to this certification. Default private. Not Storage paths; FEV per-credential tables are out of cycle 1.';

comment on column public.professional_certifications.origin_kind is
  'Geographic/legal origin of the certification: national | foreign. Default national. Drives equivalence_status conditioning (common credentials rule §29.22.8).';

comment on column public.professional_certifications.equivalence_status is
  'Required when origin_kind=foreign; must be NULL when national. Values: not_required | in_progress | obtained | denied. Descriptive only — not an administrative workflow engine.';

comment on column public.professional_certifications.notes is
  'Optional free-text note. Not evidence summary and not verification rationale.';

comment on column public.professional_certifications.sort_order is
  'Display order among certifications of the same profile. Non-negative. Not identity.';

comment on column public.professional_certifications.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_certifications.updated_at is
  'Last update timestamp. Maintained by professional_certifications_set_updated_at.';

create index prof_certifications_professional_profile_id_idx
  on public.professional_certifications (professional_profile_id);

create index prof_certifications_credential_status_idx
  on public.professional_certifications (credential_status);

create or replace function public.set_professional_certifications_updated_at ()
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

comment on function public.set_professional_certifications_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_certifications. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce verification, revocation, equivalence, or FEV.';

create trigger professional_certifications_set_updated_at
before update on public.professional_certifications
for each row
execute function public.set_professional_certifications_updated_at ();

alter table public.professional_certifications enable row level security;

-- Defense in depth: no policies in M3.4. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_certifications from public;
revoke all on table public.professional_certifications from anon, authenticated;
