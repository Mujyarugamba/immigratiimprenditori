-- M5.2 — create content market links
-- Implements typed international market context links of Contenuti:
--   public.content_market_links
-- (docs/architecture/migrations/contenuti-migration-plan.md §14 M5.2;
--  docs/architecture/physical/domain-mapping/contenuti.md §25, §29–§32;
--  docs/architecture/logical/contenuti.md).
--
-- Distinct from PresenzaDiMercato / InteresseDiMercato / Attività internazionale.

create table public.content_market_links (
  id uuid not null default gen_random_uuid (),
  content_id uuid not null,
  market_id uuid not null,
  relation_kind text not null default 'focus',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_market_links_pkey primary key (id),
  constraint content_market_links_content_id_fkey
    foreign key (content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_market_links_market_id_fkey
    foreign key (market_id)
    references public.international_markets (id)
    on update no action
    on delete restrict,
  constraint content_market_links_uidx unique (content_id, market_id),
  constraint content_market_links_relation_kind_check check (
    relation_kind in ('focus', 'related', 'destination')
  ),
  constraint content_market_links_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.content_market_links is
  'Owned Entity of contents: optional international market context for a Contenuto. market_id FK to international_markets. Distinct from PresenzaDiMercato, InteresseDiMercato, and Attività internazionale. ON DELETE CASCADE from contents; ON DELETE RESTRICT on markets.';

comment on column public.content_market_links.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.content_market_links.content_id is
  'Owning Aggregate Root (public.contents). NOT NULL. ON DELETE CASCADE.';

comment on column public.content_market_links.market_id is
  'FK to public.international_markets(id) uuid. ON DELETE RESTRICT.';

comment on column public.content_market_links.relation_kind is
  'Closed relation: focus | related | destination. Default focus.';

comment on column public.content_market_links.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.content_market_links.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_market_links.updated_at is
  'Last update timestamp. Maintained by content_market_links_set_updated_at.';

create index content_market_links_content_id_idx
  on public.content_market_links (content_id);

create index content_market_links_market_id_idx
  on public.content_market_links (market_id);

alter table public.content_market_links enable row level security;

revoke all on table public.content_market_links from public;
revoke all on table public.content_market_links from anon, authenticated;

create or replace function public.set_content_market_links_updated_at ()
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

comment on function public.set_content_market_links_updated_at () is
  'BEFORE UPDATE trigger function for public.content_market_links. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger content_market_links_set_updated_at
before update on public.content_market_links
for each row
execute function public.set_content_market_links_updated_at ();
