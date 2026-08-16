-- M2.1 — create opportunity controlled lists
-- Creates the two local Controlled Lists (C05) of the Opportunità domain:
--   TipologiaOpportunità  → public.opportunity_types
--   ModalitàAccesso       → public.opportunity_access_modes
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §13;
--  docs/architecture/physical/domain-mapping/opportunita.md §12, §19).
--
-- Scope of this unit only: catalog structures and normative initial values.
-- Associations to public.opportunities (M2.2), cardinality invariants,
-- completeness triggers, and inter-domain references are out of scope.
--
-- Origine remains the opportunities.origin column from M1.1 (external|internal);
-- it is not duplicated as a catalog here. Finalità remains free-text purpose.
-- Menu labels, editorial categories, sectors, territories, markets,
-- audiences, benefits, requirements, visibility, and Event typologies
-- are not introduced.
--
-- ModalitàAccesso classifies how a potential recipient may access the
-- actionable possibility. It is not CandidaturaOpportunità, not temporal
-- windows, not requirements, not evaluation/ranking, and not publication
-- or visibility.

-- ---------------------------------------------------------------------------
-- A. TipologiaOpportunità — public.opportunity_types
-- ---------------------------------------------------------------------------

create table public.opportunity_types (
  id bigint generated always as identity primary key,
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_types_code_not_blank_check check (length(trim(code)) > 0),
  constraint opportunity_types_code_format_check check (
    code ~ '^[a-z][a-z0-9_]*$'
  ),
  constraint opportunity_types_name_not_blank_check check (length(trim(name)) > 0),
  constraint opportunity_types_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_types is
  'Local Controlled List (C05) TipologiaOpportunità for the Opportunità domain. Classifies the nature of the actionable possibility. Not public-menu categories, not Event types, not benefits, not access modalities. Owned by Opportunità; associations to opportunities belong to M2.2.';

comment on column public.opportunity_types.id is
  'Stable internal identity of the catalog entry. Independent of code and display name.';

comment on column public.opportunity_types.code is
  'Stable machine-readable English identifier, unique within this list. Not a localized label; not a menu entry.';

comment on column public.opportunity_types.name is
  'Italian display name of the typology, aligned to Physical Mapping terminology.';

comment on column public.opportunity_types.description is
  'Optional clarifying note. Not editorial CMS content.';

comment on column public.opportunity_types.is_active is
  'Catalog activation flag. Deactivating a value does not soft-delete the row and does not change opportunity lifecycle axes.';

comment on column public.opportunity_types.sort_order is
  'Canonical administrative display order within this list, lower values first. Not priority, not identity.';

comment on column public.opportunity_types.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_types.updated_at is
  'Last update timestamp. Maintained by opportunity_types_set_updated_at.';

-- Case-insensitive uniqueness on the technical code.
create unique index opportunity_types_code_uidx
  on public.opportunity_types (lower(trim(code)));

alter table public.opportunity_types enable row level security;

-- Defense in depth: no policies in M2.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Publication/read access is
-- deferred. service_role and owner privileges are not revoked.
revoke all on table public.opportunity_types from anon, authenticated;

create or replace function public.set_opportunity_types_updated_at ()
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

create trigger opportunity_types_set_updated_at
before update on public.opportunity_types
for each row
execute function public.set_opportunity_types_updated_at ();

-- Normative initial values from Physical Mapping §12 (Migration Plan §13:
-- minimal initial controlled-list entries). Not demo/menu labels.
insert into public.opportunity_types (code, name, description, sort_order)
values
  (
    'call',
    'Bando',
    'Procedura che apre una possibilità azionabile secondo criteri dichiarati.',
    10
  ),
  (
    'incentive',
    'Incentivo',
    'Vantaggio economico o condizionato reso disponibile come possibilità azionabile.',
    20
  ),
  (
    'support_measure',
    'Misura agevolativa',
    'Misura strutturata di agevolazione o supporto, distinta dal solo prodotto commerciale.',
    30
  ),
  (
    'subsidized_financing',
    'Finanziamento agevolato',
    'Accesso strutturato a finanziamento agevolato; non catalogo di prodotti bancari.',
    40
  ),
  (
    'tender_access',
    'Gara (accesso)',
    'Possibilità strutturata di accedere/partecipare a una gara o procedura di affidamento.',
    50
  ),
  (
    'training_access',
    'Formazione (accesso)',
    'Accesso strutturato a formazione (iscrizione condizionata, bando formativo, finanziamento). Non Evento corso/webinar.',
    60
  ),
  (
    'trade_fair_participation',
    'Partecipazione fiera',
    'Misura di partecipazione/esposizione a fiera. La fiera in sé rimane nel dominio Eventi.',
    70
  ),
  (
    'mission',
    'Missione',
    'Misura di partecipazione a missione strutturata; non Evento missione puro.',
    80
  ),
  (
    'award',
    'Premio',
    'Premio o riconoscimento formale reso come possibilità azionabile.',
    90
  ),
  (
    'contribution',
    'Contributo',
    'Contributo assegnabile secondo criteri dichiarati.',
    100
  ),
  (
    'actionable_agreement',
    'Convenzione (adesione azionabile)',
    'Convenzione solo quando l''adesione è possibilità azionabile strutturata.',
    110
  ),
  (
    'services_spaces_networks_access',
    'Accesso a servizi, spazi o reti',
    'Possibilità di fruire di servizi, spazi o reti a condizioni dichiarate.',
    120
  ),
  (
    'internal_opportunity',
    'Opportunità interna',
    'Possibilità azionabile istituita o governata internamente dalla piattaforma/promotore.',
    130
  ),
  (
    'other_actionable',
    'Altra azionabile',
    'Residuale per possibilità azionabili strutturate non riconducibili alle voci precedenti.',
    140
  );

-- ---------------------------------------------------------------------------
-- B. ModalitàAccesso — public.opportunity_access_modes
-- ---------------------------------------------------------------------------

create table public.opportunity_access_modes (
  id bigint generated always as identity primary key,
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_access_modes_code_not_blank_check check (length(trim(code)) > 0),
  constraint opportunity_access_modes_code_format_check check (
    code ~ '^[a-z][a-z0-9_]*$'
  ),
  constraint opportunity_access_modes_name_not_blank_check check (length(trim(name)) > 0),
  constraint opportunity_access_modes_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_access_modes is
  'Local Controlled List (C05) ModalitàAccesso for the Opportunità domain. Declares how a potential recipient may access the actionable possibility. Not CandidaturaOpportunità lifecycle, not requirements, not temporal windows, not evaluation/ranking, not publication/visibility, not Event registration. Owned by Opportunità; associations to opportunities belong to M2.2.';

comment on column public.opportunity_access_modes.id is
  'Stable internal identity of the catalog entry. Independent of code and display name.';

comment on column public.opportunity_access_modes.code is
  'Stable machine-readable English identifier, unique within this list. Not a localized label.';

comment on column public.opportunity_access_modes.name is
  'Italian display name of the access mode, aligned to Physical Mapping / approved micro-review terminology.';

comment on column public.opportunity_access_modes.description is
  'Optional clarifying note. Not workflow configuration.';

comment on column public.opportunity_access_modes.is_active is
  'Catalog activation flag. Distinct from opportunity status axes and from soft deletion of opportunities.';

comment on column public.opportunity_access_modes.sort_order is
  'Canonical administrative display order within this list, lower values first. Not priority, not identity.';

comment on column public.opportunity_access_modes.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_access_modes.updated_at is
  'Last update timestamp. Maintained by opportunity_access_modes_set_updated_at.';

create unique index opportunity_access_modes_code_uidx
  on public.opportunity_access_modes (lower(trim(code)));

alter table public.opportunity_access_modes enable row level security;

revoke all on table public.opportunity_access_modes from anon, authenticated;

create or replace function public.set_opportunity_access_modes_updated_at ()
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

create trigger opportunity_access_modes_set_updated_at
before update on public.opportunity_access_modes
for each row
execute function public.set_opportunity_access_modes_updated_at ();

-- Normative values from Physical Mapping §19, confirmed by ModalitàAccesso
-- micro-review. Excludes graduatoria, procedura competitiva/valutativa,
-- click day, sportello, requirements, Event enrolment, visibility.
insert into public.opportunity_access_modes (code, name, description, sort_order)
values
  (
    'direct_access',
    'Accesso diretto',
    'Accesso senza processo di domanda o candidatura sulla scheda.',
    10
  ),
  (
    'open_participation',
    'Partecipazione libera',
    'Partecipazione libera dichiarata; distinta dalla candidatura.',
    20
  ),
  (
    'application',
    'Candidatura',
    'Accesso tramite candidatura come modalità dichiarata; non è l''entity CandidaturaOpportunità.',
    30
  ),
  (
    'request',
    'Domanda',
    'Accesso tramite domanda formale dichiarata.',
    40
  ),
  (
    'adhesion',
    'Adesione',
    'Accesso tramite adesione strutturata.',
    50
  ),
  (
    'registration',
    'Iscrizione',
    'Iscrizione all''Opportunità; non iscrizione a un Evento.',
    60
  ),
  (
    'reservation',
    'Prenotazione',
    'Prenotazione come azione di accesso all''Opportunità; non prenotazione Evento.',
    70
  ),
  (
    'formal_expression_of_interest',
    'Manifestazione di interesse formale',
    'Interesse formale come modalità di accesso; distinta da Manifestazione Collaborazioni.',
    80
  ),
  (
    'invitation',
    'Invito',
    'Accesso sostanziale su invito; non visibilità della scheda.',
    90
  ),
  (
    'selection',
    'Selezione',
    'Accesso tramite selezione dichiarata; non punteggi, commissioni o graduatorie.',
    100
  ),
  (
    'external_procedure',
    'Procedura esterna',
    'Procedura di accesso governata fuori piattaforma.',
    110
  ),
  (
    'internal_procedure',
    'Procedura interna',
    'Procedura di accesso governata in piattaforma.',
    120
  );
