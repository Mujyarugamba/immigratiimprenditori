begin;

create or replace function public.assign_application_role(p_account_id uuid, p_role_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'not authorized' using errcode='42501';
  end if;
  if p_account_id is null or p_role_code is null then
    raise exception 'account id and role code required' using errcode='22004';
  end if;
  if p_role_code not in ('redattore','amministratore_applicativo','contributore') then
    raise exception 'role not allowed' using errcode='22023';
  end if;
  if not exists(
    select 1 from public.accounts a
    where a.id=p_account_id and a.account_status<>'closed'
  ) then
    raise exception 'account not available' using errcode='P0002';
  end if;

  insert into public.account_role_assignments(
    account_id, role_code, assignment_status, assigned_at, revoked_at
  ) values (
    p_account_id, p_role_code, 'active', now(), null
  )
  on conflict(account_id,role_code) do update
    set assignment_status='active', revoked_at=null, assigned_at=now()
  returning id into v_assignment_id;

  return v_assignment_id;
end;
$$;

commit;
