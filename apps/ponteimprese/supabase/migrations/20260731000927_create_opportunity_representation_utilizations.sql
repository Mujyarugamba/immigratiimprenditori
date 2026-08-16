-- M6.2 — create opportunity representation utilizations
-- Implements local Appartenenza/representation utilization snapshots (D17)
-- as a multivalue composition of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §17;
--  docs/architecture/physical/domain-mapping/opportunita.md §15.B §15.B.1–§15.B.13;
--  approved Physical §15 micro-review with non-blocking findings).
--
-- Depends on:
--   public.opportunities (M1.1)
--   public.opportunity_party_references (M6.1)
--
-- Creates:
--   public.opportunity_representation_utilizations
--
-- Scope of this unit only: local non-authoritative snapshots of representation
-- use (Person acting for an Impresa) linked to an M6.1 party reference.
-- Explicitly out of scope: Appartenenza ownership/tables, Impresa FK,
-- M6.3 context references, candidature, platform publication (M7),
-- verification of titles, synchronization with remote domains, seed data,
-- policies, and grants.
--
-- Utilization ≠ Appartenenza autoritativa ≠ membership completa ≠
-- Persona ≠ Impresa ≠ candidatura ≠ pubblicazione M7 ≠ audit.
-- Soft deletion of opportunities (deleted_at) does not remove utilization
-- rows; physical delete of an opportunity or of the linked party reference
-- cascades owned utilization rows. membership_id and represented_business_id
-- are opaque UUIDs without FK until those domains exist in schema.

create table public.opportunity_representation_utilizations (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  party_reference_id uuid not null references public.opportunity_party_references (id) on delete cascade,
  membership_id uuid,
  represented_business_id uuid,
  snapshot_role_label text,
  snapshot_note text,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_representation_utilizations_snapshot_role_label_not_blank_check check (
    snapshot_role_label is null
    or btrim(snapshot_role_label) <> ''
  ),
  constraint opportunity_representation_utilizations_snapshot_note_not_blank_check check (
    snapshot_note is null
    or btrim(snapshot_note) <> ''
  ),
  constraint opportunity_representation_utilizations_anchor_check check (
    membership_id is not null
    or represented_business_id is not null
    or snapshot_role_label is not null
  )
);

comment on table public.opportunity_representation_utilizations is
  'R02 local representation-utilization composition owned by an Opportunità: non-authoritative snapshot that a Person party reference acts for an Impresa under a representation title (D17 utilization). Not Appartenenza ownership, not full membership, not candidature, not platform publication (M7). Multiple rows (0..N) allowed; current composition state with updatable/deletable rows (no supersession column, no history table). Physical delete of the opportunity or linked party reference cascades owned rows.';

comment on column public.opportunity_representation_utilizations.id is
  'Technical row identifier only. Does not confer autonomous domain identity of an Appartenenza or membership.';

comment on column public.opportunity_representation_utilizations.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_representation_utilizations.party_reference_id is
  'M6.1 party reference of the acting Person on the same opportunity sheet. Required; ON DELETE CASCADE. Application invariant: must reference a person subject_kind row of the same opportunity_id (not enforced by trigger in M6.2).';

comment on column public.opportunity_representation_utilizations.membership_id is
  'Opaque Appartenenza identity when known. No foreign key in M6.2 because Appartenenza tables are not yet in schema; a later additive migration may add FK ON DELETE SET NULL. Not ownership of Appartenenza; not current authority.';

comment on column public.opportunity_representation_utilizations.represented_business_id is
  'Opaque Impresa identity for which the Person acts. No foreign key in M6.2; future FK may use ON DELETE SET NULL. Not a copy of Impresa attributes; not authoritative business master data.';

comment on column public.opportunity_representation_utilizations.snapshot_role_label is
  'Local non-authoritative declared role/title at capture time (e.g. legale rappresentante). Plain text snapshot; not a controlled list; not Appartenenza authority. Anti-blank when set; contributes to the minimum content anchor.';

comment on column public.opportunity_representation_utilizations.snapshot_note is
  'Optional local non-authoritative note about the utilization. Plain text; not JSON; not a full membership dump. Anti-blank when set. Alone does not satisfy the minimum content anchor.';

comment on column public.opportunity_representation_utilizations.captured_at is
  'Timestamp when this local snapshot was captured. Distinct from created_at of the row, from remote Appartenenza validity, and from platform publication (M7). Default now().';

comment on column public.opportunity_representation_utilizations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_representation_utilizations.updated_at is
  'Last update timestamp. Maintained by opportunity_representation_utilizations_set_updated_at.';

create index opportunity_representation_utilizations_opportunity_id_idx
  on public.opportunity_representation_utilizations using btree (opportunity_id);

create index opportunity_representation_utilizations_party_reference_id_idx
  on public.opportunity_representation_utilizations using btree (party_reference_id);

create or replace function public.set_opportunity_representation_utilizations_updated_at ()
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

create trigger opportunity_representation_utilizations_set_updated_at
before update on public.opportunity_representation_utilizations
for each row
execute function public.set_opportunity_representation_utilizations_updated_at ();

alter table public.opportunity_representation_utilizations enable row level security;

-- Defense in depth: no policies in M6.2. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. service_role and owner
-- privileges are not revoked.
revoke all on table public.opportunity_representation_utilizations from anon, authenticated;
