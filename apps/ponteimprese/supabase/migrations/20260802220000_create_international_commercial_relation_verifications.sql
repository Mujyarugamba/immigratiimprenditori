-- M5.6 — create international commercial relation verifications
-- Implements per-aspect verification current-state (V01) for Mercati
-- Internazionali Relazione commerciale internazionale:
--   public.international_commercial_relation_verifications
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M5.6;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.13;
--  docs/architecture/logical/mercati-internazionali.md §2, §6, §10).
--
-- Scope of this unit only: current-state verification rows owned by an
-- international_commercial_relations row. Each row covers exactly one aspect.
-- At most one row per (commercial_relation_id, aspect).
-- Explicitly out of scope: aggregate sync with
-- international_commercial_relations.verification_status; is_contested;
-- history/audit; badge/score/ranking; FK to sources or evidences;
-- presence-chain tables; editorial content; Organizations; Storage;
-- auth users; reviewers; demo seed; policies; URL/file/hash fields.
-- Depends on M4.1 public.international_commercial_relations only.
-- Does not alter M1.*, M2.*, M3.*, M4.*, or M5.1–M5.5 tables.
--
-- Verifica ≠ Fonte ≠ Evidenza. A verification records the current outcome
-- for one commercial-relation aspect; it does not carry provenance typology,
-- concrete proof, or publishability, and does not mutate relation axes.

create table public.international_commercial_relation_verifications (
  id uuid not null default gen_random_uuid (),
  commercial_relation_id uuid not null,
  aspect text not null,
  status text not null default 'unverified',
  verified_at timestamptz null,
  expires_at timestamptz null,
  source_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint icrv_pkey primary key (id),
  constraint icrv_commercial_relation_id_fkey foreign key (commercial_relation_id)
    references public.international_commercial_relations (id)
    on delete cascade,
  constraint icrv_commercial_relation_aspect_unique unique (commercial_relation_id, aspect),
  constraint icrv_aspect_check check (
    aspect in (
      'commercial_relation',
      'partner_recognition'
    )
  ),
  constraint icrv_status_check check (
    status in (
      'unverified',
      'in_review',
      'confirmed',
      'rejected'
    )
  )
);

comment on table public.international_commercial_relation_verifications is
  'Per-aspect verification current-state for an international commercial relation. Owned by international_commercial_relations; at most one row per (commercial_relation_id, aspect); deleted with the relation (ON DELETE CASCADE). Distinct from Fonte and Evidenza. Does not automatically sync international_commercial_relations.verification_status, is_contested, editorial_status, relation_status, or visibility_status. Does not derive badge, score, or ranking.';

comment on column public.international_commercial_relation_verifications.id is
  'Local technical identity of this verification current-state row. Not a public catalog code.';

comment on column public.international_commercial_relation_verifications.commercial_relation_id is
  'Owning international commercial relation (public.international_commercial_relations). Required. Owned composition; ON DELETE CASCADE. Unique with aspect.';

comment on column public.international_commercial_relation_verifications.aspect is
  'Single commercial-relation verification aspect: commercial_relation, partner_recognition. Required. Same closed vocabulary as commercial-relation evidence supported_aspect. Not a relation_nature value, not an applicative Partner role, and not a verification outcome.';

comment on column public.international_commercial_relation_verifications.status is
  'Current verification outcome for this aspect: unverified, in_review, confirmed, rejected. Default unverified. Distinct from international_commercial_relations.verification_status and from editorial, relation, or visibility axes.';

comment on column public.international_commercial_relation_verifications.verified_at is
  'Optional timestamp documenting when the aspect decision was recorded. Nullable. Not auto-filled. Does not require a specific status and does not sync Aggregate Root axes.';

comment on column public.international_commercial_relation_verifications.expires_at is
  'Optional expiry timestamp of the current aspect verification. Nullable. Does not automatically change status when elapsed. Not a history or audit field.';

comment on column public.international_commercial_relation_verifications.source_note is
  'Optional free-text note about the verification context or control. Not a structured Fonte, Evidence, FK, URL, file, audit trail, or verifier account reference.';

comment on column public.international_commercial_relation_verifications.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_commercial_relation_verifications.updated_at is
  'Last update timestamp. Maintained by set_international_commercial_relation_verifications_updated_at.';

alter table public.international_commercial_relation_verifications enable row level security;

revoke all on table public.international_commercial_relation_verifications
from anon, authenticated;

create or replace function public.set_international_commercial_relation_verifications_updated_at ()
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

comment on function public.set_international_commercial_relation_verifications_updated_at () is
  'BEFORE UPDATE trigger function for public.international_commercial_relation_verifications. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns, Aggregate Root axes, evidences, or sources.';

create trigger international_commercial_relation_verifications_set_updated_at
before update on public.international_commercial_relation_verifications
for each row
execute function public.set_international_commercial_relation_verifications_updated_at ();
