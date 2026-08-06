-- M3.1 — create observatory indicator values
-- Implements ValoreIndicatore of Osservatorio:
--   public.observatory_indicator_values
-- (docs/architecture/migrations/osservatorio-migration-plan.md §15 M3.1;
--  docs/architecture/physical/domain-mapping/osservatorio.md §10–§18;
--  docs/architecture/logical/osservatorio.md §15.A–§15.D).
--
-- Scope of this unit only: aggregated numeric values subordinate to an indicator,
-- mandatory statistical source, structured period, status/quality, optional
-- territory/sector/country dimensions, current logical UNIQUE NULLS NOT DISTINCT
-- where status <> 'withdrawn', supersedes self-FK RESTRICT, indexes, updated_at,
-- RLS, REVOKE.
-- Explicitly out of scope: microdata; profiles/businesses/organizations/contents FK;
-- series/dashboard tables; catalogs/seed; JSON; threshold-5 CHECK; count/percentage
-- numeric CHECKs; cross-table periodicity triggers; auto-withdraw triggers;
-- CASCADE on historical values; policies; GRANT.

create table public.observatory_indicator_values (
  id uuid not null default gen_random_uuid (),
  indicator_id uuid not null,
  source_id uuid not null,
  numeric_value numeric(24, 8) not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'provisional',
  quality_code text not null,
  territory_level text null,
  territory_code text null,
  territory_label text null,
  business_sector_id bigint null,
  country_code text null,
  country_label text null,
  methodology_note text null,
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  revised_at timestamptz null,
  supersedes_value_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint observatory_indicator_values_pkey primary key (id),
  constraint observatory_indicator_values_indicator_id_fkey
    foreign key (indicator_id)
    references public.observatory_indicators (id)
    on update no action
    on delete restrict,
  constraint observatory_indicator_values_source_id_fkey
    foreign key (source_id)
    references public.observatory_statistical_sources (id)
    on update no action
    on delete restrict,
  constraint observatory_indicator_values_business_sector_id_fkey
    foreign key (business_sector_id)
    references public.business_sectors (id)
    on update no action
    on delete restrict,
  constraint observatory_indicator_values_supersedes_value_id_fkey
    foreign key (supersedes_value_id)
    references public.observatory_indicator_values (id)
    on update no action
    on delete restrict,
  constraint observatory_indicator_values_period_order_check
    check (period_end >= period_start),
  constraint observatory_indicator_values_status_check
    check (
      status = any (
        array[
          'provisional'::text,
          'final'::text,
          'revised'::text,
          'withdrawn'::text
        ]
      )
    ),
  constraint observatory_indicator_values_quality_code_check
    check (
      quality_code = any (
        array[
          'official'::text,
          'estimated'::text,
          'derived'::text,
          'self_reported'::text
        ]
      )
    ),
  constraint observatory_indicator_values_status_gates_check
    check (
      (
        (status <> 'withdrawn' and withdrawn_at is null)
        or (status = 'withdrawn' and withdrawn_at is not null)
      )
      and (
        (status <> 'revised' and revised_at is null)
        or (status = 'revised' and revised_at is not null)
      )
    ),
  constraint observatory_indicator_values_territory_level_check
    check (
      territory_level is null
      or territory_level = any (
        array[
          'italy'::text,
          'region'::text,
          'province'::text,
          'municipality'::text,
          'other'::text
        ]
      )
    ),
  constraint observatory_indicator_values_territory_coherence_check
    check (
      (
        territory_level is null
        and territory_code is null
        and territory_label is null
      )
      or (
        territory_level is not null
        and territory_label is not null
        and length(btrim(territory_label)) > 0
        and (
          territory_code is null
          or length(btrim(territory_code)) > 0
        )
      )
    ),
  constraint observatory_indicator_values_country_coherence_check
    check (
      (country_code is null and country_label is null)
      or (
        country_label is not null
        and length(btrim(country_label)) > 0
        and (
          country_code is null
          or length(btrim(country_code)) > 0
        )
      )
    ),
  constraint observatory_indicator_values_methodology_note_blank_check
    check (methodology_note is null or length(btrim(methodology_note)) > 0),
  constraint observatory_indicator_values_supersedes_not_self_check
    check (
      supersedes_value_id is null
      or supersedes_value_id <> id
    )
);

comment on table public.observatory_indicator_values is
  'Owned aggregated numeric values of Osservatorio ciclo 1. Subordinate to observatory_indicators; each row requires a statistical source. Aggregate statistics only — no microdata, no Persona/Impresa individual FK, no subject lists. Series/dashboards/trends are derived, not persisted. Editorial threshold of 5 for subject-derived counts is application-level (no universal CHECK). ON DELETE RESTRICT preserves historical published values.';

comment on column public.observatory_indicator_values.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.observatory_indicator_values.indicator_id is
  'Owning indicator (Aggregate Root). ON DELETE RESTRICT — dismiss indicators via lifecycle, not DELETE.';

comment on column public.observatory_indicator_values.source_id is
  'Mandatory statistical source. ON DELETE RESTRICT. Source is domain-owned and shareable.';

comment on column public.observatory_indicator_values.numeric_value is
  'Aggregated numeric value as numeric(24,8). Nature/unit live on the indicator. No universal non-negativity, integer-count, percentage-range, or threshold-5 CHECK.';

comment on column public.observatory_indicator_values.period_start is
  'Inclusive start of the reference period. NOT NULL. Coherence with indicator periodicity is application-level.';

comment on column public.observatory_indicator_values.period_end is
  'Inclusive end of the reference period. NOT NULL. Must be >= period_start.';

comment on column public.observatory_indicator_values.status is
  'Value status: provisional | final | revised | withdrawn. Default provisional. Distinct from quality_code.';

comment on column public.observatory_indicator_values.quality_code is
  'Value quality: official | estimated | derived | self_reported. NOT NULL; no default — must be chosen explicitly. Distinct from status and source.';

comment on column public.observatory_indicator_values.territory_level is
  'Optional territory level: italy | region | province | municipality | other. No ISTAT/NUTS catalog FK.';

comment on column public.observatory_indicator_values.territory_code is
  'Optional opaque territory code. Blank-guarded when present.';

comment on column public.observatory_indicator_values.territory_label is
  'Territory label required when territory dimension is present. Blank-guarded.';

comment on column public.observatory_indicator_values.business_sector_id is
  'Optional reference to public.business_sectors (bigint). ON DELETE RESTRICT. No sector name snapshot.';

comment on column public.observatory_indicator_values.country_code is
  'Optional opaque country code for statistical nationality/country dimension. Not a personal nationality; no countries catalog FK.';

comment on column public.observatory_indicator_values.country_label is
  'Country label required when country dimension is present. Blank-guarded.';

comment on column public.observatory_indicator_values.methodology_note is
  'Optional synthetic methodological note on the value. Blank-guarded when present. Not narrative Content.';

comment on column public.observatory_indicator_values.published_at is
  'NULL = not published; set when the value is published. May remain after withdrawal for historical trace.';

comment on column public.observatory_indicator_values.withdrawn_at is
  'Required when status = withdrawn. Withdrawal preserves the row.';

comment on column public.observatory_indicator_values.revised_at is
  'Required when status = revised.';

comment on column public.observatory_indicator_values.supersedes_value_id is
  'Optional self-FK to the superseded prior value. ON DELETE RESTRICT. Anti-self CHECK. At most one successor (partial UNIQUE). Prior value withdrawal is application-level; no auto-withdraw trigger.';

comment on column public.observatory_indicator_values.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.observatory_indicator_values.updated_at is
  'Last update timestamp. Maintained by observatory_indicator_values_set_updated_at.';

create unique index observatory_indicator_values_current_logical_uidx
  on public.observatory_indicator_values (
    indicator_id,
    period_start,
    period_end,
    territory_level,
    territory_code,
    territory_label,
    business_sector_id,
    country_code,
    country_label
  )
  nulls not distinct
  where status <> 'withdrawn';

create unique index observatory_indicator_values_supersedes_uidx
  on public.observatory_indicator_values (supersedes_value_id)
  where supersedes_value_id is not null;

create index observatory_indicator_values_indicator_id_idx
  on public.observatory_indicator_values (indicator_id);

create index observatory_indicator_values_source_id_idx
  on public.observatory_indicator_values (source_id);

create index observatory_indicator_values_period_idx
  on public.observatory_indicator_values (period_start, period_end);

create index observatory_indicator_values_status_idx
  on public.observatory_indicator_values (status);

create index observatory_indicator_values_quality_code_idx
  on public.observatory_indicator_values (quality_code);

create index observatory_indicator_values_territory_level_idx
  on public.observatory_indicator_values (territory_level);

create index observatory_indicator_values_business_sector_id_idx
  on public.observatory_indicator_values (business_sector_id)
  where business_sector_id is not null;

create index observatory_indicator_values_country_code_idx
  on public.observatory_indicator_values (country_code)
  where country_code is not null;

-- supersedes_value_id lookup covered by observatory_indicator_values_supersedes_uidx

alter table public.observatory_indicator_values enable row level security;

revoke all on table public.observatory_indicator_values from public;
revoke all on table public.observatory_indicator_values from anon, authenticated;

create or replace function public.set_observatory_indicator_values_updated_at ()
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

comment on function public.set_observatory_indicator_values_updated_at () is
  'BEFORE UPDATE trigger function for public.observatory_indicator_values. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables. No cross-domain sync. No automatic revision/withdraw chain.';

create trigger observatory_indicator_values_set_updated_at
before update on public.observatory_indicator_values
for each row
execute function public.set_observatory_indicator_values_updated_at ();
