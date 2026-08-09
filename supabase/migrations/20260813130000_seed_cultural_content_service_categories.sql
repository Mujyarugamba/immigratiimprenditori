-- C3.4 — seed cultural content + service categories
-- Adds structured culture classifications to existing domain catalogs.
-- Sources: C3 plan §7.7–§7.8; Hybrid C; C3.7 deferred.
--
-- Scope of this unit only:
--   INSERT content_categories.code = culture
--   INSERT service_categories.code = cultural_creative
-- Explicitly out of scope: content_types; service natures of Professionisti;
-- linguistic as culture proxy; disciplines; tags; backfill; RLS changes.

-- Content: structured category for cultural contents without requiring Event link.
insert into public.content_categories (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  (
    'culture',
    'Cultura',
    'Categoria strutturata per contenuti culturali. Distinta da events_community. Non è tipology di contenuto e non è disciplina (C3.7 deferred).',
    true,
    75
  );

-- Service: cultural/creative service category. linguistic remains non-cultural.
insert into public.service_categories (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  (
    'cultural_creative',
    'Servizi culturali e creativi',
    'Categoria di servizio culturale/creativo. Distinta da linguistic e da support_other.',
    true,
    60
  );
