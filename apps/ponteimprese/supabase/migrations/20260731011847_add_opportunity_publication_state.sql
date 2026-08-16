-- M7.2 — add opportunity publication state
-- Adds current-state editorial, platform publication, and visibility axes
-- on the Opportunità Aggregate Root
-- (docs/architecture/migrations/opportunita-migration-plan.md §18;
--  docs/architecture/physical/domain-mapping/opportunita.md §26 §26.1–§26.28;
--  Physical M7.1 micro-review approved; M7.2 Physical DDL-ready).
--
-- Depends on:
--   public.opportunities (M1.1) including trigger opportunities_set_updated_at
--
-- Alters:
--   public.opportunities — six columns, vocabulary/coherence CHECK, five indexes,
--   column comments; optional table comment refresh
--
-- Scope of this unit only: AR current-state axes for editorial readiness,
-- platform publication, and visibility. Explicitly out of scope: M7.1
-- verification rows, M5 access windows, external_official_published_at
-- semantics, candidature, Contenuti Editoriali workflow, history of
-- publication events, RLS policies, GRANT/REVOKE, seed, backfill, functions,
-- and triggers.
--
-- Defaults (draft / unpublished / private + NULL platform timestamps) satisfy
-- the coherence CHECK for existing rows without UPDATE/backfill.
-- UPDATE of these columns continues to fire opportunities_set_updated_at (M1).

alter table public.opportunities
  add column editorial_status text not null default 'draft',
  add column publication_status text not null default 'unpublished',
  add column visibility_level text not null default 'private',
  add column platform_scheduled_for timestamptz,
  add column platform_published_at timestamptz,
  add column platform_withdrawn_at timestamptz,
  add constraint opportunities_editorial_status_check check (
    editorial_status in (
      'draft',
      'in_review',
      'approved',
      'rejected'
    )
  ),
  add constraint opportunities_publication_status_check check (
    publication_status in (
      'unpublished',
      'scheduled',
      'published',
      'withdrawn'
    )
  ),
  add constraint opportunities_visibility_level_check check (
    visibility_level in (
      'private',
      'editorial',
      'restricted',
      'network',
      'public'
    )
  ),
  add constraint opportunities_publication_state_check check (
    (
      publication_status = 'scheduled'
      and editorial_status = 'approved'
      and platform_scheduled_for is not null
      and platform_published_at is null
      and platform_withdrawn_at is null
    )
    or (
      publication_status = 'published'
      and editorial_status = 'approved'
      and platform_scheduled_for is null
      and platform_published_at is not null
      and platform_withdrawn_at is null
    )
    or (
      publication_status = 'withdrawn'
      and platform_scheduled_for is null
      and platform_published_at is not null
      and platform_withdrawn_at is not null
      and platform_withdrawn_at >= platform_published_at
    )
    or (
      publication_status = 'unpublished'
      and platform_scheduled_for is null
      and platform_published_at is null
      and platform_withdrawn_at is null
    )
  ),
  add constraint opportunities_visibility_publication_check check (
    (
      visibility_level <> 'public'
      or publication_status = 'published'
    )
    and (
      publication_status <> 'withdrawn'
      or visibility_level <> 'public'
    )
  );

comment on table public.opportunities is
  'Aggregate Root of the Opportunità domain: governed representation of an actionable structured possibility. Owns current-state editorial_status, publication_status, visibility_level, and platform_* publication timestamps (M7.2). Soft-deleted via deleted_at. Distinct from M5 access windows, external_official_published_at (M5.2), representation_status archival, verification rows (M7.1), and Contenuti Editoriali workflow.';

comment on column public.opportunities.editorial_status is
  'Current-state editorial axis of the opportunity sheet: draft | in_review | approved | rejected. Not Contenuti Editoriali workflow, not platform publication, not M7.1 verification, not candidature/eligibility. approved does not imply published; rejected does not imply deletion. No transition history.';

comment on column public.opportunities.publication_status is
  'Current-state platform publication axis: unpublished | scheduled | published | withdrawn. Distinct from visibility_level, from M5 temporal access windows, from soft-delete (deleted_at), from representation_status archival, and from external_official_published_at (M5.2). Not an editorial approval status.';

comment on column public.opportunities.visibility_level is
  'Current-state visibility of the sheet: private | editorial | restricted | network | public. Representational access level only — not an RLS policy, not Identity & Access authorization, not a user role catalog. public requires publication_status = published; withdrawn forbids public. Does not open candidature.';

comment on column public.opportunities.platform_scheduled_for is
  'Planned platform publication instant when publication_status = scheduled. Required in that branch; must be NULL for unpublished, published, and withdrawn. Not an M5 opportunity_time_windows open/close, not external_official_published_at, not a general visibility interval. No automatic status change at this instant.';

comment on column public.opportunities.platform_published_at is
  'Current platform publication instant (current-state model). Required when publication_status is published or withdrawn; must be NULL when unpublished or scheduled. Distinct from external_official_published_at, created_at, and M7.1 verified_at. On withdraw retains prior value; on republish may be updated. No publication event history.';

comment on column public.opportunities.platform_withdrawn_at is
  'Platform withdrawal instant when publication_status = withdrawn. Required in that branch; must be NULL for unpublished, scheduled, and published; when set must be >= platform_published_at. Not soft-delete (deleted_at), not M5 expiry, not representation_status = archived.';

create index opportunities_editorial_status_idx
  on public.opportunities using btree (editorial_status);

create index opportunities_publication_status_idx
  on public.opportunities using btree (publication_status);

create index opportunities_visibility_level_idx
  on public.opportunities using btree (visibility_level);

create index opportunities_platform_scheduled_for_idx
  on public.opportunities using btree (platform_scheduled_for)
  where publication_status = 'scheduled';

create index opportunities_platform_published_at_idx
  on public.opportunities using btree (platform_published_at)
  where publication_status in ('published', 'withdrawn');
