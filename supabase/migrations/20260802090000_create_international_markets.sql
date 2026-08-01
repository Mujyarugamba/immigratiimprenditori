-- M2.1 — create international markets
-- Implements the Aggregate Root of governance for Mercati Internazionali:
--   public.international_markets
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M2.1;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.4;
--  docs/architecture/logical/mercati-internazionali.md §1–§3).
--
-- Scope of this unit only: market identity, kind, substantial/editorial axes,
-- descriptive notes, timestamps, RLS defense, updated_at trigger.
-- Explicitly out of scope: market countries (M2.2), support resources (M2.3),
-- presences, interests, activities, commercial relations, need instances,
-- sources, evidences, verifications, FK to other domains, demo/normative seed.
-- Does not alter M1.1–M1.3. Stop point before M2.2.

create table public.international_markets (
  id uuid not null default gen_random_uuid (),
  code text not null,
  name text not null,
  summary text null,
  description text null,
  market_kind text not null,
  substantial_status text not null default 'proposed',
  editorial_status text not null default 'drafting',
  geographic_note text null,
  economic_area_note text null,
  linguistic_area_note text null,
  commercial_area_note text null,
  cultural_area_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inm_pkey primary key (id),
  constraint inm_code_unique unique (code),
  constraint inm_code_not_blank_check check (length(btrim(code)) > 0),
  constraint inm_name_not_blank_check check (length(btrim(name)) > 0),
  constraint inm_market_kind_check check (
    market_kind in (
      'country',
      'country_group',
      'transnational_region',
      'economic_union',
      'linguistic_area',
      'commercial_area',
      'economic_corridor',
      'sectoral_international'
    )
  ),
  constraint inm_substantial_status_check check (
    substantial_status in (
      'proposed',
      'active',
      'featured',
      'maintenance',
      'unmonitored'
    )
  ),
  constraint inm_editorial_status_check check (
    editorial_status in (
      'drafting',
      'published',
      'in_review',
      'needs_update'
    )
  ),
  constraint inm_summary_not_blank_check check (
    summary is null
    or length(btrim(summary)) > 0
  ),
  constraint inm_description_not_blank_check check (
    description is null
    or length(btrim(description)) > 0
  ),
  constraint inm_geographic_note_not_blank_check check (
    geographic_note is null
    or length(btrim(geographic_note)) > 0
  ),
  constraint inm_economic_area_note_not_blank_check check (
    economic_area_note is null
    or length(btrim(economic_area_note)) > 0
  ),
  constraint inm_linguistic_area_note_not_blank_check check (
    linguistic_area_note is null
    or length(btrim(linguistic_area_note)) > 0
  ),
  constraint inm_commercial_area_note_not_blank_check check (
    commercial_area_note is null
    or length(btrim(commercial_area_note)) > 0
  ),
  constraint inm_cultural_area_note_not_blank_check check (
    cultural_area_note is null
    or length(btrim(cultural_area_note)) > 0
  )
);

comment on table public.international_markets is
  'Aggregate Root of governance (A01/E03) for Mercati Internazionali: a platform market as an economic-meaning construct, not a country catalog and not a subject relation. Distinct from Presence, Interest, Activity, commercial relation, need instance, support resource, source, evidence, and verification (later units). No seed in M2.1. Owned by Mercati Internazionali.';

comment on column public.international_markets.id is
  'Stable internal identity of the Market. Independent of code, name, composition, and of any declaring Persona or Impresa. Referenced by later owned tables.';

comment on column public.international_markets.code is
  'Stable technical identifier of the Market, unique within the catalog. Not a localized display name. Not a country code by itself.';

comment on column public.international_markets.name is
  'Human-facing name of the Market. Descriptive identity label; not uniqueness of meaning beyond the unique code.';

comment on column public.international_markets.summary is
  'Optional short presentation of the Market. Nullable; when present must be non-blank. Not a Presence or Interest statement.';

comment on column public.international_markets.description is
  'Optional extended presentation of the Market. Nullable; when present must be non-blank. Not editorial content of another domain.';

comment on column public.international_markets.market_kind is
  'Closed vocabulary classifying the nature of the Market (Logical §3 / Physical §35.4): country, country_group, transnational_region, economic_union, linguistic_area, commercial_area, economic_corridor, sectoral_international.';

comment on column public.international_markets.substantial_status is
  'Substantial governance axis of the Market (distinct from editorial_status): proposed, active, featured, maintenance, unmonitored. Default proposed. Not publication S04 and not verification.';

comment on column public.international_markets.editorial_status is
  'Editorial governance axis of the Market (distinct from substantial_status): drafting, published, in_review, needs_update. Default drafting. published absorbs platform publication without a separate S04 axis (§35.4).';

comment on column public.international_markets.geographic_note is
  'Optional geographic dimension note of the Market construct. Nullable; when present must be non-blank. Not a Territori FK and not market_countries (M2.2).';

comment on column public.international_markets.economic_area_note is
  'Optional economic-area dimension note. Nullable; when present must be non-blank. Not an institutional organization entity.';

comment on column public.international_markets.linguistic_area_note is
  'Optional linguistic-area dimension note. Nullable; when present must be non-blank. Not a languages taxonomy ownership.';

comment on column public.international_markets.commercial_area_note is
  'Optional commercial-area / practice dimension note. Nullable; when present must be non-blank.';

comment on column public.international_markets.cultural_area_note is
  'Optional cultural / diaspora-affinity dimension note. Nullable; when present must be non-blank.';

comment on column public.international_markets.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_markets.updated_at is
  'Last update timestamp. Maintained by international_markets_set_updated_at.';

create index inm_substantial_status_idx
  on public.international_markets (substantial_status);

create index inm_editorial_status_idx
  on public.international_markets (editorial_status);

create index inm_market_kind_idx
  on public.international_markets (market_kind);

alter table public.international_markets enable row level security;

-- Defense in depth: no policies in M2.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.international_markets from anon, authenticated;

create or replace function public.set_international_markets_updated_at ()
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

comment on function public.set_international_markets_updated_at () is
  'BEFORE UPDATE trigger function for public.international_markets. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_markets_set_updated_at
before update on public.international_markets
for each row
execute function public.set_international_markets_updated_at ();
