-- C3.5 — create opportunity activity scopes
-- Introduces a domain-owned activity-scope classification for Opportunità,
-- separate from opportunity_types (nature of the opportunity).
-- Enables cultural opportunities without requiring an Event anchor.
-- Sources: C3 plan §7.5; Hybrid C; C3.7 deferred.
--
-- Objects:
--   public.opportunity_activity_scopes              (C03 catalog)
--   public.opportunity_activity_scope_assignments   (C05 bridge)
--
-- Explicitly out of scope: changing opportunity_types; disciplines;
-- polymorphic flags; backfill from titles/events; Cultura AR.

-- ---------------------------------------------------------------------------
-- A. Catalog — public.opportunity_activity_scopes
-- ---------------------------------------------------------------------------

create table public.opportunity_activity_scopes (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_activity_scopes_pkey primary key (code),
  constraint opportunity_activity_scopes_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint opportunity_activity_scopes_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint opportunity_activity_scopes_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.opportunity_activity_scopes is
  'Local controlled catalog (C03) of light activity scopes for Opportunità. Owned by Opportunità. Classifies the cultural/activity field of an opportunity. Not opportunity_types (nature), not Event types, not disciplines (C3.7 deferred), not a Cultura aggregate.';

comment on column public.opportunity_activity_scopes.code is
  'Stable technical English identifier of the activity scope. Primary key and authoritative identity. Not a localized label.';

comment on column public.opportunity_activity_scopes.name_it is
  'Italian display label of the activity scope. Descriptive only; not unique and not identity.';

comment on column public.opportunity_activity_scopes.description is
  'Optional governance description. Nullable when no authoritative text is provided.';

comment on column public.opportunity_activity_scopes.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.opportunity_activity_scopes.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.opportunity_activity_scopes.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_activity_scopes.updated_at is
  'Last update timestamp. Maintained by opportunity_activity_scopes_set_updated_at.';

create index opportunity_activity_scopes_is_active_idx
  on public.opportunity_activity_scopes using btree (is_active);

create index opportunity_activity_scopes_sort_order_idx
  on public.opportunity_activity_scopes using btree (sort_order);

alter table public.opportunity_activity_scopes enable row level security;

revoke all on table public.opportunity_activity_scopes from public;
revoke all on table public.opportunity_activity_scopes from anon, authenticated;

grant select on table public.opportunity_activity_scopes to anon, authenticated;

create policy opportunity_activity_scopes_select_public
  on public.opportunity_activity_scopes for select to anon, authenticated
  using (is_active = true);

create or replace function public.set_opportunity_activity_scopes_updated_at ()
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

comment on function public.set_opportunity_activity_scopes_updated_at () is
  'BEFORE UPDATE trigger function for public.opportunity_activity_scopes. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger opportunity_activity_scopes_set_updated_at
before update on public.opportunity_activity_scopes
for each row
execute function public.set_opportunity_activity_scopes_updated_at ();

insert into public.opportunity_activity_scopes (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  (
    'culture',
    'Cultura',
    'Ambito culturale dell’opportunità. Distinto dalla tipology (call/incentive/…).',
    true,
    10
  ),
  (
    'heritage',
    'Patrimonio',
    'Ambito patrimonio culturale dell’opportunità.',
    true,
    20
  ),
  (
    'creative_industries',
    'Industrie creative',
    'Ambito industrie culturali e creative dell’opportunità.',
    true,
    30
  );

-- ---------------------------------------------------------------------------
-- B. Assignments — public.opportunity_activity_scope_assignments
-- Mirrors opportunity_type_assignments (CASCADE on opportunity, RESTRICT on catalog).
-- ---------------------------------------------------------------------------

create table public.opportunity_activity_scope_assignments (
  opportunity_id uuid not null
    references public.opportunities (id) on delete cascade,
  scope_code text not null
    references public.opportunity_activity_scopes (code) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, scope_code)
);

comment on table public.opportunity_activity_scope_assignments is
  'Classificatory bridge: Opportunità ↔ activity scope (C05). Multivalue cultural/activity field. Not opportunity_types, not Event link, not a Cultura entity. Soft deletion of the opportunity does not remove rows; physical delete cascades.';

comment on column public.opportunity_activity_scope_assignments.opportunity_id is
  'Referenced opportunity (Aggregate Root). Physical delete cascades associations.';

comment on column public.opportunity_activity_scope_assignments.scope_code is
  'Referenced activity scope from public.opportunity_activity_scopes. Catalog delete is restricted while assignments exist.';

comment on column public.opportunity_activity_scope_assignments.created_at is
  'Assignment creation timestamp. System-managed default. No updated_at: the association is replaced by delete/insert, not mutated.';

create index opportunity_activity_scope_assignments_scope_idx
  on public.opportunity_activity_scope_assignments using btree (scope_code);

alter table public.opportunity_activity_scope_assignments enable row level security;

revoke all on table public.opportunity_activity_scope_assignments from public;
revoke all on table public.opportunity_activity_scope_assignments from anon, authenticated;

grant select on table public.opportunity_activity_scope_assignments to anon, authenticated;
grant insert, update on table public.opportunity_activity_scope_assignments to authenticated;

-- Public SELECT follows published+public opportunity visibility (mirror type assignments).
create policy opportunity_activity_scope_assignments_select_public
  on public.opportunity_activity_scope_assignments for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_activity_scope_assignments.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_activity_scope_assignments_select_party
  on public.opportunity_activity_scope_assignments for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_activity_scope_assignments.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_activity_scope_assignments_insert_party
  on public.opportunity_activity_scope_assignments for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_activity_scope_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_activity_scope_assignments_update_party
  on public.opportunity_activity_scope_assignments for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_activity_scope_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);
