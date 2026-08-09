-- C3.3 — seed creative & cultural business sectors (CCI)
-- Extends public.business_sectors with cultural and creative industry sectors.
-- Sources: C3 plan §7.3; Hybrid C; C3.7 deferred.
--
-- Scope of this unit only: INSERT of CCI economic sectors.
-- Explicitly out of scope: parallel cultural business type; disciplines;
-- architecture sector (architecture remains a professional category, not
-- duplicated here as CCI seed); backfill of business_sector_declarations;
-- RLS changes (catalog already public SELECT when is_active).

-- Economic sectors, not artistic disciplines.
insert into public.business_sectors (
  slug,
  name,
  description,
  sort_order
)
values
  (
    'audiovisual',
    'Produzione audiovisiva',
    'Settore economico della produzione cinematografica e audiovisiva.',
    200
  ),
  (
    'publishing',
    'Editoria',
    'Settore economico editoriale.',
    210
  ),
  (
    'music_industry',
    'Industria musicale',
    'Settore economico dell’industria musicale.',
    220
  ),
  (
    'live_performance',
    'Spettacolo dal vivo',
    'Settore economico dello spettacolo dal vivo.',
    230
  ),
  (
    'design_creative',
    'Design creativo',
    'Settore economico del design creativo.',
    240
  ),
  (
    'fashion',
    'Moda',
    'Settore economico della moda.',
    250
  ),
  (
    'artistic_crafts',
    'Artigianato artistico / creativo',
    'Settore economico dell’artigianato artistico e creativo.',
    260
  ),
  (
    'cultural_heritage_services',
    'Servizi per il patrimonio culturale',
    'Settore economico dei servizi legati al patrimonio culturale.',
    270
  );
