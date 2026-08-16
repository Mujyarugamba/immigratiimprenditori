-- M5.3 — create international market presence verifications
-- Implements per-aspect verification current-state (V01) for Mercati
-- Internazionali Presenza:
--   public.international_market_presence_verifications
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M5.3;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.12;
--  docs/architecture/logical/mercati-internazionali.md §2, §10).
--
-- Scope of this unit only: current-state verification rows owned by an
-- international_market_presences row. Each row covers exactly one aspect.
-- At most one row per (presence_id, aspect).
-- Explicitly out of scope: aggregate sync with
-- international_market_presences.verification_status; is_contested;
-- history/audit; badge/score/ranking; FK to sources or evidences;
-- commercial-relation verifications; editorial content; Organizations;
-- Storage; auth users; reviewers; demo seed; policies; URL/file/hash fields.
-- Depends on M3.1 public.international_market_presences only.
-- Does not alter M1.*, M2.*, M3.*, M4.*, M5.1, or M5.2 tables.
--
-- Verifica ≠ Fonte ≠ Evidenza. A verification records the current outcome
-- for one Presence aspect; it does not carry provenance typology, concrete
-- proof, or publishability, and does not mutate presence axes.

create table public.international_market_presence_verifications (
  id uuid not null default gen_random_uuid (),
  presence_id uuid not null,
  aspect text not null,
  status text not null default 'unverified',
  verified_at timestamptz null,
  expires_at timestamptz null,
  source_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impv_pkey primary key (id),
  constraint impv_presence_id_fkey foreign key (presence_id)
    references public.international_market_presences (id)
    on delete cascade,
  constraint impv_presence_aspect_unique unique (presence_id, aspect),
  constraint impv_aspect_check check (
    aspect in (
      'effective_presence',
      'declared_activity',
      'foreign_site',
      'export_import',
      'person_experience',
      'linguistic_competence',
      'network_membership'
    )
  ),
  constraint impv_status_check check (
    status in (
      'unverified',
      'in_review',
      'confirmed',
      'rejected'
    )
  )
);

comment on table public.international_market_presence_verifications is
  'Per-aspect verification current-state for a market Presence. Owned by international_market_presences; at most one row per (presence_id, aspect); deleted with the presence (ON DELETE CASCADE). Distinct from Fonte and Evidenza. Does not automatically sync international_market_presences.verification_status, is_contested, editorial_status, relation_status, or visibility_status. Does not derive badge, score, or ranking.';

comment on column public.international_market_presence_verifications.id is
  'Local technical identity of this verification current-state row. Not a public catalog code.';

comment on column public.international_market_presence_verifications.presence_id is
  'Owning market Presence (public.international_market_presences). Required. Owned composition; ON DELETE CASCADE. Unique with aspect.';

comment on column public.international_market_presence_verifications.aspect is
  'Single Presence verification aspect: effective_presence, declared_activity, foreign_site, export_import, person_experience, linguistic_competence, network_membership. Required. Same closed vocabulary as evidence supported_aspect. Not a verification outcome.';

comment on column public.international_market_presence_verifications.status is
  'Current verification outcome for this aspect: unverified, in_review, confirmed, rejected. Default unverified. Distinct from international_market_presences.verification_status and from editorial or visibility axes.';

comment on column public.international_market_presence_verifications.verified_at is
  'Optional timestamp documenting when the aspect decision was recorded. Nullable. Not auto-filled. Does not require a specific status and does not sync Aggregate Root axes.';

comment on column public.international_market_presence_verifications.expires_at is
  'Optional expiry timestamp of the current aspect verification. Nullable. Does not automatically change status when elapsed. Not a history or audit field.';

comment on column public.international_market_presence_verifications.source_note is
  'Optional free-text note about the verification context or control. Not a structured Fonte, Evidence, FK, URL, file, audit trail, or verifier account reference.';

comment on column public.international_market_presence_verifications.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_presence_verifications.updated_at is
  'Last update timestamp. Maintained by set_international_market_presence_verifications_updated_at.';

alter table public.international_market_presence_verifications enable row level security;

revoke all on table public.international_market_presence_verifications
from anon, authenticated;

create or replace function public.set_international_market_presence_verifications_updated_at ()
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

comment on function public.set_international_market_presence_verifications_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_presence_verifications. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns, Aggregate Root axes, evidences, or sources.';

create trigger international_market_presence_verifications_set_updated_at
before update on public.international_market_presence_verifications
for each row
execute function public.set_international_market_presence_verifications_updated_at ();
