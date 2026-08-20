-- D1-D.5 E5.2 — Eventi external identity + provenance columns
-- Additive columns on public.events for future metadata/link acquisition.
-- Dedupe indexes (editorial rows only). No allowlist seed. No import. No RLS here.

alter table public.events
  add column source_url text null,
  add column source_label text null,
  add column external_source_code text null,
  add column external_id text null,
  add column canonical_url text null,
  add column external_natural_key text null,
  add column acquisition_fingerprint text null,
  add column acquired_at timestamptz null,
  add column source_updated_at timestamptz null,
  add column editorial_internal_notes text null;

alter table public.events
  add constraint events_source_url_check check (
    source_url is null
    or length(btrim(source_url)) > 0
  ),
  add constraint events_source_label_check check (
    source_label is null
    or length(btrim(source_label)) > 0
  ),
  add constraint events_external_source_code_check check (
    external_source_code is null
    or length(btrim(external_source_code)) > 0
  ),
  add constraint events_external_id_check check (
    external_id is null
    or length(btrim(external_id)) > 0
  ),
  add constraint events_canonical_url_check check (
    canonical_url is null
    or length(btrim(canonical_url)) > 0
  ),
  add constraint events_external_natural_key_check check (
    external_natural_key is null
    or length(btrim(external_natural_key)) > 0
  ),
  add constraint events_acquisition_fingerprint_check check (
    acquisition_fingerprint is null
    or length(btrim(acquisition_fingerprint)) > 0
  ),
  add constraint events_editorial_internal_notes_check check (
    editorial_internal_notes is null
    or length(btrim(editorial_internal_notes)) > 0
  );

comment on column public.events.source_url is
  'D1-D.5: official/source HTTPS URL for the event page (metadata/link only). Not a full-body store.';

comment on column public.events.source_label is
  'D1-D.5: human attribution label complementary to source_url / external_source_code.';

comment on column public.events.external_source_code is
  'D1-D.5: allowlisted source code for acquired events (future pilot). Null for manually curated Redazione or user-owned events.';

comment on column public.events.external_id is
  'D1-D.5: stable identifier from the source system when available. Dedupe precedence tier 1 with external_source_code.';

comment on column public.events.canonical_url is
  'D1-D.5: normalized canonical URL used for dedupe tier 2 when external_id is absent.';

comment on column public.events.external_natural_key is
  'D1-D.5: deterministic natural key ({source}:id:… | {source}:url:… | {source}:fp:…). Unique among editorial rows when set.';

comment on column public.events.acquisition_fingerprint is
  'D1-D.5: deterministic SHA-256 fingerprint of acquisition-significant fields. Dedupe tier 3.';

comment on column public.events.acquired_at is
  'D1-D.5: platform acquisition instant. Distinct from published_at and edition starts_at.';

comment on column public.events.source_updated_at is
  'D1-D.5: last update instant declared by the source when known. Not platform published_at.';

comment on column public.events.editorial_internal_notes is
  'D1-D.5: internal Redazione notes. Never exposed on public routes or anon SELECT projections.';

-- Dedupe uniqueness (editorial / acquired rows only)
create unique index events_editorial_source_external_id_uidx
  on public.events (external_source_code, external_id)
  where owned_by_editorial = true
    and external_id is not null;

create unique index events_editorial_canonical_url_uidx
  on public.events (canonical_url)
  where owned_by_editorial = true
    and canonical_url is not null;

create unique index events_editorial_acquisition_fingerprint_uidx
  on public.events (acquisition_fingerprint)
  where owned_by_editorial = true
    and acquisition_fingerprint is not null;

create unique index events_editorial_natural_key_uidx
  on public.events (external_natural_key)
  where owned_by_editorial = true
    and external_natural_key is not null;

comment on index public.events_editorial_source_external_id_uidx is
  'D1-D.5: at most one editorial Evento per (external_source_code, external_id).';

comment on index public.events_editorial_canonical_url_uidx is
  'D1-D.5: at most one editorial Evento per canonical_url.';

comment on index public.events_editorial_acquisition_fingerprint_uidx is
  'D1-D.5: at most one editorial Evento per acquisition_fingerprint.';

comment on index public.events_editorial_natural_key_uidx is
  'D1-D.5: at most one editorial Evento per external_natural_key.';
