-- Mandatory MFA enforcement for privileged editorial roles.
-- Branch/local validation only. Production activation remains an explicit release step.
--
-- `access_has_assigned_application_role` answers only whether a role is assigned;
-- it is used by the login/MFA routing layer while the session is still AAL1.
-- Existing operational helpers are redefined so privileged roles require AAL2,
-- while the non-privileged contributore role keeps its existing AAL1 behavior.

create or replace function public.access_has_assigned_application_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    p_role is not null
    and public.access_is_active_account()
    and p_role in ('redattore','amministratore_applicativo','contributore')
    and exists (
      select 1
      from public.account_role_assignments r
      where r.account_id = public.access_current_account_id()
        and r.role_code = p_role
        and r.assignment_status = 'active'
    )
  );
$$;

create or replace function public.access_is_editor_assigned()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select public.access_has_assigned_application_role('redattore');
$$;

create or replace function public.access_is_application_admin_assigned()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select public.access_has_assigned_application_role('amministratore_applicativo');
$$;

-- Preserve the existing helper name used throughout RLS/RPC code. Contributor
-- remains a normal AAL1 role; only redattore/amministratore_applicativo require
-- a JWT elevated to AAL2 before privileged authorization becomes true.
create or replace function public.access_has_active_application_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    public.access_has_assigned_application_role(p_role)
    and (
      p_role = 'contributore'
      or coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
    )
  );
$$;

create or replace function public.access_is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.access_has_active_application_role('redattore');
$$;

create or replace function public.access_is_application_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.access_has_active_application_role('amministratore_applicativo');
$$;

revoke all on function public.access_has_assigned_application_role(text)
  from public, anon, authenticated, service_role;
revoke all on function public.access_is_editor_assigned()
  from public, anon, authenticated, service_role;
revoke all on function public.access_is_application_admin_assigned()
  from public, anon, authenticated, service_role;
revoke all on function public.access_has_active_application_role(text)
  from public, anon, authenticated, service_role;
revoke all on function public.access_is_editor()
  from public, anon, authenticated, service_role;
revoke all on function public.access_is_application_admin()
  from public, anon, authenticated, service_role;

grant execute on function public.access_has_assigned_application_role(text) to authenticated;
grant execute on function public.access_is_editor_assigned() to authenticated;
grant execute on function public.access_is_application_admin_assigned() to authenticated;
grant execute on function public.access_has_active_application_role(text) to authenticated;
grant execute on function public.access_is_editor() to authenticated;
grant execute on function public.access_is_application_admin() to authenticated;

comment on function public.access_has_assigned_application_role(text) is
  'Raw application-role assignment check for routing. Does not itself grant privileged authorization.';
comment on function public.access_has_active_application_role(text) is
  'Application-role authorization gate. Contributor remains AAL1; redattore and amministratore_applicativo require JWT aal=aal2.';

-- Production currently contains legacy self-service account RPCs that still
-- use deprecated auth.role() checks. Anonymous Supabase users also assume the
-- authenticated Postgres role, so these RPCs explicitly require a permanent
-- authenticated user via auth.uid() + the signed is_anonymous JWT claim.
create or replace function public.access_self_delete_preflight()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_account public.accounts%rowtype;
  v_is_last_admin boolean := false;
  v_blockers text[] := array[]::text[];
begin
  if v_uid is null
     or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'not authenticated'
      using errcode = '42501';
  end if;

  select *
  into v_account
  from public.accounts as a
  where a.auth_user_id = v_uid;

  if not found then
    raise exception 'account not available'
      using errcode = 'P0002';
  end if;

  if exists (
    select 1
    from public.account_role_assignments as r
    where r.account_id = v_account.id
      and r.role_code = 'amministratore_applicativo'
      and r.assignment_status = 'active'
  ) then
    select not exists (
      select 1
      from public.account_role_assignments as r2
      join public.accounts as a2 on a2.id = r2.account_id
      where r2.role_code = 'amministratore_applicativo'
        and r2.assignment_status = 'active'
        and a2.account_status = 'active'
        and r2.account_id is distinct from v_account.id
    )
    into v_is_last_admin;

    if v_is_last_admin then
      v_blockers := array_append(v_blockers, 'last_application_admin');
    end if;
  end if;

  return jsonb_build_object(
    'account_id', v_account.id,
    'account_status', v_account.account_status,
    'can_proceed', cardinality(v_blockers) = 0,
    'blockers', to_jsonb(v_blockers),
    'profile_retained', v_account.person_id is not null,
    'auth_user_delete_required', true
  );
end;
$$;

create or replace function public.access_self_close_account()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_account public.accounts%rowtype;
  v_is_last_admin boolean := false;
begin
  if v_uid is null
     or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'not authenticated'
      using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('access:self-delete:admin-guard'));

  select *
  into v_account
  from public.accounts as a
  where a.auth_user_id = v_uid
  for update;

  if not found then
    raise exception 'account not available'
      using errcode = 'P0002';
  end if;

  if v_account.account_status = 'closed' then
    return jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'account_id', v_account.id,
      'account_status', 'closed',
      'profile_retained', v_account.person_id is not null,
      'auth_user_delete_required', true
    );
  end if;

  if exists (
    select 1
    from public.account_role_assignments as r
    where r.account_id = v_account.id
      and r.role_code = 'amministratore_applicativo'
      and r.assignment_status = 'active'
  ) then
    select not exists (
      select 1
      from public.account_role_assignments as r2
      join public.accounts as a2 on a2.id = r2.account_id
      where r2.role_code = 'amministratore_applicativo'
        and r2.assignment_status = 'active'
        and a2.account_status = 'active'
        and r2.account_id is distinct from v_account.id
    )
    into v_is_last_admin;

    if v_is_last_admin then
      raise exception 'self_delete_blocked: last_application_admin'
        using errcode = 'P0001',
              hint = 'appoint another active application administrator first';
    end if;
  end if;

  update public.account_role_assignments as r
  set
    assignment_status = 'revoked',
    revoked_at = coalesce(r.revoked_at, now()),
    updated_at = now()
  where r.account_id = v_account.id
    and r.assignment_status = 'active';

  update public.accounts as a
  set
    account_status = 'closed',
    closed_at = coalesce(a.closed_at, now()),
    status_reason = 'self_service_account_deletion',
    updated_at = now()
  where a.id = v_account.id;

  return jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'account_id', v_account.id,
    'account_status', 'closed',
    'profile_retained', v_account.person_id is not null,
    'auth_user_delete_required', true
  );
end;
$$;

revoke all on function public.access_self_delete_preflight()
  from public, anon, authenticated, service_role;
revoke all on function public.access_self_close_account()
  from public, anon, authenticated, service_role;

grant execute on function public.access_self_delete_preflight() to authenticated;
grant execute on function public.access_self_close_account() to authenticated;

comment on function public.access_self_delete_preflight() is
  'Self-service deletion preflight for permanent authenticated users only; anonymous Auth users are rejected.';
comment on function public.access_self_close_account() is
  'Closes the current permanent user account while protecting the final application administrator; anonymous Auth users are rejected.';

-- Service-role-only lifecycle RPCs are also present in the hosted database with
-- deprecated auth.role() checks. SECURITY DEFINER changes current_user, so the
-- signed JWT role claim is the correct request identity signal here.
create or replace function public.access_provision_account(p_auth_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account_id uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_auth_user_id is null then
    raise exception 'auth user id required' using errcode = '22004';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_auth_user_id) then
    raise exception 'auth user not available' using errcode = 'P0002';
  end if;

  select a.id into v_account_id
  from public.accounts a
  where a.auth_user_id = p_auth_user_id
  for update;

  if v_account_id is not null then
    raise exception 'account already exists' using errcode = '23505';
  end if;

  insert into public.accounts(
    auth_user_id, person_id, person_association_status, person_linked_at, account_status
  ) values (
    p_auth_user_id, null, null, null, 'registered'
  ) returning id into v_account_id;

  return v_account_id;
end;
$$;

create or replace function public.access_link_person(p_account_id uuid, p_person_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account public.accounts%rowtype;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_account_id is null or p_person_id is null then
    raise exception 'account id and person id required' using errcode = '22004';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = p_person_id and p.deleted_at is null
  ) then
    raise exception 'person not available' using errcode = 'P0002';
  end if;

  select * into v_account
  from public.accounts a
  where a.id = p_account_id
  for update;

  if not found then
    raise exception 'account not available' using errcode = 'P0002';
  end if;
  if v_account.account_status = 'closed' then
    raise exception 'account state incompatible' using errcode = '55000';
  end if;
  if v_account.person_id is not null and v_account.person_id is distinct from p_person_id then
    raise exception 'person association already set' using errcode = '55000';
  end if;

  update public.accounts a
  set
    person_id = p_person_id,
    person_association_status = 'verified',
    person_linked_at = coalesce(a.person_linked_at, now()),
    account_status = case when a.account_status in ('registered','limited') then 'active' else a.account_status end,
    activated_at = case when a.account_status in ('registered','limited') then coalesce(a.activated_at, now()) else a.activated_at end
  where a.id = p_account_id;

  return p_account_id;
end;
$$;

create or replace function public.assign_application_role(p_account_id uuid, p_role_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment_id uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_account_id is null or p_role_code is null then
    raise exception 'account id and role code required' using errcode = '22004';
  end if;
  if p_role_code not in ('redattore','amministratore_applicativo','contributore') then
    raise exception 'role not allowed' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.accounts a
    where a.id = p_account_id and a.account_status <> 'closed'
  ) then
    raise exception 'account not available' using errcode = 'P0002';
  end if;

  insert into public.account_role_assignments(
    account_id, role_code, assignment_status, assigned_at, revoked_at
  ) values (
    p_account_id, p_role_code, 'active', now(), null
  )
  on conflict(account_id, role_code) do update
    set assignment_status = 'active', revoked_at = null, assigned_at = now()
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

create or replace function public.provision_contributor_account(p_auth_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account_id uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_auth_user_id is null then
    raise exception 'auth user id required' using errcode = '22004';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_auth_user_id) then
    raise exception 'auth user not available' using errcode = 'P0002';
  end if;
  if not exists (
    select 1 from public.profiles p where p.id = p_auth_user_id and p.deleted_at is null
  ) then
    raise exception 'profile not available' using errcode = 'P0002';
  end if;

  select a.id into v_account_id
  from public.accounts a
  where a.auth_user_id = p_auth_user_id
  for update;

  if v_account_id is null then
    select public.access_provision_account(p_auth_user_id) into v_account_id;
  end if;

  perform public.access_link_person(v_account_id, p_auth_user_id);
  perform public.assign_application_role(v_account_id, 'contributore');

  return v_account_id;
end;
$$;

create or replace function public.revoke_contributor_role(p_account_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment_id uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_account_id is null then
    raise exception 'account id required' using errcode = '22004';
  end if;

  update public.account_role_assignments r
  set
    assignment_status = 'revoked',
    revoked_at = now(),
    updated_at = now()
  where r.account_id = p_account_id
    and r.role_code = 'contributore'
    and r.assignment_status = 'active'
  returning r.id into v_assignment_id;

  if v_assignment_id is null then
    raise exception 'active contributor role not available' using errcode = 'P0002';
  end if;

  return v_assignment_id;
end;
$$;

revoke all on function public.access_provision_account(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.access_link_person(uuid,uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.assign_application_role(uuid,text)
  from public, anon, authenticated, service_role;
revoke all on function public.provision_contributor_account(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.revoke_contributor_role(uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.access_provision_account(uuid) to service_role;
grant execute on function public.access_link_person(uuid,uuid) to service_role;
grant execute on function public.assign_application_role(uuid,text) to service_role;
grant execute on function public.provision_contributor_account(uuid) to service_role;
grant execute on function public.revoke_contributor_role(uuid) to service_role;

comment on function public.access_provision_account(uuid) is
  'Service-role-only account provisioning RPC; authorization uses the signed JWT role claim.';
comment on function public.access_link_person(uuid,uuid) is
  'Service-role-only account/person linking RPC; authorization uses the signed JWT role claim.';
comment on function public.assign_application_role(uuid,text) is
  'Service-role-only application-role assignment RPC; authorization uses the signed JWT role claim.';
comment on function public.provision_contributor_account(uuid) is
  'Service-role-only contributor provisioning RPC; authorization uses the signed JWT role claim.';
comment on function public.revoke_contributor_role(uuid) is
  'Service-role-only contributor revocation RPC; authorization uses the signed JWT role claim.';
