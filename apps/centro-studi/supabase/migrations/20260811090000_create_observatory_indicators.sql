-- M1.1 — create observatory indicators
-- Implements Aggregate Root Indicatore of Osservatorio:
--   public.observatory_indicators
-- (docs/architecture/migrations/osservatorio-migration-plan.md §13 M1.1;
--  docs/architecture/physical/domain-mapping/osservatorio.md §7–§8, §15–§18;
--  docs/architecture/logical/osservatorio.md §15.A–§15.D).
--
-- Scope of this unit only: indicator AR, stable code/slug, definition texts,
-- closed value_nature/unit_code with exhaustive coherence, periodicity,
-- operational + publication lifecycle with temporal gates, indexes, updated_at,
-- RLS, REVOKE.
-- Explicitly out of scope: statistical sources; indicator values; series table;
-- datasets; catalogs/seed; organizations/contents/profiles/businesses FK;
-- account/auth.users owner; policies; GRANT; JSON/metadata; Storage; M2–M3.

create table public.observatory_indicators (
  id uuid not null default gen_random_uuid (),
  code text not null,
  slug text not null,
  title text not null,
  description text not null,
  purpose_text text not null,
  methodology_summary text not null,
  value_nature text not null,
  unit_code text not null,
  periodicity text not null,
  operational_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint observatory_indicators_pkey primary key (id),
  constraint observatory_indicators_code_key unique (code),
  constraint observatory_indicators_slug_key unique (slug),
  constraint observatory_indicators_code_not_blank_check
    check (length(btrim(code)) > 0),
  constraint observatory_indicators_slug_not_blank_check
    check (length(btrim(slug)) > 0),
  constraint observatory_indicators_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint observatory_indicators_title_not_blank_check
    check (length(btrim(title)) > 0),
  constraint observatory_indicators_description_not_blank_check
    check (length(btrim(description)) > 0),
  constraint observatory_indicators_purpose_text_not_blank_check
    check (length(btrim(purpose_text)) > 0),
  constraint observatory_indicators_methodology_summary_not_blank_check
    check (length(btrim(methodology_summary)) > 0),
  constraint observatory_indicators_value_nature_check
    check (
      value_nature = any (
        array[
          'count'::text,
          'percentage'::text,
          'currency'::text,
          'ratio'::text,
          'index'::text
        ]
      )
    ),
  constraint observatory_indicators_unit_code_check
    check (
      unit_code = any (
        array[
          'units'::text,
          'percent'::text,
          'eur'::text,
          'eur_thousands'::text,
          'ratio'::text,
          'index_points'::text
        ]
      )
    ),
  constraint observatory_indicators_nature_unit_coherence_check
    check (
      (value_nature = 'count' and unit_code = 'units')
      or (value_nature = 'percentage' and unit_code = 'percent')
      or (
        value_nature = 'currency'
        and unit_code = any (array['eur'::text, 'eur_thousands'::text])
      )
      or (value_nature = 'ratio' and unit_code = 'ratio')
      or (value_nature = 'index' and unit_code = 'index_points')
    ),
  constraint observatory_indicators_periodicity_check
    check (
      periodicity = any (
        array[
          'annual'::text,
          'quarterly'::text,
          'monthly'::text,
          'point_in_time'::text
        ]
      )
    ),
  constraint observatory_indicators_operational_status_check
    check (
      operational_status = any (
        array[
          'draft'::text,
          'active'::text,
          'deprecated'::text,
          'retired'::text
        ]
      )
    ),
  constraint observatory_indicators_publication_status_check
    check (
      publication_status = any (
        array[
          'unpublished'::text,
          'published'::text,
          'withdrawn'::text
        ]
      )
    ),
  constraint observatory_indicators_publication_gates_check
    check (
      (
        publication_status = 'unpublished'
        and published_at is null
        and withdrawn_at is null
      )
      or (
        publication_status = 'published'
        and published_at is not null
        and withdrawn_at is null
      )
      or (
        publication_status = 'withdrawn'
        and withdrawn_at is not null
      )
    ),
  constraint observatory_indicators_operational_publication_check
    check (
      not (
        publication_status = 'published'
        and operational_status = 'draft'
      )
    )
);

comment on table public.observatory_indicators is
  'Aggregate Root of Osservatorio ciclo 1: statistical indicator definition (methodology summary, value nature, unit, periodicity, operational and publication lifecycle). Editorial ownership is implicit in the domain: no Persona/Impresa/Organization/Account/auth.users owner columns. Not a value, source, series table, dataset, dashboard, or editorial Content. Historical values are conserved when the indicator is deprecated/retired; dismissal is via lifecycle, not DELETE.';

comment on column public.observatory_indicators.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Autonomous identity; not derived from values or sources.';

comment on column public.observatory_indicators.code is
  'Stable technical code, unique. Immutable after first publication (application invariant). Blank-guarded.';

comment on column public.observatory_indicators.slug is
  'Public lookup slug, unique. Pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$. Blank-guarded.';

comment on column public.observatory_indicators.title is
  'Human-readable indicator title. Blank-guarded.';

comment on column public.observatory_indicators.description is
  'Indicator description. Blank-guarded.';

comment on column public.observatory_indicators.purpose_text is
  'Synthetic purpose of the indicator. Blank-guarded.';

comment on column public.observatory_indicators.methodology_summary is
  'Synthetic methodology text on the indicator. Blank-guarded. Not a versioned methodology AR.';

comment on column public.observatory_indicators.value_nature is
  'Closed value nature: count | percentage | currency | ratio | index. Must cohere with unit_code.';

comment on column public.observatory_indicators.unit_code is
  'Closed unit: units | percent | eur | eur_thousands | ratio | index_points. Defined on the indicator, not freely on values.';

comment on column public.observatory_indicators.periodicity is
  'Closed periodicity: annual | quarterly | monthly | point_in_time. Value period coherence is application-level.';

comment on column public.observatory_indicators.operational_status is
  'Operational lifecycle: draft | active | deprecated | retired. Default draft. Dismissal does not delete values.';

comment on column public.observatory_indicators.publication_status is
  'Publication axis: unpublished | published | withdrawn. Default unpublished. Distinct from operational_status.';

comment on column public.observatory_indicators.published_at is
  'Set when publication_status = published; must be null when unpublished.';

comment on column public.observatory_indicators.withdrawn_at is
  'Set when publication_status = withdrawn.';

comment on column public.observatory_indicators.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.observatory_indicators.updated_at is
  'Last update timestamp. Maintained by observatory_indicators_set_updated_at.';

create index observatory_indicators_operational_status_idx
  on public.observatory_indicators (operational_status);

create index observatory_indicators_publication_status_idx
  on public.observatory_indicators (publication_status);

create index observatory_indicators_value_nature_idx
  on public.observatory_indicators (value_nature);

create index observatory_indicators_periodicity_idx
  on public.observatory_indicators (periodicity);

create index observatory_indicators_published_listing_idx
  on public.observatory_indicators (publication_status, operational_status)
  where publication_status = 'published';

alter table public.observatory_indicators enable row level security;

revoke all on table public.observatory_indicators from public;
revoke all on table public.observatory_indicators from anon, authenticated;

create or replace function public.set_observatory_indicators_updated_at ()
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

comment on function public.set_observatory_indicators_updated_at () is
  'BEFORE UPDATE trigger function for public.observatory_indicators. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables. No cross-domain sync.';

create trigger observatory_indicators_set_updated_at
before update on public.observatory_indicators
for each row
execute function public.set_observatory_indicators_updated_at ();
