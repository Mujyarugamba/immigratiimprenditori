-- M3.3 — create professional authorizations
-- Implements the owned credentials family Abilitazione/Autorizzazione of Professionisti:
--   public.professional_authorizations
-- (docs/architecture/migrations/professionisti-migration-plan.md §14 M3.3;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.7,
--  §29.5, §29.6, §29.19, §29.20, §29.22.8, §29.23–§29.26;
--  docs/architecture/logical/professionisti.md — Abilitazione / Autorizzazione
--  vs Qualifica / Iscrizione / Certificazione).
--
-- Scope of this unit only: one owned table under professional_profiles,
-- constraints, indexes, updated_at function/trigger, RLS infrastructure, REVOKE.
-- Explicitly out of scope: seed; qualifications; registrations; certifications;
-- association memberships; authorization catalogs; authority/Organization FK;
-- FEV; Storage; policies; GRANT; alterations to M3.1, M3.2, profiles, or catalogs.

create table public.professional_authorizations (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  denomination text not null,
  authorization_kind text not null,
  issuer_label text null,
  external_identifier text null,
  issued_on date null,
  valid_from date null,
  valid_until date null,
  credential_status text not null default 'active',
  verification_status text not null default 'unverified',
  visibility_status text not null default 'private',
  evidence_visibility text not null default 'private',
  origin_kind text not null default 'national',
  equivalence_status text null,
  notes text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prof_authorizations_pkey primary key (id),
  constraint prof_authorizations_professional_profile_id_fkey foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint prof_authorizations_denomination_not_blank_check check (
    length(btrim(denomination)) > 0
  ),
  constraint prof_authorizations_authorization_kind_check check (
    authorization_kind in ('general', 'specific')
  ),
  constraint prof_authorizations_credential_status_check check (
    credential_status in ('active', 'suspended', 'revoked', 'expired')
  ),
  constraint prof_authorizations_verification_status_check check (
    verification_status in (
      'unverified',
      'in_review',
      'verified',
      'contested'
    )
  ),
  constraint prof_authorizations_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_authorizations_evidence_visibility_check check (
    evidence_visibility in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_authorizations_origin_kind_check check (
    origin_kind in ('national', 'foreign')
  ),
  constraint prof_authorizations_equivalence_status_check check (
    equivalence_status is null
    or equivalence_status in (
      'not_required',
      'in_progress',
      'obtained',
      'denied'
    )
  ),
  constraint prof_authorizations_equivalence_origin_check check (
    (
      origin_kind = 'foreign'
      and equivalence_status is not null
    )
    or (
      origin_kind = 'national'
      and equivalence_status is null
    )
  ),
  constraint prof_authorizations_valid_range_check check (
    valid_until is null
    or valid_from is null
    or valid_until >= valid_from
  ),
  constraint prof_authorizations_issued_valid_from_check check (
    valid_from is null
    or issued_on is null
    or valid_from >= issued_on
  ),
  constraint prof_authorizations_issued_valid_until_check check (
    valid_until is null
    or issued_on is null
    or valid_until >= issued_on
  ),
  constraint prof_authorizations_sort_order_check check (sort_order >= 0)
);

comment on table public.professional_authorizations is
  'Owned Entity (E02) of professional_profiles: declared professional authorization / enabling title (Abilitazione) with authorization_kind discriminating general vs specific permits (Autorizzazione as scoped subtype). Distinct from qualifications, registrations (Orders/Colleges), certifications, association memberships, competencies, and FEV profile tables. Issuer is an opaque label, not an authority catalog FK. Row-level verification_status is authoritative for this authorization only. Lifecycle via credential_status (active|suspended|revoked|expired); historical rows retained; no soft-delete.';

comment on column public.professional_authorizations.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key and not the authorization number.';

comment on column public.professional_authorizations.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — authorizations do not outlive the profile. No direct FK to profiles (Persona).';

comment on column public.professional_authorizations.denomination is
  'Declared denomination of the authorizing title / enabling instrument. Required and non-blank. Not globally UNIQUE. Not a qualification, category, specialization, or issuer name.';

comment on column public.professional_authorizations.authorization_kind is
  'Closed internal discriminant (Physical §29.3.7 Extra): general | specific. Distinguishes general enabling titles (Abilitazione) from more circumscribed permits (Autorizzazione). Not a separate table, not a catalog FK, and not a hierarchy of credentials.';

comment on column public.professional_authorizations.issuer_label is
  'Optional opaque label of the issuing authority or body. Nullable. Not a FK to Orders, Organizations, businesses, or any authority catalog; not automatic authenticity proof.';

comment on column public.professional_authorizations.external_identifier is
  'Optional number / code / reference on the authorizing document (common credentials meaning). Attribute only — not a primary key, not globally UNIQUE, not an inscription number, not a certification id, and not proof by itself.';

comment on column public.professional_authorizations.issued_on is
  'Optional issuance date. Temporal coherence with valid_from/valid_until enforced by CHECK when both ends are present.';

comment on column public.professional_authorizations.valid_from is
  'Optional start of effects. NULL when not applicable or unknown.';

comment on column public.professional_authorizations.valid_until is
  'Optional end of validity. NULL means no known term / not applicable. Does not delete historical rows. No CHECK tying expired/revoked/suspended to dates (status is declarative; no now()-based rules).';

comment on column public.professional_authorizations.credential_status is
  'Credential lifecycle S01 for authorizations only: active | suspended | revoked | expired. Default active. Distinct from qualification (declared|expired|withdrawn), registration (active|suspended|inactive), certification status vocabularies, and from profile professional_status.';

comment on column public.professional_authorizations.verification_status is
  'Authoritative per-row verification S03: unverified | in_review | verified | contested. Default unverified. Distinct from profile FEV tables and from any overall profile verification projection (not persisted).';

comment on column public.professional_authorizations.visibility_status is
  'Visibility of this authorization declaration (VIS). Default private. Distinct from evidence_visibility and from profile-level visibility_status.';

comment on column public.professional_authorizations.evidence_visibility is
  'Visibility of evidence linked to this authorization. Default private. Not Storage paths; FEV per-credential tables are out of cycle 1.';

comment on column public.professional_authorizations.origin_kind is
  'Geographic/legal origin of the authorization: national | foreign. Default national. Drives equivalence_status conditioning (common credentials rule §29.22.8).';

comment on column public.professional_authorizations.equivalence_status is
  'Required when origin_kind=foreign; must be NULL when national. Values: not_required | in_progress | obtained | denied. Descriptive only — not an administrative workflow engine.';

comment on column public.professional_authorizations.notes is
  'Optional free-text note. Not evidence summary and not verification rationale.';

comment on column public.professional_authorizations.sort_order is
  'Display order among authorizations of the same profile. Non-negative. Not identity.';

comment on column public.professional_authorizations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_authorizations.updated_at is
  'Last update timestamp. Maintained by professional_authorizations_set_updated_at.';

create index prof_authorizations_professional_profile_id_idx
  on public.professional_authorizations (professional_profile_id);

create index prof_authorizations_credential_status_idx
  on public.professional_authorizations (credential_status);

create or replace function public.set_professional_authorizations_updated_at ()
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

comment on function public.set_professional_authorizations_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_authorizations. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce verification, revocation, equivalence, or FEV.';

create trigger professional_authorizations_set_updated_at
before update on public.professional_authorizations
for each row
execute function public.set_professional_authorizations_updated_at ();

alter table public.professional_authorizations enable row level security;

-- Defense in depth: no policies in M3.3. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_authorizations from public;
revoke all on table public.professional_authorizations from anon, authenticated;
