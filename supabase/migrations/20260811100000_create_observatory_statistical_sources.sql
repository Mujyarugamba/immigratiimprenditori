-- M2.1 — create observatory statistical sources
-- Implements FonteStatistica of Osservatorio:
--   public.observatory_statistical_sources
-- (docs/architecture/migrations/osservatorio-migration-plan.md §14 M2.1;
--  docs/architecture/physical/domain-mapping/osservatorio.md §9, §15–§18;
--  docs/architecture/logical/osservatorio.md §15.A–§15.D).
--
-- Scope of this unit only: domain-owned statistical provenance entity,
-- textual producer, optional URL/external id/edition/license/methodology note,
-- lifecycle active|deprecated|unavailable, partial unique external_identifier,
-- indexes, updated_at, RLS, REVOKE.
-- Explicitly out of scope: indicator values; organizations FK; documents;
-- files; Storage; datasets with rows; contents; catalogs/seed; policies; GRANT;
-- JSON/metadata; autonomous publication of the source; M1/M3 tables.

create table public.observatory_statistical_sources (
  id uuid not null default gen_random_uuid (),
  name text not null,
  producer_name text not null,
  publication_title text not null,
  url text null,
  external_identifier text null,
  edition_label text null,
  source_published_on date null,
  license_note text null,
  methodology_note text null,
  lifecycle_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint observatory_statistical_sources_pkey primary key (id),
  constraint observatory_statistical_sources_name_not_blank_check
    check (length(btrim(name)) > 0),
  constraint observatory_statistical_sources_producer_name_not_blank_check
    check (length(btrim(producer_name)) > 0),
  constraint observatory_statistical_sources_publication_title_not_blank_check
    check (length(btrim(publication_title)) > 0),
  constraint observatory_statistical_sources_url_blank_check
    check (url is null or length(btrim(url)) > 0),
  constraint observatory_statistical_sources_external_identifier_blank_check
    check (
      external_identifier is null
      or length(btrim(external_identifier)) > 0
    ),
  constraint observatory_statistical_sources_edition_label_blank_check
    check (edition_label is null or length(btrim(edition_label)) > 0),
  constraint observatory_statistical_sources_license_note_blank_check
    check (license_note is null or length(btrim(license_note)) > 0),
  constraint observatory_statistical_sources_methodology_note_blank_check
    check (methodology_note is null or length(btrim(methodology_note)) > 0),
  constraint observatory_statistical_sources_lifecycle_status_check
    check (
      lifecycle_status = any (
        array[
          'active'::text,
          'deprecated'::text,
          'unavailable'::text
        ]
      )
    )
);

comment on table public.observatory_statistical_sources is
  'Domain-owned statistical source (FonteStatistica) for Osservatorio ciclo 1. Provenance and traceability only — not an Organization, Document, Storage object, Content, or dataset with rows. Shareable across many indicator values. No FK to organizations. No autonomous publication axis.';

comment on column public.observatory_statistical_sources.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.observatory_statistical_sources.name is
  'Source denomination. Blank-guarded.';

comment on column public.observatory_statistical_sources.producer_name is
  'Producing institution as free text. Not an organizations FK and not a duplicated anagraphic record. Blank-guarded.';

comment on column public.observatory_statistical_sources.publication_title is
  'Title of the publication or survey. Blank-guarded.';

comment on column public.observatory_statistical_sources.url is
  'Optional opaque URL text. Blank-guarded when present. No mandatory http-scheme check.';

comment on column public.observatory_statistical_sources.external_identifier is
  'Optional external identifier. Unique when present (partial unique index). Blank-guarded when present.';

comment on column public.observatory_statistical_sources.edition_label is
  'Optional edition/version label. Blank-guarded when present.';

comment on column public.observatory_statistical_sources.source_published_on is
  'Optional publication date of the external source material.';

comment on column public.observatory_statistical_sources.license_note is
  'Optional license or reuse conditions. Blank-guarded when present.';

comment on column public.observatory_statistical_sources.methodology_note is
  'Optional synthetic methodological note. Blank-guarded when present.';

comment on column public.observatory_statistical_sources.lifecycle_status is
  'Source lifecycle: active | deprecated | unavailable. Default active. Not a public publication status.';

comment on column public.observatory_statistical_sources.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.observatory_statistical_sources.updated_at is
  'Last update timestamp. Maintained by observatory_statistical_sources_set_updated_at.';

create unique index observatory_statistical_sources_external_identifier_uidx
  on public.observatory_statistical_sources (external_identifier)
  where external_identifier is not null;

create index observatory_statistical_sources_lifecycle_status_idx
  on public.observatory_statistical_sources (lifecycle_status);

create index observatory_statistical_sources_producer_name_idx
  on public.observatory_statistical_sources (producer_name);

alter table public.observatory_statistical_sources enable row level security;

revoke all on table public.observatory_statistical_sources from public;
revoke all on table public.observatory_statistical_sources from anon, authenticated;

create or replace function public.set_observatory_statistical_sources_updated_at ()
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

comment on function public.set_observatory_statistical_sources_updated_at () is
  'BEFORE UPDATE trigger function for public.observatory_statistical_sources. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables. No cross-domain sync.';

create trigger observatory_statistical_sources_set_updated_at
before update on public.observatory_statistical_sources
for each row
execute function public.set_observatory_statistical_sources_updated_at ();
