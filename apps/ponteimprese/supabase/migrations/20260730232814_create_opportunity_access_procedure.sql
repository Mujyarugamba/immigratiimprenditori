-- M4.4 — create opportunity access procedure
-- Implements VO ProceduraAccesso of the Opportunità domain as a singular
-- composition of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §15;
--  docs/architecture/physical/domain-mapping/opportunita.md §19.B §19.1–§19.21, §29;
--  approved Physical §19.B confirmation micro-review).
--
-- Depends on:
--   public.opportunities (M1.1)
--
-- Creates:
--   public.opportunity_access_procedures
--
-- Scope of this unit only: declared access instructions and optional
-- operational URL on the opportunity sheet. Explicitly out of scope:
-- ModalitàAccesso (M2 C05), Sources/Evidences FKs (M3), audience bridges
-- (M4.1), Requirements (M4.2), Benefits (M4.3), temporal windows (M5),
-- inter-domain FKs (M6), Verification (M7), candidature, application,
-- booking, practice/workflow, upload/storage, is_active lifecycle, catalogs,
-- and seed data.
--
-- ProceduraAccesso ≠ ModalitàAccesso ≠ Fonte URL ≠ Destinatario ≠
-- Requisito ≠ Beneficio ≠ Verifica ≠ candidatura ≠ pratica ≠ workflow.
-- Soft deletion of opportunities (deleted_at) does not remove the procedure
-- row; physical delete of an opportunity cascades the owned composition row.
-- The technical id does not confer autonomous domain identity or inbound
-- referentiability. At most one row per opportunity (UNIQUE opportunity_id).

create table public.opportunity_access_procedures (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  statement text not null,
  operational_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_access_procedures_opportunity_id_key unique (opportunity_id),
  constraint opportunity_access_procedures_statement_not_blank_check check (
    btrim(statement) <> ''
  ),
  constraint opportunity_access_procedures_operational_url_not_blank_check check (
    operational_url is null
    or btrim(operational_url) <> ''
  )
);

comment on table public.opportunity_access_procedures is
  'VO ProceduraAccesso composition owned by an Opportunità: declared instructions for how to access, request, book, use, or participate. Value Object of composition; not ModalitàAccesso, not a catalog, not E02 with autonomous domain identity, not candidature, practice, or workflow. At most one procedure per opportunity. Physical delete of the opportunity cascades the owned row.';

comment on column public.opportunity_access_procedures.id is
  'Technical row identifier only. Does not confer autonomous domain identity and must not be referenced by other domains or tables.';

comment on column public.opportunity_access_procedures.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. UNIQUE enforces structural cardinality 0..1 (at most one procedure per opportunity). Soft deletion of the opportunity does not remove this row. Sole foreign key of this table.';

comment on column public.opportunity_access_procedures.statement is
  'Complete declared access instructions for the opportunity sheet. Sole instructional content attribute in M4.4; not a title/description pair; not an action actually performed by a user; not candidature or workflow state.';

comment on column public.opportunity_access_procedures.operational_url is
  'Optional declared operational link or channel used to proceed (portal, form, booking page). Distinct from opportunity_sources.url (informational provenance, M3.1); not a foreign key to Sources; not an Evidence.';

comment on column public.opportunity_access_procedures.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_access_procedures.updated_at is
  'Last update timestamp. Maintained by opportunity_access_procedures_set_updated_at.';

create or replace function public.set_opportunity_access_procedures_updated_at ()
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

create trigger opportunity_access_procedures_set_updated_at
before update on public.opportunity_access_procedures
for each row
execute function public.set_opportunity_access_procedures_updated_at ();

alter table public.opportunity_access_procedures enable row level security;

-- Defense in depth: no policies in M4.4. Publication/visibility and
-- completeness gates (including any ProceduraAccesso publishability rule)
-- belong to later units (M7). With RLS enabled and no policy, roles subject
-- to RLS cannot read or write. service_role and owner privileges are not
-- revoked.
revoke all on table public.opportunity_access_procedures from anon, authenticated;
