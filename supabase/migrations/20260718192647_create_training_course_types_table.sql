-- Create public.training_course_types, the catalog of professional
-- training and workplace-safety course types the platform can market.
--
-- DOMAIN SEPARATION: this table is intentionally independent from
-- public.language_service_types. The service being offered here is
-- training/safety instruction itself (e.g. "Formazione lavoratori rischio
-- alto"), never "a linguistic service". Language is only an ATTRIBUTE of
-- how a specific training offer is delivered (see
-- public.training_offer_languages), not a course type. The two domains may
-- be connected later (e.g. a training offer using an interpreter from the
-- linguistic-services domain), but they do not share tables.
--
-- COMPLIANCE DISCLAIMER: this catalog intentionally does NOT assert legal
-- mandatoriness or statutory validity/renewal periods, because that would
-- require verified, up-to-date regulatory modeling that does not exist yet.
-- is_mandatory defaults to false and default_validity_months defaults to
-- NULL for every seeded row; providers/administrators are expected to fill
-- these in only once such information is actually modeled and verifiable.

create table public.training_course_types (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  category text not null,
  is_mandatory boolean not null default false,
  requires_practical_training boolean not null default false,
  default_validity_months integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_course_types_slug_not_blank_check check (length(trim(slug)) > 0),
  constraint training_course_types_name_not_blank_check check (length(trim(name)) > 0),
  constraint training_course_types_category_not_blank_check check (length(trim(category)) > 0),
  constraint training_course_types_sort_order_check check (sort_order >= 0),
  constraint training_course_types_validity_months_check check (
    default_validity_months is null
    or default_validity_months > 0
  )
);

comment on table public.training_course_types is
  'Platform-managed catalog of professional training and workplace-safety course types (general worker training, construction, safety roles, emergency response, equipment, specific risks, sector-specific training). Independent from public.language_service_types: language is only an attribute of how a course is delivered, not a course type. Read-only for regular users; referenced by public.training_offers and public.training_requests.';

comment on column public.training_course_types.slug is
  'Stable, technical, English identifier for the course type (e.g. high_risk_specific_training). Used for lookups and integrations; uniqueness is case-insensitive (see the expression unique index below).';

comment on column public.training_course_types.name is
  'Italian display name of the course type, shown to end users (e.g. "Formazione specifica rischio alto").';

comment on column public.training_course_types.description is
  'Optional Italian description clarifying what the course type covers.';

comment on column public.training_course_types.category is
  'Stable grouping key for the course type. Preferred values: worker_training, construction, safety_roles, emergency, equipment, specific_risks, sector_training. Not enforced by a CHECK so the taxonomy can evolve without a migration.';

comment on column public.training_course_types.is_mandatory is
  'Operational hint that this course type is typically required by employers, to be set and maintained by administrators. Defaults to false and is left false in the initial seed: the platform does not assert legal mandatoriness without a verified regulatory model.';

comment on column public.training_course_types.requires_practical_training is
  'True when the course type typically includes a hands-on/practical component (e.g. operating machinery), as opposed to purely classroom/theoretical instruction.';

comment on column public.training_course_types.default_validity_months is
  'Optional operational hint for how many months a completed course is typically considered valid before a refresher is needed. NULL in the initial seed: the platform does not assert a statutory validity period without a verified regulatory model. Must be positive when set.';

comment on column public.training_course_types.is_active is
  'False hides the course type from public catalog listings and blocks new training_offers/training_requests rows from referencing it.';

comment on column public.training_course_types.sort_order is
  'Manual display order for catalog listings, lower values first. Must be non-negative.';

-- Case-insensitive uniqueness on the technical slug (e.g. "High_Risk" and
-- "high_risk" collide), independent of the display name.
create unique index training_course_types_slug_idx on public.training_course_types (lower(trim(slug)));

-- Supports catalog browsing/filtering; mirrors the indexing pattern already
-- used on public.languages and public.language_service_types.
create index training_course_types_category_idx on public.training_course_types using btree (category);

create index training_course_types_is_active_idx on public.training_course_types using btree (is_active);

create index training_course_types_sort_order_idx on public.training_course_types using btree (sort_order);

alter table public.training_course_types enable row level security;

-- Anyone (anonymous or authenticated) can read active course types only.
-- This is a curated catalog: no insert/update/delete policies exist for
-- regular users; administration happens via the service role.
create policy "Public can view active course types"
  on public.training_course_types
  for select
  to public
  using (is_active = true);

grant select on public.training_course_types to anon, authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_training_course_types_updated_at ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger training_course_types_set_updated_at
before update on public.training_course_types
for each row
execute function public.set_training_course_types_updated_at ();

-- Broad but ordered initial catalog, reflecting real training needs of
-- businesses in construction, logistics, facility management, cleaning,
-- manufacturing, food service, agriculture and transport. is_mandatory
-- stays false and default_validity_months stays NULL for every row (see
-- the compliance disclaimer above).
insert into public.training_course_types (
  slug,
  name,
  description,
  category,
  requires_practical_training,
  sort_order
)
values
  -- Formazione generale dei lavoratori (worker_training)
  ('general_worker_training', 'Formazione generale lavoratori', 'Formazione generale sui concetti di rischio, prevenzione e organizzazione della sicurezza aziendale.', 'worker_training', false, 10),
  ('low_risk_specific_training', 'Formazione specifica rischio basso', 'Formazione specifica per lavoratori impiegati in attività a basso rischio.', 'worker_training', false, 20),
  ('medium_risk_specific_training', 'Formazione specifica rischio medio', 'Formazione specifica per lavoratori impiegati in attività a rischio medio.', 'worker_training', false, 30),
  ('high_risk_specific_training', 'Formazione specifica rischio alto', 'Formazione specifica per lavoratori impiegati in attività a rischio alto.', 'worker_training', false, 40),
  ('worker_training_refresher', 'Aggiornamento lavoratori', 'Aggiornamento periodico della formazione dei lavoratori sulla sicurezza.', 'worker_training', false, 50),
  ('new_hire_information_training', 'Informazione e formazione nuovi assunti', 'Informazione e formazione iniziale per i lavoratori neoassunti.', 'worker_training', false, 60),

  -- Cantieri ed edilizia (construction)
  ('work_at_height_training', 'Formazione per lavori in quota', 'Formazione per l''esecuzione in sicurezza di lavori in quota.', 'construction', true, 70),
  ('category_3_ppe_training', 'Addestramento DPI di terza categoria', 'Addestramento all''uso di dispositivi di protezione individuale di terza categoria.', 'construction', true, 80),
  ('ladder_scaffold_tower_training', 'Formazione uso scale e trabattelli', 'Formazione per l''uso sicuro di scale portatili e trabattelli.', 'construction', true, 90),
  ('scaffolding_training', 'Formazione ponteggi', 'Formazione per l''uso di ponteggi in sicurezza.', 'construction', true, 100),
  ('scaffolding_erection_use_dismantling_training', 'Formazione montaggio, uso e smontaggio ponteggi', 'Formazione per il montaggio, l''uso e lo smontaggio di ponteggi.', 'construction', true, 110),
  ('crane_operator_training', 'Formazione addetti gru', 'Formazione per addetti alla conduzione di gru.', 'construction', true, 120),
  ('earthmoving_machinery_operator_training', 'Formazione addetti macchine movimento terra', 'Formazione per addetti alla conduzione di macchine movimento terra.', 'construction', true, 130),
  ('aerial_platform_operator_training', 'Formazione addetti piattaforme di lavoro elevabili', 'Formazione per addetti alla conduzione di piattaforme di lavoro elevabili.', 'construction', true, 140),
  ('excavator_operator_training', 'Formazione addetti escavatori', 'Formazione per addetti alla conduzione di escavatori.', 'construction', true, 150),
  ('road_signage_training', 'Formazione segnaletica stradale', 'Formazione sulla gestione della segnaletica stradale nei lavori in cantiere.', 'construction', false, 160),
  ('construction_site_safety_training', 'Formazione sicurezza nei cantieri', 'Formazione sulla sicurezza generale nei cantieri edili.', 'construction', false, 170),
  ('self_employed_construction_worker_training', 'Formazione lavoratori autonomi in cantiere', 'Formazione sulla sicurezza per lavoratori autonomi che operano in cantiere.', 'construction', false, 180),

  -- Attrezzature e ambienti di lavoro (equipment)
  ('forklift_operator_training', 'Formazione carrelli elevatori', 'Formazione per addetti alla conduzione di carrelli elevatori.', 'equipment', true, 190),
  ('aerial_platform_stabilizer_training', 'Formazione PLE con e senza stabilizzatori', 'Formazione per addetti a piattaforme di lavoro elevabili con e senza stabilizzatori.', 'equipment', true, 200),
  ('truck_mounted_crane_training', 'Formazione gru su autocarro', 'Formazione per addetti alla conduzione di gru su autocarro.', 'equipment', true, 210),
  ('tower_crane_training', 'Formazione gru a torre', 'Formazione per addetti alla conduzione di gru a torre.', 'equipment', true, 220),
  ('agricultural_forestry_tractor_training', 'Formazione trattori agricoli e forestali', 'Formazione per la conduzione di trattori agricoli e forestali.', 'equipment', true, 230),
  ('confined_spaces_training', 'Formazione spazi confinati', 'Formazione per l''accesso e il lavoro in spazi confinati.', 'equipment', false, 240),
  ('suspected_contamination_environments_training', 'Formazione ambienti sospetti di inquinamento', 'Formazione per il lavoro in ambienti sospetti di inquinamento.', 'equipment', false, 250),
  ('electrical_risk_pes_pav_pei_training', 'Formazione rischio elettrico PES PAV PEI', 'Formazione sul rischio elettrico per persone esperte, avvertite e idonee (PES, PAV, PEI).', 'equipment', false, 260),
  ('electrical_work_training', 'Formazione lavori elettrici', 'Formazione per l''esecuzione di lavori elettrici in sicurezza.', 'equipment', true, 270),
  ('equipment_machinery_use_training', 'Formazione uso attrezzature e macchinari', 'Formazione sull''uso sicuro di attrezzature e macchinari di lavoro.', 'equipment', true, 280),

  -- Ruoli della sicurezza (safety_roles)
  ('supervisor_training', 'Formazione preposti', 'Formazione per lo svolgimento del ruolo di preposto alla sicurezza.', 'safety_roles', false, 290),
  ('supervisor_refresher_training', 'Aggiornamento preposti', 'Aggiornamento periodico della formazione dei preposti.', 'safety_roles', false, 300),
  ('manager_training', 'Formazione dirigenti', 'Formazione per lo svolgimento del ruolo di dirigente in materia di sicurezza.', 'safety_roles', false, 310),
  ('workers_safety_representative_training', 'Formazione RLS', 'Formazione per il rappresentante dei lavoratori per la sicurezza.', 'safety_roles', false, 320),
  ('workers_safety_representative_refresher_training', 'Aggiornamento RLS', 'Aggiornamento periodico della formazione del rappresentante dei lavoratori per la sicurezza.', 'safety_roles', false, 330),
  ('employer_rspp_training', 'Formazione RSPP datore di lavoro', 'Formazione per il datore di lavoro che svolge direttamente i compiti di RSPP.', 'safety_roles', false, 340),
  ('employer_rspp_refresher_training', 'Aggiornamento RSPP datore di lavoro', 'Aggiornamento periodico della formazione del datore di lavoro RSPP.', 'safety_roles', false, 350),

  -- Emergenze (emergency)
  ('fire_safety_officer_level_1_training', 'Formazione addetti antincendio livello 1', 'Formazione per addetti antincendio in attività a rischio basso.', 'emergency', true, 360),
  ('fire_safety_officer_level_2_training', 'Formazione addetti antincendio livello 2', 'Formazione per addetti antincendio in attività a rischio medio.', 'emergency', true, 370),
  ('fire_safety_officer_level_3_training', 'Formazione addetti antincendio livello 3', 'Formazione per addetti antincendio in attività a rischio alto.', 'emergency', true, 380),
  ('fire_safety_refresher_training', 'Aggiornamento antincendio', 'Aggiornamento periodico della formazione antincendio.', 'emergency', false, 390),
  ('first_aid_group_a_training', 'Formazione primo soccorso gruppo A', 'Formazione di primo soccorso per aziende di gruppo A.', 'emergency', true, 400),
  ('first_aid_group_bc_training', 'Formazione primo soccorso gruppi B e C', 'Formazione di primo soccorso per aziende di gruppo B e C.', 'emergency', true, 410),
  ('first_aid_refresher_training', 'Aggiornamento primo soccorso', 'Aggiornamento periodico della formazione di primo soccorso.', 'emergency', false, 420),
  ('emergency_evacuation_management_training', 'Formazione gestione emergenze ed evacuazione', 'Formazione sulla gestione delle emergenze e sulle procedure di evacuazione.', 'emergency', true, 430),

  -- Rischi specifici (specific_risks)
  ('chemical_risk_training', 'Formazione rischio chimico', 'Formazione sulla gestione del rischio chimico nei luoghi di lavoro.', 'specific_risks', false, 440),
  ('biological_risk_training', 'Formazione rischio biologico', 'Formazione sulla gestione del rischio biologico nei luoghi di lavoro.', 'specific_risks', false, 450),
  ('manual_handling_of_loads_training', 'Formazione movimentazione manuale dei carichi', 'Formazione sulla movimentazione manuale dei carichi.', 'specific_risks', false, 460),
  ('display_screen_equipment_training', 'Formazione videoterminali', 'Formazione sull''uso corretto dei videoterminali.', 'specific_risks', false, 470),
  ('noise_risk_training', 'Formazione rumore', 'Formazione sul rischio da esposizione al rumore.', 'specific_risks', false, 480),
  ('vibration_risk_training', 'Formazione vibrazioni', 'Formazione sul rischio da esposizione a vibrazioni.', 'specific_risks', false, 490),
  ('asbestos_training', 'Formazione amianto', 'Formazione sul rischio da esposizione all''amianto.', 'specific_risks', false, 500),
  ('haccp_training', 'Formazione HACCP', 'Formazione sulle procedure di autocontrollo igienico-sanitario (HACCP).', 'specific_risks', false, 510),

  -- Formazione settoriale (sector_training)
  ('logistics_safety_training', 'Formazione sicurezza nella logistica', 'Formazione sulla sicurezza per attività nel settore della logistica.', 'sector_training', false, 520),
  ('cleaning_sector_safety_training', 'Formazione sicurezza nelle pulizie', 'Formazione sulla sicurezza per attività nel settore delle pulizie.', 'sector_training', false, 530),
  ('food_service_safety_training', 'Formazione sicurezza nella ristorazione', 'Formazione sulla sicurezza per attività nel settore della ristorazione.', 'sector_training', false, 540),
  ('agriculture_safety_training', 'Formazione sicurezza in agricoltura', 'Formazione sulla sicurezza per attività nel settore agricolo.', 'sector_training', false, 550),
  ('transport_safety_training', 'Formazione sicurezza nei trasporti', 'Formazione sulla sicurezza per attività nel settore dei trasporti.', 'sector_training', false, 560);
