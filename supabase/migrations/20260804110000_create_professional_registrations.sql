-- M3.2 — create professional registrations
-- Implements the owned credentials family Iscrizione professionale of Professionisti:
--   public.professional_registrations
-- (docs/architecture/migrations/professionisti-migration-plan.md §14 M3.2;
--  docs/architecture/physical/domain-mapping/professionisti.md §29.3.7,
--  §29.5, §29.6, §29.19, §29.20, §29.22.8, §29.23–§29.26;
--  docs/architecture/logical/professionisti.md — Iscrizione vs Qualifica /
--  Abilitazione / Certificazione).
--
-- Scope of this unit only: one owned table under professional_profiles,
-- constraints, indexes, updated_at function/trigger, RLS infrastructure, REVOKE.
-- Explicitly out of scope: seed; qualifications; authorizations; certifications;
-- association memberships; Orders/Colleges catalog; Organizations FK; FEV;
-- Storage; policies; GRANT; alterations to M3.1, profiles, or catalogs.

create table public.professional_registrations (
  id uuid not null default gen_random_uuid (),
  professional_profile_id uuid not null,
  denomination text not null,
  register_body_label text not null,
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
  constraint prof_registrations_pkey primary key (id),
  constraint prof_registrations_professional_profile_id_fkey foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete cascade,
  constraint prof_registrations_denomination_not_blank_check check (
    length(btrim(denomination)) > 0
  ),
  constraint prof_registrations_register_body_label_not_blank_check check (
    length(btrim(register_body_label)) > 0
  ),
  constraint prof_registrations_credential_status_check check (
    credential_status in ('active', 'suspended', 'inactive')
  ),
  constraint prof_registrations_verification_status_check check (
    verification_status in (
      'unverified',
      'in_review',
      'verified',
      'contested'
    )
  ),
  constraint prof_registrations_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_registrations_evidence_visibility_check check (
    evidence_visibility in (
      'private',
      'editorial',
      'network',
      'selected',
      'public',
      'partially_anonymous'
    )
  ),
  constraint prof_registrations_origin_kind_check check (
    origin_kind in ('national', 'foreign')
  ),
  constraint prof_registrations_equivalence_status_check check (
    equivalence_status is null
    or equivalence_status in (
      'not_required',
      'in_progress',
      'obtained',
      'denied'
    )
  ),
  constraint prof_registrations_equivalence_origin_check check (
    (
      origin_kind = 'foreign'
      and equivalence_status is not null
    )
    or (
      origin_kind = 'national'
      and equivalence_status is null
    )
  ),
  constraint prof_registrations_valid_range_check check (
    valid_until is null
    or valid_from is null
    or valid_until >= valid_from
  ),
  constraint prof_registrations_issued_valid_from_check check (
    valid_from is null
    or issued_on is null
    or valid_from >= issued_on
  ),
  constraint prof_registrations_issued_valid_until_check check (
    valid_until is null
    or issued_on is null
    or valid_until >= issued_on
  ),
  constraint prof_registrations_sort_order_check check (sort_order >= 0)
);

comment on table public.professional_registrations is
  'Owned Entity (E02) of professional_profiles: declared professional registration with an Order, College, register, roll, or equivalent body. Distinct from qualifications (study/professional titles), authorizations, certifications, association memberships, competencies, and FEV profile tables. register_body_label is an opaque descriptive body name — not an Orders catalog FK and not an Organization/business entity. Row-level verification_status is authoritative for this registration only. Lifecycle via credential_status (active|suspended|inactive); historical rows retained; no soft-delete.';

comment on column public.professional_registrations.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Not a natural key and not the registration number.';

comment on column public.professional_registrations.professional_profile_id is
  'Owning Aggregate Root (public.professional_profiles). NOT NULL. ON DELETE CASCADE — registrations do not outlive the profile. No direct FK to profiles (Persona).';

comment on column public.professional_registrations.denomination is
  'Declared denomination of the registration entry (e.g. declared roll/title wording). Required and non-blank. Not globally UNIQUE.';

comment on column public.professional_registrations.register_body_label is
  'Opaque label of the Order, College, register, roll, or equivalent body (Physical §29.3.7 Extra). Required and non-blank. Not a FK to Orders, Organizations, businesses, or any body catalog.';

comment on column public.professional_registrations.issuer_label is
  'Optional additional opaque issuer/descriptive label. Nullable. Distinct from register_body_label; not a catalog FK.';

comment on column public.professional_registrations.external_identifier is
  'Optional registration number / external code on the registration document (common credentials meaning). Attribute only — not a primary key, not globally UNIQUE, and not proof by itself.';

comment on column public.professional_registrations.issued_on is
  'Optional registration / issuance date. Temporal coherence with valid_from/valid_until enforced by CHECK when both ends are present.';

comment on column public.professional_registrations.valid_from is
  'Optional start of effects. NULL when not applicable or unknown.';

comment on column public.professional_registrations.valid_until is
  'Optional end of validity. NULL means no known term / not applicable. Does not delete historical rows.';

comment on column public.professional_registrations.credential_status is
  'Credential lifecycle S01 for registrations only: active | suspended | inactive. Default active. Distinct from qualification (declared|expired|withdrawn), authorization, and certification status vocabularies, and from profile professional_status.';

comment on column public.professional_registrations.verification_status is
  'Authoritative per-row verification S03: unverified | in_review | verified | contested. Default unverified. Distinct from profile FEV tables and from any overall profile verification projection (not persisted).';

comment on column public.professional_registrations.visibility_status is
  'Visibility of this registration declaration (VIS). Default private. Distinct from evidence_visibility and from profile-level visibility_status.';

comment on column public.professional_registrations.evidence_visibility is
  'Visibility of evidence linked to this registration. Default private. Not Storage paths; FEV per-credential tables are out of cycle 1.';

comment on column public.professional_registrations.origin_kind is
  'Geographic/legal origin of the registration: national | foreign. Default national. Drives equivalence_status conditioning (common credentials rule §29.22.8).';

comment on column public.professional_registrations.equivalence_status is
  'Required when origin_kind=foreign; must be NULL when national. Values: not_required | in_progress | obtained | denied. Descriptive only — not an administrative workflow engine.';

comment on column public.professional_registrations.notes is
  'Optional free-text note. Not evidence summary and not verification rationale.';

comment on column public.professional_registrations.sort_order is
  'Display order among registrations of the same profile. Non-negative. Not identity.';

comment on column public.professional_registrations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.professional_registrations.updated_at is
  'Last update timestamp. Maintained by professional_registrations_set_updated_at.';

create index prof_registrations_professional_profile_id_idx
  on public.professional_registrations (professional_profile_id);

create index prof_registrations_credential_status_idx
  on public.professional_registrations (credential_status);

create or replace function public.set_professional_registrations_updated_at ()
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

comment on function public.set_professional_registrations_updated_at () is
  'BEFORE UPDATE trigger function for public.professional_registrations. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce verification, suspension workflows, equivalence, or FEV.';

create trigger professional_registrations_set_updated_at
before update on public.professional_registrations
for each row
execute function public.set_professional_registrations_updated_at ();

alter table public.professional_registrations enable row level security;

-- Defense in depth: no policies in M3.2. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.professional_registrations from public;
revoke all on table public.professional_registrations from anon, authenticated;
