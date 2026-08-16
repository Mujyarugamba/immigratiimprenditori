-- L1.3-M4 — Management reassignment cases (orphan ACT / org sheet owner)
-- Depends on: Access business grants, organizations ternary ownership, accounts, profiles.
-- Companion: M3 self-delete (20260817100000) opens/consumes these cases — apply M3 then M4,
--   OR apply both before enabling self-delete (recommended sequential M3→M4).
--
-- Scope ONLY:
--   public.management_reassignment_cases
--   open helpers + AFTER triggers on BMMA (zero ACT → pending case)
--   Adm resolve RPCs (canonical bootstrap grant / org owner_person_id update)
--   RLS admin SELECT
--
-- Explicitly OUT:
--   auto-transfer of ownership/ACT; delete of businesses/orgs;
--   generic ticketing/CRM/moderation;
--   JSONB entity bags; new application roles;
--   last application-admin self-delete (still M3 blocker);
--   M2 legal archive; public “senza proprietario” UX;
--   permanent apply without human auth.

-- ---------------------------------------------------------------------------
-- 0) Allow authorized M4 org owner reassignment past ownership-immutability trigger
-- ---------------------------------------------------------------------------
create or replace function public.access_reject_owner_cols_mutation ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  -- M4 Adm resolve sets app.allow_management_reassignment=on for organizations only.
  if tg_table_name = 'organizations'
     and current_setting('app.allow_management_reassignment', true) is not distinct from 'on' then
    return new;
  end if;

  if tg_table_name in (
    'service_offers', 'service_requests', 'events',
    'organizations', 'collaborations', 'contents'
  ) then
    if new.owner_person_id is distinct from old.owner_person_id
       or new.owner_business_id is distinct from old.owner_business_id then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  if tg_table_name in ('organizations', 'collaborations', 'contents') then
    if new.owned_by_editorial is distinct from old.owned_by_editorial then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  if tg_table_name in (
    'international_market_presences',
    'international_market_interests',
    'international_commercial_relations',
    'internationalization_needs'
  ) then
    if new.person_id is distinct from old.person_id
       or new.business_id is distinct from old.business_id
       or new.subject_kind is distinct from old.subject_kind then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  if tg_table_name = 'professional_profiles' then
    if new.person_id is distinct from old.person_id then
      raise exception 'ownership is immutable'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

comment on function public.access_reject_owner_cols_mutation () is
  'Access ownership immutability guard. M4 exception: organizations owner_* may change when session GUC app.allow_management_reassignment=on (Adm resolve RPC only).';

-- ---------------------------------------------------------------------------
-- 1) Cases table — minimal operational workflow (NOT M2)
-- ---------------------------------------------------------------------------
create table public.management_reassignment_cases (
  id uuid not null default gen_random_uuid (),
  entity_kind text not null,
  business_id uuid null,
  organization_id uuid null,
  reason_code text not null,
  status text not null default 'pending',
  opened_at timestamptz not null default now (),
  -- Technical refs only (minimized). Nullable if trigger Account/Person later wiped.
  trigger_account_id uuid null,
  trigger_person_id uuid null,
  resolved_at timestamptz null,
  resolved_by_account_id uuid null,
  resolution_note text null,
  constraint management_reassignment_cases_pkey primary key (id),
  constraint mrc_entity_kind_check check (
    entity_kind in ('business', 'organization')
  ),
  constraint mrc_entity_xor_check check (
    (
      entity_kind = 'business'
      and business_id is not null
      and organization_id is null
    )
    or (
      entity_kind = 'organization'
      and organization_id is not null
      and business_id is null
    )
  ),
  constraint mrc_reason_code_check check (
    reason_code in (
      'last_manager_account_deletion',
      'last_manager_grant_revoked',
      'organization_owner_account_deletion'
    )
  ),
  constraint mrc_status_check check (
    status in ('pending', 'resolved')
  ),
  constraint mrc_resolved_gate_check check (
    (
      status = 'pending'
      and resolved_at is null
      and resolved_by_account_id is null
    )
    or (
      status = 'resolved'
      and resolved_at is not null
    )
  ),
  constraint mrc_resolution_note_chk check (
    resolution_note is null
    or (
      length(btrim(resolution_note)) > 0
      and length(resolution_note) <= 500
      and position('@' in resolution_note) = 0
    )
  ),
  constraint mrc_business_id_fkey
    foreign key (business_id)
    references public.businesses (id)
    on update no action
    on delete cascade,
  constraint mrc_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update no action
    on delete cascade,
  constraint mrc_trigger_account_id_fkey
    foreign key (trigger_account_id)
    references public.accounts (id)
    on update no action
    on delete set null,
  constraint mrc_trigger_person_id_fkey
    foreign key (trigger_person_id)
    references public.profiles (id)
    on update no action
    on delete set null,
  constraint mrc_resolved_by_account_id_fkey
    foreign key (resolved_by_account_id)
    references public.accounts (id)
    on update no action
    on delete set null
);

comment on table public.management_reassignment_cases is
  'L1.3-M4 operational workflow: entity needs management reassignment after loss of last Impresa ACT grant or person-owned Organization sheet owner became non-operational. NOT a legal archive (M2), NOT generic tickets. No auto-transfer. Admin resolves via canonical ACT bootstrap / owner_person_id update.';

comment on column public.management_reassignment_cases.entity_kind is
  'Typed entity: business | organization. XOR with business_id / organization_id.';

comment on column public.management_reassignment_cases.reason_code is
  'Closed catalog: last_manager_account_deletion | last_manager_grant_revoked | organization_owner_account_deletion.';

comment on column public.management_reassignment_cases.status is
  'pending | resolved. At most one pending case per business_id / organization_id (partial UNIQUE).';

comment on column public.management_reassignment_cases.trigger_account_id is
  'Optional technical Account that caused orphaning. ON DELETE SET NULL. No email/PII.';

comment on column public.management_reassignment_cases.trigger_person_id is
  'Optional technical Persona. ON DELETE SET NULL. Org cases keep organizations.owner_person_id on tombstone until Adm resolve.';

create unique index management_reassignment_cases_pending_business_uidx
  on public.management_reassignment_cases (business_id)
  where status = 'pending' and business_id is not null;

create unique index management_reassignment_cases_pending_organization_uidx
  on public.management_reassignment_cases (organization_id)
  where status = 'pending' and organization_id is not null;

create index management_reassignment_cases_status_opened_idx
  on public.management_reassignment_cases (status, opened_at desc);

alter table public.management_reassignment_cases enable row level security;

revoke all on table public.management_reassignment_cases from public;
revoke all on table public.management_reassignment_cases from anon, authenticated;

-- Admin SELECT only (no public, no editor, no ordinary authenticated write via table grants)
create policy management_reassignment_cases_select_admin
  on public.management_reassignment_cases
  for select
  to authenticated
  using (public.access_is_application_admin());

grant select on table public.management_reassignment_cases to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Open helpers (idempotent pending) — called from triggers / M3 DEFINER
-- ---------------------------------------------------------------------------
create function public.access_m4_open_business_reassignment (
  p_business_id uuid,
  p_reason_code text,
  p_trigger_account_id uuid default null,
  p_trigger_person_id uuid default null,
  p_allow_while_granted boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_has_grant boolean;
begin
  if p_business_id is null then
    raise exception 'business id required'
      using errcode = '22004';
  end if;

  if p_reason_code not in (
    'last_manager_account_deletion',
    'last_manager_grant_revoked'
  ) then
    raise exception 'invalid reason_code'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('m4biz:' || p_business_id::text));

  select exists (
    select 1
    from public.business_membership_management_authorizations as bmma
    join public.business_memberships as m
      on m.id = bmma.membership_id
    where m.business_id = p_business_id
      and bmma.authorization_status = 'granted'
  )
  into v_has_grant;

  -- Default: only persist orphan when ACT is already zero (trigger path).
  -- M3 pre-revoke passes p_allow_while_granted=true for last manager.
  if v_has_grant and not p_allow_while_granted then
    select c.id
    into v_id
    from public.management_reassignment_cases as c
    where c.business_id = p_business_id
      and c.status = 'pending'
    limit 1;
    return v_id;
  end if;

  select c.id
  into v_id
  from public.management_reassignment_cases as c
  where c.business_id = p_business_id
    and c.status = 'pending'
  for update;

  if v_id is not null then
    return v_id;
  end if;

  begin
    insert into public.management_reassignment_cases (
      entity_kind,
      business_id,
      organization_id,
      reason_code,
      status,
      trigger_account_id,
      trigger_person_id
    ) values (
      'business',
      p_business_id,
      null,
      p_reason_code,
      'pending',
      p_trigger_account_id,
      p_trigger_person_id
    )
    returning id into v_id;
  exception
    when unique_violation then
      select c.id
      into v_id
      from public.management_reassignment_cases as c
      where c.business_id = p_business_id
        and c.status = 'pending';
  end;

  return v_id;
end;
$$;

comment on function public.access_m4_open_business_reassignment (uuid, text, uuid, uuid, boolean) is
  'L1.3-M4. Idempotent open of pending business reassignment. Default only when ACT count is zero; p_allow_while_granted for M3 last-manager pre-revoke. Advisory-locks per business. SECURITY DEFINER; empty search_path.';

revoke all on function public.access_m4_open_business_reassignment (uuid, text, uuid, uuid, boolean) from public;
grant execute on function public.access_m4_open_business_reassignment (uuid, text, uuid, uuid, boolean) to service_role;

create function public.access_m4_open_organization_reassignment (
  p_organization_id uuid,
  p_reason_code text,
  p_trigger_account_id uuid default null,
  p_trigger_person_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_owner uuid;
begin
  if p_organization_id is null then
    raise exception 'organization id required'
      using errcode = '22004';
  end if;

  if p_reason_code is distinct from 'organization_owner_account_deletion' then
    raise exception 'invalid reason_code'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('m4org:' || p_organization_id::text));

  select o.owner_person_id
  into v_owner
  from public.organizations as o
  where o.id = p_organization_id
  for update;

  if not found then
    raise exception 'organization not available'
      using errcode = 'P0002';
  end if;

  -- Case records need for reassignment; canonical owner_person_id stays until Adm resolve
  -- (ternary CHECK forbids nulling person owner without inventing editorial/business owner).

  select c.id
  into v_id
  from public.management_reassignment_cases as c
  where c.organization_id = p_organization_id
    and c.status = 'pending'
  for update;

  if v_id is not null then
    return v_id;
  end if;

  begin
    insert into public.management_reassignment_cases (
      entity_kind,
      business_id,
      organization_id,
      reason_code,
      status,
      trigger_account_id,
      trigger_person_id
    ) values (
      'organization',
      null,
      p_organization_id,
      p_reason_code,
      'pending',
      p_trigger_account_id,
      p_trigger_person_id
    )
    returning id into v_id;
  exception
    when unique_violation then
      select c.id
      into v_id
      from public.management_reassignment_cases as c
      where c.organization_id = p_organization_id
        and c.status = 'pending';
  end;

  return v_id;
end;
$$;

comment on function public.access_m4_open_organization_reassignment (uuid, text, uuid, uuid) is
  'L1.3-M4. Idempotent open of pending organization reassignment (person sheet owner). Does not null owner_person_id, does not auto-pick officials, does not delete Org. SECURITY DEFINER; empty search_path. service_role + M3 DEFINER path.';

revoke all on function public.access_m4_open_organization_reassignment (uuid, text, uuid, uuid) from public;
grant execute on function public.access_m4_open_organization_reassignment (uuid, text, uuid, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 3) BMMA triggers — zero ACT ⇒ open case; grant restored ⇒ auto-resolve pending
-- ---------------------------------------------------------------------------
create function public.access_m4_bmma_after_status_change ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_business_id uuid;
  v_granted_left boolean;
begin
  select m.business_id
  into v_business_id
  from public.business_memberships as m
  where m.id = new.membership_id;

  if v_business_id is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('m4biz:' || v_business_id::text));

  select exists (
    select 1
    from public.business_membership_management_authorizations as bmma
    join public.business_memberships as m
      on m.id = bmma.membership_id
    where m.business_id = v_business_id
      and bmma.authorization_status = 'granted'
  )
  into v_granted_left;

  if not v_granted_left then
    perform public.access_m4_open_business_reassignment (
      v_business_id,
      'last_manager_grant_revoked',
      null,
      null,
      false
    );
  elsif new.authorization_status = 'granted' then
    -- Only auto-resolve when a canonical grant is (re)asserted — not when a
    -- non-last revoke leaves other managers (avoids wiping a pre-opened M3 case).
    update public.management_reassignment_cases as c
    set
      status = 'resolved',
      resolved_at = coalesce(c.resolved_at, now()),
      resolution_note = coalesce(c.resolution_note, 'canonical_grant_restored')
    where c.business_id = v_business_id
      and c.status = 'pending';
  end if;

  return new;
end;
$$;

comment on function public.access_m4_bmma_after_status_change () is
  'L1.3-M4. AFTER INSERT/UPDATE on BMMA: if Impresa has zero granted ACT, open pending reassignment case (idempotent); if grant exists, resolve pending case. Handles concurrent last-manager races via advisory lock. SECURITY DEFINER; empty search_path.';

create trigger bmma_m4_reassignment_after_status
after insert or update of authorization_status
on public.business_membership_management_authorizations
for each row
execute function public.access_m4_bmma_after_status_change ();

-- ---------------------------------------------------------------------------
-- 4) Resolve — business via canonical bootstrap ACT
-- ---------------------------------------------------------------------------
create function public.access_resolve_business_reassignment (
  p_case_id uuid,
  p_membership_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_actor uuid := public.access_current_account_id();
  v_case public.management_reassignment_cases%rowtype;
  v_membership public.business_memberships%rowtype;
  v_auth_id uuid;
begin
  if not v_is_svc and not v_is_adm then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_case_id is null or p_membership_id is null then
    raise exception 'case id and membership id required'
      using errcode = '22004';
  end if;

  select *
  into v_case
  from public.management_reassignment_cases as c
  where c.id = p_case_id
  for update;

  if not found then
    raise exception 'case not available'
      using errcode = 'P0002';
  end if;

  if v_case.entity_kind is distinct from 'business'
     or v_case.business_id is null then
    raise exception 'case is not a business reassignment'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('m4biz:' || v_case.business_id::text));

  select *
  into v_membership
  from public.business_memberships as m
  where m.id = p_membership_id
  for update;

  if not found then
    raise exception 'membership not available'
      using errcode = 'P0002';
  end if;

  if v_membership.business_id is distinct from v_case.business_id then
    raise exception 'membership does not belong to case business'
      using errcode = '22023';
  end if;

  if v_case.status = 'resolved' then
    -- Idempotent: ensure canonical grant path still attempted only if needed
    return v_case.id;
  end if;

  -- Canonical ACT: bootstrap first grant (Adm/Svc). Raises if grant already exists.
  begin
    v_auth_id := public.access_bootstrap_business_grant (p_membership_id);
  exception
    when others then
      -- If ACT already present, treat as resolved without inventing parallel authority
      if exists (
        select 1
        from public.business_membership_management_authorizations as bmma
        join public.business_memberships as m
          on m.id = bmma.membership_id
        where m.business_id = v_case.business_id
          and bmma.authorization_status = 'granted'
      ) then
        v_auth_id := null;
      else
        raise;
      end if;
  end;

  update public.management_reassignment_cases as c
  set
    status = 'resolved',
    resolved_at = now (),
    resolved_by_account_id = v_actor,
    resolution_note = 'canonical_act_bootstrap'
  where c.id = p_case_id
    and c.status = 'pending';

  return p_case_id;
end;
$$;

comment on function public.access_resolve_business_reassignment (uuid, uuid) is
  'L1.3-M4 Adm/Svc. Resolves pending business reassignment by calling canonical access_bootstrap_business_grant(membership_id), then marks case resolved. No parallel reassignment_manager_id. No auto-pick of member. SECURITY DEFINER; empty search_path.';

revoke all on function public.access_resolve_business_reassignment (uuid, uuid) from public;
grant execute on function public.access_resolve_business_reassignment (uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5) Resolve — organization canonical owner_person_id
-- ---------------------------------------------------------------------------
create function public.access_resolve_organization_reassignment (
  p_case_id uuid,
  p_new_owner_person_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_actor uuid := public.access_current_account_id();
  v_case public.management_reassignment_cases%rowtype;
  v_org public.organizations%rowtype;
begin
  if not v_is_svc and not v_is_adm then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_case_id is null or p_new_owner_person_id is null then
    raise exception 'case id and new owner person id required'
      using errcode = '22004';
  end if;

  select *
  into v_case
  from public.management_reassignment_cases as c
  where c.id = p_case_id
  for update;

  if not found then
    raise exception 'case not available'
      using errcode = 'P0002';
  end if;

  if v_case.entity_kind is distinct from 'organization'
     or v_case.organization_id is null then
    raise exception 'case is not an organization reassignment'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('m4org:' || v_case.organization_id::text));

  if not exists (
    select 1 from public.profiles as p where p.id = p_new_owner_person_id
  ) then
    raise exception 'new owner person not available'
      using errcode = 'P0002';
  end if;

  -- Target must have an operational Account (same spirit as business bootstrap)
  if not exists (
    select 1
    from public.accounts as a
    where a.person_id = p_new_owner_person_id
      and a.account_status = 'active'
      and a.person_association_status in ('declared', 'verified')
  ) then
    raise exception 'target account not operational'
      using errcode = '55000';
  end if;

  select *
  into v_org
  from public.organizations as o
  where o.id = v_case.organization_id
  for update;

  if not found then
    raise exception 'organization not available'
      using errcode = 'P0002';
  end if;

  if v_case.status = 'resolved'
     and v_org.owner_person_id is not distinct from p_new_owner_person_id then
    return v_case.id;
  end if;

  -- Canonical ownership update (ternary person-owned). Bypass ownership-immutability
  -- trigger only for this authorized Adm reassignment path (session GUC).
  perform set_config('app.allow_management_reassignment', 'on', true);

  update public.organizations as o
  set
    owner_person_id = p_new_owner_person_id,
    owner_business_id = null,
    owned_by_editorial = false
  where o.id = v_case.organization_id;

  perform set_config('app.allow_management_reassignment', 'off', true);

  update public.management_reassignment_cases as c
  set
    status = 'resolved',
    resolved_at = now (),
    resolved_by_account_id = v_actor,
    resolution_note = 'canonical_owner_person_assigned'
  where c.id = p_case_id
    and c.status = 'pending';

  return p_case_id;
end;
$$;

comment on function public.access_resolve_organization_reassignment (uuid, uuid) is
  'L1.3-M4 Adm/Svc. Resolves pending org reassignment by setting organizations.owner_person_id to an explicit operational Persona (canonical ternary ownership). No official auto-pick. No parallel ownership column. SECURITY DEFINER; empty search_path.';

revoke all on function public.access_resolve_organization_reassignment (uuid, uuid) from public;
grant execute on function public.access_resolve_organization_reassignment (uuid, uuid) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 6) Replace M3 self-delete RPCs — orphans open M4 cases (apply after M3)
-- ---------------------------------------------------------------------------
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
  v_orphan_business_ids uuid[] := array[]::uuid[];
  v_orphan_organization_ids uuid[] := array[]::uuid[];
  v_blockers text[] := array[]::text[];
  v_can_proceed boolean;
begin
  if auth.role() is distinct from 'authenticated' or v_uid is null then
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
      where r2.role_code = 'amministratore_applicativo'
        and r2.assignment_status = 'active'
        and r2.account_id is distinct from v_account.id
    )
    into v_is_last_admin;

    if v_is_last_admin then
      v_blockers := array_append(v_blockers, 'last_application_admin');
    end if;
  end if;

  if v_account.person_id is not null then
    select coalesce(array_agg(distinct m.business_id), array[]::uuid[])
    into v_orphan_business_ids
    from public.business_membership_management_authorizations as bmma
    join public.business_memberships as m
      on m.id = bmma.membership_id
    where m.person_id = v_account.person_id
      and bmma.authorization_status = 'granted'
      and not exists (
        select 1
        from public.business_membership_management_authorizations as o
        join public.business_memberships as om
          on om.id = o.membership_id
        where om.business_id = m.business_id
          and o.authorization_status = 'granted'
          and o.membership_id is distinct from bmma.membership_id
      );

    select coalesce(array_agg(o.id), array[]::uuid[])
    into v_orphan_organization_ids
    from public.organizations as o
    where o.owner_person_id = v_account.person_id;
  end if;

  if v_account.account_status = 'closed'
     and (
       v_account.person_id is null
       or exists (
         select 1
         from public.profiles as p
         where p.id = v_account.person_id
           and p.deleted_at is not null
       )
     ) then
    v_can_proceed := true;
    v_blockers := array[]::text[];
  else
    v_can_proceed := cardinality(v_blockers) = 0;
  end if;

  return jsonb_build_object(
    'account_id', v_account.id,
    'account_status', v_account.account_status,
    'can_proceed', v_can_proceed,
    'blockers', to_jsonb(v_blockers),
    'orphan_business_ids', to_jsonb(v_orphan_business_ids),
    'orphan_organization_ids', to_jsonb(v_orphan_organization_ids),
    'last_business_ids', to_jsonb(v_orphan_business_ids),
    'sole_organization_ids', to_jsonb(v_orphan_organization_ids),
    'm4_required', false,
    'm4_cases_will_open', (
      cardinality(v_orphan_business_ids) > 0
      or cardinality(v_orphan_organization_ids) > 0
    )
  );
end;
$$;

comment on function public.access_self_delete_preflight () is
  'L1.3-M3 as replaced by M4. Hard-blocks only last application admin. Orphan Impresa/Org → m4_cases_will_open; deletion opens pending cases. SECURITY DEFINER; empty search_path.';

revoke all on function public.access_self_delete_preflight () from public;
grant execute on function public.access_self_delete_preflight () to authenticated;

create or replace function public.access_self_delete_account ()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_account public.accounts%rowtype;
  v_person_id uuid;
  v_preflight jsonb;
  v_blockers jsonb;
  v_slug text;
  v_anon_label text := 'Referente rimosso';
  v_biz_id uuid;
  v_org_id uuid;
  v_cases_opened int := 0;
begin
  if auth.role() is distinct from 'authenticated' or v_uid is null then
    raise exception 'not authenticated'
      using errcode = '42501';
  end if;

  select *
  into v_account
  from public.accounts as a
  where a.auth_user_id = v_uid
  for update;

  if not found then
    raise exception 'account not available'
      using errcode = 'P0002';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_account.id::text));

  v_person_id := v_account.person_id;

  if v_account.account_status = 'closed' then
    if v_person_id is null
       or exists (
         select 1
         from public.profiles as p
         where p.id = v_person_id
           and p.deleted_at is not null
       ) then
      return jsonb_build_object(
        'ok', true,
        'idempotent', true,
        'account_id', v_account.id,
        'account_status', 'closed'
      );
    end if;
  end if;

  v_preflight := public.access_self_delete_preflight();
  v_blockers := v_preflight -> 'blockers';

  if coalesce((v_preflight ->> 'can_proceed')::boolean, false) is not true then
    raise exception 'self_delete_blocked: %', v_blockers::text
      using errcode = 'P0001',
            hint = 'last_application_admin cannot self-delete; appoint another admin first';
  end if;

  if v_person_id is not null then
    for v_biz_id in
      select distinct m.business_id
      from public.business_membership_management_authorizations as bmma
      join public.business_memberships as m
        on m.id = bmma.membership_id
      where m.person_id = v_person_id
        and bmma.authorization_status = 'granted'
        and not exists (
          select 1
          from public.business_membership_management_authorizations as o
          join public.business_memberships as om
            on om.id = o.membership_id
          where om.business_id = m.business_id
            and o.authorization_status = 'granted'
            and o.membership_id is distinct from bmma.membership_id
        )
    loop
      perform public.access_m4_open_business_reassignment (
        v_biz_id,
        'last_manager_account_deletion',
        v_account.id,
        v_person_id,
        true
      );
      v_cases_opened := v_cases_opened + 1;
    end loop;

    for v_org_id in
      select o.id
      from public.organizations as o
      where o.owner_person_id = v_person_id
    loop
      perform public.access_m4_open_organization_reassignment (
        v_org_id,
        'organization_owner_account_deletion',
        v_account.id,
        v_person_id
      );
      v_cases_opened := v_cases_opened + 1;
    end loop;
  end if;

  update public.account_role_assignments as r
  set
    assignment_status = 'revoked',
    revoked_at = coalesce(r.revoked_at, now())
  where r.account_id = v_account.id
    and r.assignment_status = 'active';

  if v_person_id is not null then
    update public.business_membership_management_authorizations as bmma
    set
      authorization_status = 'revoked',
      revoked_at = coalesce(bmma.revoked_at, now())
    from public.business_memberships as m
    where m.id = bmma.membership_id
      and m.person_id = v_person_id
      and bmma.authorization_status = 'granted';

    update public.business_memberships as m
    set
      relation_status = 'revoked',
      ended_at = coalesce(m.ended_at, current_date),
      visibility_status = case
        when m.visibility_status = 'public' then 'private'
        else m.visibility_status
      end
    where m.person_id = v_person_id
      and m.relation_status in ('active', 'suspended');

    delete from public.person_contact_channels as c
    where c.person_id = v_person_id;

    update public.professional_profiles as pp
    set
      publication_status = 'unpublished',
      visibility_status = 'private',
      professional_status = case
        when pp.professional_status in ('active', 'suspended') then 'ceased'
        else pp.professional_status
      end,
      professional_email = null,
      professional_phone = null,
      contacts_visibility = 'private',
      fee_visibility = 'private',
      headline = null,
      summary = null,
      experience_summary = null,
      availability_note = null
    where pp.person_id = v_person_id;

    update public.organization_officials as oo
    set
      person_id = null,
      display_label = coalesce(nullif(btrim(oo.display_label), ''), v_anon_label),
      email = null,
      phone = null
    where oo.person_id = v_person_id;

    v_slug := 'rimosso-' || replace(v_person_id::text, '-', '');

    update public.profiles as p
    set
      display_name = 'Profilo rimosso',
      slug = v_slug,
      bio = null,
      organization_name = null,
      organization_type = null,
      role_description = null,
      city = null,
      province = null,
      region = null,
      website = null,
      phone = null,
      avatar_url = null,
      is_public = false,
      is_active = false,
      deleted_at = coalesce(p.deleted_at, now())
    where p.id = v_person_id;
  end if;

  update public.accounts as a
  set
    account_status = 'closed',
    closed_at = coalesce(a.closed_at, now())
  where a.id = v_account.id;

  return jsonb_build_object(
    'ok', true,
    'idempotent', false,
    'account_id', v_account.id,
    'account_status', 'closed',
    'person_minimized', v_person_id is not null,
    'm4_cases_opened_hint', v_cases_opened,
    'auth_action_required', true
  );
end;
$$;

comment on function public.access_self_delete_account () is
  'L1.3-M3 as replaced by M4. Opens pending reassignment cases for sole Impresa ACT / org person owner, then revokes capabilities and soft-closes Account. Refuses only last application admin. No aggregate delete / no auto-transfer. SECURITY DEFINER; empty search_path.';

revoke all on function public.access_self_delete_account () from public;
grant execute on function public.access_self_delete_account () to authenticated;
