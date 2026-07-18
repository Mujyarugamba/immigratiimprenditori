-- Create public.business_sectors: a general-purpose catalog of economic
-- sectors for the whole platform, not specific to any single domain.
--
-- DESIGN NOTE: this table is intentionally created as a shared,
-- platform-wide catalog rather than a training-only lookup. At the time of
-- writing there is no dedicated "enterprises" database table yet (business
-- profiles are only represented as static demo content in the frontend),
-- so business_sectors currently has no other referencing table besides the
-- training module (public.training_offer_sectors). It is designed from the
-- start to be reused later by enterprises, opportunities, professionals and
-- observatory/statistics features once those domains get their own
-- tables, instead of duplicating a sector list per domain.

create table public.business_sectors (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_sectors_slug_not_blank_check check (length(trim(slug)) > 0),
  constraint business_sectors_name_not_blank_check check (length(trim(name)) > 0),
  constraint business_sectors_sort_order_check check (sort_order >= 0)
);

comment on table public.business_sectors is
  'Platform-wide catalog of economic sectors (construction, logistics, manufacturing, agriculture, etc.), shared across domains. Currently linked from public.training_offer_sectors; intended to be reused later by enterprises, opportunities, professionals and observatory/statistics features rather than duplicated per domain.';

comment on column public.business_sectors.slug is
  'Stable, technical, English identifier for the sector (e.g. construction). Used for lookups and integrations; uniqueness is case-insensitive (see the expression unique index below).';

comment on column public.business_sectors.name is
  'Italian display name of the sector, shown to end users (e.g. "Edilizia").';

comment on column public.business_sectors.description is
  'Optional Italian description clarifying the scope of the sector.';

comment on column public.business_sectors.is_active is
  'False hides the sector from public catalog listings and blocks new links from referencing it.';

comment on column public.business_sectors.sort_order is
  'Manual display order for catalog listings, lower values first. Must be non-negative.';

-- Case-insensitive uniqueness on the technical slug (e.g. "Construction" and
-- "construction" collide), independent of the display name.
create unique index business_sectors_slug_idx on public.business_sectors (lower(trim(slug)));

create index business_sectors_is_active_idx on public.business_sectors using btree (is_active);

create index business_sectors_sort_order_idx on public.business_sectors using btree (sort_order);

alter table public.business_sectors enable row level security;

-- Anyone (anonymous or authenticated) can read active sectors only. This is
-- a curated catalog: no insert/update/delete policies exist for regular
-- users; administration happens via the service role.
create policy "Public can view active business sectors"
  on public.business_sectors
  for select
  to public
  using (is_active = true);

grant select on public.business_sectors to anon, authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_business_sectors_updated_at ()
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

create trigger business_sectors_set_updated_at
before update on public.business_sectors
for each row
execute function public.set_business_sectors_updated_at ();

insert into public.business_sectors (
  slug,
  name,
  description,
  sort_order
)
values
  ('construction', 'Edilizia', 'Costruzioni, ristrutturazioni e opere edili.', 10),
  ('building_systems', 'Impiantistica', 'Installazione e manutenzione di impianti elettrici, idraulici e termici.', 20),
  ('maintenance', 'Manutenzione', 'Manutenzione di edifici, impianti e attrezzature.', 30),
  ('facility_management', 'Facility management', 'Gestione integrata di servizi e spazi per imprese ed enti.', 40),
  ('cleaning', 'Pulizie', 'Servizi di pulizia e sanificazione per imprese ed edifici.', 50),
  ('logistics', 'Logistica', 'Gestione di magazzini, movimentazione merci e distribuzione.', 60),
  ('transport', 'Trasporti', 'Trasporto merci e persone su strada e altre modalità.', 70),
  ('manufacturing', 'Manifattura', 'Produzione e lavorazione di beni manifatturieri.', 80),
  ('industry', 'Industria', 'Attività industriali e di processo.', 90),
  ('agriculture', 'Agricoltura', 'Attività agricole, zootecniche e di lavorazione dei prodotti agricoli.', 100),
  ('food_service', 'Ristorazione', 'Ristoranti, catering e servizi di ristorazione.', 110),
  ('commerce', 'Commercio', 'Commercio all''ingrosso e al dettaglio.', 120),
  ('personal_services', 'Servizi alla persona', 'Servizi assistenziali, di cura e di supporto alla persona.', 130);
