-- Create public.language_service_specializations, the catalog of subject
-- areas a linguistic/intercultural service can be specialized in.
--
-- DESIGN NOTE (business-first scope): specializations are limited to
-- economic, professional and institutional sectors that are actually
-- relevant to businesses and professionals on immigratiimprenditori.it
-- (legal, commercial, real estate, construction, energy, import-export,
-- internationalization, etc.). Marginal or purely linguistic-portal
-- specializations (e.g. generic "technical", tourism, publishing,
-- journalism) are intentionally left out to keep the catalog proportionate
-- to a business platform rather than a language-services vertical.
--
-- A single service offered by a profile (public.profile_language_services)
-- can be tagged with several specializations via the bridge table
-- public.profile_language_service_specializations. This is a curated,
-- platform-managed catalog: it is not writable by regular users, only
-- readable when active.

create table public.language_service_specializations (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint language_service_specializations_slug_not_blank_check check (length(trim(slug)) > 0),
  constraint language_service_specializations_name_not_blank_check check (length(trim(name)) > 0),
  constraint language_service_specializations_sort_order_check check (sort_order >= 0)
);

comment on table public.language_service_specializations is
  'Platform-managed catalog of business-relevant subject-area specializations (legal, commercial, real estate, energy, import-export, internationalization, etc.) that a linguistic/intercultural service can be tagged with. Read-only for regular users; linked to public.profile_language_services through public.profile_language_service_specializations.';

comment on column public.language_service_specializations.slug is
  'Stable, technical, English identifier for the specialization (e.g. legal). Used for lookups and integrations; uniqueness is case-insensitive (see the expression unique index below).';

comment on column public.language_service_specializations.name is
  'Italian display name of the specialization, shown to end users (e.g. "Legale").';

comment on column public.language_service_specializations.description is
  'Optional Italian description clarifying the scope of the specialization.';

comment on column public.language_service_specializations.is_active is
  'False hides the specialization from public catalog listings and blocks new links from referencing it.';

comment on column public.language_service_specializations.sort_order is
  'Manual display order for catalog listings, lower values first. Must be non-negative.';

-- Case-insensitive uniqueness on the technical slug (e.g. "Legal" and
-- "legal" collide), independent of the display name.
create unique index language_service_specializations_slug_idx on public.language_service_specializations (lower(trim(slug)));

-- Supports catalog browsing/filtering; mirrors the indexing pattern already
-- used on public.languages and public.language_service_types.
create index language_service_specializations_is_active_idx on public.language_service_specializations using btree (is_active);

create index language_service_specializations_sort_order_idx on public.language_service_specializations using btree (sort_order);

alter table public.language_service_specializations enable row level security;

-- Anyone (anonymous or authenticated) can read active specializations only.
-- This is a curated catalog: no insert/update/delete policies exist for
-- regular users; administration happens via the service role.
create policy "Public can view active service specializations"
  on public.language_service_specializations
  for select
  to public
  using (is_active = true);

grant select on public.language_service_specializations to anon, authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_language_service_specializations_updated_at ()
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

create trigger language_service_specializations_set_updated_at
before update on public.language_service_specializations
for each row
execute function public.set_language_service_specializations_updated_at ();

insert into public.language_service_specializations (
  slug,
  name,
  description,
  sort_order
)
values
  ('legal', 'Legale', 'Ambito legale e giuridico.', 10),
  ('commercial', 'Commerciale', 'Ambito commerciale e di vendita.', 20),
  ('contracts', 'Contratti', 'Ambito contrattuale.', 30),
  ('public_procurement', 'Appalti', 'Ambito degli appalti pubblici.', 40),
  ('real_estate', 'Immobiliare', 'Ambito immobiliare.', 50),
  ('construction', 'Edilizia', 'Ambito edile e delle costruzioni.', 60),
  ('energy', 'Energia', 'Ambito energetico.', 70),
  ('environment', 'Ambiente', 'Ambito ambientale.', 80),
  ('industry', 'Industria', 'Ambito industriale.', 90),
  ('manufacturing', 'Manifattura', 'Ambito manifatturiero e produttivo.', 100),
  ('logistics', 'Logistica', 'Ambito logistico.', 110),
  ('transport', 'Trasporti', 'Ambito dei trasporti.', 120),
  ('import_export', 'Import-export', 'Ambito dell''import-export.', 130),
  ('internationalization', 'Internazionalizzazione', 'Ambito dell''internazionalizzazione d''impresa.', 140),
  ('financial', 'Finanziario', 'Ambito finanziario.', 150),
  ('banking', 'Bancario', 'Ambito bancario.', 160),
  ('tax', 'Fiscale', 'Ambito fiscale e tributario.', 170),
  ('administrative', 'Amministrativo', 'Ambito amministrativo.', 180),
  ('information_technology', 'Informatica', 'Ambito informatico e digitale.', 190),
  ('telecommunications', 'Telecomunicazioni', 'Ambito delle telecomunicazioni.', 200),
  ('marketing', 'Marketing', 'Ambito del marketing.', 210),
  ('audiovisual', 'Audiovisivo', 'Ambito audiovisivo e dei media.', 220),
  ('healthcare', 'Sanitario', 'Ambito sanitario e dell''assistenza alla persona.', 230),
  ('institutional', 'Istituzionale', 'Ambito istituzionale.', 240),
  ('immigration', 'Immigrazione', 'Ambito dell''immigrazione.', 250),
  ('citizenship', 'Cittadinanza', 'Ambito della cittadinanza.', 260),
  ('notarial', 'Notarile', 'Ambito notarile.', 270),
  ('judicial', 'Giudiziario', 'Ambito giudiziario.', 280),
  ('trade_fairs', 'Fieristico', 'Ambito fieristico ed espositivo.', 290);
