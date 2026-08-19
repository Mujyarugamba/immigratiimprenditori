create table public.content_observatory_indicator_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  indicator_id uuid not null references public.observatory_indicators(id) on delete restrict,
  relation_kind text not null default 'evidence' check (relation_kind in ('evidence','context','comparison')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id, indicator_id, relation_kind)
);

alter table public.content_observatory_indicator_links enable row level security;

create policy content_observatory_indicator_links_public_read
on public.content_observatory_indicator_links
for select
to anon, authenticated
using (
  exists (
    select 1 from public.contents c
    where c.id = content_id
      and c.publication_status = 'published'
      and c.visibility_status = 'public'
      and c.archived_at is null
  )
  and exists (
    select 1 from public.observatory_indicators i
    where i.id = indicator_id
      and i.publication_status = 'published'
  )
);

create policy content_observatory_indicator_links_editor_all
on public.content_observatory_indicator_links
for all
to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

revoke all on table public.content_observatory_indicator_links from public, anon, authenticated;
grant select on table public.content_observatory_indicator_links to anon, authenticated;
grant insert, update, delete on table public.content_observatory_indicator_links to authenticated;

create index content_observatory_indicator_links_content_idx on public.content_observatory_indicator_links(content_id);
create index content_observatory_indicator_links_indicator_idx on public.content_observatory_indicator_links(indicator_id);

create trigger content_observatory_indicator_links_set_updated_at
before update on public.content_observatory_indicator_links
for each row execute function public.set_updated_at();
