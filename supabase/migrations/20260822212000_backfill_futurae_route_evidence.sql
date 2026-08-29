-- Cold-start compatibility for the official origin-country evidence already
-- encoded by 20260822134000_add_atlas_origin_business_communities.sql.
--
-- The standalone baseline intentionally carries only a minimal source snapshot.
-- On a fresh database the Futurae/InfoCamere/Unioncamere source row can therefore
-- be absent when the earlier Atlas migration runs: routes are created, but its
-- source-dependent indicator values are skipped. This additive migration restores
-- the provenance row and replays the exact 11 published values from that migration.
-- No new statistical values are introduced here.

begin;

insert into public.observatory_statistical_sources (
  id,
  name,
  producer_name,
  publication_title,
  external_identifier,
  edition_label,
  methodology_note,
  lifecycle_status
)
select
  gen_random_uuid(),
  'Futurae / InfoCamere / Unioncamere',
  'Futurae / InfoCamere / Unioncamere',
  'Report sull''imprenditoria straniera — I semestre 2025',
  'mlps:futurae:imprenditoria-straniera:2025h1',
  'I semestre 2025',
  'Fonte statistica richiamata dalle evidenze Atlas già codificate: dati al 30 giugno 2025, con definizioni e limiti metodologici riportati nei singoli indicatori e valori.',
  'active'
where not exists (
  select 1
  from public.observatory_statistical_sources s
  where s.external_identifier = 'mlps:futurae:imprenditoria-straniera:2025h1'
);

with target as (
  select
    i.id as indicator_id,
    s.id as source_id
  from public.observatory_indicators i
  join public.observatory_statistical_sources s
    on s.external_identifier = 'mlps:futurae:imprenditoria-straniera:2025h1'
  where i.code = 'OBS-IT-IND-FIRM-BIRTH-ATLAS'
), seed(country_code, country_label, numeric_value) as (
  values
    ('MA', 'Marocco', 56642::numeric),
    ('RO', 'Romania', 54115::numeric),
    ('CN', 'Cina', 52267::numeric),
    ('AL', 'Albania', 43566::numeric),
    ('BD', 'Bangladesh', 30532::numeric),
    ('SN', 'Senegal', 15164::numeric),
    ('DE', 'Germania', 13981::numeric),
    ('TN', 'Tunisia', 12661::numeric),
    ('IN', 'India', 8470::numeric),
    ('UA', 'Ucraina', 7512::numeric),
    ('FR', 'Francia', 5515::numeric)
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
  'italy',
  'IT',
  'Italia',
  null,
  seed.country_code,
  seed.country_label,
  'Futurae / InfoCamere / Unioncamere, Fig. 13, 30 giugno 2025. Numero di imprese individuali registrate per Paese di nascita del titolare. Valore incluso perché il Paese di origine appartiene al perimetro del primo Atlante.',
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
    and existing.territory_code = 'IT'
    and existing.country_code = seed.country_code
    and existing.status = 'final'
    and existing.withdrawn_at is null
);

commit;
