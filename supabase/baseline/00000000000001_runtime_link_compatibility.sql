-- SPLIT-3B runtime compatibility patch — ImmigratiImprenditori
-- Apply after 00000000000000_baseline_immigratiimprenditori.sql on a fresh/local DB.
-- Cross-product identifiers are opaque UUID references only: no FK to PonteImprese.

begin;

create table public.content_event_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete restrict,
  relation_kind text not null default 'presents'
    check (relation_kind in ('presents','report','related')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id,event_id)
);

create table public.content_opportunity_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  opportunity_id uuid not null,
  relation_kind text not null default 'presents'
    check (relation_kind in ('presents','guide','related')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id,opportunity_id)
);

create table public.content_service_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  service_offer_id uuid,
  service_request_id uuid,
  relation_kind text not null default 'presents'
    check (relation_kind in ('presents','describes','related')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_service_links_target_xor_check check (
    (service_offer_id is not null and service_request_id is null)
    or (service_offer_id is null and service_request_id is not null)
  )
);

create table public.content_market_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  market_id uuid not null,
  relation_kind text not null default 'focus'
    check (relation_kind in ('focus','related','destination')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id,market_id)
);

create table public.event_markets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  market_id uuid not null,
  relation_kind text not null default 'focus'
    check (relation_kind in ('focus','related','destination')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id,market_id)
);

create trigger content_event_links_set_updated_at
before update on public.content_event_links
for each row execute function public.set_updated_at();
create trigger content_opportunity_links_set_updated_at
before update on public.content_opportunity_links
for each row execute function public.set_updated_at();
create trigger content_service_links_set_updated_at
before update on public.content_service_links
for each row execute function public.set_updated_at();
create trigger content_market_links_set_updated_at
before update on public.content_market_links
for each row execute function public.set_updated_at();
create trigger event_markets_set_updated_at
before update on public.event_markets
for each row execute function public.set_updated_at();

alter table public.content_event_links enable row level security;
alter table public.content_opportunity_links enable row level security;
alter table public.content_service_links enable row level security;
alter table public.content_market_links enable row level security;
alter table public.event_markets enable row level security;

create policy content_event_links_public_read on public.content_event_links
for select to anon,authenticated
using (exists (
  select 1 from public.contents c
  where c.id=content_id and c.publication_status='published' and c.visibility_status='public'
));
create policy content_event_links_editor_all on public.content_event_links
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_opportunity_links_public_read on public.content_opportunity_links
for select to anon,authenticated
using (exists (
  select 1 from public.contents c
  where c.id=content_id and c.publication_status='published' and c.visibility_status='public'
));
create policy content_opportunity_links_editor_all on public.content_opportunity_links
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_service_links_public_read on public.content_service_links
for select to anon,authenticated
using (exists (
  select 1 from public.contents c
  where c.id=content_id and c.publication_status='published' and c.visibility_status='public'
));
create policy content_service_links_editor_all on public.content_service_links
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_market_links_public_read on public.content_market_links
for select to anon,authenticated
using (exists (
  select 1 from public.contents c
  where c.id=content_id and c.publication_status='published' and c.visibility_status='public'
));
create policy content_market_links_editor_all on public.content_market_links
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_markets_public_read on public.event_markets
for select to anon,authenticated
using (exists (
  select 1 from public.events e
  where e.id=event_id and e.publication_status='published' and e.visibility_status='public'
));
create policy event_markets_editor_all on public.event_markets
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

grant select on public.content_event_links,public.content_opportunity_links,
  public.content_service_links,public.content_market_links,public.event_markets to anon;
grant select,insert,update,delete on public.content_event_links,public.content_opportunity_links,
  public.content_service_links,public.content_market_links,public.event_markets to authenticated;

commit;
