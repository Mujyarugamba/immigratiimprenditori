-- M1.2 — extend opportunity lifecycle vocabularies
-- Extends only the check constraints on substantial_status and
-- representation_status created by M1.1
-- (20260720225301_create_opportunities_core.sql).
--
-- Does not add columns, tables, indexes, triggers, policies, grants,
-- transitions, temporal/editorial/publication/verification axes, or
-- inter-domain references. Defaults and nullability stay unchanged.
-- Soft deletion (deleted_at) is untouched and remains independent.
--
-- Precondition: public.opportunities exists with M1.1 constraint names
-- opportunities_substantial_status_check and
-- opportunities_representation_status_check. Absence fails this migration.

-- Substantial axis (Physical Mapping §27; Thesis §28).
-- Included: announced (initial), suspended, closed, revoked, cancelled.
-- Excluded from this unit:
--   open       — overlaps derived temporal axis (M5); not persisted here
--   exhausted  — requires funds/slots/resource facts not modeled yet (M4+)
alter table public.opportunities
drop constraint opportunities_substantial_status_check;

alter table public.opportunities
add constraint opportunities_substantial_status_check check (
  substantial_status in (
    'announced',
    'suspended',
    'closed',
    'revoked',
    'cancelled'
  )
);

-- Representation axis (Physical Mapping §27).
-- Included: censused (initial), obsolete, withdrawn, archived.
-- Excluded from this unit:
--   incomplete — completeness is derived (Physical Mapping §26)
--   updated    — not a synonym of updated_at; governed refresh vs Fonte
--                belongs with later source/verification work (M3+)
alter table public.opportunities
drop constraint opportunities_representation_status_check;

alter table public.opportunities
add constraint opportunities_representation_status_check check (
  representation_status in (
    'censused',
    'obsolete',
    'withdrawn',
    'archived'
  )
);

comment on column public.opportunities.substantial_status is
  'Substantial-axis status: announced, suspended, closed, revoked, cancelled. Distinct from derived temporal state (M5), publication/verification/visibility (later units), and soft deletion (deleted_at). revoked = competent authority withdraws a previously in-force opportunity; cancelled = opportunity/procedure declared void or that it will not take place.';

comment on column public.opportunities.representation_status is
  'Representation-axis status of the governed sheet: censused, obsolete, withdrawn, archived. Distinct from substantial_status, from publication withdrawn (later unit), and from soft deletion (deleted_at). No constraint ties archived to deleted_at.';
