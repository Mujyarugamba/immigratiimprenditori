\set ON_ERROR_STOP on

-- Go-live database smoke. Runs only against the ephemeral local Supabase stack.
do $$
declare
  v_content_id uuid;
  v_language_id bigint;
  v_type_code text;
  v_slug text := 'ci-audit-' || replace(gen_random_uuid()::text, '-', '');
  v_count bigint;
begin
  select id into v_language_id
  from public.languages
  where is_active
  order by sort_order, id
  limit 1;

  select code into v_type_code
  from public.content_types
  where is_active
  order by sort_order, code
  limit 1;

  if v_language_id is null or v_type_code is null then
    raise exception 'GO_LIVE_DB_SMOKE_MISSING_CATALOG';
  end if;

  insert into public.contents (
    owned_by_editorial,
    owner_person_id,
    owner_business_id,
    type_code,
    language_id,
    title,
    slug,
    body,
    editorial_status,
    publication_status,
    visibility_status,
    is_featured
  ) values (
    true,
    null,
    null,
    v_type_code,
    v_language_id,
    'CI audit fixture',
    v_slug,
    'Temporary local-only audit fixture.',
    'draft',
    'unpublished',
    'private',
    false
  ) returning id into v_content_id;

  update public.contents
  set title = 'CI audit fixture updated'
  where id = v_content_id;

  select count(*) into v_count
  from public.editorial_content_activity
  where content_id = v_content_id
    and action in ('created', 'updated');

  if v_count < 2 then
    raise exception 'GO_LIVE_AUDIT_INSERT_UPDATE_MISSING';
  end if;

  delete from public.contents where id = v_content_id;

  if not exists (
    select 1
    from public.editorial_content_activity
    where content_id = v_content_id
      and action = 'deleted'
  ) then
    raise exception 'GO_LIVE_AUDIT_DELETE_MISSING';
  end if;

  -- Audit history intentionally survives the content deletion.
  if not exists (
    select 1 from public.editorial_content_activity where content_id = v_content_id
  ) then
    raise exception 'GO_LIVE_AUDIT_HISTORY_NOT_PRESERVED';
  end if;

  delete from public.editorial_content_activity where content_id = v_content_id;
end;
$$;

-- Atlas route evidence must survive a standalone cold start. The source row is
-- provenance, while the 11 values are the exact official values already encoded
-- for the first origin->Italy route perimeter.
do $$
declare
  v_source_id uuid;
  v_count bigint;
begin
  select id into v_source_id
  from public.observatory_statistical_sources
  where external_identifier = 'mlps:futurae:imprenditoria-straniera:2025h1'
    and lifecycle_status = 'active';

  if v_source_id is null then
    raise exception 'GO_LIVE_ATLAS_FUTURAE_SOURCE_MISSING';
  end if;

  select count(*) into v_count
  from public.observatory_indicator_values v
  join public.observatory_indicators i on i.id = v.indicator_id
  where i.code = 'OBS-IT-IND-FIRM-BIRTH-ATLAS'
    and v.source_id = v_source_id
    and v.status = 'final'
    and v.territory_code = 'IT'
    and v.country_code in ('MA','RO','CN','AL','BD','SN','DE','TN','IN','UA','FR')
    and v.withdrawn_at is null;

  if v_count <> 11 then
    raise exception 'GO_LIVE_ATLAS_ROUTE_EVIDENCE_COUNT_FAILED: %', v_count;
  end if;

  select count(*) into v_count
  from public.migration_routes r
  where r.is_active
    and r.destination_country_code = 'IT'
    and r.origin_country_code in ('MA','RO','CN','AL','BD','SN','DE','TN','IN','UA','FR');

  if v_count <> 11 then
    raise exception 'GO_LIVE_ATLAS_ROUTE_COUNT_FAILED: %', v_count;
  end if;
end;
$$;

-- Private operational tables must never be directly readable by anon.
do $$
begin
  if has_table_privilege('anon', 'public.editorial_content_activity', 'SELECT') then
    raise exception 'GO_LIVE_AUDIT_ANON_SELECT_GRANTED';
  end if;

  if has_table_privilege('anon', 'public.site_analytics_daily', 'SELECT') then
    raise exception 'GO_LIVE_ANALYTICS_ANON_SELECT_GRANTED';
  end if;

  if has_function_privilege(
    'anon',
    'public.record_site_page_view(text,text)',
    'EXECUTE'
  ) then
    raise exception 'GO_LIVE_ANALYTICS_ANON_RPC_GRANTED';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.record_site_page_view(text,text)',
    'EXECUTE'
  ) then
    raise exception 'GO_LIVE_ANALYTICS_SERVICE_RPC_MISSING';
  end if;
end;
$$;

-- Immediate aggregation: no per-request raw analytics table exists.
select public.record_site_page_view('/ci-go-live', 'it');
select public.record_site_page_view('/ci-go-live', 'it');

do $$
declare
  v_count bigint;
begin
  select view_count into v_count
  from public.site_analytics_daily
  where event_date = (now() at time zone 'utc')::date
    and path = '/ci-go-live'
    and locale = 'it';

  if v_count <> 2 then
    raise exception 'GO_LIVE_ANALYTICS_AGGREGATION_FAILED: %', v_count;
  end if;

  delete from public.site_analytics_daily
  where path = '/ci-go-live' and locale = 'it';
end;
$$;

select 'GO_LIVE_DB_SMOKE = PASS' as result;
