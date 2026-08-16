-- M2.2 — associate opportunity classifications
-- Implements the multivalue classification links of the Opportunità domain:
--   Opportunità ↔ TipologiaOpportunità  → public.opportunity_type_assignments
--   Opportunità ↔ ModalitàAccesso       → public.opportunity_access_mode_assignments
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §13;
--  docs/architecture/physical/domain-mapping/opportunita.md §12, §19, §29).
--
-- Depends on:
--   public.opportunities              (M1.1)
--   public.opportunity_types          (M2.1)
--   public.opportunity_access_modes   (M2.1)
--
-- Scope of this unit only: classificatory bridge tables.
-- Conceptual cardinality is Opportunità → Tipologia = 1..N and
-- Opportunità → ModalitàAccesso = 1..N. Maximum N is supported here;
-- the minimum of one is a domain invariant not enforced as a database
-- trigger in M2.2 (census drafts may be temporarily incomplete;
-- completeness gates belong with publication / later validation, not M2.2).
--
-- Tipologia ≠ menu category. ModalitàAccesso ≠ CandidaturaOpportunità.
-- No new catalogs, seeds, AR columns, primary flags, ordering on the
-- relation, soft deletion on bridges, or publication policies.

-- ---------------------------------------------------------------------------
-- A. Opportunità ↔ TipologiaOpportunità
-- ---------------------------------------------------------------------------

create table public.opportunity_type_assignments (
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  opportunity_type_id bigint not null references public.opportunity_types (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, opportunity_type_id)
);

comment on table public.opportunity_type_assignments is
  'Classificatory bridge: Opportunità ↔ TipologiaOpportunità (C05). Multivalue; not a menu category, not an autonomous entity, not editorial assignment. Conceptual cardinality 1..N; minimum one is not database-enforced in M2.2.';

comment on column public.opportunity_type_assignments.opportunity_id is
  'Referenced opportunity (Aggregate Root). Physical delete cascades associations; soft deletion of the opportunity (deleted_at) does not remove rows.';

comment on column public.opportunity_type_assignments.opportunity_type_id is
  'Referenced local typology from public.opportunity_types. Catalog deactivation uses is_active; physical catalog delete is restricted while assignments exist.';

comment on column public.opportunity_type_assignments.created_at is
  'Assignment creation timestamp. System-managed default. No updated_at: the association is replaced by delete/insert, not mutated.';

-- PK leading column covers "types of a given opportunity". Reverse lookup
-- ("opportunities of a given type") needs its own index; also supports
-- FK checks on opportunity_types deletes.
create index opportunity_type_assignments_type_idx
  on public.opportunity_type_assignments using btree (opportunity_type_id);

alter table public.opportunity_type_assignments enable row level security;

-- Defense in depth: no policies in M2.2. Publication/visibility read paths
-- belong to later units (M7). With RLS enabled and no policy, roles subject
-- to RLS cannot read or write. service_role and owner are not revoked.
revoke all on table public.opportunity_type_assignments from anon, authenticated;

-- ---------------------------------------------------------------------------
-- B. Opportunità ↔ ModalitàAccesso
-- ---------------------------------------------------------------------------

create table public.opportunity_access_mode_assignments (
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  opportunity_access_mode_id bigint not null references public.opportunity_access_modes (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, opportunity_access_mode_id)
);

comment on table public.opportunity_access_mode_assignments is
  'Classificatory bridge: Opportunità ↔ ModalitàAccesso (C05). Declares how access may occur; not CandidaturaOpportunità, not requirements, not temporal windows, not visibility. Conceptual cardinality 1..N; minimum one is not database-enforced in M2.2.';

comment on column public.opportunity_access_mode_assignments.opportunity_id is
  'Referenced opportunity (Aggregate Root). Physical delete cascades associations; soft deletion of the opportunity (deleted_at) does not remove rows.';

comment on column public.opportunity_access_mode_assignments.opportunity_access_mode_id is
  'Referenced local access mode from public.opportunity_access_modes. Catalog deactivation uses is_active; physical catalog delete is restricted while assignments exist.';

comment on column public.opportunity_access_mode_assignments.created_at is
  'Assignment creation timestamp. System-managed default. No updated_at: the association is replaced by delete/insert, not mutated.';

create index opportunity_access_mode_assignments_mode_idx
  on public.opportunity_access_mode_assignments using btree (opportunity_access_mode_id);

alter table public.opportunity_access_mode_assignments enable row level security;

revoke all on table public.opportunity_access_mode_assignments from anon, authenticated;
