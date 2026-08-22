-- Expand OBS-OECD-SELF-BIRTH-RATE with additional first-Atlas countries
-- directly supported by OECD International Migration Outlook 2024, Table 4.1.
-- Source: OECD, self-employment rate by place of birth, 2022.
-- Values are percentages of the employed population; FB = foreign-born,
-- NB = native-born. This is not a citizenship measure and not a firm count.

with target as (
  select
    i.id as indicator_id,
    s.id as source_id
  from public.observatory_indicators i
  join public.observatory_statistical_sources s
    on s.external_identifier = 'oecd:imo2024:table4.1'
  where i.code = 'OBS-OECD-SELF-BIRTH-RATE'
), seed(
  territory_code,
  territory_label,
  country_code,
  country_label,
  numeric_value,
  methodology_note
) as (
  values
    ('USA', 'Stati Uniti', 'FB', 'Nati all’estero', 12.3::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo foreign-born.'),
    ('USA', 'Stati Uniti', 'NB', 'Nati nel Paese', 8.2::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo native-born.'),
    ('CAN', 'Canada', 'FB', 'Nati all’estero', 13.9::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo foreign-born.'),
    ('CAN', 'Canada', 'NB', 'Nati nel Paese', 11.0::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo native-born.'),
    ('GBR', 'Regno Unito', 'FB', 'Nati all’estero', 13.8::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo foreign-born.'),
    ('GBR', 'Regno Unito', 'NB', 'Nati nel Paese', 11.6::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo native-born.'),
    ('BEL', 'Belgio', 'FB', 'Nati all’estero', 14.2::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo foreign-born.'),
    ('BEL', 'Belgio', 'NB', 'Nati nel Paese', 14.0::numeric, 'OECD Table 4.1, self-employment rate 2022; gruppo native-born.')
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
  target.indicator_id,
  target.source_id,
  seed.numeric_value,
  date '2022-01-01',
  date '2022-12-31',
  'final',
  'official',
  'other',
  seed.territory_code,
  seed.territory_label,
  null,
  seed.country_code,
  seed.country_label,
  seed.methodology_note,
  now()
from target
cross join seed
where not exists (
  select 1
  from public.observatory_indicator_values existing
  where existing.indicator_id = target.indicator_id
    and existing.source_id = target.source_id
    and existing.period_start = date '2022-01-01'
    and existing.period_end = date '2022-12-31'
    and existing.territory_code = seed.territory_code
    and existing.country_code = seed.country_code
    and existing.status = 'final'
    and existing.withdrawn_at is null
);
