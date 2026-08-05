-- M1.2 — create content categories
-- Implements the flat C03 category catalog of Contenuti:
--   public.content_categories
-- (docs/architecture/migrations/contenuti-migration-plan.md §10 M1.2;
--  docs/architecture/physical/domain-mapping/contenuti.md §10, §29–§33;
--  docs/architecture/logical/contenuti.md).
--
-- Scope of this unit only: flat catalog structure and 8 normative seed rows.
-- Explicitly out of scope: hierarchy; multi-category; service/event/professional
-- catalogs; contents AR; RLS policies; GRANT.

create table public.content_categories (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_categories_pkey primary key (code),
  constraint content_categories_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint content_categories_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint content_categories_sort_order_check check (sort_order >= 0)
);

comment on table public.content_categories is
  'Flat local controlled catalog (C03) of editorial content categories for Contenuti. Owned by Contenuti. Optional primary category via contents.primary_category_code. Not hierarchical. Not service_categories, not event_types, not professional_categories, not opportunity typologies. Seed is normative, not demo (M8.1 SKIP).';

comment on column public.content_categories.code is
  'Stable technical English identifier of the content category. Primary key and authoritative identity. Not a localized label. Immutable by convention after seed; referenced by contents.primary_category_code.';

comment on column public.content_categories.name_it is
  'Italian display label of the category (Physical §10). Descriptive only; not unique and not identity.';

comment on column public.content_categories.description is
  'Optional governance description. Nullable when no authoritative text is provided.';

comment on column public.content_categories.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.content_categories.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.content_categories.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_categories.updated_at is
  'Last update timestamp. Maintained by content_categories_set_updated_at.';

create index content_categories_is_active_idx
  on public.content_categories using btree (is_active);

create index content_categories_sort_order_idx
  on public.content_categories using btree (sort_order);

alter table public.content_categories enable row level security;

revoke all on table public.content_categories from public;
revoke all on table public.content_categories from anon, authenticated;

create or replace function public.set_content_categories_updated_at ()
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

comment on function public.set_content_categories_updated_at () is
  'BEFORE UPDATE trigger function for public.content_categories. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger content_categories_set_updated_at
before update on public.content_categories
for each row
execute function public.set_content_categories_updated_at ();

-- Normative seed from Physical §10 / Migration Plan M1.2.
-- Exactly 8 categories. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.content_categories (
  code,
  name_it,
  description,
  is_active,
  sort_order
)
values
  ('internationalization', 'Internazionalizzazione', null, true, 10),
  ('entrepreneurship', 'Imprenditoria', null, true, 20),
  ('regulation_compliance', 'Normativa e adempimenti', null, true, 30),
  ('markets', 'Mercati', null, true, 40),
  ('services_guidance', 'Orientamento ai servizi', null, true, 50),
  ('events_community', 'Eventi e comunità', null, true, 60),
  ('stories', 'Storie e testimonianze', null, true, 70),
  ('other', 'Altro', null, true, 90);
