-- D1-D.5 E5.3 — Prepare Eventi external ingestion + editorial RLS
--
-- Path (future importer, not this GO): offline Node → Supabase JS → service_role
--   → PostgREST → table DML (BYPASSRLS; no service_role RLS policies).
--
-- This migration:
--   1) least-privilege service_role writer on events / editions / languages
--   2) additive editor SELECT/INSERT/UPDATE for owned_by_editorial rows
--   3) ownership immutability for owned_by_editorial on events
--
-- Public SELECT policies unchanged (published + visibility public).
-- AUTO-PUBLISH remains application-level NO.
-- Non-editor admin does NOT inherit Redazione powers (access_is_editor only).

-- ---------------------------------------------------------------------------
-- 1) Least-privilege service_role writer (SIU)
-- ---------------------------------------------------------------------------

revoke all on table public.events from service_role;

revoke all on table public.event_editions from service_role;

revoke all on table public.event_languages from service_role;

grant select, insert, update on table public.events to service_role;

grant select, insert, update on table public.event_editions to service_role;

grant select, insert, update on table public.event_languages to service_role;

-- ---------------------------------------------------------------------------
-- 2) Editor review queue — events AR
-- ---------------------------------------------------------------------------

create policy events_select_editorial
  on public.events
  for select
  to authenticated
  using (
    owned_by_editorial = true
    and public.access_is_editor()
  );

create policy events_insert_editorial
  on public.events
  for insert
  to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and owned_by_editorial = true
    and owner_person_id is null
    and owner_business_id is null
  );

create policy events_update_editorial
  on public.events
  for update
  to authenticated
  using (
    owned_by_editorial = true
    and public.access_is_editor()
    and public.access_is_active_account()
  )
  with check (
    owned_by_editorial = true
    and owner_person_id is null
    and owner_business_id is null
    and public.access_is_editor()
  );

-- ---------------------------------------------------------------------------
-- 3) Editor policies — event_editions
-- ---------------------------------------------------------------------------

create policy event_editions_select_editorial
  on public.event_editions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.events as e
      where e.id = event_editions.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
    )
  );

create policy event_editions_insert_editorial
  on public.event_editions
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.events as e
      where e.id = event_editions.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy event_editions_update_editorial
  on public.event_editions
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.events as e
      where e.id = event_editions.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  )
  with check (
    exists (
      select 1
      from public.events as e
      where e.id = event_editions.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
    )
  );

-- ---------------------------------------------------------------------------
-- 4) Editor policies — event_organizers / event_languages
-- ---------------------------------------------------------------------------

create policy event_organizers_select_editorial
  on public.event_organizers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.events as e
      where e.id = event_organizers.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
    )
  );

create policy event_organizers_insert_editorial
  on public.event_organizers
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.events as e
      where e.id = event_organizers.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy event_organizers_update_editorial
  on public.event_organizers
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.events as e
      where e.id = event_organizers.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  )
  with check (
    exists (
      select 1
      from public.events as e
      where e.id = event_organizers.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
    )
  );

create policy event_languages_select_editorial
  on public.event_languages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.events as e
      where e.id = event_languages.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
    )
  );

create policy event_languages_insert_editorial
  on public.event_languages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.events as e
      where e.id = event_languages.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy event_languages_update_editorial
  on public.event_languages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.events as e
      where e.id = event_languages.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  )
  with check (
    exists (
      select 1
      from public.events as e
      where e.id = event_languages.event_id
        and e.owned_by_editorial = true
        and public.access_is_editor()
    )
  );

-- ---------------------------------------------------------------------------
-- 5) Ownership immutability — include events.owned_by_editorial
-- ---------------------------------------------------------------------------

create or replace function public.access_reject_owner_cols_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op <> 'UPDATE' then
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

  if tg_table_name in ('organizations', 'collaborations', 'contents', 'events') then
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

comment on function public.access_reject_owner_cols_mutation() is
  'BEFORE UPDATE guard: owner columns (and owned_by_editorial where applicable, including events) are immutable after insert. D1-D.5 extended events.';
