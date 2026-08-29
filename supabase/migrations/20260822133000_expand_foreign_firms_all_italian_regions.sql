-- Expand OBS-IT-FOR-FIRM-REG with all 20 regional values published in
-- Futurae / InfoCamere / Unioncamere, Fig. 9, data at 30 June 2025.
--
-- Important data-quality note: the 20 regional values published in Fig. 9 sum
-- to 678,000, while the same report states a national total of 678,004.
-- We preserve the primary-source regional values exactly and do not fabricate
-- a four-unit reconciliation.

with target as (
  select
    i.id as indicator_id,
    s.id as source_id
  from public.observatory_indicators i
  join public.observatory_statistical_sources s
    on s.external_identifier = 'mlps:futurae:imprenditoria-straniera:2025h1'
  where i.code = 'OBS-IT-FOR-FIRM-REG'
), seed(territory_code, territory_label, numeric_value) as (
  values
    ('IT-65', 'Abruzzo', 14987::numeric),
    ('IT-77', 'Basilicata', 2475::numeric),
    ('IT-78', 'Calabria', 14609::numeric),
    ('IT-72', 'Campania', 52195::numeric),
    ('IT-45', 'Emilia-Romagna', 61899::numeric),
    ('IT-36', 'Friuli-Venezia Giulia', 14377::numeric),
    ('IT-62', 'Lazio', 78574::numeric),
    ('IT-42', 'Liguria', 26926::numeric),
    ('IT-25', 'Lombardia', 135249::numeric),
    ('IT-57', 'Marche', 13479::numeric),
    ('IT-67', 'Molise', 2308::numeric),
    ('IT-21', 'Piemonte', 55001::numeric),
    ('IT-75', 'Puglia', 22257::numeric),
    ('IT-88', 'Sardegna', 10675::numeric),
    ('IT-82', 'Sicilia', 29287::numeric),
    ('IT-52', 'Toscana', 65718::numeric),
    ('IT-32', 'Trentino-Alto Adige/Südtirol', 10304::numeric),
    ('IT-55', 'Umbria', 10008::numeric),
    ('IT-23', 'Valle d''Aosta/Vallée d''Aoste', 888::numeric),
    ('IT-34', 'Veneto', 56784::numeric)
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
  date '2025-06-30',
  date '2025-06-30',
  'final',
  'official',
  'region',
  seed.territory_code,
  seed.territory_label,
  null,
  null,
  null,
  'Dato regionale della Fig. 9 del report InfoCamere/Futurae al 30 giugno 2025. Imprese registrate classificate come straniere. I 20 valori regionali pubblicati sommano a 678.000, mentre il totale nazionale del report è 678.004; i valori regionali sono conservati senza riconciliazione arbitraria.',
  now()
from target
cross join seed
where not exists (
  select 1
  from public.observatory_indicator_values existing
  where existing.indicator_id = target.indicator_id
    and existing.source_id = target.source_id
    and existing.period_start = date '2025-06-30'
    and existing.period_end = date '2025-06-30'
    and existing.territory_code = seed.territory_code
    and existing.status = 'final'
    and existing.withdrawn_at is null
);
