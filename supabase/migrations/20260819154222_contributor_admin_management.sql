begin;

create or replace function public.provision_contributor_account(p_auth_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_account_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_auth_user_id is null then
    raise exception 'auth user id required' using errcode = '22004';
  end if;
  if not exists (select 1 from auth.users u where u.id = p_auth_user_id) then
    raise exception 'auth user not available' using errcode = 'P0002';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_auth_user_id and p.deleted_at is null) then
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
$function$;

create or replace function public.revoke_contributor_role(p_account_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_assignment_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_account_id is null then
    raise exception 'account id required' using errcode = '22004';
  end if;

  update public.account_role_assignments r
  set assignment_status = 'revoked',
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
$function$;

revoke all privileges on function public.provision_contributor_account(uuid) from public, anon, authenticated, service_role;
grant execute on function public.provision_contributor_account(uuid) to service_role;

revoke all privileges on function public.revoke_contributor_role(uuid) from public, anon, authenticated, service_role;
grant execute on function public.revoke_contributor_role(uuid) to service_role;

commit;
