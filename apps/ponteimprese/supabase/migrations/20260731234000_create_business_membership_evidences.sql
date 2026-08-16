-- M3.2 — create business membership evidences
-- Implements verification evidences for Appartenenze:
--   public.business_membership_evidences
-- (docs/architecture/migrations/appartenenze-migration-plan.md §16 M3.2;
--  docs/architecture/physical/domain-mapping/appartenenze.md §32.5, §32.8;
--  docs/architecture/logical/appartenenze.md §2 Evidenza di verifica).
--
-- Scope of this unit only: 0..N evidence rows owned by a business_memberships
-- row. Each row supports exactly one verification aspect. Optional link to
-- a local Fonte (M3.1). Evidence ≠ Fonte ≠ Verification.
--
-- Explicitly out of scope: business_membership_verifications (M5.1);
-- management authorizations; responsibility declarations; history/audit;
-- Storage files; score/badge/outcome; seed/demo; policies; Organizations;
-- Opportunità; modifications to M1–M3.1 beyond FK ownership.
--
-- An evidence does not assign verification_status, does not mutate AR axes,
-- and does not assert confirmation or rejection of the membership.

create table public.business_membership_evidences (
  id uuid not null default gen_random_uuid (),
  membership_id uuid not null,
  source_id uuid,
  supported_aspect text not null,
  summary text not null,
  observed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bme_pkey primary key (id),
  constraint bme_membership_id_fkey
    foreign key (membership_id)
    references public.business_memberships (id)
    on delete cascade,
  constraint bme_source_id_fkey
    foreign key (source_id)
    references public.business_membership_sources (id)
    on delete set null,
  constraint bme_supported_aspect_check check (
    supported_aspect in (
      'identity',
      'business_existence',
      'relation_effectiveness',
      'role',
      'period',
      'representation',
      'management_authorization'
    )
  ),
  constraint bme_summary_not_blank_check check (
    length(btrim(summary)) > 0
  )
);

comment on table public.business_membership_evidences is
  'Informative evidences that support exactly one verification aspect of a specific Persona–Impresa membership. Owned by business_memberships; deleted with the membership (ON DELETE CASCADE). Distinct from Fonte (optional source_id) and from Verification (M5.1). Multiple evidences may support the same aspect. Does not assign verification_status, mutate membership axes, or derive badge/score/outcome.';

comment on column public.business_membership_evidences.id is
  'Local technical identity of this evidence row. Not a public catalog code.';

comment on column public.business_membership_evidences.membership_id is
  'Owning Appartenenza (public.business_memberships). Required. ON DELETE CASCADE.';

comment on column public.business_membership_evidences.source_id is
  'Optional local Fonte (public.business_membership_sources) providing provenance for this evidence. NULL when unlinked or after Fonte deletion (ON DELETE SET NULL). Deleting the Fonte keeps the evidence and clears only source_id.';

comment on column public.business_membership_evidences.supported_aspect is
  'Single verification aspect supported by this evidence row: identity, business_existence, relation_effectiveness, role, period, representation, management_authorization. Required. Not a verification outcome.';

comment on column public.business_membership_evidences.summary is
  'Required free-text summary of the informative riscontro. Anti-blank. Not a score, outcome, editorial decision, or verification status.';

comment on column public.business_membership_evidences.observed_at is
  'Optional timestamp when the evidence was observed or recorded. Distinct from created_at/updated_at. Not verified_at and not an expiry timestamp.';

comment on column public.business_membership_evidences.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.business_membership_evidences.updated_at is
  'Last update timestamp. Maintained by business_membership_evidences_set_updated_at.';

create index bme_membership_id_idx
  on public.business_membership_evidences using btree (membership_id);

create index bme_source_id_idx
  on public.business_membership_evidences using btree (source_id);

create index bme_supported_aspect_idx
  on public.business_membership_evidences using btree (supported_aspect);

alter table public.business_membership_evidences enable row level security;

-- Defense in depth: no policies in M3.2. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.business_membership_evidences
from anon, authenticated;

create or replace function public.set_business_membership_evidences_updated_at ()
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

comment on function public.set_business_membership_evidences_updated_at () is
  'BEFORE UPDATE trigger function for public.business_membership_evidences. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns or membership axes.';

create trigger business_membership_evidences_set_updated_at
before update on public.business_membership_evidences
for each row
execute function public.set_business_membership_evidences_updated_at ();
