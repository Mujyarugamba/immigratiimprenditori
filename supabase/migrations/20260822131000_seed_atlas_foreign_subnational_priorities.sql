-- Approved foreign subnational priorities for the first Atlas perimeter.
-- These registry rows do not make a territory public by themselves.

insert into public.geo_territories (
  id, country_code, parent_id, level_kind, code, name, slug, is_active
)
values
  (gen_random_uuid(), 'FR', null, 'region', 'FR-IDF', 'Île-de-France', 'ile-de-france', true),
  (gen_random_uuid(), 'DE', null, 'region', 'DE-BY', 'Baviera', 'baviera', true),
  (gen_random_uuid(), 'GB', null, 'metropolitan_area', null, 'Greater London', 'greater-london', true),
  (gen_random_uuid(), 'ES', null, 'region', 'ES-CT', 'Catalogna', 'catalogna', true)
on conflict (slug) do update
set
  country_code = excluded.country_code,
  parent_id = excluded.parent_id,
  level_kind = excluded.level_kind,
  code = excluded.code,
  name = excluded.name,
  is_active = excluded.is_active,
  updated_at = now();
