-- M5.5 — create international commercial relation evidences
-- Implements verification evidences (V02) for Mercati Internazionali Relazione
-- commerciale internazionale:
--   public.international_commercial_relation_evidences
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M5.5;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.13;
--  docs/architecture/logical/mercati-internazionali.md §2 Evidenza, §6, §10).
--
-- Scope of this unit only: 0..N evidence rows owned by an
-- international_commercial_relations row. Each row supports exactly one
-- commercial-relation aspect with a concrete summary. Optional link to a
-- local Fonte (M5.4).
-- Explicitly out of scope: commercial-relation verifications; presence-chain
-- tables; editorial content; Organizations; Storage files; archived documents;
-- root verification_status; counterpart fields; relation_nature; structured
-- volumes or amounts; auth users; reviewers; audit; demo seed; policies;
-- URL/file/hash fields; sync to commercial-relation axes.
-- Depends on M4.1 public.international_commercial_relations and
-- M5.4 public.international_commercial_relation_sources.
-- Does not alter M1.*, M2.*, M3.*, M4.*, or M5.1–M5.4 tables.
--
-- Evidenza ≠ Fonte ≠ Verifica. An evidence carries concrete support for one
-- aspect; it does not record provenance typology, verification outcome,
-- commercial volumes, or publishability, and does not mutate relation axes.

create table public.international_commercial_relation_evidences (
  id uuid not null default gen_random_uuid (),
  commercial_relation_id uuid not null,
  source_id uuid null,
  supported_aspect text not null,
  summary text not null,
  observed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint icre_pkey primary key (id),
  constraint icre_commercial_relation_id_fkey foreign key (commercial_relation_id)
    references public.international_commercial_relations (id)
    on delete cascade,
  constraint icre_source_id_fkey foreign key (source_id)
    references public.international_commercial_relation_sources (id)
    on delete set null,
  constraint icre_supported_aspect_check check (
    supported_aspect in (
      'commercial_relation',
      'partner_recognition'
    )
  )
);

comment on table public.international_commercial_relation_evidences is
  'Concrete evidences (V02) supporting exactly one aspect of a specific international commercial relation. Owned by international_commercial_relations; deleted with the relation (ON DELETE CASCADE). Distinct from Fonte (optional source_id) and from Verification: does not assert provenance typology, verification outcome, reliability score, or publishability, and does not mutate commercial-relation axes. Multiple evidences may support the same aspect.';

comment on column public.international_commercial_relation_evidences.id is
  'Local technical identity of this evidence row. Not a public catalog code.';

comment on column public.international_commercial_relation_evidences.commercial_relation_id is
  'Owning international commercial relation (public.international_commercial_relations). Required. Owned composition; ON DELETE CASCADE.';

comment on column public.international_commercial_relation_evidences.source_id is
  'Optional local Fonte (public.international_commercial_relation_sources) providing provenance for this evidence. NULL when unlinked or after Fonte deletion (ON DELETE SET NULL). Deleting the Fonte keeps the evidence and clears only source_id.';

comment on column public.international_commercial_relation_evidences.supported_aspect is
  'Single commercial-relation aspect supported by this evidence: commercial_relation, partner_recognition. Required classification of what is supported. Not a verification outcome, not a relation_nature value, and not an applicative Partner role.';

comment on column public.international_commercial_relation_evidences.summary is
  'Required free-text summary of the concrete riscontro observed for the supported aspect. Not a score, confidence level, editorial decision, verification status, contract body, structured economic payload, file, or JSON.';

comment on column public.international_commercial_relation_evidences.observed_at is
  'Optional timestamp when the evidence element was observed or referred. Distinct from created_at/updated_at and from the commercial relation period (started_at/ended_at). Not declared_at, verified_at, or published_at.';

comment on column public.international_commercial_relation_evidences.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_commercial_relation_evidences.updated_at is
  'Last update timestamp. Maintained by set_international_commercial_relation_evidences_updated_at.';

alter table public.international_commercial_relation_evidences enable row level security;

revoke all on table public.international_commercial_relation_evidences
from anon, authenticated;

create or replace function public.set_international_commercial_relation_evidences_updated_at ()
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

comment on function public.set_international_commercial_relation_evidences_updated_at () is
  'BEFORE UPDATE trigger function for public.international_commercial_relation_evidences. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns or commercial-relation axes.';

create trigger international_commercial_relation_evidences_set_updated_at
before update on public.international_commercial_relation_evidences
for each row
execute function public.set_international_commercial_relation_evidences_updated_at ();
