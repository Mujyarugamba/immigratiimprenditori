/**
 * M4 (+ M3 replace) runtime harness — applies migration SQL inside BEGIN…ROLLBACK.
 * Does NOT permanently apply M3/M4. Exit 2 if Docker unavailable.
 */
import { execFileSync, execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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

function psqlFile(sql) {
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

const m3 = readFileSync(
  join(root, "supabase/migrations/20260817100000_create_self_service_account_deletion.sql"),
  "utf8",
);
const m4 = readFileSync(
  join(root, "supabase/migrations/20260818100000_create_management_reassignment_cases.sql"),
  "utf8",
);

const tests = `
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
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  ) values
    (v_auth1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'm4a-' || v_auth1::text || '@example.invalid', crypt('x', gen_salt('bf')),
     now(), now(), now(), '{}'::jsonb, '{}'::jsonb, false, false),
    (v_auth2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'm4b-' || v_auth2::text || '@example.invalid', crypt('x', gen_salt('bf')),
     now(), now(), now(), '{}'::jsonb, '{}'::jsonb, false, false),
    (v_auth3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
     'm4c-' || v_auth3::text || '@example.invalid', crypt('x', gen_salt('bf')),
     now(), now(), now(), '{}'::jsonb, '{}'::jsonb, false, false);

  -- handle_new_user may have created profiles; ensure usable rows
  insert into public.profiles (id, display_name, slug, is_public, is_active)
  values
    (v_auth1, 'M4 A', 'm4-a-' || replace(v_auth1::text,'-',''), false, true),
    (v_auth2, 'M4 B', 'm4-b-' || replace(v_auth2::text,'-',''), false, true),
    (v_auth3, 'M4 C', 'm4-c-' || replace(v_auth3::text,'-',''), false, true)
  on conflict (id) do update
    set deleted_at = null, is_active = true, is_public = false;

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

  insert into public.businesses (legal_name, public_name, publication_status, editorial_status)
  values ('M4 Two Legal', 'M4 Two Public', 'public', 'complete')
  returning id into v_biz_two;

  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_two, v_auth1, 'owner', 'active')
  returning id into v_mem1;
  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_two, v_auth2, 'partner', 'active')
  returning id into v_mem2;

  insert into public.business_membership_management_authorizations (membership_id, authorization_status, granted_at)
  values (v_mem1, 'granted', now()), (v_mem2, 'granted', now());

  update public.business_membership_management_authorizations
  set authorization_status = 'revoked', revoked_at = now()
  where membership_id = v_mem1;

  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where business_id = v_biz_two and status = 'pending';
  if v_pending_count <> 0 then
    raise exception 'FAIL A: two-manager revoke opened case';
  end if;
  raise notice 'PASS A two-manager';

  insert into public.businesses (legal_name, public_name, publication_status, editorial_status)
  values ('M4 Sole Legal', 'M4 Sole Public', 'public', 'complete')
  returning id into v_biz_sole;

  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_sole, v_auth1, 'owner', 'active')
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
    raise exception 'FAIL B: sole manager pending count=%', v_pending_count;
  end if;
  raise notice 'PASS B sole-manager';

  perform public.access_m4_open_business_reassignment(v_biz_sole, 'last_manager_grant_revoked', null, null, false);
  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where business_id = v_biz_sole and status = 'pending';
  if v_pending_count <> 1 then
    raise exception 'FAIL D: duplicate pending=%', v_pending_count;
  end if;
  raise notice 'PASS D duplicate';

  select code into v_type from public.organization_types limit 1;
  insert into public.organizations (
    owner_person_id, owner_business_id, owned_by_editorial,
    type_code, name, description, slug,
    editorial_status, publication_status, visibility_status
  ) values (
    v_auth2, null, false,
    v_type, 'M4 Org', 'Harness', 'm4-org-' || replace(v_auth2::text,'-',''),
    'draft', 'unpublished', 'private'
  ) returning id into v_org;

  perform public.access_m4_open_organization_reassignment(
    v_org, 'organization_owner_account_deletion', v_acc2, v_auth2
  );
  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where organization_id = v_org and status = 'pending';
  if v_pending_count <> 1 then
    raise exception 'FAIL C: org pending=%', v_pending_count;
  end if;
  if not exists (select 1 from public.organizations where id = v_org and owner_person_id = v_auth2) then
    raise exception 'FAIL C: owner auto-changed';
  end if;
  raise notice 'PASS C org-owner';

  insert into public.business_memberships (business_id, person_id, role_id, relation_status)
  values (v_biz_sole, v_auth3, 'administrator', 'active')
  returning id into v_mem_new;

  insert into public.account_role_assignments (account_id, role_code, assignment_status, assigned_at)
  values (v_acc3, 'amministratore_applicativo', 'active', now());

  perform set_config('request.jwt.claim.sub', v_auth3::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);

  select id into v_case from public.management_reassignment_cases
  where business_id = v_biz_sole and status = 'pending';

  perform public.access_resolve_business_reassignment(v_case, v_mem_new);

  select count(*) into v_granted_count
  from public.business_membership_management_authorizations bmma
  join public.business_memberships m on m.id = bmma.membership_id
  where m.business_id = v_biz_sole and bmma.authorization_status = 'granted';
  if v_granted_count < 1 then
    raise exception 'FAIL F: no grant after resolve';
  end if;
  if exists (select 1 from public.management_reassignment_cases where id = v_case and status = 'pending') then
    raise exception 'FAIL F: still pending';
  end if;
  raise notice 'PASS F business resolve';

  select id into v_case from public.management_reassignment_cases
  where organization_id = v_org and status = 'pending';
  perform public.access_resolve_organization_reassignment(v_case, v_auth3);
  if not exists (select 1 from public.organizations where id = v_org and owner_person_id = v_auth3) then
    raise exception 'FAIL G: owner not reassigned';
  end if;
  raise notice 'PASS G org resolve';

  update public.account_role_assignments
  set assignment_status = 'revoked', revoked_at = now()
  where account_id = v_acc3 and role_code = 'amministratore_applicativo' and assignment_status = 'active';
  perform set_config('request.jwt.claim.sub', v_auth1::text, true);

  begin
    perform public.access_resolve_organization_reassignment(v_case, v_auth1);
    raise exception 'FAIL H: unauthorized resolve allowed';
  exception
    when others then
      if sqlerrm ilike '%not authorized%' then
        raise notice 'PASS H unauthorized';
      else
        raise;
      end if;
  end;

  -- E concurrency sketch: two granted → revoke both → one pending
  update public.business_membership_management_authorizations
  set authorization_status = 'granted', granted_at = now(), revoked_at = null
  where membership_id in (v_mem1, v_mem2);

  update public.business_membership_management_authorizations
  set authorization_status = 'revoked', revoked_at = now()
  where membership_id = v_mem1;
  update public.business_membership_management_authorizations
  set authorization_status = 'revoked', revoked_at = now()
  where membership_id = v_mem2;

  select count(*) into v_pending_count
  from public.management_reassignment_cases
  where business_id = v_biz_two and status = 'pending';
  if v_pending_count <> 1 then
    raise exception 'FAIL E: concurrent-style double revoke pending=%', v_pending_count;
  end if;
  raise notice 'PASS E double-revoke → one pending';

  raise notice 'M4 HARNESS PASS';
end $$;
`;

const full = `
BEGIN;
${m3}
${m4}
${tests}
ROLLBACK;
`;

try {
  const out = psqlFile(full);
  console.log(out);
  if (!/M4 HARNESS PASS/.test(out) && !/PASS E/.test(out)) {
    // notices may go to stderr mixed
  }
  console.log("M4 runtime harness finished (transaction rolled back; DB unchanged).");
} catch (e) {
  const err = e.stderr || e.stdout || e.message;
  console.error(String(err));
  process.exit(1);
}
