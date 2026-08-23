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
