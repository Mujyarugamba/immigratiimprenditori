/**
 * Cumulative M3+M4 runtime on applied local DB — creates disposable fixtures, cleans up.
 * Does not re-apply migrations. Exit 2 if Docker unavailable.
 */
import { execFileSync, execSync } from "node:child_process";

function localDbContainer() {
  try {
    const out = execSync("docker ps --format {{.Names}}", { encoding: "utf8" });
    return (
      out
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find((n) => n.startsWith("supabase_db_")) || null
    );
  } catch {
    return null;
  }
}

function psql(sql) {
  const container = localDbContainer();
  if (!container) {
    console.error("Docker/Supabase DB container not available");
    process.exit(2);
  }
  return execFileSync(
    "docker",
    [
      "exec",
      "-i",
      container,
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
    ],
    { encoding: "utf8", input: sql, stdio: ["pipe", "pipe", "pipe"], maxBuffer: 20 * 1024 * 1024 },
  );
}

const sql = `
do $$
declare
  v_auth1 uuid := gen_random_uuid();
  v_auth2 uuid := gen_random_uuid();
  v_auth3 uuid := gen_random_uuid();
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
  v_type text;
  v_m2_before int;
  v_m2_after int;
begin
  if to_regprocedure('public.access_self_delete_account()') is null
     or to_regclass('public.management_reassignment_cases') is null then
    raise exception 'M3/M4 not applied locally';
  end if;

  select count(*) into v_m2_before from public.legal_retention_records;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  ) values
    (v_auth1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'm3m4a-' || v_auth1::text || '@example.invalid', crypt('x', gen_salt('bf')),
     now(), now(), now(), '{}'::jsonb, '{}'::jsonb, false, false),
    (v_auth2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'm3m4b-' || v_auth2::text || '@example.invalid', crypt('x', gen_salt('bf')),
     now(), now(), now(), '{}'::jsonb, '{}'::jsonb, false, false),
    (v_auth3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'm3m4c-' || v_auth3::text || '@example.invalid', crypt('x', gen_salt('bf')),
     now(), now(), now(), '{}'::jsonb, '{}'::jsonb, false, false);

  insert into public.profiles (id, display_name, slug, is_public, is_active)
  values
    (v_auth1, 'M34 A', 'm34-a-' || replace(v_auth1::text,'-',''), true, true),
    (v_auth2, 'M34 B', 'm34-b-' || replace(v_auth2::text,'-',''), false, true),
    (v_auth3, 'M34 C', 'm34-c-' || replace(v_auth3::text,'-',''), false, true)
  on conflict (id) do update
    set deleted_at = null, is_active = true, is_public = excluded.is_public,
        display_name = excluded.display_name, slug = excluded.slug;

  insert into public.accounts (
    auth_user_id, person_id, person_association_status, person_linked_at,
    account_status, activated_at
  ) values
    (v_auth1, v_auth1, 'declared', now(), 'active', now()),
    (v_auth2, v_auth2, 'declared', now(), 'active', now()),
    (v_auth3, v_auth3, 'declared', now(), 'active', now())
  on conflict (auth_user_id) do update set
    person_id = excluded.person_id,
    account_status = 'active',
    person_association_status = 'declared',
    person_linked_at = now(),
    activated_at = coalesce(public.accounts.activated_at, now()),
    closed_at = null;

  select id into v_acc1 from public.accounts where auth_user_id = v_auth1;
  select id into v_acc2 from public.accounts where auth_user_id = v_auth2;
  select id into v_acc3 from public.accounts where auth_user_id = v_auth3;

  -- Multi-manager business
  insert into public.businesses (legal_name, public_name, publication_status, editorial_status)
  values ('M34 Two Legal', 'M34 Two Public', 'public', 'complete')
  returning id into v_biz_two;
  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_two, v_auth1, 'owner', 'active') returning id into v_mem1;
  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_two, v_auth2, 'partner', 'active') returning id into v_mem2;
  insert into public.business_membership_management_authorizations (membership_id, authorization_status, granted_at)
  values (v_mem1, 'granted', now()), (v_mem2, 'granted', now());

  -- Sole manager business
  insert into public.businesses (legal_name, public_name, publication_status, editorial_status)
  values ('M34 Sole Legal', 'M34 Sole Public', 'public', 'complete')
  returning id into v_biz_sole;
  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_sole, v_auth1, 'owner', 'active') returning id into v_mem_sole;
  insert into public.business_membership_management_authorizations (membership_id, authorization_status, granted_at)
  values (v_mem_sole, 'granted', now());

  select code into v_type from public.organization_types limit 1;
  insert into public.organizations (
    owner_person_id, owner_business_id, owned_by_editorial,
    type_code, name, description, slug,
    editorial_status, publication_status, visibility_status
  ) values (
    v_auth1, null, false,
    v_type, 'M34 Org', 'Harness', 'm34-org-' || replace(v_auth1::text,'-',''),
    'draft', 'unpublished', 'private'
  ) returning id into v_org;

  -- Self-delete as auth1 (JWT)
  perform set_config('request.jwt.claim.sub', v_auth1::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  perform public.access_self_delete_account();

  if not exists (
    select 1 from public.accounts where id = v_acc1 and account_status = 'closed' and closed_at is not null
  ) then
    raise exception 'FAIL: account not closed';
  end if;
  if not exists (
    select 1 from public.profiles where id = v_auth1 and deleted_at is not null and is_public = false
  ) then
    raise exception 'FAIL: persona not minimized';
  end if;
  if exists (
    select 1 from public.business_membership_management_authorizations b
    join public.business_memberships m on m.id = b.membership_id
    where m.person_id = v_auth1 and b.authorization_status = 'granted'
  ) then
    raise exception 'FAIL: grants still active for deleted person';
  end if;
  if not exists (select 1 from public.businesses where id = v_biz_two)
     or not exists (select 1 from public.businesses where id = v_biz_sole)
     or not exists (select 1 from public.organizations where id = v_org) then
    raise exception 'FAIL: aggregate deleted';
  end if;
  -- multi-manager: other grant remains, no pending on two-mgr biz
  if not exists (
    select 1 from public.business_membership_management_authorizations
    where membership_id = v_mem2 and authorization_status = 'granted'
  ) then
    raise exception 'FAIL: peer manager grant lost';
  end if;
  select count(*) into v_pending_count from public.management_reassignment_cases
  where business_id = v_biz_two and status = 'pending';
  if v_pending_count <> 0 then
    raise exception 'FAIL: multi-manager opened case';
  end if;
  select count(*) into v_pending_count from public.management_reassignment_cases
  where business_id = v_biz_sole and status = 'pending';
  if v_pending_count <> 1 then
    raise exception 'FAIL: sole manager case count=%', v_pending_count;
  end if;
  select count(*) into v_pending_count from public.management_reassignment_cases
  where organization_id = v_org and status = 'pending';
  if v_pending_count <> 1 then
    raise exception 'FAIL: org case count=%', v_pending_count;
  end if;
  if not exists (
    select 1 from public.organizations where id = v_org and owner_person_id = v_auth1
  ) then
    raise exception 'FAIL: org owner auto-changed';
  end if;

  select count(*) into v_m2_after from public.legal_retention_records;
  if v_m2_after <> v_m2_before then
    raise exception 'FAIL: automatic M2 insert';
  end if;

  -- Idempotent retry
  perform public.access_self_delete_account();

  -- Admin resolve
  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_sole, v_auth3, 'administrator', 'active') returning id into v_mem_new;
  insert into public.account_role_assignments (account_id, role_code, assignment_status, assigned_at)
  values (v_acc3, 'amministratore_applicativo', 'active', now())
  on conflict do nothing;

  perform set_config('request.jwt.claim.sub', v_auth3::text, true);
  select id into v_case from public.management_reassignment_cases
  where business_id = v_biz_sole and status = 'pending';
  perform public.access_resolve_business_reassignment(v_case, v_mem_new);
  select count(*) into v_granted_count
  from public.business_membership_management_authorizations b
  join public.business_memberships m on m.id = b.membership_id
  where m.business_id = v_biz_sole and b.authorization_status = 'granted';
  if v_granted_count < 1 then raise exception 'FAIL resolve business'; end if;

  select id into v_case from public.management_reassignment_cases
  where organization_id = v_org and status = 'pending';
  perform public.access_resolve_organization_reassignment(v_case, v_auth3);
  if not exists (select 1 from public.organizations where id = v_org and owner_person_id = v_auth3) then
    raise exception 'FAIL resolve org';
  end if;

  raise notice 'CUMULATIVE M3+M4 HARNESS PASS';

  -- Cleanup fixtures (best-effort; soft-deleted profiles cannot be updated)
  delete from public.management_reassignment_cases
  where business_id in (v_biz_two, v_biz_sole) or organization_id = v_org;
  delete from public.business_membership_management_authorizations
  where membership_id in (
    select id from public.business_memberships where business_id in (v_biz_two, v_biz_sole)
  );
  delete from public.business_memberships where business_id in (v_biz_two, v_biz_sole);
  delete from public.organizations where id = v_org;
  delete from public.businesses where id in (v_biz_two, v_biz_sole);
  delete from public.account_role_assignments where account_id in (v_acc1, v_acc2, v_acc3);
  delete from public.accounts where id in (v_acc1, v_acc2, v_acc3);
  delete from auth.users where id in (v_auth1, v_auth2, v_auth3);
end $$;
`;

try {
  const out = psql(sql);
  console.log(out);
  if (!/CUMULATIVE M3\+M4 HARNESS PASS/.test(out) && !out.includes("DO")) {
    // notices often on stderr; success if no throw
  }
  console.log("Cumulative M3+M4 runtime harness finished with cleanup.");
} catch (e) {
  const err = String(e.stderr || e.stdout || e.message);
  console.error(err);
  if (/CUMULATIVE M3\+M4 HARNESS PASS/.test(err)) {
    console.log("PASS noticed despite cleanup noise — check fixtures manually.");
  }
  process.exit(1);
}
