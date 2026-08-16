-- M5.3 — create service request sectors
-- Implements owned sector links for RichiestaDiServizio:
--   public.service_request_sectors
-- (docs/architecture/migrations/servizi-migration-plan.md §14 M5.3;
--  docs/architecture/physical/domain-mapping/servizi.md §17, §23–§26).
--
-- Explicitly out of scope: offer sectors polymorphism; seed; policies; GRANT.

create table public.service_request_sectors (
  id uuid not null default gen_random_uuid (),
  service_request_id uuid not null,
  sector_id bigint not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_request_sectors_pkey primary key (id),
  constraint service_request_sectors_service_request_id_fkey
    foreign key (service_request_id)
    references public.service_requests (id)
    on update no action
    on delete cascade,
  constraint service_request_sectors_sector_id_fkey
    foreign key (sector_id)
    references public.business_sectors (id)
    on update no action
    on delete restrict,
  constraint service_request_sectors_uidx unique (
    service_request_id,
    sector_id
  ),
  constraint svc_req_sectors_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.service_request_sectors is
  'Owned Entity of service_requests: optional economic sectors for a RichiestaDiServizio. Twin of service_offer_sectors. sector_id bigint FK to business_sectors. ON DELETE CASCADE from the request.';

comment on column public.service_request_sectors.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.service_request_sectors.service_request_id is
  'Owning Aggregate Root (public.service_requests). NOT NULL. ON DELETE CASCADE.';

comment on column public.service_request_sectors.sector_id is
  'FK to public.business_sectors(id) bigint. ON DELETE RESTRICT.';

comment on column public.service_request_sectors.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.service_request_sectors.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_request_sectors.updated_at is
  'Last update timestamp. Maintained by service_request_sectors_set_updated_at.';

create index svc_req_sectors_service_request_id_idx
  on public.service_request_sectors (service_request_id);

create index svc_req_sectors_sector_id_idx
  on public.service_request_sectors (sector_id);

alter table public.service_request_sectors enable row level security;

revoke all on table public.service_request_sectors from public;
revoke all on table public.service_request_sectors from anon, authenticated;

create or replace function public.set_service_request_sectors_updated_at ()
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

comment on function public.set_service_request_sectors_updated_at () is
  'BEFORE UPDATE trigger function for public.service_request_sectors. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger service_request_sectors_set_updated_at
before update on public.service_request_sectors
for each row
execute function public.set_service_request_sectors_updated_at ();
