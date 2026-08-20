insert into public.content_authors (
  content_id,
  role_kind,
  display_label,
  is_primary,
  sort_order
)
select
  c.id,
  'author',
  'Redazione Immigrati Imprenditori',
  true,
  0
from public.contents c
where c.slug = any (array[
  '678mila-imprese-straniere-registro-imprese',
  'europa-self-employment-migranti-2022',
  'futurae-imprenditoria-straniera-2025-lettura',
  'italiani-impresa-estero-perche-non-esiste-un-numero',
  'lombardia-135mila-imprese-straniere',
  'oecd-10-milioni-lavoratori-autonomi-immigrati',
  'ue-imprenditori-migranti-finanziamento-formazione-mentoring'
])
and not exists (
  select 1
  from public.content_authors a
  where a.content_id = c.id
);
