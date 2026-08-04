-- M1.1 — create event types
-- Implements the normative C03 typology catalog of Eventi:
--   public.event_types
-- (docs/architecture/migrations/eventi-migration-plan.md §10 M1.1;
--  docs/architecture/physical/domain-mapping/eventi.md §13–§14, §24–§28;
--  docs/architecture/logical/eventi.md).
--
-- Scope of this unit only: catalog structure and 10 normative seed rows.
-- Explicitly out of scope: events AR (M2); editions/sessions/roles/registrations;
-- service_categories; professional_categories; opportunity typologies;
-- ticketing; RRULE; demo AR data; RLS policies; GRANT.

create table public.event_types (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_types_pkey primary key (code),
  constraint event_types_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint event_types_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint event_types_sort_order_check check (sort_order >= 0)
);

comment on table public.event_types is
  'Normative local controlled catalog (C03) of event typologies for the Eventi domain. Owned by Eventi. Classifies Evento via events.type_code. Not service_categories, not professional_categories, not opportunity typologies, not a marketplace taxonomy. Seed is normative, not demo (M8.1 SKIP).';

comment on column public.event_types.code is
  'Stable technical English identifier of the event type. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced by events.type_code.';

comment on column public.event_types.name_it is
  'Italian display label of the typology (Physical §13). Descriptive only; not unique and not identity.';

comment on column public.event_types.description is
  'Optional governance description. Nullable when no authoritative text is provided. Not an event description.';

comment on column public.event_types.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.event_types.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.event_types.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_types.updated_at is
  'Last update timestamp. Maintained by event_types_set_updated_at.';

create index event_types_is_active_idx
  on public.event_types using btree (is_active);

create index event_types_sort_order_idx
  on public.event_types using btree (sort_order);

alter table public.event_types enable row level security;

-- Defense in depth: no policies in M1.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.event_types from public;
revoke all on table public.event_types from anon, authenticated;

create or replace function public.set_event_types_updated_at ()
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

comment on function public.set_event_types_updated_at () is
  'BEFORE UPDATE trigger function for public.event_types. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger event_types_set_updated_at
before update on public.event_types
for each row
execute function public.set_event_types_updated_at ();

-- Normative seed from Physical §14 / Migration Plan M1.1.
-- Exactly 10 typologies. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.event_types (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  ('networking', 'Networking / incontro', null, true, 10),
  ('conference', 'Convegno / conferenza / webinar / workshop', null, true, 20),
  ('fair', 'Fiera / esposizione', null, true, 30),
  ('mission', 'Missione imprenditoriale', null, true, 40),
  ('visit', 'Visita aziendale', null, true, 50),
  ('institutional', 'Istituzionale / associativo', null, true, 60),
  ('course', 'Corso / attività formativa', null, true, 70),
  ('award', 'Premiazione', null, true, 80),
  ('cultural', 'Culturale / sociale', null, true, 90),
  ('other', 'Altro', null, true, 100);
