-- M3.1 — create professional qualifications
-- Implements the owned credentials family Qualifica of Professionisti:
--   public.professional_qualifications
-- (docs/architecture/migrations/professionisti-migration-plan.md §14 M3.1;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.7,
--  §29.5, §29.6, §29.19, §29.20, §29.22.8, §29.23–§29.26;
--  docs/architecture/logical/professionisti.md — Qualifica vs iscrizione /
--  abilitazione / certificazione).
--
-- Scope of this unit only: one owned table under professional_profiles,
-- constraints, indexes, updated_at function/trigger, RLS infrastructure, REVOKE.
-- Explicitly out of scope: seed; registrations; authorizations; certifications;
-- association memberships; FEV; catalog of qualifications or issuers; Orders;
-- specializations; Storage; policies; GRANT; alterations to profiles or catalogs.

create table public.professional_qualifications (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  denomination text not null,
  qualification_kind text not null,
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
  constraint prof_qualifications_pkey primary key (id),
  constraint prof_qualifications_professional_profile_id_fkey foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint prof_qualifications_denomination_not_blank_check check (
    length(btrim(denomination)) > 0
  ),
  constraint prof_qualifications_qualification_kind_check check (
    qualification_kind in (
      'study_title',
      'professional_title',
      'declared_qualification'
    )
  ),
  constraint prof_qualifications_credential_status_check check (
    credential_status in ('declared', 'expired', 'withdrawn')
  ),
  constraint prof_qualifications_verification_status_check check (
    verification_status in (
      'unverified',
      'in_review',
      'verified',
      'contested'
    )
  ),
  constraint prof_qualifications_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_qualifications_evidence_visibility_check check (
    evidence_visibility in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_qualifications_origin_kind_check check (
    origin_kind in ('national', 'foreign')
  ),
  constraint prof_qualifications_equivalence_status_check check (
    equivalence_status is null
    or equivalence_status in (
      'not_required',
      'in_progress',
      'obtained',
      'denied'
    )
  ),
  constraint prof_qualifications_equivalence_origin_check check (
    (
      origin_kind = 'foreign'
      and equivalence_status is not null
    )
    or (
      origin_kind = 'national'
      and equivalence_status is null
    )
  ),
  constraint prof_qualifications_valid_range_check check (
    valid_until is null
    or valid_from is null
    or valid_until >= valid_from
  ),
  constraint prof_qualifications_issued_valid_from_check check (
    valid_from is null
    or issued_on is null
    or valid_from >= issued_on
  ),
  constraint prof_qualifications_issued_valid_until_check check (
    valid_until is null
    or issued_on is null
    or valid_until >= issued_on
  ),
  constraint prof_qualifications_sort_order_check check (sort_order >= 0)
);

comment on table public.professional_qualifications is
  'Owned Entity (E02) of professional_profiles: declared professional qualification / study title / professional title. Distinct from registrations (Orders/Colleges), authorizations, certifications, association memberships, competencies, categories, and FEV profile tables. Issuer is an opaque label, not an Order catalog FK. Row-level verification_status is authoritative for this credential only — not overall profile verification and not per-credential FEV. Lifecycle retained via credential_status (declared|expired|withdrawn); no soft-delete.';

comment on column public.professional_qualifications.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key.';

comment on column public.professional_qualifications.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — qualifications do not outlive the profile. No direct FK to profiles (Persona).';

comment on column public.professional_qualifications.denomination is
  'Declared denomination / title text. Required and non-blank. Not globally UNIQUE — multiple similar qualifications over time are legitimate.';

comment on column public.professional_qualifications.qualification_kind is
  'Closed vocabulary: study_title | professional_title | declared_qualification. Distinguishes study titles, formal professional titles, and less-formal declared qualifications. Not a specialization catalog.';

comment on column public.professional_qualifications.issuer_label is
  'Opaque descriptive issuer label (university, body, organization). Nullable. Not a FK to Orders, Organizations, businesses, or any issuer catalog.';

comment on column public.professional_qualifications.external_identifier is
  'Optional external code / registration-like identifier on the credential document. Attribute only — not a primary key and not a catalog FK.';

comment on column public.professional_qualifications.issued_on is
  'Optional issuance date. Temporal coherence with valid_from/valid_until enforced by CHECK when both ends are present.';

comment on column public.professional_qualifications.valid_from is
  'Optional start of validity. NULL when not applicable or unknown.';

comment on column public.professional_qualifications.valid_until is
  'Optional end of validity. NULL means no known term / not applicable. Does not delete historical rows.';

comment on column public.professional_qualifications.credential_status is
  'Credential lifecycle S01 for qualifications only: declared | expired | withdrawn. Default declared. Distinct from registration/authorization/certification status vocabularies and from profile professional_status.';

comment on column public.professional_qualifications.verification_status is
  'Authoritative per-row verification S03: unverified | in_review | verified | contested. Default unverified. Distinct from profile FEV tables and from any overall profile verification projection (not persisted).';

comment on column public.professional_qualifications.visibility_status is
  'Visibility of this qualification declaration (VIS). Default private. Distinct from evidence_visibility and from profile-level visibility_status.';

comment on column public.professional_qualifications.evidence_visibility is
  'Visibility of evidence linked to this qualification (Logical: public qualification with reserved evidence). Default private. Not Storage paths; FEV per-credential tables are out of cycle 1.';

comment on column public.professional_qualifications.origin_kind is
  'Geographic/legal origin of the qualification: national | foreign. Default national. Drives equivalence_status conditioning.';

comment on column public.professional_qualifications.equivalence_status is
  'Required when origin_kind=foreign; must be NULL when national. Values: not_required | in_progress | obtained | denied. Descriptive status only — not an administrative workflow engine.';

comment on column public.professional_qualifications.notes is
  'Optional free-text note. Not evidence summary and not verification rationale.';

comment on column public.professional_qualifications.sort_order is
  'Display order among qualifications of the same profile. Non-negative. Not identity.';

comment on column public.professional_qualifications.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_qualifications.updated_at is
  'Last update timestamp. Maintained by professional_qualifications_set_updated_at.';

create index prof_qualifications_professional_profile_id_idx
  on public.professional_qualifications (professional_profile_id);

create index prof_qualifications_credential_status_idx
  on public.professional_qualifications (credential_status);

create or replace function public.set_professional_qualifications_updated_at ()
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

comment on function public.set_professional_qualifications_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_qualifications. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce verification, publication, equivalence workflows, or FEV.';

create trigger professional_qualifications_set_updated_at
before update on public.professional_qualifications
for each row
execute function public.set_professional_qualifications_updated_at ();

alter table public.professional_qualifications enable row level security;

-- Defense in depth: no policies in M3.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_qualifications from public;
revoke all on table public.professional_qualifications from anon, authenticated;
