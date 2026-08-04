-- M5.2 — create event markets
-- Implements owned international market links for Evento:
--   public.event_markets
-- (docs/architecture/migrations/eventi-migration-plan.md §14 M5.2;
--  docs/architecture/physical/domain-mapping/eventi.md §23.1, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- Distinct from PresenzaDiMercato / InteresseDiMercato / Attività internazionale.

create table public.event_markets (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null,
  market_id uuid not null,
  relation_kind text not null default 'focus',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_markets_pkey primary key (id),
  constraint event_markets_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on update no action
    on delete cascade,
  constraint event_markets_market_id_fkey
    foreign key (market_id)
    references public.international_markets (id)
    on update no action
    on delete restrict,
  constraint event_markets_uidx unique (event_id, market_id),
  constraint event_markets_relation_kind_check check (
    relation_kind in ('focus', 'related', 'destination')
  ),
  constraint event_markets_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.event_markets is
  'Owned Entity of events: optional international market context for an Evento. market_id FK to international_markets. Distinct from PresenzaDiMercato, InteresseDiMercato, and Attività internazionale. ON DELETE CASCADE from events; ON DELETE RESTRICT on markets.';

comment on column public.event_markets.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.event_markets.event_id is
  'Owning Aggregate Root (public.events). NOT NULL. ON DELETE CASCADE.';

comment on column public.event_markets.market_id is
  'FK to public.international_markets(id) uuid. ON DELETE RESTRICT.';

comment on column public.event_markets.relation_kind is
  'Closed relation: focus | related | destination. Default focus.';

comment on column public.event_markets.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.event_markets.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_markets.updated_at is
  'Last update timestamp. Maintained by event_markets_set_updated_at.';

create index event_markets_event_id_idx
  on public.event_markets (event_id);

create index event_markets_market_id_idx
  on public.event_markets (market_id);

alter table public.event_markets enable row level security;

revoke all on table public.event_markets from public;
revoke all on table public.event_markets from anon, authenticated;

create or replace function public.set_event_markets_updated_at ()
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

comment on function public.set_event_markets_updated_at () is
  'BEFORE UPDATE trigger function for public.event_markets. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger event_markets_set_updated_at
before update on public.event_markets
for each row
execute function public.set_event_markets_updated_at ();
