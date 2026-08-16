-- A3.4b — Access/RLS v1 business-management RPCs
-- Implements Impresa grant mutation RPCs from:
--   docs/architecture/access/application-access-model-v1.md (§9.3–§9.4, B1/B3)
--   docs/architecture/access/application-access-physical-v1.md (§8)
--   docs/architecture/access/application-access-migration-plan-v1.md §6
--
-- Scope of this unit only:
--   public.access_bootstrap_business_grant(uuid)
--   public.grant_business_management(uuid)
--   public.revoke_business_management(uuid)
--
-- Autorevoca is consolidated into revoke_business_management (Plan/A2).
--
-- Explicitly out of scope: membership CRUD; membership role changes;
-- verification workflow; last-manager trigger; Org membership; policies;
-- table GRANT; seeds; identity RPCs (A3.4a); helper modifications.
--
-- SECURITY DEFINER rationale: management_authorizations is deny-by-default.
-- Writes require DEFINER after explicit actor checks. Empty search_path;
-- fully qualified names; no dynamic SQL.

-- ---------------------------------------------------------------------------
-- 1) Bootstrap first Impresa management grant (Adm/Svc; B1)
-- ---------------------------------------------------------------------------
create function public.access_bootstrap_business_grant (p_membership_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_membership public.business_memberships%rowtype;
  v_auth_id uuid;
  v_auth_status text;
  v_other_granted boolean;
begin
  if not v_is_svc and not v_is_adm then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_membership_id is null then
    raise exception 'membership id required'
      using errcode = '22004';
  end if;

  select *
  into v_membership
  from public.business_memberships as m
  where m.id = p_membership_id
  for update;

  if not found then
    raise exception 'membership not available'
      using errcode = 'P0002';
  end if;

  if v_membership.relation_status is distinct from 'active'
     or v_membership.ended_at is not null then
    raise exception 'membership state incompatible'
      using errcode = '55000';
  end if;

  -- Target Persona must have an operational Account (A1 §9.3).
  if not exists (
    select 1
    from public.accounts as a
    where a.person_id = v_membership.person_id
      and a.account_status = 'active'
      and a.person_association_status in ('declared', 'verified')
  ) then
    raise exception 'target account not operational'
      using errcode = '55000';
  end if;

  select exists (
    select 1
    from public.business_membership_management_authorizations as bmma
    join public.business_memberships as m
      on m.id = bmma.membership_id
    where m.business_id = v_membership.business_id
      and bmma.authorization_status = 'granted'
      and bmma.membership_id is distinct from p_membership_id
  )
  into v_other_granted;

  if v_other_granted then
    raise exception 'first grant already exists for business'
      using errcode = '55000';
  end if;

  select bmma.id, bmma.authorization_status
  into v_auth_id, v_auth_status
  from public.business_membership_management_authorizations as bmma
  where bmma.membership_id = p_membership_id
  for update;

  if v_auth_id is not null then
    if v_auth_status = 'granted' then
      return v_auth_id;
    end if;

    update public.business_membership_management_authorizations as bmma
    set
      authorization_status = 'granted',
      granted_at = coalesce(bmma.granted_at, now()),
      revoked_at = null
    where bmma.id = v_auth_id;

    return v_auth_id;
  end if;

  begin
    insert into public.business_membership_management_authorizations (
      membership_id,
      authorization_status,
      granted_at,
      revoked_at
    ) values (
      p_membership_id,
      'granted',
      now(),
      null
    )
    returning id into v_auth_id;
  exception
    when unique_violation then
      select bmma.id
      into v_auth_id
      from public.business_membership_management_authorizations as bmma
      where bmma.membership_id = p_membership_id;

      update public.business_membership_management_authorizations as bmma
      set
        authorization_status = 'granted',
        granted_at = coalesce(bmma.granted_at, now()),
        revoked_at = null
      where bmma.id = v_auth_id
        and bmma.authorization_status = 'revoked';

      return v_auth_id;
  end;

  return v_auth_id;
end;
$$;

comment on function public.access_bootstrap_business_grant (uuid) is
  'Access/RLS v1 business-management RPC (Adm/Svc; B1). Creates or reactivates the first granted row in business_membership_management_authorizations for an Impresa via an existing active membership. Does not create membership, transfer ownership, or infer rights from role_id. Ordinary Accounts cannot call this path. External verification remains applicative (not stored). Returns authorization id. SECURITY DEFINER with empty search_path; independent of future RLS policies.';

revoke all on function public.access_bootstrap_business_grant (uuid) from public;
grant execute on function public.access_bootstrap_business_grant (uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2) Grant subsequent management (Adm/Svc/ACT; B3; no self-grant)
-- ---------------------------------------------------------------------------
create function public.grant_business_management (p_membership_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_actor_person_id uuid := public.access_current_person_id();
  v_membership public.business_memberships%rowtype;
  v_auth_id uuid;
  v_auth_status text;
  v_bootstrap_done boolean;
begin
  if p_membership_id is null then
    raise exception 'membership id required'
      using errcode = '22004';
  end if;

  if not v_is_svc and not v_is_adm then
    if not public.access_is_active_account() then
      raise exception 'account not operational'
        using errcode = '55000';
    end if;
    if v_actor_person_id is null then
      raise exception 'not authorized'
        using errcode = '42501';
    end if;
  end if;

  select *
  into v_membership
  from public.business_memberships as m
  where m.id = p_membership_id
  for update;

  if not found then
    raise exception 'membership not available'
      using errcode = 'P0002';
  end if;

  if v_membership.relation_status is distinct from 'active'
     or v_membership.ended_at is not null then
    raise exception 'membership state incompatible'
      using errcode = '55000';
  end if;

  -- Autoconcessione always forbidden (including Adm/ACT).
  if v_actor_person_id is not null
     and v_actor_person_id = v_membership.person_id then
    raise exception 'self-grant not allowed'
      using errcode = '42501';
  end if;

  if not v_is_svc and not v_is_adm then
    if not public.access_can_act_for_business(v_membership.business_id) then
      raise exception 'not authorized'
        using errcode = '42501';
    end if;
  end if;

  -- Subsequent grants require a prior granted authorization on the Impresa.
  select exists (
    select 1
    from public.business_membership_management_authorizations as bmma
    join public.business_memberships as m
      on m.id = bmma.membership_id
    where m.business_id = v_membership.business_id
      and bmma.authorization_status = 'granted'
  )
  into v_bootstrap_done;

  if not v_bootstrap_done then
    raise exception 'business grant not bootstrapped'
      using errcode = '55000';
  end if;

  if not exists (
    select 1
    from public.accounts as a
    where a.person_id = v_membership.person_id
      and a.account_status = 'active'
      and a.person_association_status in ('declared', 'verified')
  ) then
    raise exception 'target account not operational'
      using errcode = '55000';
  end if;

  select bmma.id, bmma.authorization_status
  into v_auth_id, v_auth_status
  from public.business_membership_management_authorizations as bmma
  where bmma.membership_id = p_membership_id
  for update;

  if v_auth_id is not null then
    if v_auth_status = 'granted' then
      return v_auth_id;
    end if;

    -- Reactivation of a revoked row is a grant action: still no self-grant.
    update public.business_membership_management_authorizations as bmma
    set
      authorization_status = 'granted',
      granted_at = now(),
      revoked_at = null
    where bmma.id = v_auth_id;

    return v_auth_id;
  end if;

  begin
    insert into public.business_membership_management_authorizations (
      membership_id,
      authorization_status,
      granted_at,
      revoked_at
    ) values (
      p_membership_id,
      'granted',
      now(),
      null
    )
    returning id into v_auth_id;
  exception
    when unique_violation then
      select bmma.id
      into v_auth_id
      from public.business_membership_management_authorizations as bmma
      where bmma.membership_id = p_membership_id;

      update public.business_membership_management_authorizations as bmma
      set
        authorization_status = 'granted',
        granted_at = now(),
        revoked_at = null
      where bmma.id = v_auth_id
        and bmma.authorization_status = 'revoked';

      return v_auth_id;
  end;

  return v_auth_id;
end;
$$;

comment on function public.grant_business_management (uuid) is
  'Access/RLS v1 business-management RPC (Adm/Svc/ACT; B3). Grants or reactivates management authorization on an active membership of an Impresa that already has a bootstrapped grant. Autoconcessione is always forbidden. Ordinary actors require access_can_act_for_business on the same Impresa. Does not create membership, change role_id, or transfer ownership. Returns authorization id. SECURITY DEFINER with empty search_path.';

revoke all on function public.grant_business_management (uuid) from public;
grant execute on function public.grant_business_management (uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3) Revoke / self-revoke management (Adm/Svc/ACT/self; B3)
-- ---------------------------------------------------------------------------
create function public.revoke_business_management (p_authorization_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_actor_person_id uuid := public.access_current_person_id();
  v_bmma public.business_membership_management_authorizations%rowtype;
  v_membership public.business_memberships%rowtype;
  v_allowed boolean := false;
begin
  if p_authorization_id is null then
    raise exception 'authorization id required'
      using errcode = '22004';
  end if;

  select *
  into v_bmma
  from public.business_membership_management_authorizations as bmma
  where bmma.id = p_authorization_id
  for update;

  if not found then
    raise exception 'authorization not available'
      using errcode = 'P0002';
  end if;

  select *
  into v_membership
  from public.business_memberships as m
  where m.id = v_bmma.membership_id;

  if not found then
    raise exception 'membership not available'
      using errcode = 'P0002';
  end if;

  if v_is_svc or v_is_adm then
    v_allowed := true;
  elsif v_actor_person_id is not null
        and v_actor_person_id = v_membership.person_id then
    -- Autorevoca of own grant.
    if not public.access_is_active_account() then
      raise exception 'account not operational'
        using errcode = '55000';
    end if;
    v_allowed := true;
  elsif public.access_can_act_for_business(v_membership.business_id) then
    -- Other granted manager on the same Impresa.
    v_allowed := true;
  end if;

  if not v_allowed then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if v_bmma.authorization_status = 'revoked' then
    return v_bmma.id;
  end if;

  update public.business_membership_management_authorizations as bmma
  set
    authorization_status = 'revoked',
    revoked_at = coalesce(bmma.revoked_at, now())
  where bmma.id = p_authorization_id;

  return p_authorization_id;
end;
$$;

comment on function public.revoke_business_management (uuid) is
  'Access/RLS v1 business-management RPC (Adm/Svc/other ACT/self; B3). Sets authorization_status=revoked and revoked_at on business_membership_management_authorizations. Does not DELETE the row, close membership, transfer ownership, or enforce last-manager retention in DB. Autorevoca is limited to the caller Person owning the membership. Idempotent when already revoked. Returns authorization id. SECURITY DEFINER with empty search_path.';

revoke all on function public.revoke_business_management (uuid) from public;
grant execute on function public.revoke_business_management (uuid) to authenticated, service_role;
