-- M3.1 — create opportunity sources
-- Implements E02 Fonte of the Opportunità domain as an owned dependent
-- entity of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §14;
--  docs/architecture/physical/domain-mapping/opportunita.md §13, §29;
--  approved M3 architectural review + M3.1 micro-review).
--
-- Depends on: public.opportunities (M1.1).
--
-- Scope of this unit only: Fonte structure and local invariants.
-- Explicitly out of scope: Evidence (M3.2), source_types, reliability /
-- attendibilità, verification (M7), promoters, file storage, versioning
-- chains, publication policies, FK to languages, access-procedure links.
--
-- Fonte ≠ Promotore ≠ origin ≠ URL ≠ Documento ≠ Allegato ≠ Evidenza ≠ Verifica.
-- Soft deletion of opportunities (deleted_at) does not remove source rows;
-- physical delete of an opportunity cascades owned sources.

create table public.opportunity_sources (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  authority text,
  url text,
  external_identifier text,
  reference_text text,
  status text not null default 'active',
  is_primary boolean not null default false,
  information_relation text,
  language_code text,
  version text,
  consulted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_sources_authority_not_blank_check check (
    authority is null
    or length(trim(authority)) > 0
  ),
  constraint opportunity_sources_url_not_blank_check check (
    url is null
    or length(trim(url)) > 0
  ),
  constraint opportunity_sources_external_identifier_not_blank_check check (
    external_identifier is null
    or length(trim(external_identifier)) > 0
  ),
  constraint opportunity_sources_reference_text_not_blank_check check (
    reference_text is null
    or length(trim(reference_text)) > 0
  ),
  constraint opportunity_sources_status_check check (
    status in (
      'active',
      'replaced',
      'unreachable',
      'contradictory',
      'historical'
    )
  ),
  constraint opportunity_sources_information_relation_check check (
    information_relation is null
    or information_relation in ('primary', 'secondary')
  ),
  constraint opportunity_sources_language_code_not_blank_check check (
    language_code is null
    or length(trim(language_code)) > 0
  ),
  constraint opportunity_sources_version_not_blank_check check (
    version is null
    or length(trim(version)) > 0
  )
);

comment on table public.opportunity_sources is
  'E02 Fonte owned by an Opportunità: declared informative provenance of the sheet. Not Promoter, not opportunity.origin, not access-procedure link, not Document/Attachment storage, not Evidence, not Verification. One source belongs to exactly one opportunity; physical delete of the opportunity cascades.';

comment on column public.opportunity_sources.id is
  'Stable internal identity of the source row. Independent of URL, external identifier, or authority text.';

comment on column public.opportunity_sources.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_sources.authority is
  'Optional free-text declared authority of the source (e.g. institutional body name). Not a FK to Person/Enterprise/Promoter; does not assert verification.';

comment on column public.opportunity_sources.url is
  'Optional locator URL of the informative source. Not the operational access/candidature link (ProceduraAccesso). A source may exist without a URL.';

comment on column public.opportunity_sources.external_identifier is
  'Optional external identifier (call code, act number, protocol, publication extremes id). Does not replace the internal id.';

comment on column public.opportunity_sources.reference_text is
  'Optional free-text reference (extremes, page/section, textual citation) when URL alone is insufficient or absent.';

comment on column public.opportunity_sources.status is
  'Local Fonte lifecycle: active, replaced, unreachable, contradictory, historical. Not verification, not publication, not opportunity expiry. contradictory marks conflict; resolution belongs to M7.';

comment on column public.opportunity_sources.is_primary is
  'True when this is the principal source selected for this opportunity sheet. At most one true per opportunity_id (partial unique index). Distinct from information_relation. Not required at census.';

comment on column public.opportunity_sources.information_relation is
  'Optional relation of the source to the information: primary (originates from the promoter/official channel) or secondary (reports elsewhere). Distinct from is_primary. NULL when undeclared.';

comment on column public.opportunity_sources.language_code is
  'Optional textual language code of the source material. Not a FK to public.languages; not translation or editorial i18n.';

comment on column public.opportunity_sources.version is
  'Optional free-text version label of the source material. Not a versioning chain; replacement uses status = replaced plus a new source row.';

comment on column public.opportunity_sources.consulted_at is
  'Optional timestamp when the source was consulted. Distinct from created_at/updated_at and from opportunity publication dates.';

comment on column public.opportunity_sources.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_sources.updated_at is
  'Last update timestamp. Maintained by opportunity_sources_set_updated_at.';

-- Lookup of sources for a given opportunity.
create index opportunity_sources_opportunity_id_idx
  on public.opportunity_sources using btree (opportunity_id);

-- At most one principal source per opportunity.
create unique index opportunity_sources_single_primary_idx
  on public.opportunity_sources using btree (opportunity_id)
where
  is_primary = true;

alter table public.opportunity_sources enable row level security;

-- Defense in depth: no policies in M3.1. Publication/visibility of sources
-- follows the opportunity and belongs to later units (M7). With RLS enabled
-- and no policy, roles subject to RLS cannot read or write. service_role
-- and owner privileges are not revoked.
revoke all on table public.opportunity_sources from anon, authenticated;

create or replace function public.set_opportunity_sources_updated_at ()
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

create trigger opportunity_sources_set_updated_at
before update on public.opportunity_sources
for each row
execute function public.set_opportunity_sources_updated_at ();
