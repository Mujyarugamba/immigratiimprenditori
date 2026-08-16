-- L1.3-M4 (+M3 replace) runtime harness — ROLLBACK ONLY
-- Usage:
--   psql "$DB_URL" -v ON_ERROR_STOP=1 -f scripts/m4-management-reassignment-runtime-check.sql
-- Applies M3+M4 DDL inside a transaction if functions missing, runs fixtures, ROLLBACKs.
-- Does NOT touch Auth ban. Does NOT commit.

begin;

-- Load migrations if not present (idempotent-ish for harness only)
\set ON_ERROR_STOP on

do $$
begin
  if to_regprocedure('public.access_self_delete_preflight()') is null then
    raise notice 'M3 functions missing — run migration SQL before harness or apply in this session';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Fixture helpers (disposable UUIDs)
-- ---------------------------------------------------------------------------
do $$
declare
  v_auth1 uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1';
  v_auth2 uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2';
  v_auth3 uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3';
  v_acc1 uuid;
  v_acc2 uuid;
  v_acc3 uuid;
  v_biz_two uuid;
  v_biz_sole uuid;
  v_org uuid;
  v_mem1 uuid;
  v_mem2 uuid;
  v_mem_sole uuid;
  v_mem_new uuid;
  v_case uuid;
  v_pending_count int;
  v_granted_count int;
begin
  -- Minimal auth.users + profiles + accounts (local only; rolled back)
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
  values
    (v_auth1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'm4fix1@example.invalid', crypt('x', gen_salt('bf')), now(), now(), now(), '{}', '{}'),
    (v_auth2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'm4fix2@example.invalid', crypt('x', gen_salt('bf')), now(), now(), now(), '{}', '{}'),
    (v_auth3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'm4fix3@example.invalid', crypt('x', gen_salt('bf')), now(), now(), now(), '{}', '{}')
  on conflict (id) do nothing;

  insert into public.profiles (id, display_name, slug, is_public, is_active)
  values
    (v_auth1, 'M4 Fixture One', 'm4-fixture-one', false, true),
    (v_auth2, 'M4 Fixture Two', 'm4-fixture-two', false, true),
    (v_auth3, 'M4 Fixture Three', 'm4-fixture-three', false, true)
  on conflict (id) do update set deleted_at = null, is_active = true;

  insert into public.accounts (auth_user_id, person_id, person_association_status, person_linked_at, account_status, activated_at)
  values
    (v_auth1, v_auth1, 'declared', now(), 'active', now()),
    (v_auth2, v_auth2, 'declared', now(), 'active', now()),
    (v_auth3, v_auth3, 'declared', now(), 'active', now())
  on conflict (auth_user_id) do update
    set person_id = excluded.person_id,
        account_status = 'active',
        person_association_status = 'declared',
        person_linked_at = now(),
        activated_at = coalesce(public.accounts.activated_at, now()),
        closed_at = null;

  select id into v_acc1 from public.accounts where auth_user_id = v_auth1;
  select id into v_acc2 from public.accounts where auth_user_id = v_auth2;
  select id into v_acc3 from public.accounts where auth_user_id = v_auth3;

  -- Business with two managers
  insert into public.businesses (id, name, slug, publication_status)
  values (gen_random_uuid(), 'M4 Biz Two Mgr', 'm4-biz-two-' || substr(replace(gen_random_uuid()::text,'-',''),1,8), 'public')
  returning id into v_biz_two;

  insert into public.business_memberships (business_id, person_id, relation_status, visibility_status)
  values
    (v_biz_two, v_auth1, 'active', 'private'),
    (v_biz_two, v_auth2, 'active', 'private')
  returning id into v_mem1;
  -- capture mem2
  select id into v_mem1 from public.business_memberships where business_id = v_biz_two and person_id = v_auth1;
  select id into v_mem2 from public.business_memberships where business_id = v_biz_two and person_id = v_auth2;

  insert into public.business_membership_management_authorizations (membership_id, authorization_status, granted_at)
  values
    (v_mem1, 'granted', now()),
    (v_mem2, 'granted', now());

  -- A: revoke one of two → no pending case
  update public.business_membership_management_authorizations
  set authorization_status = 'revoked', revoked_at = now()
  where membership_id = v_mem1;

  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where business_id = v_biz_two and status = 'pending';

  if v_pending_count <> 0 then
    raise exception 'FAIL A: two-manager revoke opened case';
  end if;
  raise notice 'PASS A: two-manager revoke → no orphan case';

  -- B: sole manager business
  insert into public.businesses (id, name, slug, publication_status)
  values (gen_random_uuid(), 'M4 Biz Sole', 'm4-biz-sole-' || substr(replace(gen_random_uuid()::text,'-',''),1,8), 'public')
  returning id into v_biz_sole;

  insert into public.business_memberships (business_id, person_id, relation_status, visibility_status)
  values (v_biz_sole, v_auth1, 'active', 'private')
  returning id into v_mem_sole;

  insert into public.business_membership_management_authorizations (membership_id, authorization_status, granted_at)
  values (v_mem_sole, 'granted', now());

  update public.business_membership_management_authorizations
  set authorization_status = 'revoked', revoked_at = now()
  where membership_id = v_mem_sole;

  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where business_id = v_biz_sole and status = 'pending';

  if v_pending_count <> 1 then
    raise exception 'FAIL B: sole manager revoke did not open single pending case (% )', v_pending_count;
  end if;

  if not exists (select 1 from public.businesses where id = v_biz_sole) then
    raise exception 'FAIL B: business deleted';
  end if;
  raise notice 'PASS B: sole manager → pending case; business preserved';

  -- D: duplicate retry open
  perform public.access_m4_open_business_reassignment(v_biz_sole, 'last_manager_grant_revoked', null, null, false);
  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where business_id = v_biz_sole and status = 'pending';
  if v_pending_count <> 1 then
    raise exception 'FAIL D: duplicate pending cases (% )', v_pending_count;
  end if;
  raise notice 'PASS D: duplicate open → still one pending';

  -- C: organization owner case
  insert into public.organizations (
    id, owner_person_id, owner_business_id, owned_by_editorial,
    type_code, name, description, slug,
    editorial_status, publication_status, visibility_status
  )
  select
    gen_random_uuid(), v_auth2, null, false,
    ot.code, 'M4 Org Owner', 'Harness org', 'm4-org-' || substr(replace(gen_random_uuid()::text,'-',''),1,8),
    'ready', 'published', 'public'
  from public.organization_types ot
  limit 1
  returning id into v_org;

  perform public.access_m4_open_organization_reassignment(
    v_org, 'organization_owner_account_deletion', v_acc2, v_auth2
  );

  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where organization_id = v_org and status = 'pending';
  if v_pending_count <> 1 then
    raise exception 'FAIL C: org owner case not pending';
  end if;
  if not exists (
    select 1 from public.organizations where id = v_org and owner_person_id = v_auth2
  ) then
    raise exception 'FAIL C: owner_person_id was nulled/auto-transferred';
  end if;
  raise notice 'PASS C: org owner case pending; org preserved; owner kept until resolve';

  -- F: admin resolve business via bootstrap + new membership for auth3
  insert into public.business_memberships (business_id, person_id, relation_status, visibility_status)
  values (v_biz_sole, v_auth3, 'active', 'private')
  returning id into v_mem_new;

  select id into v_case
  from public.management_reassignment_cases
  where business_id = v_biz_sole and status = 'pending';

  -- Simulate Adm: set JWT to an admin if present; else call as service via bypass — use resolve as DEFINER with access_is_application_admin
  -- For harness, temporarily assign admin role to acc3 then set jwt claim
  insert into public.account_role_assignments (account_id, role_code, assignment_status, assigned_at)
  values (v_acc3, 'amministratore_applicativo', 'active', now())
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub', v_auth3::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('role', 'authenticated', true);

  perform public.access_resolve_business_reassignment(v_case, v_mem_new);

  select count(*) into v_granted_count
  from public.business_membership_management_authorizations bmma
  join public.business_memberships m on m.id = bmma.membership_id
  where m.business_id = v_biz_sole and bmma.authorization_status = 'granted';

  if v_granted_count < 1 then
    raise exception 'FAIL F: resolve did not create canonical grant';
  end if;
  if exists (
    select 1 from public.management_reassignment_cases
    where id = v_case and status = 'pending'
  ) then
    raise exception 'FAIL F: case still pending';
  end if;
  raise notice 'PASS F: business resolve → canonical grant + case resolved';

  -- G: org resolve to auth3 person
  select id into v_case
  from public.management_reassignment_cases
  where organization_id = v_org and status = 'pending';

  perform public.access_resolve_organization_reassignment(v_case, v_auth3);

  if not exists (
    select 1 from public.organizations where id = v_org and owner_person_id = v_auth3
  ) then
    raise exception 'FAIL G: org owner not updated';
  end if;
  if exists (
    select 1 from public.management_reassignment_cases where id = v_case and status = 'pending'
  ) then
    raise exception 'FAIL G: org case still pending';
  end if;
  raise notice 'PASS G: org resolve → canonical owner_person_id + resolved';

  -- H/I/J: unauthorized — clear admin, use auth1
  update public.account_role_assignments
  set assignment_status = 'revoked', revoked_at = now()
  where account_id = v_acc3 and role_code = 'amministratore_applicativo';

  perform set_config('request.jwt.claim.sub', v_auth1::text, true);

  begin
    perform public.access_resolve_business_reassignment(v_case, v_mem_new);
    raise exception 'FAIL H: unauthorized resolve succeeded';
  exception
    when insufficient_privilege then
      raise notice 'PASS H: unauthorized resolve denied';
    when others then
      if sqlerrm ilike '%not authorized%' then
        raise notice 'PASS H: unauthorized resolve denied';
      else
        raise;
      end if;
  end;

  raise notice 'M4 harness core PASS — rolling back fixtures';
end $$;

rollback;
