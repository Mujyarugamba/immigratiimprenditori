-- C3.6 — add collaboration activity scope
-- Introduces a domain-owned activity-scope classification for Collaborazioni,
-- separate from form_code (declaration form).
-- Sources: C3 plan §7.6; Hybrid C; C3.7 deferred.
--
-- Objects:
--   public.collaboration_activity_scopes          (C03 catalog)
--   public.collaborations.activity_scope_code     (nullable FK 0..1)
--
-- Explicitly out of scope: changing form_code; backfill from form/title/
-- description; disciplines; Cultura AR; new collaboration RLS policies
-- (column inherits existing AR policies); ownership immutability guard
-- (activity_scope_code is editorial/gestionale classification, not owner).

-- ---------------------------------------------------------------------------
-- A. Catalog — public.collaboration_activity_scopes
-- ---------------------------------------------------------------------------

create table public.collaboration_activity_scopes (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collaboration_activity_scopes_pkey primary key (code),
  constraint collaboration_activity_scopes_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint collaboration_activity_scopes_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint collaboration_activity_scopes_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.collaboration_activity_scopes is
  'Local controlled catalog (C03) of light activity scopes for Collaborazioni. Owned by Collaborazioni. Classifies the cultural/activity field of a collaboration. Not form_code, not disciplines (C3.7 deferred), not a Cultura aggregate.';

comment on column public.collaboration_activity_scopes.code is
  'Stable technical English identifier of the activity scope. Primary key and authoritative identity. Not a localized label.';

comment on column public.collaboration_activity_scopes.name_it is
  'Italian display label of the activity scope. Descriptive only; not unique and not identity.';

comment on column public.collaboration_activity_scopes.description is
  'Optional governance description. Nullable when no authoritative text is provided.';

comment on column public.collaboration_activity_scopes.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.collaboration_activity_scopes.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.collaboration_activity_scopes.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.collaboration_activity_scopes.updated_at is
  'Last update timestamp. Maintained by collaboration_activity_scopes_set_updated_at.';

create index collaboration_activity_scopes_is_active_idx
  on public.collaboration_activity_scopes using btree (is_active);

create index collaboration_activity_scopes_sort_order_idx
  on public.collaboration_activity_scopes using btree (sort_order);

alter table public.collaboration_activity_scopes enable row level security;

revoke all on table public.collaboration_activity_scopes from public;
revoke all on table public.collaboration_activity_scopes from anon, authenticated;

grant select on table public.collaboration_activity_scopes to anon, authenticated;

create policy collaboration_activity_scopes_select_public
  on public.collaboration_activity_scopes for select to anon, authenticated
  using (is_active = true);

create or replace function public.set_collaboration_activity_scopes_updated_at ()
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

comment on function public.set_collaboration_activity_scopes_updated_at () is
  'BEFORE UPDATE trigger function for public.collaboration_activity_scopes. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger collaboration_activity_scopes_set_updated_at
before update on public.collaboration_activity_scopes
for each row
execute function public.set_collaboration_activity_scopes_updated_at ();

insert into public.collaboration_activity_scopes (
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
    'Ambito culturale della collaborazione. Distinto da form_code.',
    true,
    10
  ),
  (
    'heritage',
    'Patrimonio',
    'Ambito patrimonio culturale della collaborazione.',
    true,
    20
  ),
  (
    'creative_industries',
    'Industrie creative',
    'Ambito industrie culturali e creative della collaborazione.',
    true,
    30
  );

-- ---------------------------------------------------------------------------
-- B. AR column — collaborations.activity_scope_code (nullable; no backfill)
-- ---------------------------------------------------------------------------

alter table public.collaborations
add column activity_scope_code text null;

alter table public.collaborations
add constraint collaborations_activity_scope_code_fkey
  foreign key (activity_scope_code)
  references public.collaboration_activity_scopes (code)
  on update cascade
  on delete restrict;

comment on column public.collaborations.activity_scope_code is
  'Optional FK to collaboration_activity_scopes(code). At most one activity scope. Nullable so existing and non-cultural collaborations remain valid without backfill. Not form_code; not ownership; not discipline.';

create index collaborations_activity_scope_code_idx
  on public.collaborations using btree (activity_scope_code);
