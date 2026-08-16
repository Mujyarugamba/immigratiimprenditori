-- M1.1 — create international activity types
-- Implements the normative C03/C05 activity-type catalog of Mercati Internazionali:
--   public.international_activity_types
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M1.1;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.1;
--  docs/architecture/logical/mercati-internazionali.md §5).
--
-- Scope of this unit only: catalog structure and 20 normative seed rows.
-- Explicitly out of scope: access channels, need types, markets, countries,
-- support resources, presences, interests, activity instances, type links,
-- commercial relations, needs, sources, evidences, verifications, demo data.

create table public.international_activity_types (
  code text not null,
  label_it text not null,
  description text null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint iat_pkey primary key (code),
  constraint iat_code_not_blank_check check (length(btrim(code)) > 0),
  constraint iat_label_it_not_blank_check check (length(btrim(label_it)) > 0),
  constraint iat_sort_order_check check (sort_order >= 0)
);

comment on table public.international_activity_types is
  'Normative controlled catalog (C03/C05) of international activity typologies for Mercati Internazionali. Owned by Mercati Internazionali. Each row defines a stable typology vocabulary entry, not an activity instance performed by a Persona or Impresa, and not a Presence, Interest, commercial relation, sector taxonomy, or Opportunity catalog. Does not confer publication, verification, visibility, badge, or score. M1.1 seed is normative, not demo (M8.1).';

comment on column public.international_activity_types.code is
  'Stable technical English identifier of the activity typology. Primary key. Not a localized label. Immutable by convention; referenced by future activity type links.';

comment on column public.international_activity_types.label_it is
  'Italian display label aligned to Logical §5 typology names. Descriptive only; not unique and not identity.';

comment on column public.international_activity_types.description is
  'Optional Italian descriptive meaning of the typology from Logical §5. Not an activity instance, not a Presence, and does not assert verification or publishability. Anti-blank when present is application-level; column is nullable.';

comment on column public.international_activity_types.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.international_activity_types.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.international_activity_types.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_activity_types.updated_at is
  'Last update timestamp. Maintained by international_activity_types_set_updated_at.';

alter table public.international_activity_types enable row level security;

-- Defense in depth: no policies in M1.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.international_activity_types from anon, authenticated;

create or replace function public.set_international_activity_types_updated_at ()
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

comment on function public.set_international_activity_types_updated_at () is
  'BEFORE UPDATE trigger function for public.international_activity_types. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_activity_types_set_updated_at
before update on public.international_activity_types
for each row
execute function public.set_international_activity_types_updated_at ();

-- Normative seed from Logical §5 / Physical §35.1 / Migration Plan M1.1.
-- Exactly 20 typologies. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.international_activity_types (
  code,
  label_it,
  description,
  sort_order,
  is_active
)
values
  (
    'export',
    'Esportazione',
    'Vendita di beni o servizi dall''Italia verso il Mercato',
    10,
    true
  ),
  (
    'import',
    'Importazione',
    'Acquisto di beni o servizi dal Mercato verso l''Italia',
    20,
    true
  ),
  (
    'distribution',
    'Distribuzione',
    'Gestione della rivendita di beni nel Mercato, propri o di terzi',
    30,
    true
  ),
  (
    'intermediation',
    'Intermediazione',
    'Ruolo di collegamento tra soggetti nel Mercato senza essere parte diretta della transazione finale',
    40,
    true
  ),
  (
    'production',
    'Produzione',
    'Attività produttiva svolta direttamente nel Mercato',
    50,
    true
  ),
  (
    'service_provision',
    'Fornitura di servizi',
    'Erogazione di servizi a beneficiari presenti nel Mercato',
    60,
    true
  ),
  (
    'consulting',
    'Consulenza',
    'Attività di consulenza professionale prestata verso soggetti del Mercato',
    70,
    true
  ),
  (
    'cross_border_ecommerce',
    'Commercio elettronico transfrontaliero',
    'Vendita diretta a clienti nel Mercato tramite canali digitali',
    80,
    true
  ),
  (
    'direct_investment',
    'Investimento diretto',
    'Impiego di capitale nel Mercato (es. apertura di una struttura propria)',
    90,
    true
  ),
  (
    'equity_participation',
    'Partecipazione societaria',
    'Detenzione di quote in una società operante nel Mercato',
    100,
    true
  ),
  (
    'franchising',
    'Franchising',
    'Concessione o acquisizione di un modello di attività in franchising nel Mercato',
    110,
    true
  ),
  (
    'licensing',
    'Licenza',
    'Concessione o acquisizione del diritto di utilizzo di un marchio, un brevetto o un know-how nel Mercato',
    120,
    true
  ),
  (
    'commercial_representation',
    'Rappresentanza commerciale',
    'Ruolo di rappresentante formale degli interessi commerciali di un''Impresa nel Mercato',
    130,
    true
  ),
  (
    'procurement',
    'Approvvigionamento',
    'Acquisto di beni o materie prime dal Mercato per uso proprio, distinto dall''importazione a fini di rivendita',
    140,
    true
  ),
  (
    'subcontracting',
    'Subfornitura',
    'Fornitura di componenti o lavorazioni a un''Impresa del Mercato nell''ambito della sua catena produttiva',
    150,
    true
  ),
  (
    'industrial_cooperation',
    'Cooperazione industriale',
    'Collaborazione strutturata con soggetti del Mercato su progetti industriali comuni',
    160,
    true
  ),
  (
    'research_development',
    'Ricerca e sviluppo',
    'Attività di ricerca svolta in collaborazione con o all''interno del Mercato',
    170,
    true
  ),
  (
    'training',
    'Formazione',
    'Attività formativa erogata verso o in collaborazione con soggetti del Mercato',
    180,
    true
  ),
  (
    'technology_transfer',
    'Trasferimento tecnologico',
    'Cessione o acquisizione di tecnologia o competenza tecnica verso/dal Mercato',
    190,
    true
  ),
  (
    'institutional_associative',
    'Attività istituzionale o associativa',
    'Partecipazione a reti, associazioni o iniziative istituzionali legate al Mercato, senza una transazione economica diretta',
    200,
    true
  );
