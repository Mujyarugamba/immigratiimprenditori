-- M3.4 — create service offer markets
-- Implements owned international market links for OffertaDiServizio:
--   public.service_offer_markets
-- (docs/architecture/migrations/servizi-migration-plan.md §12 M3.4;
--  docs/architecture/physical/domain-mapping/servizi.md §22.1, §23–§26).
--
-- Explicitly out of scope: PresenzaDiMercato / InteresseDiMercato / Attività;
-- markets on service_requests (cycle 1); seed; policies; GRANT.

create table public.service_offer_markets (
  id uuid not null default gen_random_uuid (),
  service_offer_id uuid not null,
  market_id uuid not null,
  relation_kind text not null default 'served',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_offer_markets_pkey primary key (id),
  constraint service_offer_markets_service_offer_id_fkey
    foreign key (service_offer_id)
    references public.service_offers (id)
    on update no action
    on delete cascade,
  constraint service_offer_markets_market_id_fkey
    foreign key (market_id)
    references public.international_markets (id)
    on update no action
    on delete restrict,
  constraint service_offer_markets_uidx unique (service_offer_id, market_id),
  constraint svc_offer_markets_relation_kind_check check (
    relation_kind in ('served', 'supported', 'target')
  ),
  constraint svc_offer_markets_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.service_offer_markets is
  'Owned Entity of service_offers: optional international market context for an OffertaDiServizio. market_id FK to international_markets. Distinct from PresenzaDiMercato, InteresseDiMercato, and Attività internazionale. Cycle 1: offers only (no request markets table). ON DELETE CASCADE from the offer.';

comment on column public.service_offer_markets.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.service_offer_markets.service_offer_id is
  'Owning Aggregate Root (public.service_offers). NOT NULL. ON DELETE CASCADE.';

comment on column public.service_offer_markets.market_id is
  'FK to public.international_markets(id) uuid. ON DELETE RESTRICT.';

comment on column public.service_offer_markets.relation_kind is
  'Closed relation: served | supported | target. Default served.';

comment on column public.service_offer_markets.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.service_offer_markets.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.service_offer_markets.updated_at is
  'Last update timestamp. Maintained by service_offer_markets_set_updated_at.';

create index svc_offer_markets_service_offer_id_idx
  on public.service_offer_markets (service_offer_id);

create index svc_offer_markets_market_id_idx
  on public.service_offer_markets (market_id);

alter table public.service_offer_markets enable row level security;

revoke all on table public.service_offer_markets from public;
revoke all on table public.service_offer_markets from anon, authenticated;

create or replace function public.set_service_offer_markets_updated_at ()
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

comment on function public.set_service_offer_markets_updated_at () is
  'BEFORE UPDATE trigger function for public.service_offer_markets. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger service_offer_markets_set_updated_at
before update on public.service_offer_markets
for each row
execute function public.set_service_offer_markets_updated_at ();
