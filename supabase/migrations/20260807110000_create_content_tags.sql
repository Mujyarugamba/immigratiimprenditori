-- M1.3 — create content tags
-- Implements the C03 tag catalog of Contenuti:
--   public.content_tags
-- (docs/architecture/migrations/contenuti-migration-plan.md §10 M1.3;
--  docs/architecture/physical/domain-mapping/contenuti.md §11.1, §29–§33;
--  docs/architecture/logical/contenuti.md).
--
-- Scope of this unit only: catalog structure ready for operational population.
-- Explicitly out of scope: seed rows; hierarchy; content_tag_links (M3.2);
-- RLS policies; GRANT.

create table public.content_tags (
  code text not null,
  name_it text not null,
  description text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_tags_pkey primary key (code),
  constraint content_tags_code_not_blank_check check (
    length(btrim(code)) > 0
  ),
  constraint content_tags_name_it_not_blank_check check (
    length(btrim(name_it)) > 0
  ),
  constraint content_tags_sort_order_check check (sort_order >= 0)
);

comment on table public.content_tags is
  'Local controlled catalog (C03) of editorial tags for Contenuti. Owned by Contenuti. Linked via content_tag_links. Flat (no hierarchy). No normative seed in cycle 1; vocabulary is operationally populated. Not a CMS taxonomy tree.';

comment on column public.content_tags.code is
  'Stable technical English identifier of the tag. Primary key and authoritative identity. Not a localized label. Referenced by content_tag_links.tag_code.';

comment on column public.content_tags.name_it is
  'Italian display label of the tag (Physical §11.1). Descriptive only; not unique and not identity.';

comment on column public.content_tags.description is
  'Optional governance description. Nullable when no authoritative text is provided.';

comment on column public.content_tags.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.content_tags.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.content_tags.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_tags.updated_at is
  'Last update timestamp. Maintained by content_tags_set_updated_at.';

create index content_tags_is_active_idx
  on public.content_tags using btree (is_active);

create index content_tags_sort_order_idx
  on public.content_tags using btree (sort_order);

alter table public.content_tags enable row level security;

revoke all on table public.content_tags from public;
revoke all on table public.content_tags from anon, authenticated;

create or replace function public.set_content_tags_updated_at ()
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

comment on function public.set_content_tags_updated_at () is
  'BEFORE UPDATE trigger function for public.content_tags. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger content_tags_set_updated_at
before update on public.content_tags
for each row
execute function public.set_content_tags_updated_at ();

-- Seed: none in cycle 1 (Physical §33 / Plan M1.3).
