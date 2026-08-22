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
