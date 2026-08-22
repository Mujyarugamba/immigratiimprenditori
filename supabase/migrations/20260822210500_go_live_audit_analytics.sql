-- Immigrati Imprenditori — go-live audit + privacy-friendly analytics
-- Additive migration. Validated locally before any production application.

begin;

-- ---------------------------------------------------------------------------
-- Editorial content audit log
-- ---------------------------------------------------------------------------
-- Keep immutable operational facts without copying editorial body text into the
-- audit trail. Content IDs/slugs are snapshots rather than FKs so deletion does
-- not erase the audit history.
create table if not exists public.editorial_content_activity (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null,
  content_slug text null,
  actor_account_id uuid null references public.accounts(id) on delete set null,
  action text not null check (action in (
    'created','updated','status_changed','published','withdrawn','deleted'
  )),
  changes jsonb not null default '{}'::jsonb
    check (jsonb_typeof(changes) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists editorial_content_activity_content_idx
  on public.editorial_content_activity(content_id, created_at desc);
create index if not exists editorial_content_activity_actor_idx
  on public.editorial_content_activity(actor_account_id, created_at desc)
  where actor_account_id is not null;
create index if not exists editorial_content_activity_action_idx
  on public.editorial_content_activity(action, created_at desc);

alter table public.editorial_content_activity enable row level security;

drop policy if exists editorial_content_activity_editor_read
  on public.editorial_content_activity;
create policy editorial_content_activity_editor_read
on public.editorial_content_activity
for select
to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

grant select on public.editorial_content_activity to authenticated;
revoke all on public.editorial_content_activity from anon;

create or replace function public.log_editorial_content_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  v_new jsonb := case when tg_op = 'DELETE' then '{}'::jsonb else to_jsonb(new) end;
  v_fields jsonb := '[]'::jsonb;
  v_action text;
  v_actor uuid;
  v_content_id uuid;
  v_slug text;
begin
  v_content_id := coalesce(
    nullif(v_new ->> 'id', '')::uuid,
    nullif(v_old ->> 'id', '')::uuid
  );
  v_slug := coalesce(v_new ->> 'slug', v_old ->> 'slug');

  if tg_op = 'INSERT' then
    v_action := 'created';
    v_fields := '["created"]'::jsonb;
  elsif tg_op = 'DELETE' then
    v_action := 'deleted';
    v_fields := '["deleted"]'::jsonb;
  else
    select coalesce(jsonb_agg(k order by k), '[]'::jsonb)
      into v_fields
    from unnest(array[
      'title','slug','subtitle','abstract','body','language_id',
      'primary_category_code','is_featured','editorial_status',
      'publication_status','visibility_status','published_at',
      'withdrawn_at','archived_at'
    ]) as k
    where (v_old -> k) is distinct from (v_new -> k);

    -- Ignore updates that only touch bookkeeping columns such as updated_at.
    if jsonb_array_length(v_fields) = 0 then
      return new;
    end if;

    if (v_new ->> 'publication_status') = 'published'
       and (v_old ->> 'publication_status') is distinct from 'published' then
      v_action := 'published';
    elsif (
      (v_new ->> 'withdrawn_at') is not null
      and (v_old ->> 'withdrawn_at') is null
    ) or (
      (v_old ->> 'visibility_status') = 'public'
      and (v_new ->> 'visibility_status') is distinct from 'public'
    ) then
      v_action := 'withdrawn';
    elsif (v_old ->> 'editorial_status') is distinct from (v_new ->> 'editorial_status')
       or (v_old ->> 'publication_status') is distinct from (v_new ->> 'publication_status')
       or (v_old ->> 'visibility_status') is distinct from (v_new ->> 'visibility_status') then
      v_action := 'status_changed';
    else
      v_action := 'updated';
    end if;
  end if;

  v_actor := public.access_current_account_id();

  insert into public.editorial_content_activity (
    content_id,
    content_slug,
    actor_account_id,
    action,
    changes
  ) values (
    v_content_id,
    v_slug,
    v_actor,
    v_action,
    jsonb_build_object(
      'fields', v_fields,
      'before_status', jsonb_strip_nulls(jsonb_build_object(
        'editorial', v_old ->> 'editorial_status',
        'publication', v_old ->> 'publication_status',
        'visibility', v_old ->> 'visibility_status'
      )),
      'after_status', jsonb_strip_nulls(jsonb_build_object(
        'editorial', v_new ->> 'editorial_status',
        'publication', v_new ->> 'publication_status',
        'visibility', v_new ->> 'visibility_status'
      ))
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.log_editorial_content_activity()
  from public, anon, authenticated;

drop trigger if exists editorial_content_activity_log on public.contents;
create trigger editorial_content_activity_log
  after insert or update or delete on public.contents
  for each row execute function public.log_editorial_content_activity();

-- ---------------------------------------------------------------------------
-- Privacy-friendly aggregate analytics
-- ---------------------------------------------------------------------------
-- No IP address, user-agent, cookie identifier, account id or raw event stream is
-- stored. Counts are aggregated immediately by UTC day + normalized path + locale.
create table if not exists public.site_analytics_daily (
  event_date date not null default (now() at time zone 'utc')::date,
  path text not null check (
    length(path) between 1 and 200
    and path like '/%'
    and position('?' in path) = 0
    and position('#' in path) = 0
  ),
  locale text not null check (locale in ('it','en','fr','es','de','ar','zh')),
  view_count bigint not null default 0 check (view_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (event_date, path, locale)
);

create index if not exists site_analytics_daily_path_idx
  on public.site_analytics_daily(path, event_date desc);
create index if not exists site_analytics_daily_locale_idx
  on public.site_analytics_daily(locale, event_date desc);

alter table public.site_analytics_daily enable row level security;

drop policy if exists site_analytics_daily_editor_read
  on public.site_analytics_daily;
create policy site_analytics_daily_editor_read
on public.site_analytics_daily
for select
to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

grant select on public.site_analytics_daily to authenticated;
revoke all on public.site_analytics_daily from anon;

create or replace function public.record_site_page_view(
  p_path text,
  p_locale text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_path text := btrim(coalesce(p_path, ''));
  v_locale text := lower(btrim(coalesce(p_locale, '')));
begin
  if length(v_path) < 1 or length(v_path) > 200
     or left(v_path, 1) <> '/'
     or position('?' in v_path) > 0
     or position('#' in v_path) > 0 then
    raise exception 'ANALYTICS_INVALID_PATH' using errcode = '22023';
  end if;

  if v_locale not in ('it','en','fr','es','de','ar','zh') then
    raise exception 'ANALYTICS_INVALID_LOCALE' using errcode = '22023';
  end if;

  insert into public.site_analytics_daily (
    event_date,
    path,
    locale,
    view_count,
    updated_at
  ) values (
    (now() at time zone 'utc')::date,
    v_path,
    v_locale,
    1,
    now()
  )
  on conflict (event_date, path, locale)
  do update set
    view_count = public.site_analytics_daily.view_count + 1,
    updated_at = now();
end;
$$;

revoke all on function public.record_site_page_view(text, text)
  from public, anon, authenticated;
grant execute on function public.record_site_page_view(text, text)
  to service_role;

commit;
