-- D1-B.2 — Fix opportunity RLS recursion blocking editorial SELECT
--
-- Root cause: opportunities_select_party / update_party read
-- opportunity_party_references under RLS, while
-- opportunity_party_references_select_party reads opportunities under RLS
-- → 42P17 infinite recursion for any authenticated non-public SELECT.
--
-- This blocked D1-B.2 /app/redazione/opportunita (editor policies alone are
-- not enough because PostgreSQL still evaluates sibling permissive policies).
--
-- Fix: SECURITY DEFINER helpers that read party refs / opportunity flags
-- with bypass RLS, then rewrite party (+ editor admin) policies to use them.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.access_opportunity_visible_to_current_party (
  p_opportunity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    p_opportunity_id is not null
    and (
      exists (
        select 1
        from public.opportunity_party_references as pr
        where pr.opportunity_id = p_opportunity_id
          and (
            pr.person_id = public.access_current_person_id()
            or (
              pr.business_id is not null
              and (
                public.access_has_active_business_membership(pr.business_id)
                or public.access_can_act_for_business(pr.business_id)
              )
            )
          )
      )
      or exists (
        select 1
        from public.opportunity_representation_utilizations as ru
        join public.opportunity_party_references as pr
          on pr.id = ru.party_reference_id
        where ru.opportunity_id = p_opportunity_id
          and pr.person_id = public.access_current_person_id()
      )
    )
  );
$$;

comment on function public.access_opportunity_visible_to_current_party (uuid) is
  'D1-B.2: party visibility for an opportunity without RLS recursion. SECURITY DEFINER reads opportunity_party_references / representation utilizations.';

revoke all on function public.access_opportunity_visible_to_current_party (uuid)
  from public;

grant execute on function public.access_opportunity_visible_to_current_party (uuid)
  to authenticated;

create or replace function public.access_opportunity_manageable_by_current_party (
  p_opportunity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    p_opportunity_id is not null
    and exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = p_opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (
            pr.business_id is not null
            and public.access_can_act_for_business(pr.business_id)
          )
        )
    )
  );
$$;

comment on function public.access_opportunity_manageable_by_current_party (uuid) is
  'D1-B.2: party manage roles for an opportunity without RLS recursion.';

revoke all on function public.access_opportunity_manageable_by_current_party (uuid)
  from public;

grant execute on function public.access_opportunity_manageable_by_current_party (uuid)
  to authenticated;

create or replace function public.access_opportunity_is_public_published (
  p_opportunity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.opportunities as o
    where o.id = p_opportunity_id
      and o.deleted_at is null
      and o.publication_status = 'published'
      and o.visibility_level = 'public'
  );
$$;

comment on function public.access_opportunity_is_public_published (uuid) is
  'D1-B.2: public/published check without RLS recursion (for owned-table policies).';

revoke all on function public.access_opportunity_is_public_published (uuid)
  from public;

grant execute on function public.access_opportunity_is_public_published (uuid)
  to anon, authenticated;

create or replace function public.access_opportunity_exists_not_deleted (
  p_opportunity_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.opportunities as o
    where o.id = p_opportunity_id
      and o.deleted_at is null
  );
$$;

comment on function public.access_opportunity_exists_not_deleted (uuid) is
  'D1-B.2: non-deleted opportunity existence without RLS recursion.';

revoke all on function public.access_opportunity_exists_not_deleted (uuid)
  from public;

grant execute on function public.access_opportunity_exists_not_deleted (uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Rewrite opportunities party policies
-- ---------------------------------------------------------------------------

drop policy if exists opportunities_select_party on public.opportunities;

create policy opportunities_select_party
  on public.opportunities
  for select
  to authenticated
  using (
    deleted_at is null
    and public.access_opportunity_visible_to_current_party(id)
  );

drop policy if exists opportunities_update_party on public.opportunities;

create policy opportunities_update_party
  on public.opportunities
  for update
  to authenticated
  using (
    deleted_at is null
    and public.access_opportunity_manageable_by_current_party(id)
  )
  with check (
    deleted_at is null
    and public.access_opportunity_manageable_by_current_party(id)
  );

-- Editor policies: allow application admin as well (parity with requireEditor).
drop policy if exists opportunities_select_editor on public.opportunities;

create policy opportunities_select_editor
  on public.opportunities
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
  );

drop policy if exists opportunities_update_editor on public.opportunities;

create policy opportunities_update_editor
  on public.opportunities
  for update
  to authenticated
  using (
    deleted_at is null
    and (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
  )
  with check (
    deleted_at is null
    and (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
  );

-- ---------------------------------------------------------------------------
-- Rewrite opportunity_party_references select policies (break cycle)
-- ---------------------------------------------------------------------------

drop policy if exists opportunity_party_references_select_public
  on public.opportunity_party_references;

create policy opportunity_party_references_select_public
  on public.opportunity_party_references
  for select
  to anon, authenticated
  using (
    public.access_opportunity_is_public_published(opportunity_id)
  );

drop policy if exists opportunity_party_references_select_party
  on public.opportunity_party_references;

create policy opportunity_party_references_select_party
  on public.opportunity_party_references
  for select
  to authenticated
  using (
    public.access_opportunity_visible_to_current_party(opportunity_id)
  );

-- ---------------------------------------------------------------------------
-- Editor owned-table policies: avoid nested opportunities RLS
-- ---------------------------------------------------------------------------

drop policy if exists opportunity_sources_select_editor on public.opportunity_sources;

create policy opportunity_sources_select_editor
  on public.opportunity_sources
  for select
  to authenticated
  using (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  );

drop policy if exists opportunity_sources_update_editor on public.opportunity_sources;

create policy opportunity_sources_update_editor
  on public.opportunity_sources
  for update
  to authenticated
  using (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  )
  with check (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  );

drop policy if exists opportunity_time_windows_select_editor
  on public.opportunity_time_windows;

create policy opportunity_time_windows_select_editor
  on public.opportunity_time_windows
  for select
  to authenticated
  using (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  );

drop policy if exists opportunity_time_windows_update_editor
  on public.opportunity_time_windows;

create policy opportunity_time_windows_update_editor
  on public.opportunity_time_windows
  for update
  to authenticated
  using (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  )
  with check (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  );

drop policy if exists opportunity_market_references_select_editor
  on public.opportunity_market_references;

create policy opportunity_market_references_select_editor
  on public.opportunity_market_references
  for select
  to authenticated
  using (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  );

drop policy if exists opportunity_market_references_update_editor
  on public.opportunity_market_references;

create policy opportunity_market_references_update_editor
  on public.opportunity_market_references
  for update
  to authenticated
  using (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  )
  with check (
    (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
    and public.access_opportunity_exists_not_deleted(opportunity_id)
  );
