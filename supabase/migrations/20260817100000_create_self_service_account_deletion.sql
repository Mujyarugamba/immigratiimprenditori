-- L1.3-M3 — Self-service account deletion (DB contract)
-- Depends on: M1 terms_acceptances, M2 legal_retention_records, Access identity/grant RPCs.
--
-- Scope ONLY:
--   public.access_self_delete_preflight()
--   public.access_self_delete_account()
--
-- STANDALONE BEHAVIOR (before M4 applied):
--   Refuses sole Impresa ACT manager and org person-owner deletion (m4_required).
--   Refuses last application admin.
--
-- AFTER M4 (20260818100000) is applied:
--   M4 CREATE OR REPLACE replaces these functions so orphans open reassignment cases
--   and self-delete may proceed. Recommended apply order: M3 → M4.
--
-- Contract (when unblocked):
--   soft-close Account + revoke roles/grants + conclude memberships
--   + soft-unpublish/minimize Persona + delete person_contact_channels
--   + unpublish professional profile + anonymize organization_officials
--   Auth ban is APPLICATION/SERVER after RPC success.
--   No auto-delete of businesses/orgs; no auto-transfer.

-- ---------------------------------------------------------------------------
-- 1) Preflight
-- ---------------------------------------------------------------------------
create function public.access_self_delete_preflight ()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_account public.accounts%rowtype;
  v_is_last_admin boolean := false;
  v_last_business_ids uuid[] := array[]::uuid[];
  v_sole_org_ids uuid[] := array[]::uuid[];
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
    into v_last_business_ids
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

    if cardinality(v_last_business_ids) > 0 then
      v_blockers := array_append(v_blockers, 'last_business_manager');
    end if;

    select coalesce(array_agg(o.id), array[]::uuid[])
    into v_sole_org_ids
    from public.organizations as o
    where o.owner_person_id = v_account.person_id;

    if cardinality(v_sole_org_ids) > 0 then
      v_blockers := array_append(v_blockers, 'sole_organization_owner');
    end if;
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
    'last_business_ids', to_jsonb(v_last_business_ids),
    'sole_organization_ids', to_jsonb(v_sole_org_ids),
    'orphan_business_ids', to_jsonb(v_last_business_ids),
    'orphan_organization_ids', to_jsonb(v_sole_org_ids),
    'm4_required', (
      'last_business_manager' = any (v_blockers)
      or 'sole_organization_owner' = any (v_blockers)
    ),
    'm4_cases_will_open', false
  );
end;
$$;

comment on function public.access_self_delete_preflight () is
  'L1.3-M3. Preflight for auth.uid() only. Blocks last admin and (until M4 replaces this function) sole Impresa ACT / org person-owner. SECURITY DEFINER; empty search_path.';

revoke all on function public.access_self_delete_preflight () from public;
grant execute on function public.access_self_delete_preflight () to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Execute (standalone: refuses M4-gated orphans)
-- ---------------------------------------------------------------------------
create function public.access_self_delete_account ()
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
            hint = 'M4 required for last_business_manager / sole_organization_owner; last_application_admin needs another admin first';
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
    'auth_action_required', true
  );
end;
$$;

comment on function public.access_self_delete_account () is
  'L1.3-M3 standalone. Soft-closes Account; revokes roles/grants; minimizes Persona. Refuses last admin and (until M4) sole Impresa ACT / org person-owner. SECURITY DEFINER; empty search_path.';

revoke all on function public.access_self_delete_account () from public;
grant execute on function public.access_self_delete_account () to authenticated;
