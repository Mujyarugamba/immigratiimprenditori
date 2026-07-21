-- M1.1 — create opportunity core
-- Implements the minimal Aggregate Root structure for the Opportunità domain
-- (docs/architecture/migrations/opportunita-migration-plan.md §11–§12;
--  docs/architecture/physical/domain-mapping/opportunita.md).
--
-- Scope of this unit only:
--   identity, title, summary, description, purpose, origin,
--   substantial_status and representation_status columns with the minimal
--   initial vocabulary required to persist a census draft,
--   created_at / updated_at, soft deletion via deleted_at.
--
-- Lifecycle vocabulary expansion for both status axes is out of scope here
-- (Migration Plan unit M1.2). Explicitly out of scope as well: sources,
-- evidence, audiences, requirements, structured benefits, time windows,
-- inter-domain references, verification, editorial/publication/visibility,
-- candidature, evaluation, ranking, seed data, public read access.
--
-- No dependency on profiles or any other domain table.

create table public.opportunities (
  id uuid primary key default gen_random_uuid (),
  title text not null,
  summary text,
  description text,
  purpose text,
  origin text not null,
  substantial_status text not null default 'announced',
  representation_status text not null default 'censused',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint opportunities_title_not_blank_check check (length(trim(title)) > 0),
  -- Origin is the nature of the opportunity (external vs internal), not the
  -- publisher, promoter, source, or verification/publication state. Text
  -- check (not a PostgreSQL ENUM) keeps the vocabulary evolvable toward M2
  -- without freezing a database type.
  constraint opportunities_origin_check check (
    origin in ('external', 'internal')
  ),
  -- Substantial axis column (mapping §27). M1.1 persists only the initial
  -- census value 'announced'. Broader substantial vocabulary (open,
  -- suspended, closed, revoked, cancelled, exhausted, …) is deferred to
  -- M1.2 — 'open' also overlaps the derived temporal axis and must not be
  -- frozen here; 'exhausted' needs resource facts not modeled in M1.1.
  constraint opportunities_substantial_status_check check (
    substantial_status in ('announced')
  ),
  -- Representation axis column (mapping §27). M1.1 persists only the
  -- initial census value 'censused'. Values such as incomplete (completeness
  -- is derived per mapping §26), updated (not a synonym of updated_at),
  -- obsolete, withdrawn, and archived are deferred to later units.
  constraint opportunities_representation_status_check check (
    representation_status in ('censused')
  )
);

comment on table public.opportunities is
  'Aggregate Root of the Opportunità domain: governed representation of an actionable structured possibility. M1.1 core only — no sources, evidence, candidature, publication workflow, or inter-domain references yet. Soft-deleted via deleted_at; never hard-deleted by this unit.';

comment on column public.opportunities.id is
  'Stable internal identity. Independent of title, source, promoter, editorial content, event, or collaboration. Not reused.';

comment on column public.opportunities.title is
  'Human-facing short name of the opportunity sheet. Required even for incomplete drafts; not unique (same title may identify distinct opportunities).';

comment on column public.opportunities.summary is
  'Optional short autonomous synopsis. Nullable so an incomplete draft can exist before M4–M7 completion.';

comment on column public.opportunities.description is
  'Optional extended structured description of the sheet. Not an editorial article, guide, or source text (those belong to other domains / later units).';

comment on column public.opportunities.purpose is
  'Optional free-text statement of the substantial benefit or access made possible. Not typology, structured benefit, requirement, or access modality (M2/M4).';

comment on column public.opportunities.origin is
  'external = platform governs representation of an external possibility; internal = platform/promoter governs definition and process. Not publisher, promoter, source URL, or verification state.';

comment on column public.opportunities.substantial_status is
  'Substantial-axis status of the opportunity. M1.1 allows only ''announced'' (initial census). Not verification, editorial review, publication, visibility, soft deletion, candidature, or derived temporal state.';

comment on column public.opportunities.representation_status is
  'Representation-axis status of the governed sheet. M1.1 allows only ''censused'' (sheet registered at census). Distinct from substantial_status, from soft deletion (deleted_at), and from editorial/publication status (later units).';

comment on column public.opportunities.created_at is
  'Census/creation timestamp of the sheet. System-managed default.';

comment on column public.opportunities.updated_at is
  'Last update timestamp. Maintained by opportunities_set_updated_at; not a client-owned field.';

comment on column public.opportunities.deleted_at is
  'Technical/administrative soft deletion of the row. Distinct from substantial_status and from representation_status (including any future ''archived'' value). Preserves identity and row history; no hard delete in M1.1. Independent of status axes: no constraint ties deleted_at to representation_status.';

alter table public.opportunities enable row level security;

-- Defense in depth: no policies in M1.1 (publication/visibility and business
-- permissions belong to later units). With RLS enabled and no policy, roles
-- subject to RLS cannot read or write. Explicit revoke removes table-level
-- privileges that might otherwise be inherited by anon/authenticated.
-- service_role and owner privileges are not revoked.
revoke all on table public.opportunities from anon, authenticated;

-- Keeps updated_at current on every row update. Table-local function, same
-- pattern as competencies / business_sectors / profiles (no shared helper
-- required or assumed). SECURITY INVOKER; empty search_path; does not touch
-- created_at or deleted_at.
create or replace function public.set_opportunities_updated_at ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row
execute function public.set_opportunities_updated_at ();
