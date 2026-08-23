\set ON_ERROR_STOP on

-- Local-only security smoke. It runs on the ephemeral Supabase database built
-- from the standalone cold-start chain; it never connects to Production.
do $$
declare
  v_content_id uuid;
  v_language_id bigint;
  v_type_code text;
begin
  select id
    into v_language_id
  from public.languages
  where is_active
  order by sort_order, id
  limit 1;

  select code
    into v_type_code
  from public.content_types
  where is_active
  order by sort_order, code
  limit 1;

  if v_language_id is null or v_type_code is null then
    raise exception 'SECURITY_SMOKE_MISSING_CONTENT_CATALOGS';
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
    'CI publication gate fixture',
    'ci-publication-gate-fixture',
    'Temporary local-only fixture.',
    'draft',
    'unpublished',
    'private',
    false
  )
  returning id into v_content_id;

  -- No auth.uid()/active editor exists in this local postgres session. The hard
  -- gate must reject any attempt to cross onto a public editorial axis.
  begin
    update public.contents
    set editorial_status = 'ready',
        publication_status = 'published',
        visibility_status = 'public',
        published_at = now()
    where id = v_content_id;

    raise exception 'SECURITY_SMOKE_PUBLICATION_GATE_DID_NOT_BLOCK';
  exception
    when sqlstate '42501' then
      null;
  end;

  if exists (
    select 1
    from public.contents
    where id = v_content_id
      and (publication_status = 'published' or visibility_status = 'public')
  ) then
    raise exception 'SECURITY_SMOKE_PUBLICATION_STATE_ESCAPED';
  end if;

  delete from public.contents where id = v_content_id;
end;
$$;

-- Private editorial tables must remain behind RLS and must not grant anonymous
-- table-level SELECT access.
do $$
begin
  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'editorial_inbox_items'
      and c.relrowsecurity
  ) then
    raise exception 'SECURITY_SMOKE_INBOX_RLS_DISABLED';
  end if;

  if has_table_privilege('anon', 'public.editorial_inbox_items', 'SELECT') then
    raise exception 'SECURITY_SMOKE_ANON_CAN_SELECT_INBOX';
  end if;

  if not has_table_privilege('authenticated', 'public.editorial_inbox_items', 'SELECT') then
    raise exception 'SECURITY_SMOKE_AUTHENTICATED_GRANT_MISSING';
  end if;

  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'content_versions'
      and c.relrowsecurity
  ) then
    raise exception 'SECURITY_SMOKE_CONTENT_VERSIONS_RLS_DISABLED';
  end if;

  if has_table_privilege('anon', 'public.content_versions', 'SELECT') then
    raise exception 'SECURITY_SMOKE_ANON_CAN_SELECT_CONTENT_VERSIONS';
  end if;

  if not has_table_privilege('authenticated', 'public.content_versions', 'SELECT') then
    raise exception 'SECURITY_SMOKE_EDITORIAL_VERSION_AUTH_GRANT_MISSING';
  end if;

  if not has_table_privilege('anon', 'public.content_corrections', 'SELECT') then
    raise exception 'SECURITY_SMOKE_PUBLIC_CORRECTIONS_GRANT_MISSING';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'contents_human_publication_gate'
      and not tgisinternal
  ) then
    raise exception 'SECURITY_SMOKE_PUBLICATION_TRIGGER_MISSING';
  end if;

  -- MFA authorization helpers stay private to authenticated sessions. Public
  -- RLS policies must not solve compatibility by granting these functions to anon.
  if has_function_privilege('anon', 'public.access_is_editor()', 'EXECUTE') then
    raise exception 'SECURITY_SMOKE_ANON_CAN_EXECUTE_EDITOR_HELPER';
  end if;
  if has_function_privilege('anon', 'public.access_is_application_admin()', 'EXECUTE') then
    raise exception 'SECURITY_SMOKE_ANON_CAN_EXECUTE_ADMIN_HELPER';
  end if;
end;
$$;

-- Public geography/routes/authors must be queryable with the anon database role
-- without evaluating privileged MFA helpers. Any permission error here fails CI.
begin;
set local role anon;
select count(*) as anon_active_territories from public.geo_territories;
select count(*) as anon_active_routes from public.migration_routes;
select count(*) as anon_public_authors from public.author_profiles;
select count(*) as anon_public_corrections from public.content_corrections;
reset role;
rollback;

select 'SUPABASE_LOCAL_SECURITY_SMOKE_PASS' as result;
