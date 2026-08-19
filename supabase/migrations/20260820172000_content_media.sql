begin;

create table public.content_media (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  media_kind text not null check (media_kind in ('video','audio','image','document')),
  provider text null check (provider is null or provider in ('youtube','vimeo','external')),
  external_id text null check (external_id is null or length(btrim(external_id)) > 0),
  url text null check (url is null or url ~ '^https://'),
  title text null check (title is null or length(btrim(title)) > 0),
  caption text null check (caption is null or length(btrim(caption)) > 0),
  rights_note text null check (rights_note is null or length(btrim(rights_note)) > 0),
  is_primary boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (url is not null or external_id is not null),
  check (provider <> 'youtube' or external_id ~ '^[A-Za-z0-9_-]{6,32}$')
);

create index content_media_content_idx on public.content_media(content_id, sort_order);
create unique index content_media_one_primary_uidx
  on public.content_media(content_id)
  where is_primary;

create trigger content_media_set_updated_at
before update on public.content_media
for each row execute function public.set_updated_at();

alter table public.content_media enable row level security;

create policy content_media_public_read on public.content_media
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

create policy content_media_editor_all on public.content_media
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

grant select on public.content_media to anon, authenticated;
grant insert, update, delete on public.content_media to authenticated;

commit;
