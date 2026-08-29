-- Canonical geographic registry for the first Atlas perimeter in Italy.
-- Data-only, idempotent seed. This migration is prepared on the development
-- branch and is not a publication decision: public territory pages still
-- require substantive evidence (data, research, stories or events).

insert into public.geo_territories (
  id, country_code, parent_id, level_kind, code, name, slug, is_active
)
values
  (gen_random_uuid(), 'IT', null, 'region', 'IT-65', 'Abruzzo', 'abruzzo', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-77', 'Basilicata', 'basilicata', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-78', 'Calabria', 'calabria', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-72', 'Campania', 'campania', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-45', 'Emilia-Romagna', 'emilia-romagna', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-36', 'Friuli-Venezia Giulia', 'friuli-venezia-giulia', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-62', 'Lazio', 'lazio', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-42', 'Liguria', 'liguria', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-25', 'Lombardia', 'lombardia', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-57', 'Marche', 'marche', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-67', 'Molise', 'molise', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-21', 'Piemonte', 'piemonte', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-75', 'Puglia', 'puglia', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-88', 'Sardegna', 'sardegna', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-82', 'Sicilia', 'sicilia', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-52', 'Toscana', 'toscana', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-32', 'Trentino-Alto Adige/Südtirol', 'trentino-alto-adige-sudtirol', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-55', 'Umbria', 'umbria', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-23', 'Valle d''Aosta/Vallée d''Aoste', 'valle-d-aosta-vallee-d-aoste', true),
  (gen_random_uuid(), 'IT', null, 'region', 'IT-34', 'Veneto', 'veneto', true)
on conflict (slug) do update
set
  country_code = excluded.country_code,
  level_kind = excluded.level_kind,
  code = excluded.code,
  name = excluded.name,
  is_active = excluded.is_active,
  updated_at = now();

with city_seed(slug, name, region_slug) as (
  values
    ('milano', 'Milano', 'lombardia'),
    ('roma', 'Roma', 'lazio'),
    ('torino', 'Torino', 'piemonte'),
    ('brescia', 'Brescia', 'lombardia'),
    ('bergamo', 'Bergamo', 'lombardia'),
    ('bologna', 'Bologna', 'emilia-romagna'),
    ('firenze', 'Firenze', 'toscana'),
    ('napoli', 'Napoli', 'campania'),
    ('verona', 'Verona', 'veneto'),
    ('genova', 'Genova', 'liguria')
)
insert into public.geo_territories (
  id, country_code, parent_id, level_kind, code, name, slug, is_active
)
select
  gen_random_uuid(),
  'IT',
  region.id,
  'municipality_city',
  null,
  city_seed.name,
  city_seed.slug,
  true
from city_seed
join public.geo_territories region on region.slug = city_seed.region_slug
on conflict (slug) do update
set
  country_code = excluded.country_code,
  parent_id = excluded.parent_id,
  level_kind = excluded.level_kind,
  name = excluded.name,
  is_active = excluded.is_active,
  updated_at = now();
