-- M5.1 — create service request territories
-- Implements owned area declarations for RichiestaDiServizio:
--   public.service_request_territories
-- (docs/architecture/migrations/servizi-migration-plan.md §14 M5.1;
--  docs/architecture/physical/domain-mapping/servizi.md §14, §23–§26).
--
-- Explicitly out of scope: geographic catalog FK; offer territories table
-- polymorphism; seed; policies; GRANT.

create table public.service_request_territories (
  id uuid not null default gen_random_uuid (),
  service_request_id uuid not null,
  country_ref text not null,
  territory_label text null,
  coverage_kind text not null default 'served',
  presence_mode text not null default 'unspecified',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_request_territories_pkey primary key (id),
  constraint service_request_territories_service_request_id_fkey
    foreign key (service_request_id)
    references public.service_requests (id)
    on update no action
    on delete cascade,
  constraint service_request_territories_uidx unique (
    service_request_id,
    country_ref,
    coverage_kind
  ),
  constraint svc_req_terr_country_ref_not_blank_check check (
    length(btrim(country_ref)) > 0
  ),
  constraint svc_req_terr_territory_label_check check (
    territory_label is null
    or length(btrim(territory_label)) > 0
  ),
  constraint svc_req_terr_coverage_kind_check check (
    coverage_kind in ('served', 'primary', 'both')
  ),
  constraint svc_req_terr_presence_mode_check check (
    presence_mode in ('in_person', 'remote', 'hybrid', 'unspecified')
  ),
  constraint svc_req_terr_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.service_request_territories is
  'Owned Entity of service_requests: declared area for a RichiestaDiServizio. Twin of service_offer_territories with distinct ownership. country_ref opaque. ON DELETE CASCADE from the request.';

comment on column public.service_request_territories.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.service_request_territories.service_request_id is
  'Owning Aggregate Root (public.service_requests). NOT NULL. ON DELETE CASCADE.';

comment on column public.service_request_territories.country_ref is
  'Opaque country reference. Required and non-blank. Not a geographic FK.';

comment on column public.service_request_territories.territory_label is
  'Optional descriptive sub-area label. Nullable; blank rejected when present.';

comment on column public.service_request_territories.coverage_kind is
  'Closed coverage role: served | primary | both. Default served.';

comment on column public.service_request_territories.presence_mode is
  'Closed presence mode: in_person | remote | hybrid | unspecified. Default unspecified.';

comment on column public.service_request_territories.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.service_request_territories.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_request_territories.updated_at is
  'Last update timestamp. Maintained by service_request_territories_set_updated_at.';

create index svc_req_terr_service_request_id_idx
  on public.service_request_territories (service_request_id);

create index svc_req_terr_country_ref_idx
  on public.service_request_territories (country_ref);

alter table public.service_request_territories enable row level security;

revoke all on table public.service_request_territories from public;
revoke all on table public.service_request_territories from anon, authenticated;

create or replace function public.set_service_request_territories_updated_at ()
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

comment on function public.set_service_request_territories_updated_at () is
  'BEFORE UPDATE trigger function for public.service_request_territories. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger service_request_territories_set_updated_at
before update on public.service_request_territories
for each row
execute function public.set_service_request_territories_updated_at ();
