-- M5.2 — create international market presence evidences
-- Implements verification evidences (V02) for Mercati Internazionali Presenza:
--   public.international_market_presence_evidences
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M5.2;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.12;
--  docs/architecture/logical/mercati-internazionali.md §2 Evidenza, §10).
--
-- Scope of this unit only: 0..N evidence rows owned by an
-- international_market_presences row. Each row supports exactly one Presence
-- aspect with a concrete summary. Optional link to a local Fonte (M5.1).
-- Explicitly out of scope: presence verifications; commercial-relation
-- sources/evidences/verifications; editorial content; Organizations;
-- Storage files; archived documents; presence verification_status; auth users;
-- reviewers; audit; demo seed; policies; URL/file/hash fields; sync to
-- presence axes.
-- Depends on M3.1 public.international_market_presences and
-- M5.1 public.international_market_presence_sources.
-- Does not alter M1.*, M2.*, M3.*, M4.*, or M5.1 tables.
--
-- Evidenza ≠ Fonte ≠ Verifica. An evidence carries concrete support for one
-- aspect; it does not record provenance typology, verification outcome, or
-- publishability, and does not mutate presence axes.

create table public.international_market_presence_evidences (
  id uuid not null default gen_random_uuid (),
  presence_id uuid not null,
  source_id uuid null,
  supported_aspect text not null,
  summary text not null,
  observed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impe_pkey primary key (id),
  constraint impe_presence_id_fkey foreign key (presence_id)
    references public.international_market_presences (id)
    on delete cascade,
  constraint impe_source_id_fkey foreign key (source_id)
    references public.international_market_presence_sources (id)
    on delete set null,
  constraint impe_supported_aspect_check check (
    supported_aspect in (
      'effective_presence',
      'declared_activity',
      'foreign_site',
      'export_import',
      'person_experience',
      'linguistic_competence',
      'network_membership'
    )
  )
);

comment on table public.international_market_presence_evidences is
  'Concrete evidences (V02) supporting exactly one aspect of a specific market Presence. Owned by international_market_presences; deleted with the presence (ON DELETE CASCADE). Distinct from Fonte (optional source_id) and from Verification: does not assert provenance typology, verification outcome, reliability score, or publishability, and does not mutate presence axes. Multiple evidences may support the same aspect.';

comment on column public.international_market_presence_evidences.id is
  'Local technical identity of this evidence row. Not a public catalog code.';

comment on column public.international_market_presence_evidences.presence_id is
  'Owning market Presence (public.international_market_presences). Required. Owned composition; ON DELETE CASCADE.';

comment on column public.international_market_presence_evidences.source_id is
  'Optional local Fonte (public.international_market_presence_sources) providing provenance for this evidence. NULL when unlinked or after Fonte deletion (ON DELETE SET NULL). Deleting the Fonte keeps the evidence and clears only source_id.';

comment on column public.international_market_presence_evidences.supported_aspect is
  'Single Presence aspect supported by this evidence: effective_presence, declared_activity, foreign_site, export_import, person_experience, linguistic_competence, network_membership. Required classification of what is supported. Not a verification outcome.';

comment on column public.international_market_presence_evidences.summary is
  'Required free-text summary of the concrete riscontro observed for the supported aspect. Not a score, confidence level, editorial decision, verification status, file, or structured payload.';

comment on column public.international_market_presence_evidences.observed_at is
  'Optional timestamp when the evidence element was observed or referred. Distinct from created_at/updated_at. Not declared_at, verified_at, or published_at.';

comment on column public.international_market_presence_evidences.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_presence_evidences.updated_at is
  'Last update timestamp. Maintained by set_international_market_presence_evidences_updated_at.';

alter table public.international_market_presence_evidences enable row level security;

revoke all on table public.international_market_presence_evidences
from anon, authenticated;

create or replace function public.set_international_market_presence_evidences_updated_at ()
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

comment on function public.set_international_market_presence_evidences_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_presence_evidences. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns or presence axes.';

create trigger international_market_presence_evidences_set_updated_at
before update on public.international_market_presence_evidences
for each row
execute function public.set_international_market_presence_evidences_updated_at ();
