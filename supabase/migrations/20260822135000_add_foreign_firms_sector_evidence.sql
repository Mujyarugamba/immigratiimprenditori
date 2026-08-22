-- Sector evidence from Futurae / InfoCamere / Unioncamere, Fig. 8,
-- data at 30 June 2025. We import only source ATECO sections that have a
-- direct, non-ambiguous correspondence with the canonical business-sector
-- taxonomy already used by the Centro Studi.

insert into public.observatory_indicators (
  id,
  code,
  slug,
  title,
  description,
  purpose_text,
  methodology_summary,
  value_nature,
  unit_code,
  periodicity,
  operational_status,
  publication_status,
  published_at
)
values (
  gen_random_uuid(),
  'OBS-IT-FOR-FIRM-SECTOR-DIRECT',
  'imprese-straniere-settori-corrispondenza-diretta',
  'Imprese straniere registrate per settore — corrispondenza diretta',
  'Numero di imprese straniere registrate in Italia al 30 giugno 2025 per i settori della tassonomia del Centro Studi che corrispondono direttamente a una sezione ATECO pubblicata dalla fonte.',
  'Consentire una lettura settoriale dell’imprenditoria straniera senza forzare aggregazioni tra classificazioni non equivalenti.',
  'Fonte Futurae / InfoCamere / Unioncamere, Fig. 8 del report I semestre 2025. Sono importate soltanto le sezioni ATECO con corrispondenza univoca alla tassonomia del Centro Studi: A agricoltura, C manifattura, F costruzioni, G commercio, H trasporto e magazzinaggio, I alloggio e ristorazione. Le altre sezioni della figura originale restano nella fonte e non vengono rimappate arbitrariamente.',
  'count',
  'units',
  'point_in_time',
  'active',
  'published',
  now()
)
on conflict (code) do update
set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  purpose_text = excluded.purpose_text,
  methodology_summary = excluded.methodology_summary,
  value_nature = excluded.value_nature,
  unit_code = excluded.unit_code,
  periodicity = excluded.periodicity,
  operational_status = excluded.operational_status,
  publication_status = excluded.publication_status,
  published_at = coalesce(public.observatory_indicators.published_at, excluded.published_at),
  withdrawn_at = null,
  updated_at = now();

with target as (
  select
    i.id as indicator_id,
    s.id as source_id
  from public.observatory_indicators i
  join public.observatory_statistical_sources s
    on s.external_identifier = 'mlps:futurae:imprenditoria-straniera:2025h1'
  where i.code = 'OBS-IT-FOR-FIRM-SECTOR-DIRECT'
), seed(sector_slug, numeric_value, source_section) as (
  values
    ('agriculture', 21623::numeric, 'A - Agricoltura, silvicoltura e pesca'),
    ('manufacturing', 49811::numeric, 'C - Attività manifatturiere'),
    ('construction', 170057::numeric, 'F - Costruzioni'),
    ('commerce', 198888::numeric, 'G - Commercio all’ingrosso e al dettaglio; riparazione di autoveicoli e motocicli'),
    ('transport', 16900::numeric, 'H - Trasporto e magazzinaggio'),
    ('food_service', 59926::numeric, 'I - Attività dei servizi di alloggio e ristorazione')
), resolved as (
  select
    target.indicator_id,
    target.source_id,
    bs.id as business_sector_id,
    bs.name as business_sector_name,
    seed.numeric_value,
    seed.source_section
  from target
  cross join seed
  join public.business_sectors bs on bs.slug = seed.sector_slug
)
insert into public.observatory_indicator_values (
  id,
  indicator_id,
  source_id,
  numeric_value,
  period_start,
  period_end,
  status,
  quality_code,
  territory_level,
  territory_code,
  territory_label,
  business_sector_id,
  country_code,
  country_label,
  methodology_note,
  published_at
)
select
  gen_random_uuid(),
  resolved.indicator_id,
  resolved.source_id,
  resolved.numeric_value,
  date '2025-06-30',
  date '2025-06-30',
  'final',
  'official',
  'italy',
  'IT',
  'Italia',
  resolved.business_sector_id,
  null,
  null,
  'Futurae / InfoCamere / Unioncamere, Fig. 8, 30 giugno 2025. ' || resolved.source_section || '. Corrispondenza diretta con il settore canonico ' || resolved.business_sector_name || '; nessuna aggregazione inferita.',
  now()
from resolved
where not exists (
  select 1
  from public.observatory_indicator_values existing
  where existing.indicator_id = resolved.indicator_id
    and existing.source_id = resolved.source_id
    and existing.period_start = date '2025-06-30'
    and existing.period_end = date '2025-06-30'
    and existing.territory_code = 'IT'
    and existing.business_sector_id = resolved.business_sector_id
    and existing.status = 'final'
    and existing.withdrawn_at is null
);
