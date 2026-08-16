-- M1.1 — create content types
-- Implements the normative C03 typology catalog of Contenuti:
--   public.content_types
-- (docs/architecture/migrations/contenuti-migration-plan.md §10 M1.1;
--  docs/architecture/physical/domain-mapping/contenuti.md §9, §29–§33;
--  docs/architecture/logical/contenuti.md).
--
-- Scope of this unit only: catalog structure and 11 normative seed rows.
-- Explicitly out of scope: content_categories/tags; contents AR; authors/links;
-- CMS; page builder; personal_stories absorption; RLS policies; GRANT.

create table public.content_types (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_types_pkey primary key (code),
  constraint content_types_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint content_types_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint content_types_sort_order_check check (sort_order >= 0)
);

comment on table public.content_types is
  'Normative local controlled catalog (C03) of editorial content typologies for the Contenuti domain. Owned by Contenuti. Classifies Contenuto via contents.type_code. Not service_categories, not event_types, not professional_categories, not opportunity typologies. Tipology personal_story is classification only and does not absorb public.personal_stories. Seed is normative, not demo (M8.1 SKIP).';

comment on column public.content_types.code is
  'Stable technical English identifier of the content type. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced by contents.type_code.';

comment on column public.content_types.name_it is
  'Italian display label of the typology (Physical §9). Descriptive only; not unique and not identity.';

comment on column public.content_types.description is
  'Optional governance description. Nullable when no authoritative text is provided. Not content body text.';

comment on column public.content_types.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.content_types.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.content_types.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_types.updated_at is
  'Last update timestamp. Maintained by content_types_set_updated_at.';

create index content_types_is_active_idx
  on public.content_types using btree (is_active);

create index content_types_sort_order_idx
  on public.content_types using btree (sort_order);

alter table public.content_types enable row level security;

-- Defense in depth: no policies in M1.1. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and table owner privileges are not revoked.
revoke all on table public.content_types from public;
revoke all on table public.content_types from anon, authenticated;

create or replace function public.set_content_types_updated_at ()
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

comment on function public.set_content_types_updated_at () is
  'BEFORE UPDATE trigger function for public.content_types. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger content_types_set_updated_at
before update on public.content_types
for each row
execute function public.set_content_types_updated_at ();

-- Normative seed from Physical §9 / Migration Plan M1.1.
-- Exactly 11 typologies. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.content_types (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  ('news', 'Notizia', null, true, 10),
  ('guide', 'Guida', null, true, 20),
  ('insight', 'Approfondimento', null, true, 30),
  ('interview', 'Intervista', null, true, 40),
  ('business_story', 'Storia di Impresa', null, true, 50),
  ('event_presentation', 'Presentazione Evento', null, true, 60),
  ('opportunity_presentation', 'Presentazione Opportunità', null, true, 70),
  ('service_presentation', 'Presentazione Servizio', null, true, 80),
  ('market_content', 'Contenuto su Mercato', null, true, 90),
  ('institutional_page', 'Pagina informativa', null, true, 100),
  ('personal_story', 'Storia personale (classificazione)', null, true, 110);
