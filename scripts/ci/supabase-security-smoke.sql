\set ON_ERROR_STOP on

-- Local-only security smoke. It runs on the ephemeral Supabase database built
-- from the standalone cold-start chain; it never connects to Production.
do $$
declare
  v_content_id uuid;
  v_language_id bigint;
  v_type_code text;
  v_version_count integer;
  v_latest_body text;
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

  select count(*)::integer
    into v_version_count
  from public.content_versions
  where content_id = v_content_id;

  if v_version_count <> 1 then
    raise exception 'SECURITY_SMOKE_INITIAL_VERSION_COUNT_%', v_version_count;
  end if;

  update public.contents
  set body = 'Temporary local-only fixture, revision two.'
  where id = v_content_id;

  select count(*)::integer
    into v_version_count
  from public.content_versions
  where content_id = v_content_id;

  select snapshot ->> 'body'
    into v_latest_body
  from public.content_versions
  where content_id = v_content_id
  order by version_number desc
  limit 1;

  if v_version_count <> 2 then
    raise exception 'SECURITY_SMOKE_UPDATED_VERSION_COUNT_%', v_version_count;
  end if;

  if v_latest_body is distinct from 'Temporary local-only fixture, revision two.' then
    raise exception 'SECURITY_SMOKE_VERSION_SNAPSHOT_MISMATCH_%', v_latest_body;
  end if;

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

  select count(*)::integer
    into v_version_count
  from public.content_versions
  where content_id = v_content_id;

  if v_version_count <> 2 then
    raise exception 'SECURITY_SMOKE_REJECTED_PUBLICATION_CREATED_VERSION_%', v_version_count;
  end if;

  delete from public.contents where id = v_content_id;
end;
$$;

-- The Inbox audit trail is database-canonical and atomic. One state transition
-- must produce exactly one activity row using the trigger JSON shape consumed by
-- the redazione UI.
do $$
declare
  v_inbox_id uuid;
  v_activity_count integer;
  v_changes jsonb;
begin
  insert into public.editorial_inbox_items (
    source_kind,
    item_kind,
    title,
    priority,
    status
  ) values (
    'editorial_manual',
    'other',
    'CI inbox activity fixture',
    'normal',
    'new'
  ) returning id into v_inbox_id;

  update public.editorial_inbox_items
  set status = 'to_review',
      reviewed_at = now()
  where id = v_inbox_id;

  select count(*)::integer
    into v_activity_count
  from public.editorial_inbox_activity
  where inbox_item_id = v_inbox_id;

  select changes
    into v_changes
  from public.editorial_inbox_activity
  where inbox_item_id = v_inbox_id
  order by created_at desc, id desc
  limit 1;

  if v_activity_count <> 1 then
    raise exception 'SECURITY_SMOKE_INBOX_ACTIVITY_COUNT_%', v_activity_count;
  end if;

  if v_changes #>> '{status,from}' is distinct from 'new'
     or v_changes #>> '{status,to}' is distinct from 'to_review' then
    raise exception 'SECURITY_SMOKE_INBOX_ACTIVITY_SHAPE_INVALID: %', v_changes;
  end if;

  delete from public.editorial_inbox_items where id = v_inbox_id;
end;
$$;

-- Private editorial tables must remain behind RLS and must not grant anonymous
-- table-level SELECT access. Historical content snapshots are trigger-only:
-- authenticated editors can SELECT but cannot INSERT/UPDATE/DELETE.
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
    raise exception 'SECURITY_SMOKE_EDITORIAL_VERSION_READ_GRANT_MISSING';
  end if;

  if has_table_privilege('authenticated', 'public.content_versions', 'INSERT')
     or has_table_privilege('authenticated', 'public.content_versions', 'UPDATE')
     or has_table_privilege('authenticated', 'public.content_versions', 'DELETE') then
    raise exception 'SECURITY_SMOKE_CONTENT_VERSIONS_NOT_TRIGGER_ONLY';
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

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'contents_capture_version'
      and not tgisinternal
  ) then
    raise exception 'SECURITY_SMOKE_CONTENT_VERSION_TRIGGER_MISSING';
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

-- Public geography/routes/authors/correction notices must be queryable with the
-- anon database role without evaluating privileged editor/MFA helpers.
begin;
set local role anon;
select count(*) as anon_active_territories from public.geo_territories;
select count(*) as anon_active_routes from public.migration_routes;
select count(*) as anon_public_authors from public.author_profiles;
select count(*) as anon_public_corrections from public.content_corrections;
reset role;
rollback;

-- AI translation cache: anon may read only when the source content is public;
-- anon/authenticated must not insert, update or delete.
do $$
declare
  v_private_id uuid;
  v_language_id bigint;
  v_type_code text;
  v_seen integer;
  v_policy text;
  v_source_code text;
  v_target text;
begin
  if to_regclass('public.content_ai_translations') is null then
    raise exception 'SECURITY_SMOKE_CONTENT_AI_TRANSLATIONS_MISSING';
  end if;

  select qual
    into v_policy
  from pg_policies
  where schemaname = 'public'
    and tablename = 'content_ai_translations'
    and policyname = 'content_ai_translations_public_read';

  if v_policy is null
     or v_policy not ilike '%editorial_status%'
     or v_policy not ilike '%ready%'
     or v_policy not ilike '%publication_status%'
     or v_policy not ilike '%published%'
     or v_policy not ilike '%visibility_status%'
     or v_policy not ilike '%public%'
     or v_policy not ilike '%archived_at%' then
    raise exception 'SECURITY_SMOKE_AI_TRANSLATION_PUBLIC_POLICY_INCOMPLETE';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'content_ai_translations'
      and cmd in ('INSERT', 'UPDATE', 'DELETE')
  ) then
    raise exception 'SECURITY_SMOKE_AI_TRANSLATION_WRITE_POLICY_PRESENT';
  end if;

  select id into v_language_id from public.languages where is_active order by sort_order, id limit 1;
  select code into v_source_code from public.languages where id = v_language_id;
  v_target := case when v_source_code = 'en' then 'fr' else 'en' end;
  select code into v_type_code from public.content_types where is_active order by sort_order, code limit 1;

  insert into public.contents (
    owned_by_editorial, type_code, language_id, title, slug, body,
    editorial_status, publication_status, visibility_status, is_featured
  ) values (
    true, v_type_code, v_language_id, 'CI private AI translation fixture',
    'ci-private-ai-translation-fixture-' || replace(gen_random_uuid()::text, '-', ''),
    'Private fixture body.',
    'draft', 'unpublished', 'private', false
  ) returning id into v_private_id;

  insert into public.content_ai_translations (
    content_id, target_locale, source_language_id, source_fingerprint,
    translated_title, translated_body, provider, model, prompt_version
  ) values (
    v_private_id, v_target, v_language_id, 'ci-private-fingerprint',
    'Private EN title', 'Private EN body', 'openai', 'gpt-5.6-terra', 'editorial-public-v1'
  );

  perform set_config('role', 'anon', true);
  select count(*)::integer into v_seen
  from public.content_ai_translations
  where content_id = v_private_id;
  if v_seen <> 0 then
    raise exception 'SECURITY_SMOKE_ANON_CAN_READ_PRIVATE_AI_TRANSLATION';
  end if;

  begin
    insert into public.content_ai_translations (
      content_id, target_locale, source_language_id, source_fingerprint,
      translated_title, translated_body, provider, model, prompt_version
    ) values (
      v_private_id, 'zh', v_language_id, 'ci-forbidden-write',
      'Nope', 'Nope', 'openai', 'gpt-5.6-terra', 'editorial-public-v1'
    );
    raise exception 'SECURITY_SMOKE_ANON_INSERTED_AI_TRANSLATION';
  exception
    when insufficient_privilege then
      null;
  end;

  perform set_config('role', 'authenticated', true);
  begin
    update public.content_ai_translations
    set translated_title = 'hacked'
    where content_id = v_private_id;
    if found then
      raise exception 'SECURITY_SMOKE_AUTHENTICATED_UPDATED_AI_TRANSLATION';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  begin
    delete from public.content_ai_translations where content_id = v_private_id;
    if found then
      raise exception 'SECURITY_SMOKE_AUTHENTICATED_DELETED_AI_TRANSLATION';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;

  perform set_config('role', 'postgres', true);
  delete from public.contents where id = v_private_id;
end;
$$;

select 'SUPABASE_LOCAL_SECURITY_SMOKE_PASS' as result;
