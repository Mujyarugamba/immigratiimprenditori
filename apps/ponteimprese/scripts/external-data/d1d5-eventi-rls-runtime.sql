-- D1-D.5 Eventi RLS + identity runtime harness — ROLLBACK ONLY
-- Usage:
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f scripts/external-data/d1d5-eventi-rls-runtime.sql

begin;

do $$
declare
  v_auth_editor uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb101';
  v_auth_admin uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb102';
  v_auth_user uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb103';
  v_acc_editor uuid;
  v_acc_admin uuid;
  v_acc_user uuid;
  v_review_id uuid;
  v_published_id uuid;
  v_withdrawn_id uuid;
  v_edition_id uuid;
  v_cnt int;
  v_ok boolean;
begin
  -- Disposable auth users + profiles + accounts
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
  )
  values
    (v_auth_editor, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'd1d5-editor@example.invalid', crypt('x', gen_salt('bf')), now(), now(), now(), '{}', '{}'),
    (v_auth_admin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'd1d5-admin@example.invalid', crypt('x', gen_salt('bf')), now(), now(), now(), '{}', '{}'),
    (v_auth_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'd1d5-user@example.invalid', crypt('x', gen_salt('bf')), now(), now(), now(), '{}', '{}')
  on conflict (id) do nothing;

  insert into public.profiles (id, display_name, slug, is_public, is_active)
  values
    (v_auth_editor, 'D1D5 Editor', 'd1d5-editor', false, true),
    (v_auth_admin, 'D1D5 Admin', 'd1d5-admin', false, true),
    (v_auth_user, 'D1D5 User', 'd1d5-user', false, true)
  on conflict (id) do update set deleted_at = null, is_active = true;

  insert into public.accounts (
    auth_user_id, person_id, person_association_status, person_linked_at,
    account_status, activated_at
  )
  values
    (v_auth_editor, v_auth_editor, 'declared', now(), 'active', now()),
    (v_auth_admin, v_auth_admin, 'declared', now(), 'active', now()),
    (v_auth_user, v_auth_user, 'declared', now(), 'active', now())
  on conflict (auth_user_id) do update
    set person_id = excluded.person_id,
        account_status = 'active',
        person_association_status = 'declared',
        person_linked_at = now(),
        activated_at = coalesce(public.accounts.activated_at, now()),
        closed_at = null;

  select id into v_acc_editor from public.accounts where auth_user_id = v_auth_editor;
  select id into v_acc_admin from public.accounts where auth_user_id = v_auth_admin;
  select id into v_acc_user from public.accounts where auth_user_id = v_auth_user;

  insert into public.account_role_assignments (account_id, role_code, assignment_status)
  values
    (v_acc_editor, 'redattore', 'active'),
    (v_acc_admin, 'amministratore_applicativo', 'active')
  on conflict (account_id, role_code) do update
    set assignment_status = 'active', revoked_at = null;

  -- Schema gates
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events'
      and column_name = 'owned_by_editorial'
  ) then
    raise exception 'FAIL schema: owned_by_editorial missing';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events'
      and column_name = 'external_natural_key'
  ) then
    raise exception 'FAIL schema: external_natural_key missing';
  end if;

  -- Review-only editorial event + edition
  insert into public.events (
    owned_by_editorial, owner_person_id, owner_business_id,
    type_code, title, description, delivery_mode,
    editorial_status, publication_status, visibility_status,
    external_source_code, external_id, canonical_url, external_natural_key,
    acquisition_fingerprint, source_url, source_label, acquired_at,
    external_organization_label, editorial_internal_notes
  ) values (
    true, null, null,
    'conference', 'D1D5 Review Only Event', 'Sintesi editoriale test.',
    'in_presence',
    'draft', 'unpublished', 'private',
    'test-events', 'rev-1', 'https://events.example.org/e/rev-1',
    'test-events:id:rev-1',
    repeat('a', 64), 'https://events.example.org/e/rev-1', 'Test Events',
    now(), 'Organizzatore Test', 'nota interna non pubblica'
  ) returning id into v_review_id;

  insert into public.event_editions (
    event_id, starts_at, ends_at, timezone, delivery_mode,
    venue_label, city_text, country_ref, occurrence_status
  ) values (
    v_review_id, now() + interval '7 days', now() + interval '7 days 2 hours',
    'Europe/Rome', 'in_presence', 'Sala Test', 'Milano', 'IT', 'scheduled'
  ) returning id into v_edition_id;

  -- Published editorial event
  insert into public.events (
    owned_by_editorial, type_code, title, description, delivery_mode,
    editorial_status, publication_status, visibility_status,
    published_at, external_natural_key, canonical_url, acquisition_fingerprint,
    source_url, source_label, external_organization_label
  ) values (
    true, 'cultural', 'D1D5 Published Event', 'Descrizione pubblica.',
    'online',
    'ready', 'published', 'public',
    now(), 'test-events:url:https://events.example.org/e/pub-1',
    'https://events.example.org/e/pub-1', repeat('b', 64),
    'https://events.example.org/e/pub-1', 'Test Events', 'Org Pub'
  ) returning id into v_published_id;

  insert into public.event_editions (
    event_id, starts_at, timezone, delivery_mode, online_reference, occurrence_status
  ) values (
    v_published_id, now() + interval '3 days', 'Europe/Rome', 'online',
    'https://meet.example.org/room', 'scheduled'
  );

  -- Withdrawn editorial event
  insert into public.events (
    owned_by_editorial, type_code, title, description, delivery_mode,
    editorial_status, publication_status, visibility_status,
    published_at, withdrawn_at, external_natural_key, acquisition_fingerprint
  ) values (
    true, 'other', 'D1D5 Withdrawn Event', 'Ritirato.',
    'hybrid',
    'ready', 'withdrawn', 'public',
    now() - interval '1 day', now(),
    'test-events:fp:withdrawn', repeat('c', 64)
  ) returning id into v_withdrawn_id;

  insert into public.event_editions (
    event_id, starts_at, timezone, delivery_mode, venue_label, city_text,
    online_reference, occurrence_status, cancelled_at
  ) values (
    v_withdrawn_id, now() - interval '2 days', 'Europe/Rome', 'hybrid',
    'Sala W', 'Roma', 'https://meet.example.org/w', 'cancelled', now()
  );

  -- Dedupe: second insert same natural key must fail
  begin
    insert into public.events (
      owned_by_editorial, type_code, title, description,
      external_natural_key, acquisition_fingerprint
    ) values (
      true, 'other', 'Dup', 'Dup desc',
      'test-events:id:rev-1', repeat('d', 64)
    );
    raise exception 'FAIL dedupe: duplicate natural key accepted';
  exception
    when unique_violation then
      null;
  end;

  -- Ternary ownership: editorial with person owner must fail
  begin
    insert into public.events (
      owned_by_editorial, owner_person_id, type_code, title, description
    ) values (
      true, v_auth_user, 'other', 'Bad', 'Bad'
    );
    raise exception 'FAIL ownership: editorial+person accepted';
  exception
    when check_violation then
      null;
  end;

  -- Anon: only published visible
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claim.role', 'anon', true);
  execute 'set local role anon';

  select count(*) into v_cnt from public.events where id = v_review_id;
  if v_cnt <> 0 then raise exception 'FAIL anon: review-only visible'; end if;

  select count(*) into v_cnt from public.events where id = v_published_id;
  if v_cnt <> 1 then raise exception 'FAIL anon: published invisible'; end if;

  select count(*) into v_cnt from public.events where id = v_withdrawn_id;
  if v_cnt <> 0 then raise exception 'FAIL anon: withdrawn visible'; end if;

  -- Ordinary authenticated
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub', v_auth_user::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  select public.access_is_editor() into v_ok;
  if v_ok then raise exception 'FAIL ordinary: access_is_editor true'; end if;

  select count(*) into v_cnt from public.events where id = v_review_id;
  if v_cnt <> 0 then raise exception 'FAIL ordinary: review-only visible'; end if;

  select count(*) into v_cnt from public.events where id = v_published_id;
  if v_cnt <> 1 then raise exception 'FAIL ordinary: published invisible'; end if;

  -- Non-editor admin
  perform set_config('request.jwt.claim.sub', v_auth_admin::text, true);
  select public.access_is_editor() into v_ok;
  if v_ok then raise exception 'FAIL admin: access_is_editor true'; end if;
  select public.access_is_application_admin() into v_ok;
  if not v_ok then raise exception 'FAIL admin: access_is_application_admin false'; end if;

  select count(*) into v_cnt from public.events where id = v_review_id;
  if v_cnt <> 0 then raise exception 'FAIL admin: review-only visible without editor'; end if;

  update public.events
  set title = 'Hacked by admin'
  where id = v_review_id;
  if found then
    -- RLS may report 0 rows updated without error
    null;
  end if;
  select count(*) into v_cnt
  from public.events
  where id = v_review_id and title = 'Hacked by admin';
  -- as admin we cannot see review-only; verify via service later
  execute 'reset role';
  select count(*) into v_cnt
  from public.events
  where id = v_review_id and title = 'D1D5 Review Only Event';
  if v_cnt <> 1 then raise exception 'FAIL admin: was able to update review-only'; end if;

  -- Editor
  execute 'set local role authenticated';
  perform set_config('request.jwt.claim.sub', v_auth_editor::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  select public.access_is_editor() into v_ok;
  if not v_ok then raise exception 'FAIL editor: access_is_editor false'; end if;

  select count(*) into v_cnt from public.events where id = v_review_id;
  if v_cnt <> 1 then raise exception 'FAIL editor: cannot read review-only'; end if;

  update public.events
  set editorial_status = 'ready',
      title = 'D1D5 Review Only Event READY'
  where id = v_review_id;
  get diagnostics v_cnt = row_count;
  if v_cnt <> 1 then raise exception 'FAIL editor: cannot update review-only'; end if;

  -- Explicit publish (still not auto)
  update public.events
  set publication_status = 'published',
      visibility_status = 'public',
      published_at = now(),
      withdrawn_at = null
  where id = v_review_id;
  get diagnostics v_cnt = row_count;
  if v_cnt <> 1 then raise exception 'FAIL editor: cannot publish'; end if;

  -- service_role privileges (table grants exist; BYPASSRLS)
  execute 'reset role';
  if not has_table_privilege('service_role', 'public.events', 'INSERT') then
    raise exception 'FAIL service_role: missing INSERT on events';
  end if;
  if has_table_privilege('service_role', 'public.events', 'DELETE') then
    raise exception 'FAIL service_role: DELETE should not be granted on events';
  end if;

  raise notice 'D1-D.5 Eventi RLS runtime harness PASS';
end $$;

rollback;
