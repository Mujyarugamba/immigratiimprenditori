-- Official origin-country evidence for first-Atlas routes to Italy.
-- Source: Futurae / InfoCamere / Unioncamere, Fig. 13, 30 June 2025.
-- Measure: registered individual enterprises by country of birth of the owner.
-- Only source countries inside the approved 20-country Atlas perimeter are
-- imported here. This is a place-of-birth measure, not citizenship.

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
  'OBS-IT-IND-FIRM-BIRTH-ATLAS',
  'imprese-individuali-paese-nascita-titolare-atlas',
  'Imprese individuali per Paese di nascita del titolare — Paesi Atlas',
  'Numero di imprese individuali registrate in Italia il cui titolare è nato in uno dei Paesi compresi nel primo perimetro dell’Atlante.',
  'Misurare la presenza imprenditoriale in Italia delle comunità di origine incluse nel primo Atlante, mantenendo distinta la dimensione del luogo di nascita dalla cittadinanza.',
  'Fonte Futurae / InfoCamere / Unioncamere, Fig. 13 del report I semestre 2025. Valori al 30 giugno 2025, solo imprese individuali. Il Paese indica il luogo di nascita del titolare. La figura originale presenta le prime 20 comunità straniere; questa serie importa soltanto quelle appartenenti al perimetro approvato del primo Atlante e non va interpretata come classifica completa di tutte le provenienze.',
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

with seed(origin_country_code, destination_country_code, slug) as (
  values
    ('MA', 'IT', 'marocco-italia'),
    ('RO', 'IT', 'romania-italia'),
    ('CN', 'IT', 'cina-italia'),
    ('AL', 'IT', 'albania-italia'),
    ('BD', 'IT', 'bangladesh-italia'),
    ('SN', 'IT', 'senegal-italia'),
    ('DE', 'IT', 'germania-italia'),
    ('TN', 'IT', 'tunisia-italia'),
    ('IN', 'IT', 'india-italia'),
    ('UA', 'IT', 'ucraina-italia'),
    ('FR', 'IT', 'francia-italia')
)
insert into public.migration_routes (
  id,
  origin_country_code,
  destination_country_code,
  slug,
  is_active
)
select
  gen_random_uuid(),
  seed.origin_country_code,
  seed.destination_country_code,
  seed.slug,
  true
from seed
on conflict (origin_country_code, destination_country_code) do update
set
  slug = excluded.slug,
  is_active = true,
  updated_at = now();
