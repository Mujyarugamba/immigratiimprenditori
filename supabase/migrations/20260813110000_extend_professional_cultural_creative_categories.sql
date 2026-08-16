-- C3.2 — extend professional cultural/creative categories
-- Extends public.professional_categories group_code CHECK with cultural_creative
-- and seeds a minimal set of cultural/creative practice categories.
-- Sources: C3 plan §7.1; Hybrid C; C3.7 deferred.
--
-- Scope of this unit only: additive CHECK extension + INSERT of new categories.
-- Explicitly out of scope: moving cultural_mediation; job-title encyclopedia;
-- disciplines; profiles cultural fields; backfill of professional_profile_categories.

-- Preserve all ten existing groups; add cultural_creative only.
alter table public.professional_categories
drop constraint professional_categories_group_code_check;

alter table public.professional_categories
add constraint professional_categories_group_code_check check (
  group_code in (
    'legal_tax_labor',
    'finance_credit',
    'technical_built',
    'digital_communication',
    'trade_international',
    'people_org',
    'real_estate',
    'linguistic_intercultural',
    'ip_innovation',
    'residual',
    'cultural_creative'
  )
);

comment on column public.professional_categories.group_code is
  'Closed vocabulary of professional groups (Logical §5 / Physical §29.22) extended by C3.2 with cultural_creative. Not a foreign key; no separate groups table. Italian group labels must not be stored here.';

-- Minimal cultural/creative categories (not exhaustive artistic job titles).
-- cultural_mediation remains in linguistic_intercultural with unchanged meaning.
-- Existing architecture/communication/marketing are NOT cultural by default.
insert into public.professional_categories (
  code,
  label_it,
  group_code,
  description,
  sort_order,
  is_active
)
values
  (
    'performing_artist',
    'Artista performativo',
    'cultural_creative',
    'Pratiche performative (teatro, danza e affini). Categoria di ambito, non specializzazione o titolo professionale.',
    340,
    true
  ),
  (
    'visual_artist',
    'Artista visivo',
    'cultural_creative',
    'Pratiche di arti visive. Non fotografia/disciplina condivisa (C3.7 deferred).',
    350,
    true
  ),
  (
    'musician',
    'Musicista / professionista musicale',
    'cultural_creative',
    'Pratiche musicali professionali. Non industria musicale Impresa.',
    360,
    true
  ),
  (
    'audiovisual_professional',
    'Professionista audiovisivo',
    'cultural_creative',
    'Pratiche cinema / audiovisivo. Non settore economico Impresa.',
    370,
    true
  ),
  (
    'writer_editorial_professional',
    'Autore / professionista editoriale',
    'cultural_creative',
    'Pratiche letterarie e editoriali. Non settore publishing Impresa.',
    380,
    true
  ),
  (
    'designer_creative',
    'Designer creativo',
    'cultural_creative',
    'Pratiche di design in ambito culturale/creativo. Distinto da marketing/communication generici.',
    390,
    true
  ),
  (
    'cultural_producer',
    'Produttore / organizzatore culturale',
    'cultural_creative',
    'Produzione, programmazione e organizzazione culturale. Distinto da event manager generico non culturale.',
    400,
    true
  );
