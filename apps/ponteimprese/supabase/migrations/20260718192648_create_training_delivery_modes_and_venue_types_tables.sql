-- Create public.training_delivery_modes and public.training_venue_types.
--
-- DESIGN NOTE (why two tables instead of one "delivery modes" list): the
-- originally proposed seed mixed two different concepts:
--   - HOW a course is delivered (in person, synchronous video conference,
--     e-learning, blended) - a property of the teaching format, and
--   - WHERE an in-person session physically takes place (at the training
--     provider's site, at the company's site, at a construction site) - a
--     property of the venue.
-- These are orthogonal: an "in person" delivery mode can happen at any of
-- several venue types, and fully remote modes (e-learning, synchronous
-- video conference) have no physical venue at all. Collapsing both into a
-- single catalog column would force an artificial one-to-one choice (e.g.
-- a provider could not say "in person, either at the company or at the
-- construction site" without duplicating rows). Two catalogs plus a
-- separate many-to-many bridge for venues (public.training_offer_venue_types,
-- created together with public.training_offers) is the more normalized
-- structure: a single training_offers row keeps one delivery_mode_id, but
-- can be linked to several venue types when relevant.

create table public.training_delivery_modes (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_delivery_modes_slug_not_blank_check check (length(trim(slug)) > 0),
  constraint training_delivery_modes_name_not_blank_check check (length(trim(name)) > 0),
  constraint training_delivery_modes_sort_order_check check (sort_order >= 0)
);

comment on table public.training_delivery_modes is
  'Catalog of training delivery formats (in person, synchronous video conference, e-learning, blended). Distinct from public.training_venue_types, which represents where an in-person session physically takes place. Read-only for regular users; referenced by public.training_offers.';

comment on column public.training_delivery_modes.slug is
  'Stable, technical, English identifier for the delivery mode (e.g. in_person). Uniqueness is case-insensitive (see the expression unique index below).';

comment on column public.training_delivery_modes.name is
  'Italian display name of the delivery mode, shown to end users (e.g. "In presenza").';

comment on column public.training_delivery_modes.description is
  'Optional Italian description clarifying the delivery mode.';

comment on column public.training_delivery_modes.is_active is
  'False hides the delivery mode from public catalog listings and blocks new training_offers rows from referencing it.';

comment on column public.training_delivery_modes.sort_order is
  'Manual display order for catalog listings, lower values first. Must be non-negative.';

create unique index training_delivery_modes_slug_idx on public.training_delivery_modes (lower(trim(slug)));

create index training_delivery_modes_is_active_idx on public.training_delivery_modes using btree (is_active);

create index training_delivery_modes_sort_order_idx on public.training_delivery_modes using btree (sort_order);

alter table public.training_delivery_modes enable row level security;

create policy "Public can view active delivery modes"
  on public.training_delivery_modes
  for select
  to public
  using (is_active = true);

grant select on public.training_delivery_modes to anon, authenticated;

create or replace function public.set_training_delivery_modes_updated_at ()
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

create trigger training_delivery_modes_set_updated_at
before update on public.training_delivery_modes
for each row
execute function public.set_training_delivery_modes_updated_at ();

insert into public.training_delivery_modes (
  slug,
  name,
  description,
  sort_order
)
values
  ('in_person', 'In presenza', 'Corso erogato con presenza fisica di docente e partecipanti nello stesso luogo.', 10),
  ('synchronous_video_conference', 'Videoconferenza sincrona', 'Corso erogato in diretta a distanza tramite piattaforma di videoconferenza.', 20),
  ('e_learning', 'E-learning', 'Corso erogato tramite piattaforma digitale, fruibile in autonomia dai partecipanti.', 30),
  ('blended', 'Modalità mista', 'Corso che combina sessioni in presenza e sessioni a distanza o in e-learning.', 40);

create table public.training_venue_types (
  id bigint generated always as identity primary key,
  slug text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_venue_types_slug_not_blank_check check (length(trim(slug)) > 0),
  constraint training_venue_types_name_not_blank_check check (length(trim(name)) > 0),
  constraint training_venue_types_sort_order_check check (sort_order >= 0)
);

comment on table public.training_venue_types is
  'Catalog of physical venue types where an in-person or blended training session can take place (provider''s site, company''s site, construction site). Distinct from public.training_delivery_modes. Read-only for regular users; referenced by public.training_offer_venue_types.';

comment on column public.training_venue_types.slug is
  'Stable, technical, English identifier for the venue type (e.g. company_site). Uniqueness is case-insensitive (see the expression unique index below).';

comment on column public.training_venue_types.name is
  'Italian display name of the venue type, shown to end users (e.g. "Sede dell''impresa").';

comment on column public.training_venue_types.description is
  'Optional Italian description clarifying the venue type.';

comment on column public.training_venue_types.is_active is
  'False hides the venue type from public catalog listings and blocks new training_offer_venue_types rows from referencing it.';

comment on column public.training_venue_types.sort_order is
  'Manual display order for catalog listings, lower values first. Must be non-negative.';

create unique index training_venue_types_slug_idx on public.training_venue_types (lower(trim(slug)));

create index training_venue_types_is_active_idx on public.training_venue_types using btree (is_active);

create index training_venue_types_sort_order_idx on public.training_venue_types using btree (sort_order);

alter table public.training_venue_types enable row level security;

create policy "Public can view active venue types"
  on public.training_venue_types
  for select
  to public
  using (is_active = true);

grant select on public.training_venue_types to anon, authenticated;

create or replace function public.set_training_venue_types_updated_at ()
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

create trigger training_venue_types_set_updated_at
before update on public.training_venue_types
for each row
execute function public.set_training_venue_types_updated_at ();

insert into public.training_venue_types (
  slug,
  name,
  description,
  sort_order
)
values
  ('provider_site', 'Sede dell''ente formatore', 'Il corso in presenza si svolge presso la sede del formatore o dell''ente.', 10),
  ('company_site', 'Sede dell''impresa', 'Il corso in presenza si svolge presso la sede dell''impresa richiedente.', 20),
  ('construction_site', 'Cantiere', 'Il corso in presenza si svolge direttamente presso il cantiere.', 30);
