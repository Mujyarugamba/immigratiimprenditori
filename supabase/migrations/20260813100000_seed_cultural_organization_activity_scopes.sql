-- C3.1 — seed cultural organization activity scopes
-- Populates public.organization_activity_scopes (structure from M1.2 /
-- 20260808100000; seed was intentionally empty).
-- Sources: docs/architecture/application/c3-cultural-taxonomy-enrichment-plan.md §7.2;
--   Hybrid C (scope ≠ discipline; C3.7 deferred).
--
-- Scope of this unit only: normative INSERT of three cultural activity scopes.
-- Explicitly out of scope: organization_types; organizations AR; membership;
-- business_sectors; disciplines; backfill of primary_scope_code; RLS changes
-- (catalog already covered by residual catalog SELECT).

-- culture: organization operates in the cultural field of the network.
-- heritage: cultural heritage / patrimonio focus.
-- creative_industries: cultural and creative industries (CCI) focus.
-- association/foundation/ngo organization_types do NOT imply culture.

insert into public.organization_activity_scopes (
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
    'Ambito di attività culturale della rete. Non è tipology giuridica e non è disciplina artistica.',
    true,
    10
  ),
  (
    'heritage',
    'Patrimonio culturale',
    'Ambito incentrato su patrimonio culturale / heritage. Scope di dominio, non disciplina.',
    true,
    20
  ),
  (
    'creative_industries',
    'Industrie culturali e creative',
    'Ambito incentrato sulle industrie culturali e creative (CCI). Scope di dominio, non settore Impresa.',
    true,
    30
  );
