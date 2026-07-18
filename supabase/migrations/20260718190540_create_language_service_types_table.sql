-- Create public.language_service_types, the catalog of linguistic and
-- intercultural service types the platform can market.
--
-- DESIGN NOTE (business-first scope): immigratiimprenditori.it is a
-- platform for enterprises, entrepreneurs, professionals, economic
-- opportunities, collaborations and business services. Linguistic and
-- intercultural skills are a transversal capability that makes those
-- services more effective (working with international clients/suppliers,
-- exporting, trade fairs, paperwork, assisting foreign workers/clients,
-- dealing with institutions) - this is NOT a translation portal, an
-- interpreters marketplace, or a language-focused vertical. The catalog is
-- therefore deliberately kept proportionate: broad service families
-- relevant to businesses, not dozens of near-duplicate micro-services.
--
-- This is a curated, platform-managed catalog: it is not writable by
-- regular users, only readable when active. public.profile_language_services
-- references this table to describe which service(s) a profile actually
-- offers.
--
-- FUTURE MODULE (not implemented here): "Formazione e sicurezza sul lavoro
-- multilingue" will be a separate, autonomous domain (training courses,
-- workplace safety training, training sites/materials in multiple
-- languages, training bodies, qualified trainers, companies' training
-- requests) and must not be modeled as a linguistic service type. In that
-- future domain, language is an ATTRIBUTE of the training offer, not the
-- offer itself: e.g. "Corso sicurezza lavoratori rischio alto" with
-- available languages [italiano, arabo, francese] is correct; a
-- language_service_types row such as "Servizio linguistico: sicurezza sul
-- lavoro" would be incorrect and must be avoided. That future domain will
-- need to match a company's training request (e.g. "8 lavoratori da
-- formare, 5 di lingua araba, 3 di lingua francese") with training bodies,
-- qualified trainers, safety consultants and multilingual
-- professionals/mediators able to deliver it in the requested language -
-- none of this is created by the current migration.

create table public.language_service_types (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  category text not null,
  requires_language_pair boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint language_service_types_slug_not_blank_check check (length(trim(slug)) > 0),
  constraint language_service_types_name_not_blank_check check (length(trim(name)) > 0),
  constraint language_service_types_category_not_blank_check check (length(trim(category)) > 0),
  constraint language_service_types_sort_order_check check (sort_order >= 0)
);

comment on table public.language_service_types is
  'Platform-managed catalog of linguistic and intercultural service types useful to businesses (translation, interpreting, business mediation, institutional assistance, international business support, multimedia localization). Deliberately kept proportionate: the platform is business-centric, not a language-focused portal. Read-only for regular users; referenced by public.profile_language_services.';

comment on column public.language_service_types.slug is
  'Stable, technical, English identifier for the service type (e.g. sworn_translation). Used for lookups and integrations; uniqueness is case-insensitive (see the expression unique index below).';

comment on column public.language_service_types.name is
  'Italian display name of the service type, shown to end users (e.g. "Traduzione giurata").';

comment on column public.language_service_types.description is
  'Optional Italian description clarifying what the service type covers.';

comment on column public.language_service_types.category is
  'Stable grouping key for the service type. Preferred values: translation, interpreting, business_mediation, institutional_assistance, international_business, multimedia_localization, training_support. Not enforced by a CHECK so the taxonomy can evolve without a migration.';

comment on column public.language_service_types.requires_language_pair is
  'True when this service type is inherently defined between a source and a target language (e.g. translation, interpreting) and public.profile_language_services must therefore carry both languages. False when the service is not necessarily tied to a language pair (e.g. accompaniment, business consulting), in which case the language pair on public.profile_language_services is optional.';

comment on column public.language_service_types.is_active is
  'False hides the service type from public catalog listings and blocks new profile_language_services rows from referencing it.';

comment on column public.language_service_types.sort_order is
  'Manual display order for catalog listings, lower values first. Must be non-negative.';

-- Case-insensitive uniqueness on the technical slug (e.g. "Legal" and
-- "legal" collide), independent of the display name.
create unique index language_service_types_slug_idx on public.language_service_types (lower(trim(slug)));

-- Supports catalog browsing/filtering; mirrors the indexing pattern already
-- used on public.languages.
create index language_service_types_category_idx on public.language_service_types using btree (category);

create index language_service_types_is_active_idx on public.language_service_types using btree (is_active);

create index language_service_types_sort_order_idx on public.language_service_types using btree (sort_order);

alter table public.language_service_types enable row level security;

-- Anyone (anonymous or authenticated) can read active service types only.
-- This is a curated catalog: no insert/update/delete policies exist for
-- regular users; administration happens via the service role.
create policy "Public can view active service types"
  on public.language_service_types
  for select
  to public
  using (is_active = true);

grant select on public.language_service_types to anon, authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_language_service_types_updated_at ()
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

create trigger language_service_types_set_updated_at
before update on public.language_service_types
for each row
execute function public.set_language_service_types_updated_at ();

-- Intentionally proportionate: broad, business-relevant service families
-- rather than an exhaustive linguistic-portal catalog. Near-duplicate
-- micro-services (e.g. separate rows for website/software/e-commerce
-- localization) are merged into a single row.
insert into public.language_service_types (
  slug,
  name,
  description,
  category,
  requires_language_pair,
  sort_order
)
values
  -- Traduzione e documenti (translation)
  ('written_translation', 'Traduzione scritta', 'Traduzione scritta di documenti e contenuti da una lingua a un''altra.', 'translation', true, 10),
  ('technical_translation', 'Traduzione tecnica', 'Traduzione di manuali, schede tecniche e documentazione specialistica.', 'translation', true, 20),
  ('commercial_translation', 'Traduzione commerciale', 'Traduzione di materiali commerciali, offerte e comunicazioni con clienti e fornitori.', 'translation', true, 30),
  ('legal_translation', 'Traduzione giuridica', 'Traduzione di contratti, atti e documenti legali.', 'translation', true, 40),
  ('certified_translation', 'Traduzione certificata', 'Traduzione scritta accompagnata da una dichiarazione di conformità del traduttore.', 'translation', true, 50),
  ('sworn_translation', 'Traduzione giurata', 'Traduzione scritta con valore legale, resa ufficiale tramite giuramento in tribunale.', 'translation', true, 60),
  ('text_revision', 'Revisione testi', 'Revisione linguistica e stilistica di testi già scritti.', 'translation', false, 70),
  ('corporate_document_translation', 'Traduzione di documenti aziendali', 'Traduzione di documenti societari, bilanci, presentazioni e materiali interni all''impresa.', 'translation', true, 80),

  -- Interpretariato e incontri (interpreting)
  ('consecutive_interpreting', 'Interpretariato consecutivo', 'Interpretariato in cui l''interprete traduce dopo che l''oratore ha terminato un intervento.', 'interpreting', true, 90),
  ('simultaneous_interpreting', 'Interpretariato simultaneo', 'Interpretariato in tempo reale, generalmente con attrezzature dedicate.', 'interpreting', true, 100),
  ('liaison_interpreting', 'Interpretariato di trattativa', 'Interpretariato informale durante incontri di lavoro e negoziazioni.', 'interpreting', true, 110),
  ('remote_interpreting', 'Interpretariato da remoto', 'Interpretariato fornito a distanza tramite piattaforme digitali.', 'interpreting', true, 120),
  ('trade_fair_conference_interpreting', 'Interpretariato durante fiere e convegni', 'Interpretariato per fiere, convegni ed eventi pubblici o commerciali.', 'interpreting', true, 130),
  ('judicial_institutional_interpreting', 'Interpretariato giudiziario e istituzionale', 'Interpretariato durante procedimenti giudiziari o rapporti con istituzioni pubbliche.', 'interpreting', true, 140),

  -- Mediazione e accompagnamento professionale, ramo commerciale (business_mediation)
  ('linguistic_cultural_mediation', 'Mediazione linguistico-culturale', 'Mediazione che facilita la comunicazione linguistica e culturale tra le parti.', 'business_mediation', false, 150),
  ('commercial_mediation', 'Mediazione commerciale', 'Mediazione linguistica e culturale in trattative e rapporti commerciali.', 'business_mediation', false, 160),
  ('trade_fair_accompaniment', 'Accompagnamento in fiera', 'Accompagnamento linguistico durante fiere ed eventi espositivi.', 'business_mediation', false, 170),
  ('business_meeting_assistance', 'Assistenza durante incontri aziendali', 'Assistenza linguistica durante riunioni e incontri di lavoro.', 'business_mediation', false, 180),
  ('bank_accompaniment', 'Accompagnamento presso banche', 'Accompagnamento linguistico durante appuntamenti bancari.', 'business_mediation', false, 190),

  -- Mediazione e accompagnamento professionale, ramo istituzionale (institutional_assistance)
  ('notary_accompaniment', 'Accompagnamento presso notai', 'Accompagnamento linguistico durante appuntamenti notarili.', 'institutional_assistance', false, 200),
  ('court_accompaniment', 'Accompagnamento presso tribunali', 'Accompagnamento linguistico durante procedimenti o appuntamenti in tribunale.', 'institutional_assistance', false, 210),
  ('public_office_accompaniment', 'Accompagnamento presso uffici pubblici', 'Accompagnamento linguistico presso uffici della pubblica amministrazione.', 'institutional_assistance', false, 220),
  ('consulate_police_accompaniment', 'Accompagnamento presso consolati e questure', 'Accompagnamento linguistico presso consolati, ambasciate e questure.', 'institutional_assistance', false, 230),

  -- Internazionalizzazione (international_business)
  ('international_business_relations_assistance', 'Assistenza per relazioni commerciali internazionali', 'Assistenza linguistica nelle relazioni commerciali con partner internazionali.', 'international_business', false, 240),
  ('import_export_support', 'Supporto import-export', 'Supporto linguistico alle attività di importazione ed esportazione.', 'international_business', false, 250),
  ('intercultural_communication_support', 'Supporto alla comunicazione interculturale', 'Supporto nella gestione della comunicazione tra interlocutori di culture diverse.', 'international_business', false, 260),
  ('business_language_consulting', 'Consulenza linguistica per imprese', 'Consulenza per la scelta e la gestione dei servizi linguistici di un''impresa.', 'international_business', false, 270),
  ('foreign_client_supplier_meeting_support', 'Supporto per incontri con clienti e fornitori esteri', 'Supporto linguistico durante incontri con clienti e fornitori stranieri.', 'international_business', false, 280),

  -- Localizzazione multimediale (multimedia_localization)
  ('website_software_localization', 'Localizzazione siti web e software', 'Adattamento linguistico e culturale di siti web, software e applicazioni aziendali.', 'multimedia_localization', true, 290),
  ('transcription_subtitling', 'Trascrizione e sottotitolazione', 'Trascrizione di contenuti audio e video e creazione di sottotitoli.', 'multimedia_localization', false, 300);
