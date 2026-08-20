-- D1-B — Prepare Opportunità external ingestion (writer + idempotency + editor review)
--
-- Path: offline Node importer → Supabase JS → JWT role service_role
--       → PostgREST → table DML (BYPASSRLS; no service_role RLS policies).
--
-- Importer operations (planned apply; this migration only prepares ACL/schema):
--   opportunities:                 SELECT, INSERT, UPDATE
--   opportunity_sources:           SELECT, INSERT, UPDATE
--   opportunity_time_windows:      SELECT, INSERT, UPDATE
--   opportunity_market_references: SELECT, INSERT, UPDATE
--
-- Intentionally NOT granted: DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN.
-- Intentionally unchanged: anon table grants; party-based authenticated write surface
--   except additive editor SELECT/UPDATE policies for review queue.
--
-- REVOKE ALL first so hosted environments that previously had GRANT ALL
-- (or partial defaults) converge to the same least-privilege surface.
--
-- Idempotency: partial UNIQUE on active opportunity_sources.external_identifier
-- (natural key form: incentivi-gov:<nid>, …). Historical/replaced rows may keep
-- the same identifier when status <> 'active'.
--
-- Editor review: access_is_editor() may SELECT/UPDATE unpublished external
-- drafts without becoming a party_reference. Public SELECT policies unchanged
-- (published + visibility_level=public only). AUTO-PUBLISH remains application-level NO.

-- ---------------------------------------------------------------------------
-- 1) Idempotent external natural key (active sources only)
-- ---------------------------------------------------------------------------

create unique index if not exists opportunity_sources_active_external_identifier_uidx
  on public.opportunity_sources using btree (external_identifier)
where
  status = 'active'
  and external_identifier is not null;

comment on index public.opportunity_sources_active_external_identifier_uidx is
  'D1-B: at most one active Fonte per non-null external_identifier (e.g. incentivi-gov:<nid>). Enables idempotent external ingest without a second workflow.';

-- ---------------------------------------------------------------------------
-- 2) Least-privilege service_role writer (SIU)
-- ---------------------------------------------------------------------------

revoke all on table public.opportunities from service_role;

revoke all on table public.opportunity_sources from service_role;

revoke all on table public.opportunity_time_windows from service_role;

revoke all on table public.opportunity_market_references from service_role;

grant select, insert, update on table public.opportunities to service_role;

grant select, insert, update on table public.opportunity_sources to service_role;

grant select, insert, update on table public.opportunity_time_windows to service_role;

grant select, insert, update on table public.opportunity_market_references to service_role;

-- ---------------------------------------------------------------------------
-- 3) Editor review queue (additive RLS; no anon widening)
-- ---------------------------------------------------------------------------

create policy opportunities_select_editor
  on public.opportunities
  for select
  to authenticated
  using (
    deleted_at is null
    and public.access_is_editor()
  );

create policy opportunities_update_editor
  on public.opportunities
  for update
  to authenticated
  using (
    deleted_at is null
    and public.access_is_editor()
  )
  with check (
    deleted_at is null
    and public.access_is_editor()
  );

create policy opportunity_sources_select_editor
  on public.opportunity_sources
  for select
  to authenticated
  using (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_sources.opportunity_id
        and o.deleted_at is null
    )
  );

create policy opportunity_sources_update_editor
  on public.opportunity_sources
  for update
  to authenticated
  using (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_sources.opportunity_id
        and o.deleted_at is null
    )
  )
  with check (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_sources.opportunity_id
        and o.deleted_at is null
    )
  );

create policy opportunity_time_windows_select_editor
  on public.opportunity_time_windows
  for select
  to authenticated
  using (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_time_windows.opportunity_id
        and o.deleted_at is null
    )
  );

create policy opportunity_time_windows_update_editor
  on public.opportunity_time_windows
  for update
  to authenticated
  using (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_time_windows.opportunity_id
        and o.deleted_at is null
    )
  )
  with check (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_time_windows.opportunity_id
        and o.deleted_at is null
    )
  );

create policy opportunity_market_references_select_editor
  on public.opportunity_market_references
  for select
  to authenticated
  using (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_market_references.opportunity_id
        and o.deleted_at is null
    )
  );

create policy opportunity_market_references_update_editor
  on public.opportunity_market_references
  for update
  to authenticated
  using (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_market_references.opportunity_id
        and o.deleted_at is null
    )
  )
  with check (
    public.access_is_editor()
    and exists (
      select 1
      from public.opportunities as o
      where o.id = opportunity_market_references.opportunity_id
        and o.deleted_at is null
    )
  );
