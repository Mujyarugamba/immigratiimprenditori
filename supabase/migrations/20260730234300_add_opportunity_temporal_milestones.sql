-- M5.2 — add opportunity temporal milestones
-- Adds the singular AR-level temporal milestone closed by Physical §28.15
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §16;
--  docs/architecture/physical/domain-mapping/opportunita.md §28.15, §28.20–§28.23).
--
-- Depends on:
--   public.opportunities (M1.1)
--
-- Alters:
--   public.opportunities
--     + external_official_published_at
--
-- Scope of this unit only: optional declared external official publication
-- timestamp on the Aggregate Root. Explicitly out of scope: access windows
-- (M5.1), platform publication/withdrawal/visibility/archival (M7),
-- denormalised opens_at/closes_at on the AR, verification, candidature,
-- seed data, policies, and grants.
--
-- external_official_published_at ≠ platform published_at (M7)
-- ≠ opens_at / closes_at of opportunity_time_windows (M5.1)
-- ≠ created_at census (M1).

alter table public.opportunities
add column external_official_published_at timestamptz;

comment on column public.opportunities.external_official_published_at is
  'Optional declared timestamp of the external official publication of the possibility, when known. Distinct from platform publication/visibility (M7), from access window opens_at/closes_at (M5.1), and from sheet census created_at (M1).';
