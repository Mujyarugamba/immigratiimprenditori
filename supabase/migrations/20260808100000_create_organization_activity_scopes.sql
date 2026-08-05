-- M1.2 — create organization activity scopes
-- Implements the C03 activity-scope catalog of Organizzazioni:
--   public.organization_activity_scopes
-- (docs/architecture/migrations/organizzazioni-migration-plan.md §10 M1.2;
--  docs/architecture/physical/domain-mapping/organizzazioni.md §10.3;
--  docs/architecture/logical/organizzazioni.md).
--
-- Scope of this unit only: empty catalog structure (seed 0).
-- Explicitly out of scope: organization_types seed; organizations AR;
-- officials; membership; business_sectors reuse; demo seed; policies; GRANT.

create table public.organization_activity_scopes (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_activity_scopes_pkey primary key (code),
  constraint organization_activity_scopes_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint organization_activity_scopes_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint organization_activity_scopes_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.organization_activity_scopes is
  'Local controlled catalog (C03) of light activity scopes for Organizzazioni. Owned by Organizzazioni. Optional classification via organizations.primary_scope_code. Not business_sectors, not Impresa economic sectors, not membership/Appartenenze. Cycle 1 seed is empty (structure ready; operational population deferred).';

comment on column public.organization_activity_scopes.code is
  'Stable technical English identifier of the activity scope. Primary key and authoritative identity. Not a localized label. Referenced optionally by organizations.primary_scope_code.';

comment on column public.organization_activity_scopes.name_it is
  'Italian display label of the activity scope. Descriptive only; not unique and not identity.';

comment on column public.organization_activity_scopes.description is
  'Optional governance description. Nullable when no authoritative text is provided.';

comment on column public.organization_activity_scopes.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.organization_activity_scopes.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.organization_activity_scopes.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.organization_activity_scopes.updated_at is
  'Last update timestamp. Maintained by organization_activity_scopes_set_updated_at.';

create index organization_activity_scopes_is_active_idx
  on public.organization_activity_scopes using btree (is_active);

create index organization_activity_scopes_sort_order_idx
  on public.organization_activity_scopes using btree (sort_order);

alter table public.organization_activity_scopes enable row level security;

revoke all on table public.organization_activity_scopes from public;
revoke all on table public.organization_activity_scopes from anon, authenticated;

create or replace function public.set_organization_activity_scopes_updated_at ()
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

comment on function public.set_organization_activity_scopes_updated_at () is
  'BEFORE UPDATE trigger function for public.organization_activity_scopes. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger organization_activity_scopes_set_updated_at
before update on public.organization_activity_scopes
for each row
execute function public.set_organization_activity_scopes_updated_at ();

-- Seed cycle 1: intentionally empty (Physical §10.3 / Plan M1.2). No INSERT.
