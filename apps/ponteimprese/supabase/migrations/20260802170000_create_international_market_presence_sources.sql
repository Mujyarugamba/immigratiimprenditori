-- M5.1 — create international market presence sources
-- Implements informative sources (V03) for Mercati Internazionali Presenza:
--   public.international_market_presence_sources
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M5.1;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.12;
--  docs/architecture/logical/mercati-internazionali.md §2 Fonte, §10).
--
-- Scope of this unit only: 0..N source rows owned by an
-- international_market_presences row. Documents the informative provenance
-- used in the context of a market Presence.
-- Explicitly out of scope: evidences (M5.2); verifications (M5.3);
-- commercial-relation sources/evidences/verifications (M5.4–M5.6);
-- editorial content; Organizations; Storage files; archived documents;
-- free-form presence notes; presence verification_status; auth users;
-- reviewers; audit; demo seed; policies; URL/file/hash fields.
-- Depends on M3.1 public.international_market_presences.
-- Does not alter M1.*, M2.*, M3.*, or M4.* tables.
--
-- Fonte ≠ Evidenza ≠ Verifica. A source records provenance only; it does
-- not carry concrete proof, verification outcome, or publishability.

create table public.international_market_presence_sources (
  id uuid not null default gen_random_uuid (),
  presence_id uuid not null,
  source_kind text not null,
  reliability_note text null,
  reference_label text null,
  declared_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imps_pkey primary key (id),
  constraint imps_presence_id_fkey foreign key (presence_id)
    references public.international_market_presences (id)
    on delete cascade,
  constraint imps_source_kind_check check (
    source_kind in (
      'business_declaration',
      'person_declaration',
      'commercial_documentation',
      'public_source',
      'institutional_body',
      'association',
      'verified_partner',
      'editorial',
      'informative_import'
    )
  )
);

comment on table public.international_market_presence_sources is
  'Informative sources (V03) documenting the provenance of information for a specific market Presence. Owned by international_market_presences; deleted with the presence (ON DELETE CASCADE). Not an Evidence and not a Verification: does not assert concrete proof, verification outcome, reliability score, or publishability.';

comment on column public.international_market_presence_sources.id is
  'Local technical identity of this source row. Not a public catalog code.';

comment on column public.international_market_presence_sources.presence_id is
  'Owning market Presence (public.international_market_presences). Required. Owned composition; ON DELETE CASCADE.';

comment on column public.international_market_presence_sources.source_kind is
  'Controlled typology of the informative source: business_declaration, person_declaration, commercial_documentation, public_source, institutional_body, association, verified_partner, editorial, informative_import. Required classification of provenance. Does not imply an Organization FK, Appartenenza, editorial Content, partner account, or verification outcome.';

comment on column public.international_market_presence_sources.reliability_note is
  'Optional qualitative reliability note for this source. Free text only; not a numeric score, enum, confidence level, or verification status.';

comment on column public.international_market_presence_sources.reference_label is
  'Optional descriptive reference to the source material. Free-text citation label; not a URL field, external structured identifier, Content title, Organization name, or natural key.';

comment on column public.international_market_presence_sources.declared_at is
  'Optional timestamp referring to when the source information was declared or stated. Distinct from created_at/updated_at. Not observed_at, verified_at, or published_at.';

comment on column public.international_market_presence_sources.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_presence_sources.updated_at is
  'Last update timestamp. Maintained by set_international_market_presence_sources_updated_at.';

alter table public.international_market_presence_sources enable row level security;

revoke all on table public.international_market_presence_sources
from anon, authenticated;

create or replace function public.set_international_market_presence_sources_updated_at ()
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

comment on function public.set_international_market_presence_sources_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_presence_sources. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns.';

create trigger international_market_presence_sources_set_updated_at
before update on public.international_market_presence_sources
for each row
execute function public.set_international_market_presence_sources_updated_at ();
