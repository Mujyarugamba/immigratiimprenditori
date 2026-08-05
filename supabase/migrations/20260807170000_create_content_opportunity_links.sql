-- M4.3 — create content opportunity links
-- Implements typed Opportunità object links of Contenuti:
--   public.content_opportunity_links
-- (docs/architecture/migrations/contenuti-migration-plan.md §13 M4.3;
--  docs/architecture/physical/domain-mapping/contenuti.md §22, §29–§32;
--  docs/architecture/logical/contenuti.md).
--
-- Does not duplicate requirements, deadlines, or Opportunità lifecycle.

create table public.content_opportunity_links (
  id uuid not null default gen_random_uuid (),
  content_id uuid not null,
  opportunity_id uuid not null,
  relation_kind text not null default 'presents',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_opportunity_links_pkey primary key (id),
  constraint content_opportunity_links_content_id_fkey
    foreign key (content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_opportunity_links_opportunity_id_fkey
    foreign key (opportunity_id)
    references public.opportunities (id)
    on update no action
    on delete restrict,
  constraint content_opportunity_links_uidx unique (content_id, opportunity_id),
  constraint content_opportunity_links_relation_kind_check check (
    relation_kind in ('presents', 'guide', 'related')
  ),
  constraint content_opportunity_links_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.content_opportunity_links is
  'Owned Entity of contents: typed link from Contenuto to Opportunità (opportunities). Does not duplicate requirements, deadlines, or Opportunità lifecycle. ON DELETE CASCADE from contents; ON DELETE RESTRICT on opportunities.';

comment on column public.content_opportunity_links.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.content_opportunity_links.content_id is
  'Owning Aggregate Root (public.contents). NOT NULL. ON DELETE CASCADE.';

comment on column public.content_opportunity_links.opportunity_id is
  'FK to public.opportunities(id) uuid. ON DELETE RESTRICT. Not ownership of Opportunità.';

comment on column public.content_opportunity_links.relation_kind is
  'Closed relation: presents | guide | related. Default presents.';

comment on column public.content_opportunity_links.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.content_opportunity_links.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_opportunity_links.updated_at is
  'Last update timestamp. Maintained by content_opportunity_links_set_updated_at.';

create index content_opportunity_links_content_id_idx
  on public.content_opportunity_links (content_id);

create index content_opportunity_links_opportunity_id_idx
  on public.content_opportunity_links (opportunity_id);

alter table public.content_opportunity_links enable row level security;

revoke all on table public.content_opportunity_links from public;
revoke all on table public.content_opportunity_links from anon, authenticated;

create or replace function public.set_content_opportunity_links_updated_at ()
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

comment on function public.set_content_opportunity_links_updated_at () is
  'BEFORE UPDATE trigger function for public.content_opportunity_links. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger content_opportunity_links_set_updated_at
before update on public.content_opportunity_links
for each row
execute function public.set_content_opportunity_links_updated_at ();
