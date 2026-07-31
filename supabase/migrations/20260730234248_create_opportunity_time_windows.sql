-- M5.1 — create opportunity time windows
-- Implements VO FinestraAccesso / PeriodoValidità of the Opportunità domain
-- as a multivalue composition of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §16;
--  docs/architecture/physical/domain-mapping/opportunita.md §28.1–§28.23, §29;
--  approved architectural micro-review M5 + Physical §28 expansion).
--
-- Depends on:
--   public.opportunities (M1.1)
--
-- Creates:
--   public.opportunity_time_windows
--
-- Scope of this unit only: declared access/validity windows on the
-- opportunity sheet. Explicitly out of scope: platform publication /
-- withdrawal / visibility / archival (M7), verification of deadlines (M7),
-- substantial suspension/reopening as window kinds, candidature entities,
-- scheduling, notifications, is_active lifecycle, catalogs, seed data,
-- and AR milestone columns (M5.2).
--
-- FinestraAccesso ≠ pubblicazione piattaforma ≠ ritiro ≠ archiviazione ≠
-- verifica ≠ candidatura ≠ ProceduraAccesso ≠ edizione successiva.
-- Soft deletion of opportunities (deleted_at) does not remove window rows;
-- physical delete of an opportunity cascades owned window composition rows.
-- The technical id does not confer autonomous domain identity or inbound
-- referentiability (Evidenza supports_aspect = deadline has no FK here).
-- Temporal status (future/open/expiring/expired/extended) is derived, not
-- persisted. Prorogation historises prior closes_at via superseded_at + insert.

create table public.opportunity_time_windows (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  kind text not null,
  opens_at timestamptz,
  closes_at timestamptz,
  open_ended boolean not null default false,
  note text,
  sort_order integer not null default 0,
  superseded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_time_windows_kind_check check (
    kind in (
      'access',
      'application'
    )
  ),
  constraint opportunity_time_windows_note_not_blank_check check (
    note is null
    or btrim(note) <> ''
  ),
  constraint opportunity_time_windows_sort_order_check check (sort_order >= 0),
  constraint opportunity_time_windows_interval_check check (
    opens_at is null
    or closes_at is null
    or opens_at <= closes_at
  ),
  constraint opportunity_time_windows_open_ended_closes_check check (
    not (
      open_ended
      and closes_at is not null
    )
  ),
  constraint opportunity_time_windows_anchor_check check (
    open_ended
    or opens_at is not null
    or closes_at is not null
  )
);

comment on table public.opportunity_time_windows is
  'VO FinestraAccesso / PeriodoValidità composition owned by an Opportunità: declared access or application time windows on the opportunity sheet. Multivalue; not a catalog, not E02 with autonomous domain identity, not platform publication/withdrawal/visibility/archival (M7), not candidature, not scheduling. Prorogation keeps prior deadlines via superseded_at + new row (PF8). Physical delete of the opportunity cascades owned rows.';

comment on column public.opportunity_time_windows.id is
  'Technical row identifier only. Does not confer autonomous domain identity and must not be referenced by other domains or tables.';

comment on column public.opportunity_time_windows.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row. Sole foreign key of this table.';

comment on column public.opportunity_time_windows.kind is
  'Declared window type: access (access/validity period) or application (candidature period only when modality implies it). Not ModalitàAccesso, not candidature entity, not publication state.';

comment on column public.opportunity_time_windows.opens_at is
  'Declared start of the window (access opening). Nullable. Not platform publication time (M7).';

comment on column public.opportunity_time_windows.closes_at is
  'Declared end/deadline of the window. Nullable. Must be null when open_ended is true. Prorogation must not silently overwrite: supersede this row and insert a new one.';

comment on column public.opportunity_time_windows.open_ended is
  'True when the opportunity is continuous or has no known closing deadline. When true, closes_at must be null.';

comment on column public.opportunity_time_windows.note is
  'Optional editorial caveat (e.g. indicative deadline). Plain text; not HTML/JSON; not a second description field required for the window.';

comment on column public.opportunity_time_windows.sort_order is
  'Editorial display order among concurrent windows on the sheet, lower values first. Not unique, not priority scoring, not identity.';

comment on column public.opportunity_time_windows.superseded_at is
  'Null when the row is the current (or still-relevant historical) declaration. Non-null when replaced by a prorogation/successor window (PF8). Not soft delete of the opportunity.';

comment on column public.opportunity_time_windows.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_time_windows.updated_at is
  'Last update timestamp. Maintained by opportunity_time_windows_set_updated_at.';

-- Lookup of windows for a given opportunity (ownership retrieval).
create index opportunity_time_windows_opportunity_id_idx
  on public.opportunity_time_windows using btree (opportunity_id);

create or replace function public.set_opportunity_time_windows_updated_at ()
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

create trigger opportunity_time_windows_set_updated_at
before update on public.opportunity_time_windows
for each row
execute function public.set_opportunity_time_windows_updated_at ();

alter table public.opportunity_time_windows enable row level security;

-- Defense in depth: no policies in M5.1. Publication/visibility and
-- completeness gates belong to later units (M7). With RLS enabled and no
-- policy, roles subject to RLS cannot read or write. service_role and
-- owner privileges are not revoked.
revoke all on table public.opportunity_time_windows from anon, authenticated;
