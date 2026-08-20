begin;

create or replace function public.access_has_active_application_role(p_role text)
returns boolean
language sql
stable
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

commit;
