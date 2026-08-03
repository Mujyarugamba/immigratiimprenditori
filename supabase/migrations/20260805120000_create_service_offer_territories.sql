-- M3.1 — create service offer territories
-- Implements owned area-of-availability declarations for OffertaDiServizio:
--   public.service_offer_territories
-- (docs/architecture/migrations/servizi-migration-plan.md §12 M3.1;
--  docs/architecture/physical/domain-mapping/servizi.md §13, §23–§26;
--  docs/architecture/logical/servizi.md §16).
--
-- Explicitly out of scope: territories/countries catalog FK; FEV;
-- professional_served_territories duplication; service_requests coverage;
-- seed; policies; GRANT.

create table public.service_offer_territories (
  id uuid not null default gen_random_uuid (),
  service_offer_id uuid not null,
  country_ref text not null,
  territory_label text null,
  coverage_kind text not null default 'served',
  presence_mode text not null default 'unspecified',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_offer_territories_pkey primary key (id),
  constraint service_offer_territories_service_offer_id_fkey
    foreign key (service_offer_id)
    references public.service_offers (id)
    on update no action
    on delete cascade,
  constraint service_offer_territories_uidx unique (
    service_offer_id,
    country_ref,
    coverage_kind
  ),
  constraint svc_offer_terr_country_ref_not_blank_check check (
    length(btrim(country_ref)) > 0
  ),
  constraint svc_offer_terr_territory_label_check check (
    territory_label is null
    or length(btrim(territory_label)) > 0
  ),
  constraint svc_offer_terr_coverage_kind_check check (
    coverage_kind in ('served', 'primary', 'both')
  ),
  constraint svc_offer_terr_presence_mode_check check (
    presence_mode in ('in_person', 'remote', 'hybrid', 'unspecified')
  ),
  constraint svc_offer_terr_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.service_offer_territories is
  'Owned Entity of service_offers: declared availability area for an OffertaDiServizio. country_ref is opaque (no geographic FK). Distinct from professional_served_territories and business_services.served_territory. ON DELETE CASCADE from the offer.';

comment on column public.service_offer_territories.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.service_offer_territories.service_offer_id is
  'Owning Aggregate Root (public.service_offers). NOT NULL. ON DELETE CASCADE.';

comment on column public.service_offer_territories.country_ref is
  'Opaque country reference (platform convention; typically ISO 3166-1 alpha-2). Required and non-blank. Not a FK to territories/countries.';

comment on column public.service_offer_territories.territory_label is
  'Optional descriptive sub-area label. Nullable; blank rejected when present.';

comment on column public.service_offer_territories.coverage_kind is
  'Closed coverage role: served | primary | both. Default served. Part of UNIQUE with country_ref.';

comment on column public.service_offer_territories.presence_mode is
  'Closed presence mode: in_person | remote | hybrid | unspecified. Default unspecified.';

comment on column public.service_offer_territories.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.service_offer_territories.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_offer_territories.updated_at is
  'Last update timestamp. Maintained by service_offer_territories_set_updated_at.';

create index svc_offer_terr_service_offer_id_idx
  on public.service_offer_territories (service_offer_id);

create index svc_offer_terr_country_ref_idx
  on public.service_offer_territories (country_ref);

alter table public.service_offer_territories enable row level security;

revoke all on table public.service_offer_territories from public;
revoke all on table public.service_offer_territories from anon, authenticated;

create or replace function public.set_service_offer_territories_updated_at ()
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

comment on function public.set_service_offer_territories_updated_at () is
  'BEFORE UPDATE trigger function for public.service_offer_territories. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger service_offer_territories_set_updated_at
before update on public.service_offer_territories
for each row
execute function public.set_service_offer_territories_updated_at ();
