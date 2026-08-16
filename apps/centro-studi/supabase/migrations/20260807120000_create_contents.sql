-- M2.1 — create contents
-- Implements Aggregate Root Contenuto of Contenuti:
--   public.contents
-- (docs/architecture/migrations/contenuti-migration-plan.md §11 M2.1;
--  docs/architecture/physical/domain-mapping/contenuti.md §7–§8, §29–§32;
--  docs/architecture/logical/contenuti.md).
--
-- Scope of this unit only: AR structure, ternary ownership, catalogs FKs,
-- language bigint, body, lifecycle axes, slug, opaque cover/source, indexes,
-- updated_at, RLS, REVOKE.
-- Explicitly out of scope: authors/links; CMS/page builder; JSONB blocks;
-- versioning; translations; Storage; scheduling; Organizzazioni; auth.users;
-- personal_stories / business_media absorption; seed; policies; GRANT.
--
-- Application invariant (not DDL): publication_status = 'published' implies
-- at least one content_authors row with role_kind = 'editorial_responsible'.
-- No cross-table trigger in cycle 1.

create table public.contents (
  id uuid not null default gen_random_uuid (),
  owner_person_id uuid null,
  owner_business_id uuid null,
  owned_by_editorial boolean not null default false,
  type_code text not null,
  primary_category_code text null,
  language_id bigint not null,
  title text not null,
  subtitle text null,
  abstract text null,
  body text not null,
  body_format text not null default 'markdown',
  slug text not null,
  cover_url text null,
  source_url text null,
  source_label text null,
  editorial_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  visibility_status text not null default 'private',
  is_featured boolean not null default false,
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contents_pkey primary key (id),
  constraint contents_owner_person_id_fkey
    foreign key (owner_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint contents_owner_business_id_fkey
    foreign key (owner_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint contents_type_code_fkey
    foreign key (type_code)
    references public.content_types (code)
    on update cascade
    on delete restrict,
  constraint contents_primary_category_code_fkey
    foreign key (primary_category_code)
    references public.content_categories (code)
    on update cascade
    on delete restrict,
  constraint contents_language_id_fkey
    foreign key (language_id)
    references public.languages (id)
    on update no action
    on delete restrict,
  constraint contents_slug_key unique (slug),
  constraint contents_ownership_ternary_check check (
    (
      owner_person_id is not null
      and owner_business_id is null
      and owned_by_editorial = false
    )
    or (
      owner_person_id is null
      and owner_business_id is not null
      and owned_by_editorial = false
    )
    or (
      owner_person_id is null
      and owner_business_id is null
      and owned_by_editorial = true
    )
  ),
  constraint contents_title_not_blank_check check (
    length(btrim(title)) > 0
  ),
  constraint contents_body_not_blank_check check (
    length(btrim(body)) > 0
  ),
  constraint contents_slug_not_blank_check check (
    length(btrim(slug)) > 0
  ),
  constraint contents_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint contents_body_format_check check (
    body_format in ('plain_text', 'markdown')
  ),
  constraint contents_editorial_status_check check (
    editorial_status in ('draft', 'ready')
  ),
  constraint contents_publication_status_check check (
    publication_status in ('unpublished', 'published', 'withdrawn')
  ),
  constraint contents_visibility_status_check check (
    visibility_status in ('private', 'public')
  ),
  constraint contents_publication_gates_check check (
    (
      publication_status = 'published'
      and published_at is not null
      and editorial_status = 'ready'
    )
    or (
      publication_status = 'withdrawn'
      and withdrawn_at is not null
    )
    or (
      publication_status = 'unpublished'
      and published_at is null
      and withdrawn_at is null
    )
  ),
  constraint contents_subtitle_check check (
    subtitle is null
    or length(btrim(subtitle)) > 0
  ),
  constraint contents_abstract_check check (
    abstract is null
    or length(btrim(abstract)) > 0
  ),
  constraint contents_cover_url_check check (
    cover_url is null
    or length(btrim(cover_url)) > 0
  ),
  constraint contents_source_url_check check (
    source_url is null
    or length(btrim(source_url)) > 0
  ),
  constraint contents_source_label_check check (
    source_label is null
    or length(btrim(source_label)) > 0
  )
);

comment on table public.contents is
  'Aggregate Root of Contenuti: structured publishable editorial Contenuto sheet with single textual body. Owned by Contenuti. Distinct from Evento (events), OffertaDiServizio/RichiestaDiServizio, Opportunità, StoriaPersonale (personal_stories), and MediaImpresa (business_media). Owner is exactly one of Persona (profiles), Impresa (businesses), or Redazione (owned_by_editorial). Not CMS, not page builder, not JSONB blocks, not Storage, not versioning, not translations. Application invariant: published contents require ≥1 content_authors row with role_kind = editorial_responsible (enforced outside DDL; no cross-table trigger in cycle 1).';

comment on column public.contents.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Stable identity of the content sheet.';

comment on column public.contents.owner_person_id is
  'Owning Persona when titolare is a person. Mutually exclusive with owner_business_id and owned_by_editorial. FK profiles ON DELETE RESTRICT. Not auth.users.';

comment on column public.contents.owner_business_id is
  'Owning Impresa when titolare is a business. Mutually exclusive with owner_person_id and owned_by_editorial. FK businesses ON DELETE RESTRICT.';

comment on column public.contents.owned_by_editorial is
  'When true, titolare is platform Redazione (no Organizzazioni FK, no auth.users). Requires both owner_* NULL. Default false.';

comment on column public.contents.type_code is
  'FK to content_types(code). Required. ON UPDATE CASCADE; ON DELETE RESTRICT. Tipology personal_story is classification only and does not absorb personal_stories.';

comment on column public.contents.primary_category_code is
  'Optional FK to content_categories(code). At most one primary category in cycle 1. ON UPDATE CASCADE; ON DELETE RESTRICT.';

comment on column public.contents.language_id is
  'Single language of the content body. FK languages(id) bigint. ON DELETE RESTRICT. No owned translations table in cycle 1.';

comment on column public.contents.title is
  'Required non-blank human-facing title.';

comment on column public.contents.subtitle is
  'Optional subtitle. Nullable; blank rejected when present.';

comment on column public.contents.abstract is
  'Optional short synopsis. Nullable; blank rejected when present.';

comment on column public.contents.body is
  'Required non-blank unique textual body. Not JSONB, not CMS blocks, not HTML page builder.';

comment on column public.contents.body_format is
  'Closed body format: plain_text | markdown. Default markdown.';

comment on column public.contents.slug is
  'Required globally unique URL slug. Pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$. Not blank.';

comment on column public.contents.cover_url is
  'Optional opaque cover URL reference. Not a Storage bucket path, not MIME/hash metadata.';

comment on column public.contents.source_url is
  'Optional opaque descriptive source URL. Not FEV structured sources, not Storage.';

comment on column public.contents.source_label is
  'Optional opaque source label complementary to source_url.';

comment on column public.contents.editorial_status is
  'Editorial axis: draft | ready. Default draft. Published requires ready (DDL publication gates).';

comment on column public.contents.publication_status is
  'Publication axis: unpublished | published | withdrawn. Default unpublished. Published implies editorial_responsible author (application invariant, not DDL).';

comment on column public.contents.visibility_status is
  'Substantial visibility: private | public. Default private. Not an RLS policy.';

comment on column public.contents.is_featured is
  'Simple pinning flag. Default false. Not ranking, not analytics.';

comment on column public.contents.published_at is
  'Publication timestamp. Required when publication_status = published; NULL when unpublished. No scheduling column.';

comment on column public.contents.withdrawn_at is
  'Withdrawal timestamp. Required when publication_status = withdrawn.';

comment on column public.contents.archived_at is
  'Archive timestamp. NULL means current; set means archived historically.';

comment on column public.contents.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.contents.updated_at is
  'Last update timestamp. Maintained by contents_set_updated_at.';

create index contents_owner_person_id_idx
  on public.contents (owner_person_id)
  where owner_person_id is not null;

create index contents_owner_business_id_idx
  on public.contents (owner_business_id)
  where owner_business_id is not null;

create index contents_owned_by_editorial_idx
  on public.contents (owned_by_editorial)
  where owned_by_editorial = true;

create index contents_type_code_idx
  on public.contents (type_code);

create index contents_language_id_idx
  on public.contents (language_id);

create index contents_publication_status_idx
  on public.contents (publication_status);

create index contents_published_idx
  on public.contents (publication_status)
  where publication_status = 'published';

create index contents_featured_idx
  on public.contents (is_featured)
  where is_featured = true;

create index contents_archived_at_idx
  on public.contents (archived_at)
  where archived_at is not null;

alter table public.contents enable row level security;

revoke all on table public.contents from public;
revoke all on table public.contents from anon, authenticated;

create or replace function public.set_contents_updated_at ()
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

comment on function public.set_contents_updated_at () is
  'BEFORE UPDATE trigger function for public.contents. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not enforce editorial_responsible or publication cross-table invariants.';

create trigger contents_set_updated_at
before update on public.contents
for each row
execute function public.set_contents_updated_at ();
