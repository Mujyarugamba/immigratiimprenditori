-- M5.3 — create content relations
-- Implements minimal related-content links of Contenuti:
--   public.content_relations
-- (docs/architecture/migrations/contenuti-migration-plan.md §14 M5.3;
--  docs/architecture/physical/domain-mapping/contenuti.md §26, §29–§32;
--  docs/architecture/logical/contenuti.md).
--
-- No advanced editorial graph / series. Closes SQL cycle 1 (12/12).

create table public.content_relations (
  id uuid not null default gen_random_uuid (),
  source_content_id uuid not null,
  target_content_id uuid not null,
  relation_kind text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_relations_pkey primary key (id),
  constraint content_relations_source_content_id_fkey
    foreign key (source_content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_relations_target_content_id_fkey
    foreign key (target_content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_relations_uidx unique (source_content_id, target_content_id, relation_kind),
  constraint content_relations_no_self_check check (
    source_content_id <> target_content_id
  ),
  constraint content_relations_relation_kind_check check (
    relation_kind in ('related', 'follow_up', 'recommended')
  ),
  constraint content_relations_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.content_relations is
  'Owned Entity of contents: minimal directed related-content link. source and target CASCADE from contents. Self-relation forbidden. Not an advanced editorial graph, series, or recommendation engine.';

comment on column public.content_relations.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.content_relations.source_content_id is
  'Source Contenuto (public.contents). NOT NULL. ON DELETE CASCADE.';

comment on column public.content_relations.target_content_id is
  'Target Contenuto (public.contents). NOT NULL. Must differ from source. ON DELETE CASCADE.';

comment on column public.content_relations.relation_kind is
  'Closed relation: related | follow_up | recommended.';

comment on column public.content_relations.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.content_relations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_relations.updated_at is
  'Last update timestamp. Maintained by content_relations_set_updated_at.';

create index content_relations_source_content_id_idx
  on public.content_relations (source_content_id);

create index content_relations_target_content_id_idx
  on public.content_relations (target_content_id);

alter table public.content_relations enable row level security;

revoke all on table public.content_relations from public;
revoke all on table public.content_relations from anon, authenticated;

create or replace function public.set_content_relations_updated_at ()
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

comment on function public.set_content_relations_updated_at () is
  'BEFORE UPDATE trigger function for public.content_relations. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger content_relations_set_updated_at
before update on public.content_relations
for each row
execute function public.set_content_relations_updated_at ();
