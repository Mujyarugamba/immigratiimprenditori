-- A3.4a — Access/RLS v1 identity RPCs
-- Implements identity/role mutation RPCs from:
--   docs/architecture/access/application-access-model-v1.md (§11, B5)
--   docs/architecture/access/application-access-physical-v1.md (§10–§11, §19)
--   docs/architecture/access/application-access-migration-plan-v1.md §6
--
-- Scope of this unit only:
--   public.access_provision_account(uuid)
--   public.access_link_person(uuid, uuid)
--   public.access_close_account(uuid)
--   public.assign_application_role(uuid, text)
--   public.revoke_application_role(uuid)
--
-- Explicitly out of scope / SKIP in this unit:
--   access_update_own_account — no self-service columns on public.accounts yet
--   update_own_profile — A2 v1 chooses column-level GRANT; path completed in A4.2
--   bootstrap primo Adm — service/SQL controllato fuori migration pubbliche (B5)
--   policies; table GRANT; seeds; business-management RPCs (A3.4b);
--   modifications to A3.1–A3.3 helpers.
--
-- SECURITY DEFINER rationale: accounts / account_role_assignments are
-- deny-by-default (RLS on, 0 policies, REVOKE). Writes require DEFINER after
-- explicit actor checks. Empty search_path; fully qualified names; no dynamic SQL.

-- ---------------------------------------------------------------------------
-- 1) Provision Account (Svc-only)
-- ---------------------------------------------------------------------------
create function public.access_provision_account (p_auth_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account_id uuid;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_auth_user_id is null then
    raise exception 'auth user id required'
      using errcode = '22004';
  end if;

  if not exists (
    select 1
    from auth.users as u
    where u.id = p_auth_user_id
  ) then
    raise exception 'auth user not available'
      using errcode = 'P0002';
  end if;

  select a.id
  into v_account_id
  from public.accounts as a
  where a.auth_user_id = p_auth_user_id
  for update;

  if v_account_id is not null then
    raise exception 'account already exists'
      using errcode = '23505';
  end if;

  begin
    insert into public.accounts (
      auth_user_id,
      person_id,
      person_association_status,
      person_linked_at,
      account_status
    ) values (
      p_auth_user_id,
      null,
      null,
      null,
      'registered'
    )
    returning id into v_account_id;
  exception
    when unique_violation then
      raise exception 'account already exists'
        using errcode = '23505';
  end;

  return v_account_id;
end;
$$;

comment on function public.access_provision_account (uuid) is
  'Access/RLS v1 identity RPC (Svc-only). Inserts public.accounts for an existing auth.users id in account_status=registered with no Person, no elevated roles, and no business grant. Returns the new accounts.id. Does not create credentials, profiles, or auth.users. Rejects duplicate auth_user_id. SECURITY DEFINER with empty search_path; authorization is service_role only (EXECUTE not granted to anon/authenticated). Intended for post-signup provisioning before foundation RLS policies.';

revoke all on function public.access_provision_account (uuid) from public;
grant execute on function public.access_provision_account (uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 2) Link Account–Persona
-- ---------------------------------------------------------------------------
create function public.access_link_person (
  p_account_id uuid,
  p_person_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_uid uuid := auth.uid();
  v_account public.accounts%rowtype;
  v_assoc text;
begin
  if p_account_id is null or p_person_id is null then
    raise exception 'account id and person id required'
      using errcode = '22004';
  end if;

  if not v_is_svc and v_uid is null then
    raise exception 'not authenticated'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles as p
    where p.id = p_person_id
      and p.deleted_at is null
  ) then
    raise exception 'person not available'
      using errcode = 'P0002';
  end if;

  select *
  into v_account
  from public.accounts as a
  where a.id = p_account_id
  for update;

  if not found then
    raise exception 'account not available'
      using errcode = 'P0002';
  end if;

  if v_account.account_status = 'closed' then
    raise exception 'account state incompatible'
      using errcode = '55000';
  end if;

  if not v_is_svc and not v_is_adm then
    -- Self-service controlled: own Account only; own Persona only; no replace.
    if v_account.auth_user_id is distinct from v_uid then
      raise exception 'not authorized'
        using errcode = '42501';
    end if;
    if p_person_id is distinct from v_uid then
      raise exception 'not authorized'
        using errcode = '42501';
    end if;
    if v_account.account_status in ('suspended', 'disabled') then
      raise exception 'account not operational'
        using errcode = '55000';
    end if;
    v_assoc := 'declared';
  else
    -- Adm/Svc: may link administrated Account; verified association.
    v_assoc := 'verified';
  end if;

  if v_account.person_id is not null
     and v_account.person_id is distinct from p_person_id then
    raise exception 'person association already set'
      using errcode = '55000';
  end if;

  -- Contested association cannot be silently replaced; same Person may be
  -- re-asserted to verified by Adm/Svc only.
  if v_account.person_association_status = 'contested'
     and not v_is_svc
     and not v_is_adm then
    raise exception 'person association contested'
      using errcode = '55000';
  end if;

  if v_account.person_id is not distinct from p_person_id
     and v_account.person_association_status in ('declared', 'verified')
     and (
       (not v_is_svc and not v_is_adm and v_account.person_association_status = 'declared')
       or ((v_is_svc or v_is_adm) and v_account.person_association_status = 'verified')
     ) then
    return v_account.id;
  end if;

  update public.accounts as a
  set
    person_id = p_person_id,
    person_association_status = case
      when v_is_svc or v_is_adm then 'verified'
      else coalesce(a.person_association_status, v_assoc)
    end,
    person_linked_at = coalesce(a.person_linked_at, now()),
    account_status = case
      when a.account_status in ('registered', 'limited') then 'active'
      else a.account_status
    end,
    activated_at = case
      when a.account_status in ('registered', 'limited') then coalesce(a.activated_at, now())
      else a.activated_at
    end
  where a.id = p_account_id;

  return p_account_id;
exception
  when unique_violation then
    raise exception 'person already linked to another account'
      using errcode = '23505';
end;
$$;

comment on function public.access_link_person (uuid, uuid) is
  'Access/RLS v1 identity RPC. Links public.accounts to public.profiles (Persona) via person_id / person_association_status / person_linked_at. Self-service: caller may link only own Account to own profile id (auth.uid), association declared, and may activate registered|limited → active. Adm/Svc: may link administrated Account with verified association; cannot arbitrarily replace a different existing Person. Does not create Persona, elevate roles, or grant Impresa management. Contested associations are not bypassed by ordinary callers. Returns accounts.id. SECURITY DEFINER with empty search_path; works before foundation RLS.';

revoke all on function public.access_link_person (uuid, uuid) from public;
grant execute on function public.access_link_person (uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3) Close Account (Adm/Svc)
-- ---------------------------------------------------------------------------
create function public.access_close_account (p_account_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_account public.accounts%rowtype;
begin
  if not v_is_svc and not v_is_adm then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_account_id is null then
    raise exception 'account id required'
      using errcode = '22004';
  end if;

  select *
  into v_account
  from public.accounts as a
  where a.id = p_account_id
  for update;

  if not found then
    raise exception 'account not available'
      using errcode = 'P0002';
  end if;

  if v_account.account_status = 'closed' then
    return v_account.id;
  end if;

  update public.accounts as a
  set
    account_status = 'closed',
    closed_at = coalesce(a.closed_at, now())
  where a.id = p_account_id;

  return p_account_id;
end;
$$;

comment on function public.access_close_account (uuid) is
  'Access/RLS v1 identity RPC (Adm/Svc). Sets accounts.account_status=closed and closed_at (lifecycle close; no DELETE). Does not delete auth.users, profiles, memberships, role rows, or business grants. Idempotent when already closed. Ordinary self-close is not provided by this RPC. Returns accounts.id. SECURITY DEFINER with empty search_path.';

revoke all on function public.access_close_account (uuid) from public;
grant execute on function public.access_close_account (uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4) Assign elevated application role (Adm/Svc; no self-elevate)
-- ---------------------------------------------------------------------------
create function public.assign_application_role (
  p_account_id uuid,
  p_role_code text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_actor_account_id uuid := public.access_current_account_id();
  v_assignment_id uuid;
  v_status text;
begin
  if not v_is_svc and not v_is_adm then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_account_id is null or p_role_code is null then
    raise exception 'account id and role code required'
      using errcode = '22004';
  end if;

  if p_role_code not in ('redattore', 'amministratore_applicativo') then
    raise exception 'role not allowed'
      using errcode = '22023';
  end if;

  -- No self-elevate for authenticated Adm (B5). Svc may bootstrap first Adm.
  if not v_is_svc
     and v_actor_account_id is not null
     and v_actor_account_id = p_account_id then
    raise exception 'self-elevate not allowed'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.accounts as a
    where a.id = p_account_id
      and a.account_status <> 'closed'
  ) then
    raise exception 'account not available'
      using errcode = 'P0002';
  end if;

  select r.id, r.assignment_status
  into v_assignment_id, v_status
  from public.account_role_assignments as r
  where r.account_id = p_account_id
    and r.role_code = p_role_code
  for update;

  if v_assignment_id is not null then
    if v_status = 'active' then
      return v_assignment_id;
    end if;

    update public.account_role_assignments as r
    set
      assignment_status = 'active',
      revoked_at = null,
      assigned_at = now()
    where r.id = v_assignment_id;

    return v_assignment_id;
  end if;

  begin
    insert into public.account_role_assignments (
      account_id,
      role_code,
      assignment_status,
      assigned_at,
      revoked_at
    ) values (
      p_account_id,
      p_role_code,
      'active',
      now(),
      null
    )
    returning id into v_assignment_id;
  exception
    when unique_violation then
      select r.id
      into v_assignment_id
      from public.account_role_assignments as r
      where r.account_id = p_account_id
        and r.role_code = p_role_code;

      update public.account_role_assignments as r
      set
        assignment_status = 'active',
        revoked_at = null,
        assigned_at = now()
      where r.id = v_assignment_id
        and r.assignment_status = 'revoked';

      return v_assignment_id;
  end;

  return v_assignment_id;
end;
$$;

comment on function public.assign_application_role (uuid, text) is
  'Access/RLS v1 identity RPC (Adm/Svc). Inserts or reactivates public.account_role_assignments for role_code redattore|amministratore_applicativo (UNIQUE account_id+role_code). No self-elevate for authenticated callers (B5). Does not create account_registrato, does not auto-grant the other elevated role, and does not protect the last Adm in DB. Returns assignment id. SECURITY DEFINER with empty search_path. First Adm bootstrap remains Svc/SQL outside ordinary authenticated use.';

revoke all on function public.assign_application_role (uuid, text) from public;
grant execute on function public.assign_application_role (uuid, text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5) Revoke elevated application role (Adm/Svc)
-- ---------------------------------------------------------------------------
create function public.revoke_application_role (p_assignment_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_row public.account_role_assignments%rowtype;
begin
  if not v_is_svc and not v_is_adm then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_assignment_id is null then
    raise exception 'assignment id required'
      using errcode = '22004';
  end if;

  select *
  into v_row
  from public.account_role_assignments as r
  where r.id = p_assignment_id
  for update;

  if not found then
    raise exception 'assignment not available'
      using errcode = 'P0002';
  end if;

  if v_row.assignment_status = 'revoked' then
    return v_row.id;
  end if;

  update public.account_role_assignments as r
  set
    assignment_status = 'revoked',
    revoked_at = coalesce(r.revoked_at, now())
  where r.id = p_assignment_id;

  return p_assignment_id;
end;
$$;

comment on function public.revoke_application_role (uuid) is
  'Access/RLS v1 identity RPC (Adm/Svc). Sets account_role_assignments.assignment_status=revoked and revoked_at. Does not DELETE the row. Last-Adm protection is application-level only (not enforced here). Idempotent when already revoked. Returns assignment id. SECURITY DEFINER with empty search_path.';

revoke all on function public.revoke_application_role (uuid) from public;
grant execute on function public.revoke_application_role (uuid) to authenticated, service_role;
