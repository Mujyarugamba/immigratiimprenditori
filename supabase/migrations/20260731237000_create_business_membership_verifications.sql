-- M5.1 — create business membership verifications
-- Implements per-aspect verification current-state (V04) for Appartenenze:
--   public.business_membership_verifications
-- (docs/architecture/migrations/appartenenze-migration-plan.md §18 M5.1;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.8;
--  docs/architecture/logical/appartenenze.md §10).
--
-- Scope of this unit only: current-state verification rows owned by a
-- business_memberships row. Each row covers exactly one aspect. At most one
-- row per (membership_id, aspect).
--
-- Explicitly out of scope: aggregate sync with
-- business_memberships.verification_status; is_contested; history/audit;
-- badge/score/ranking; FK to sources/evidences; technical permissions;
-- RLS policies; seed/demo; Organizations; Opportunità; modifications to
-- M1–M4 beyond FK ownership.
--
-- Fonte ≠ Evidenza ≠ Verifica. status rejected is a negative verification
-- outcome for an aspect, not relation contestation. No cross-table trigger
-- updates the Aggregate Root or other domains.

create table public.business_membership_verifications (
  id uuid not null default gen_random_uuid (),
  membership_id uuid not null,
  aspect text not null,
  status text not null default 'unverified',
  verified_at timestamptz,
  expires_at timestamptz,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bmv_pkey primary key (id),
  constraint bmv_membership_id_fkey
    foreign key (membership_id)
    references public.business_memberships (id)
    on delete cascade,
  constraint bmv_membership_aspect_uidx unique (membership_id, aspect),
  constraint bmv_aspect_check check (
    aspect in (
      'identity',
      'business_existence',
      'relation_effectiveness',
      'role',
      'period',
      'representation',
      'management_authorization'
    )
  ),
  constraint bmv_status_check check (
    status in (
      'unverified',
      'in_review',
      'confirmed',
      'rejected'
    )
  ),
  constraint bmv_source_note_not_blank_check check (
    source_note is null
    or length(btrim(source_note)) > 0
  )
);

comment on table public.business_membership_verifications is
  'Per-aspect verification current-state (V04) for a Persona–Impresa membership. Owned by business_memberships; at most one row per (membership_id, aspect); deleted with the membership (ON DELETE CASCADE). Distinct from Fonte (M3.1) and Evidenza (M3.2). Does not automatically sync business_memberships.verification_status, is_contested, relation_status, visibility_status, or role_id. Does not derive badge, score, or ranking. status rejected is a negative aspect outcome, not relation contestation.';

comment on column public.business_membership_verifications.id is
  'Local technical identity of this verification current-state row. Not a public catalog code.';

comment on column public.business_membership_verifications.membership_id is
  'Owning Appartenenza (public.business_memberships). Required. ON DELETE CASCADE. Unique with aspect.';

comment on column public.business_membership_verifications.aspect is
  'Single verification aspect: identity, business_existence, relation_effectiveness, role, period, representation, management_authorization. Required. Same closed vocabulary as evidence supported_aspect; no FK or sync with evidences.';

comment on column public.business_membership_verifications.status is
  'Current verification outcome for this aspect: unverified, in_review, confirmed, rejected. Default unverified. rejected is a negative verification outcome, not contestation (is_contested) and not aggregate membership verification_status.';

comment on column public.business_membership_verifications.verified_at is
  'Optional timestamp documenting when the aspect decision was recorded. Nullable. Not auto-filled by trigger. Does not imply sync with Aggregate Root axes.';

comment on column public.business_membership_verifications.expires_at is
  'Optional expiry timestamp of the current aspect verification. Nullable. Does not automatically change status when elapsed. Not a history or audit field.';

comment on column public.business_membership_verifications.source_note is
  'Optional free-text note about the verification context. Anti-blank when present. Not a structured Fonte, Evidence, FK, audit trail, or verifier account reference.';

comment on column public.business_membership_verifications.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_membership_verifications.updated_at is
  'Last update timestamp. Maintained by bm_verifications_set_updated_at.';

create index bmv_membership_id_idx
  on public.business_membership_verifications using btree (membership_id);

create index bmv_aspect_idx
  on public.business_membership_verifications using btree (aspect);

alter table public.business_membership_verifications enable row level security;

-- Defense in depth: no policies in M5.1. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_membership_verifications
from anon, authenticated;

create or replace function public.set_bm_verifications_updated_at ()
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

comment on function public.set_bm_verifications_updated_at () is
  'BEFORE UPDATE trigger function for public.business_membership_verifications. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns, Aggregate Root axes, evidences, sources, or other domains.';

create trigger bm_verifications_set_updated_at
before update on public.business_membership_verifications
for each row
execute function public.set_bm_verifications_updated_at ();
