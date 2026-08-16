-- M5.1 — create content service links
-- Implements typed Servizi object links of Contenuti:
--   public.content_service_links
-- (docs/architecture/migrations/contenuti-migration-plan.md §14 M5.1;
--  docs/architecture/physical/domain-mapping/contenuti.md §20, §29–§32;
--  docs/architecture/logical/contenuti.md).
--
-- Exactly one of service_offer_id / service_request_id. Does not duplicate service sheets.

create table public.content_service_links (
  id uuid not null default gen_random_uuid (),
  content_id uuid not null,
  service_offer_id uuid null,
  service_request_id uuid null,
  relation_kind text not null default 'presents',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_service_links_pkey primary key (id),
  constraint content_service_links_content_id_fkey
    foreign key (content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_service_links_service_offer_id_fkey
    foreign key (service_offer_id)
    references public.service_offers (id)
    on update no action
    on delete restrict,
  constraint content_service_links_service_request_id_fkey
    foreign key (service_request_id)
    references public.service_requests (id)
    on update no action
    on delete restrict,
  constraint content_service_links_target_xor_check check (
    (
      service_offer_id is not null
      and service_request_id is null
    )
    or (
      service_offer_id is null
      and service_request_id is not null
    )
  ),
  constraint content_service_links_relation_kind_check check (
    relation_kind in ('presents', 'describes', 'related')
  ),
  constraint content_service_links_sort_order_check check (
    sort_order >= 0
  )
);

create unique index content_service_links_offer_uidx
  on public.content_service_links (content_id, service_offer_id)
  where service_offer_id is not null;

create unique index content_service_links_request_uidx
  on public.content_service_links (content_id, service_request_id)
  where service_request_id is not null;

comment on table public.content_service_links is
  'Owned Entity of contents: typed link from Contenuto to OffertaDiServizio or RichiestaDiServizio. Exactly one of service_offer_id / service_request_id. Does not duplicate service sheets. ON DELETE CASCADE from contents; ON DELETE RESTRICT on offers/requests.';

comment on column public.content_service_links.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.content_service_links.content_id is
  'Owning Aggregate Root (public.contents). NOT NULL. ON DELETE CASCADE.';

comment on column public.content_service_links.service_offer_id is
  'FK to public.service_offers(id) when linking an offer. XOR with service_request_id. ON DELETE RESTRICT.';

comment on column public.content_service_links.service_request_id is
  'FK to public.service_requests(id) when linking a request. XOR with service_offer_id. ON DELETE RESTRICT.';

comment on column public.content_service_links.relation_kind is
  'Closed relation: presents | describes | related. Default presents.';

comment on column public.content_service_links.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.content_service_links.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_service_links.updated_at is
  'Last update timestamp. Maintained by content_service_links_set_updated_at.';

create index content_service_links_content_id_idx
  on public.content_service_links (content_id);

create index content_service_links_service_offer_id_idx
  on public.content_service_links (service_offer_id)
  where service_offer_id is not null;

create index content_service_links_service_request_id_idx
  on public.content_service_links (service_request_id)
  where service_request_id is not null;

alter table public.content_service_links enable row level security;

revoke all on table public.content_service_links from public;
revoke all on table public.content_service_links from anon, authenticated;

create or replace function public.set_content_service_links_updated_at ()
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

comment on function public.set_content_service_links_updated_at () is
  'BEFORE UPDATE trigger function for public.content_service_links. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger content_service_links_set_updated_at
before update on public.content_service_links
for each row
execute function public.set_content_service_links_updated_at ();
