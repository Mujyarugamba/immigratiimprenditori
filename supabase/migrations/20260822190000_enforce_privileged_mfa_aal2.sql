-- Mandatory MFA enforcement for privileged editorial roles.
-- Branch/local validation only. Production activation remains an explicit release step.
--
-- `access_has_assigned_application_role` answers only whether a role is assigned;
-- it is used by the login/MFA routing layer while the session is still AAL1.
-- Existing operational helpers are redefined to require AAL2 so every current
-- RLS policy and SECURITY DEFINER function that calls them inherits the MFA gate.

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
    and p_role in ('redattore','amministratore_applicativo')
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

-- Preserve the existing public helper names used throughout RLS/RPC code, but
-- make AAL2 part of their authorization semantics for privileged operations.
create or replace function public.access_has_active_application_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    public.access_has_assigned_application_role(p_role)
    and coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
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
  'Raw privileged role assignment check for login/MFA routing. Does not authorize privileged operations.';
comment on function public.access_has_active_application_role(text) is
  'Privileged application-role authorization gate. Requires an active assigned role and JWT aal=aal2.';
