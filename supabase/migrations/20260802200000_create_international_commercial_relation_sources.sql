-- M5.4 — create international commercial relation sources
-- Implements informative sources (V03) for Mercati Internazionali Relazione
-- commerciale internazionale:
--   public.international_commercial_relation_sources
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M5.4;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.13;
--  docs/architecture/logical/mercati-internazionali.md §2 Fonte, §6, §10).
--
-- Scope of this unit only: 0..N source rows owned by an
-- international_commercial_relations row. Documents the informative provenance
-- used in the context of an international commercial relation.
-- Explicitly out of scope: commercial-relation evidences and verifications;
-- presence sources/evidences/verifications; editorial content; Organizations;
-- Storage files; archived documents; free-form relation notes; root
-- verification_status; counterpart fields; relation_nature; auth users;
-- reviewers; audit; demo seed; policies; URL/file/hash fields.
-- Depends on M4.1 public.international_commercial_relations.
-- Does not alter M1.*, M2.*, M3.*, M4.*, or M5.1–M5.3 tables.
--
-- Fonte ≠ Evidenza ≠ Verifica. A source records provenance only; it does
-- not carry concrete proof, verification outcome, commercial volumes, or
-- publishability.

create table public.international_commercial_relation_sources (
  id uuid not null default gen_random_uuid (),
  commercial_relation_id uuid not null,
  source_kind text not null,
  reliability_note text null,
  reference_label text null,
  declared_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint icrs_pkey primary key (id),
  constraint icrs_commercial_relation_id_fkey foreign key (commercial_relation_id)
    references public.international_commercial_relations (id)
    on delete cascade,
  constraint icrs_source_kind_check check (
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

comment on table public.international_commercial_relation_sources is
  'Informative sources (V03) documenting the provenance of information for a specific international commercial relation. Owned by international_commercial_relations; deleted with the relation (ON DELETE CASCADE). Not an Evidence and not a Verification: does not assert concrete proof, verification outcome, reliability score, or publishability.';

comment on column public.international_commercial_relation_sources.id is
  'Local technical identity of this source row. Not a public catalog code.';

comment on column public.international_commercial_relation_sources.commercial_relation_id is
  'Owning international commercial relation (public.international_commercial_relations). Required. Owned composition; ON DELETE CASCADE.';

comment on column public.international_commercial_relation_sources.source_kind is
  'Controlled typology of the informative source: business_declaration, person_declaration, commercial_documentation, public_source, institutional_body, association, verified_partner, editorial, informative_import. Required classification of provenance. Does not imply an Organization FK, Appartenenza, editorial Content, partner account, contract number, or verification outcome.';

comment on column public.international_commercial_relation_sources.reliability_note is
  'Optional qualitative reliability note for this source. Free text only; not a numeric score, enum, confidence level, or verification status.';

comment on column public.international_commercial_relation_sources.reference_label is
  'Optional descriptive reference to the source material. Free-text citation label; not a URL field, structured contract or invoice identifier, Content title, Organization name, or natural key.';

comment on column public.international_commercial_relation_sources.declared_at is
  'Optional timestamp referring to when the source information was declared or stated. Distinct from created_at/updated_at and from the commercial relation period (started_at/ended_at). Not observed_at, verified_at, or published_at.';

comment on column public.international_commercial_relation_sources.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_commercial_relation_sources.updated_at is
  'Last update timestamp. Maintained by set_international_commercial_relation_sources_updated_at.';

alter table public.international_commercial_relation_sources enable row level security;

revoke all on table public.international_commercial_relation_sources
from anon, authenticated;

create or replace function public.set_international_commercial_relation_sources_updated_at ()
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

comment on function public.set_international_commercial_relation_sources_updated_at () is
  'BEFORE UPDATE trigger function for public.international_commercial_relation_sources. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not modify other columns.';

create trigger international_commercial_relation_sources_set_updated_at
before update on public.international_commercial_relation_sources
for each row
execute function public.set_international_commercial_relation_sources_updated_at ();
