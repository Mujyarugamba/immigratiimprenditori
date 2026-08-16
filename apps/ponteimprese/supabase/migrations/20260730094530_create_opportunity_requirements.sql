-- M4.2 — create opportunity requirements
-- Implements E02 Requisito of the Opportunità domain as an owned dependent
-- entity of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §15;
--  docs/architecture/physical/domain-mapping/opportunita.md §17.1–§17.23, §29;
--  approved M4.2 architectural micro-review).
--
-- Depends on:
--   public.opportunities (M1.1)
--
-- Creates:
--   public.opportunity_requirements
--
-- Scope of this unit only: declared textual eligibility conditions on the
-- opportunity sheet. Explicitly out of scope: structured numeric/rule-engine
-- requirements, requirement type catalogs, audience bridges (M4.1), Benefits
-- (M4.3), temporal windows (M5), inter-domain FKs (M6), Verification (M7),
-- candidature, evaluation, publication gates, and seed data.
--
-- Requisito ≠ Destinatario ≠ Beneficio ≠ ModalitàAccesso ≠ Verifica ≠
-- candidatura ≠ valutazione ≠ motore di regole.
-- Soft deletion of opportunities (deleted_at) does not remove requirement
-- rows; physical delete of an opportunity cascades owned requirements.

create table public.opportunity_requirements (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  statement text not null,
  kind text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_requirements_statement_not_blank_check check (
    btrim(statement) <> ''
  ),
  constraint opportunity_requirements_kind_check check (
    kind in (
      'mandatory',
      'preferential',
      'exclusion'
    )
  ),
  constraint opportunity_requirements_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_requirements is
  'E02 Requisito owned by an Opportunità: declared eligibility condition on the opportunity sheet. Textual statement only in M4.2; not a catalog, not Destinatario, not Beneficio, not ModalitàAccesso, not Verification, not candidature/evaluation, not a rule engine. Physical delete of the opportunity cascades owned requirements.';

comment on column public.opportunity_requirements.id is
  'Stable internal identity of the requirement row. Independent of statement text.';

comment on column public.opportunity_requirements.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_requirements.statement is
  'Complete declared enunciation of the eligibility condition (sheet text). Sole textual content attribute in M4.2; not a title/description pair; not a structured rule.';

comment on column public.opportunity_requirements.kind is
  'Operational classification of the declared condition: mandatory (absence excludes access), preferential (favours without excluding), or exclusion (presence excludes). Not a dimensional type catalog; not Verification.';

comment on column public.opportunity_requirements.is_active is
  'Whether the declared condition is currently applicable on the sheet. false keeps a historically present condition without making it current. Not verification, publication, or eligibility outcome.';

comment on column public.opportunity_requirements.sort_order is
  'Representational display order of requirements on the sheet, lower values first. Not priority scoring, not identity, not uniqueness.';

comment on column public.opportunity_requirements.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_requirements.updated_at is
  'Last update timestamp. Maintained by opportunity_requirements_set_updated_at.';

-- Lookup of requirements for a given opportunity (ownership retrieval).
create index opportunity_requirements_opportunity_id_idx
  on public.opportunity_requirements using btree (opportunity_id);

alter table public.opportunity_requirements enable row level security;

-- Defense in depth: no policies in M4.2. Publication/visibility and
-- completeness gates belong to later units (M7). With RLS enabled and no
-- policy, roles subject to RLS cannot read or write. service_role and
-- owner privileges are not revoked.
revoke all on table public.opportunity_requirements from anon, authenticated;

create or replace function public.set_opportunity_requirements_updated_at ()
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

create trigger opportunity_requirements_set_updated_at
before update on public.opportunity_requirements
for each row
execute function public.set_opportunity_requirements_updated_at ();
