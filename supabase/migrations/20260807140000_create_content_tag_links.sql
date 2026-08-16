-- M3.2 — create content tag links
-- Implements owned tag associations of Contenuti:
--   public.content_tag_links
-- (docs/architecture/migrations/contenuti-migration-plan.md §12 M3.2;
--  docs/architecture/physical/domain-mapping/contenuti.md §11.2, §29–§32;
--  docs/architecture/logical/contenuti.md).

create table public.content_tag_links (
  id uuid not null default gen_random_uuid (),
  content_id uuid not null,
  tag_code text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_tag_links_pkey primary key (id),
  constraint content_tag_links_content_id_fkey
    foreign key (content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_tag_links_tag_code_fkey
    foreign key (tag_code)
    references public.content_tags (code)
    on update cascade
    on delete restrict,
  constraint content_tag_links_uidx unique (content_id, tag_code),
  constraint content_tag_links_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.content_tag_links is
  'Owned Entity of contents: association of a content sheet to a content_tags catalog value. ON DELETE CASCADE from contents; ON DELETE RESTRICT on tag_code. Not a free-text hashtag store.';

comment on column public.content_tag_links.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.content_tag_links.content_id is
  'Owning Aggregate Root (public.contents). NOT NULL. ON DELETE CASCADE.';

comment on column public.content_tag_links.tag_code is
  'FK to content_tags(code). ON UPDATE CASCADE; ON DELETE RESTRICT.';

comment on column public.content_tag_links.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.content_tag_links.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_tag_links.updated_at is
  'Last update timestamp. Maintained by content_tag_links_set_updated_at.';

create index content_tag_links_content_id_idx
  on public.content_tag_links (content_id);

create index content_tag_links_tag_code_idx
  on public.content_tag_links (tag_code);

alter table public.content_tag_links enable row level security;

revoke all on table public.content_tag_links from public;
revoke all on table public.content_tag_links from anon, authenticated;

create or replace function public.set_content_tag_links_updated_at ()
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

comment on function public.set_content_tag_links_updated_at () is
  'BEFORE UPDATE trigger function for public.content_tag_links. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger content_tag_links_set_updated_at
before update on public.content_tag_links
for each row
execute function public.set_content_tag_links_updated_at ();
