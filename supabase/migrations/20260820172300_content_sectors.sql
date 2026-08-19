begin;

create table public.content_sectors (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  business_sector_id bigint not null references public.business_sectors(id) on delete restrict,
  relation_kind text not null default 'focus' check (relation_kind in ('focus','related')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id, business_sector_id, relation_kind)
);

create index content_sectors_sector_idx
  on public.content_sectors(business_sector_id, content_id);

create trigger content_sectors_set_updated_at
before update on public.content_sectors
for each row execute function public.set_updated_at();

alter table public.content_sectors enable row level security;

create policy content_sectors_public_read on public.content_sectors
for select using (
  exists (
    select 1
    from public.contents c
    where c.id = content_id
      and c.publication_status = 'published'
      and c.visibility_status = 'public'
      and c.archived_at is null
  )
);

create policy content_sectors_editor_all on public.content_sectors
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

revoke insert, update, delete, truncate, references, trigger
on table public.content_sectors
from anon;
revoke truncate, references, trigger
on table public.content_sectors
from authenticated;

grant select on table public.content_sectors to anon, authenticated;
grant insert, update, delete on table public.content_sectors to authenticated;

commit;
