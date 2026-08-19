-- L1.3 post-split — Self-service account deletion for the editorial-only Supabase scope
--
-- The pre-split implementation depended on business/professional/organization tables
-- that moved out of this database. This version intentionally manages only Auth-facing
-- access state: Account + application roles. Persona/editorial records are not erased
-- automatically and remain subject to the privacy/editorial retention process.

create or replace function public.access_self_delete_preflight ()
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
  if auth.role() is distinct from 'authenticated' or v_uid is null then
    raise exception 'not authenticated'
      using errcode = '42501';
  end if;

  select * into v_account
  from public.accounts as a
  where a.auth_user_id = v_uid;

  if not found then
    raise exception 'account not available' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.account_role_assignments as r
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
    ) into v_is_last_admin;

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

comment on function public.access_self_delete_preflight () is
  'Post-split self-delete preflight for auth.uid(). Blocks deletion of the last active application administrator. Persona/editorial data are outside automatic account deletion.';
revoke all on function public.access_self_delete_preflight () from public;
grant execute on function public.access_self_delete_preflight () to authenticated;

create or replace function public.access_self_close_account ()
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
  if auth.role() is distinct from 'authenticated' or v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('access:self-delete:admin-guard'));

  select * into v_account
  from public.accounts as a
  where a.auth_user_id = v_uid
  for update;

  if not found then
    raise exception 'account not available' using errcode = 'P0002';
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
    select 1 from public.account_role_assignments as r
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
    ) into v_is_last_admin;

    if v_is_last_admin then
      raise exception 'self_delete_blocked: last_application_admin'
        using errcode = 'P0001', hint = 'appoint another active application administrator first';
    end if;
  end if;

  update public.account_role_assignments as r
  set assignment_status = 'revoked',
      revoked_at = coalesce(r.revoked_at, now()),
      updated_at = now()
  where r.account_id = v_account.id
    and r.assignment_status = 'active';

  update public.accounts as a
  set account_status = 'closed',
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

comment on function public.access_self_close_account () is
  'Post-split self-delete preparation. For auth.uid() only: atomically revokes active application roles and closes Account, while blocking the last active application admin. Server must then delete the same Auth user with service_role. Persona/editorial data are retained for separate privacy/editorial handling.';
revoke all on function public.access_self_close_account () from public;
grant execute on function public.access_self_close_account () to authenticated;
