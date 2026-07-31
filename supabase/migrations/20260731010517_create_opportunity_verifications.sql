-- M7.1 — create opportunity verifications
-- Implements E02 current-state verification-by-aspect of the Opportunità
-- domain (docs/architecture/migrations/opportunita-migration-plan.md §18;
--  docs/architecture/physical/domain-mapping/opportunita.md §24 §24.1–§24.17;
--  Physical M7.1 micro-review approved).
--
-- Depends on:
--   public.opportunities (M1.1)
--
-- Creates:
--   public.opportunity_verifications
--   public.set_opportunity_verifications_updated_at
--   trigger opportunity_verifications_set_updated_at
--
-- Scope of this unit only: optional per-aspect verification current-state
-- rows owned by an Opportunity. Explicitly out of scope: M7.2 editorial /
-- publication / visibility axes on opportunities, candidature, beneficiaries,
-- editorial workflow, Contenuti Editoriali, Eventi, Collaborazioni, audit /
-- history / transition logs, seed data, policies, and grants.
--
-- Verification ≠ editorial approval ≠ platform publication ≠ M5 access
-- windows ≠ external_official_published_at. Soft deletion of opportunities
-- (deleted_at) does not remove verification rows; physical delete of an
-- opportunity cascades owned verification rows. At most one current row per
-- (opportunity_id, aspect); no history table.

create table public.opportunity_verifications (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  aspect text not null,
  status text not null,
  verified_at timestamptz,
  expires_at timestamptz,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_verifications_aspect_check check (
    aspect in (
      'existence',
      'identity',
      'source',
      'timing',
      'benefit',
      'requirements'
    )
  ),
  constraint opportunity_verifications_status_check check (
    status in (
      'pending',
      'verified',
      'failed',
      'expired'
    )
  ),
  constraint opportunity_verifications_status_timestamps_check check (
    (
      status = 'pending'
      and verified_at is null
      and expires_at is null
    )
    or (
      status = 'verified'
      and verified_at is not null
      and (
        expires_at is null
        or expires_at > verified_at
      )
    )
    or (
      status = 'failed'
      and verified_at is not null
      and expires_at is null
    )
    or (
      status = 'expired'
      and verified_at is not null
      and expires_at is not null
      and expires_at > verified_at
    )
  ),
  constraint opportunity_verifications_source_note_not_blank_check check (
    source_note is null
    or btrim(source_note) <> ''
  ),
  constraint opportunity_verifications_opportunity_aspect_key unique (opportunity_id, aspect)
);

comment on table public.opportunity_verifications is
  'E02 verification current-state composition owned by an Opportunità: at most one row per (opportunity_id, aspect). Records per-aspect verification outcome of the governed sheet (existence, identity, source, timing, benefit, requirements). Not an audit log, not a history/transition table, not editorial workflow, not editorial approval, not platform publication (M7.2), not M5 access windows, not Contenuti Editoriali. Structural cardinality 0..N; no minimum; physical delete of the opportunity cascades owned rows.';

comment on column public.opportunity_verifications.id is
  'Technical identifier of the current verification row. Does not confer autonomous domain identity.';

comment on column public.opportunity_verifications.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row. No autonomous existence without the opportunity.';

comment on column public.opportunity_verifications.aspect is
  'Closed controlled vocabulary of the verified plane: existence | identity | source | timing | benefit | requirements. Maps Thesis/Logical verification planes; not contact, officiality, eligibility, editorial, publication, candidature, or access modality.';

comment on column public.opportunity_verifications.status is
  'Closed controlled vocabulary of verification outcome: pending | verified | failed | expired. Not an editorial status (draft/in_review/approved/rejected), not publication status, not M5 temporal state.';

comment on column public.opportunity_verifications.verified_at is
  'Conclusion timestamp of the current verification: positive for verified, negative for failed, original positive conclusion retained for expired. Must be NULL when status is pending; required for verified, failed, and expired.';

comment on column public.opportunity_verifications.expires_at is
  'Optional declared validity limit of a positive verification, or obsolescence anchor when status is expired. Required for expired; optional for verified (NULL or > verified_at); must be NULL for pending and failed. Not an M5 access/application window and not external_official_published_at. No automatic transition from now().';

comment on column public.opportunity_verifications.source_note is
  'Optional local synthetic note supporting the verification row. Anti-blank when set. Not the Fonte entity, not Evidence, not an audit trail, not a public text, not an editorial rejection/publication reason.';

comment on column public.opportunity_verifications.created_at is
  'Row creation timestamp for the current-state verification. System-managed default.';

comment on column public.opportunity_verifications.updated_at is
  'Last update timestamp of the current-state row. Maintained by opportunity_verifications_set_updated_at.';

create index opportunity_verifications_opportunity_id_idx
  on public.opportunity_verifications using btree (opportunity_id);

create index opportunity_verifications_status_idx
  on public.opportunity_verifications using btree (status);

create or replace function public.set_opportunity_verifications_updated_at ()
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

create trigger opportunity_verifications_set_updated_at
before update on public.opportunity_verifications
for each row
execute function public.set_opportunity_verifications_updated_at ();

alter table public.opportunity_verifications enable row level security;

-- Defense in depth: no policies in M7.1. Completeness/publication gates are
-- applicative (M7.2 / later). With RLS enabled and no policy, roles subject
-- to RLS cannot read or write. service_role and owner privileges are not
-- revoked. Function privileges follow the M1–M6 opportunity pattern (no
-- GRANT/REVOKE on the trigger function).
revoke all on table public.opportunity_verifications from anon, authenticated;
