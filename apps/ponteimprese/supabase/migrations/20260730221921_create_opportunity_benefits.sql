-- M4.3 — create opportunity benefits
-- Implements VO Beneficio of the Opportunità domain as a multivalue
-- composition of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §15;
--  docs/architecture/physical/domain-mapping/opportunita.md §18.1–§18.33, §29;
--  approved M4.3 architectural micro-review + Physical confirmation).
--
-- Depends on:
--   public.opportunities (M1.1)
--
-- Creates:
--   public.opportunity_benefits
--
-- Scope of this unit only: declared textual benefits/access on the
-- opportunity sheet. Explicitly out of scope: structured economic columns,
-- benefit type catalogs, is_active lifecycle, Requirements (M4.2), audience
-- bridges (M4.1), Sources/Evidences FKs (M3), temporal windows (M5),
-- inter-domain FKs (M6), Verification (M7), candidature, concession,
-- disbursement/erogazione, and seed data.
--
-- Beneficio (VO) ≠ Destinatario ≠ Requisito ≠ ModalitàAccesso ≠ Verifica ≠
-- candidatura ≠ concessione ≠ erogazione ≠ motore finanziario.
-- Soft deletion of opportunities (deleted_at) does not remove benefit rows;
-- physical delete of an opportunity cascades owned benefit composition rows.
-- The technical id does not confer autonomous domain identity or inbound
-- referentiability (Evidenza supports_aspect = benefit has no FK here).

create table public.opportunity_benefits (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  statement text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_benefits_statement_not_blank_check check (
    btrim(statement) <> ''
  ),
  constraint opportunity_benefits_sort_order_check check (sort_order >= 0)
);

comment on table public.opportunity_benefits is
  'VO Beneficio composition owned by an Opportunità: declared benefit or access on the opportunity sheet. Multivalue textual statements only in M4.3; not a catalog, not E02 with autonomous domain identity, not Destinatario, not Requisito, not ModalitàAccesso, not Verification, not candidature/concession/disbursement, not a financial engine. Physical delete of the opportunity cascades owned rows.';

comment on column public.opportunity_benefits.id is
  'Technical row identifier only. Does not confer autonomous domain identity and must not be referenced by other domains or tables.';

comment on column public.opportunity_benefits.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row. Sole foreign key of this table.';

comment on column public.opportunity_benefits.statement is
  'Complete declared enunciation of the benefit or access (sheet text). Sole descriptive content attribute in M4.3; amounts, percentages, currencies, or types remain inside this text when declared; not a title/description pair; not structured economic columns.';

comment on column public.opportunity_benefits.sort_order is
  'Editorial display order of benefits on the sheet, lower values first. Not unique, not priority scoring, not identity.';

comment on column public.opportunity_benefits.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_benefits.updated_at is
  'Last update timestamp. Maintained by opportunity_benefits_set_updated_at.';

-- Lookup of benefits for a given opportunity (ownership retrieval).
create index opportunity_benefits_opportunity_id_idx
  on public.opportunity_benefits using btree (opportunity_id);

create or replace function public.set_opportunity_benefits_updated_at ()
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

create trigger opportunity_benefits_set_updated_at
before update on public.opportunity_benefits
for each row
execute function public.set_opportunity_benefits_updated_at ();

alter table public.opportunity_benefits enable row level security;

-- Defense in depth: no policies in M4.3. Publication/visibility and
-- completeness gates (including minimum one benefit) belong to later
-- units (M7). With RLS enabled and no policy, roles subject to RLS cannot
-- read or write. service_role and owner privileges are not revoked.
revoke all on table public.opportunity_benefits from anon, authenticated;
