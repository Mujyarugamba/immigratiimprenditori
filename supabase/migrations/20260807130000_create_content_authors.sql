-- M3.1 — create content authors
-- Implements owned authorial / editorial responsibility roles of Contenuti:
--   public.content_authors
-- (docs/architecture/migrations/contenuti-migration-plan.md §12 M3.1;
--  docs/architecture/physical/domain-mapping/contenuti.md §12, §29–§32;
--  docs/architecture/logical/contenuti.md).
--
-- Author is distinct from contents owner (titolare). No FK to Organizzazioni
-- or auth.users. Application invariant: published ⇒ ≥1 editorial_responsible.

create table public.content_authors (
  id uuid not null default gen_random_uuid (),
  content_id uuid not null,
  role_kind text not null,
  person_id uuid null,
  business_id uuid null,
  professional_profile_id uuid null,
  display_label text null,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  attribution_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_authors_pkey primary key (id),
  constraint content_authors_content_id_fkey
    foreign key (content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_authors_person_id_fkey
    foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete set null,
  constraint content_authors_business_id_fkey
    foreign key (business_id)
    references public.businesses (id)
    on update no action
    on delete set null,
  constraint content_authors_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete set null,
  constraint content_authors_role_kind_check check (
    role_kind in (
      'author',
      'co_author',
      'curator',
      'editor',
      'contributor',
      'editorial_responsible'
    )
  ),
  constraint content_authors_subject_present_check check (
    person_id is not null
    or business_id is not null
    or professional_profile_id is not null
    or (
      display_label is not null
      and length(btrim(display_label)) > 0
    )
  ),
  constraint content_authors_person_business_xor_check check (
    not (
      person_id is not null
      and business_id is not null
    )
  ),
  constraint content_authors_sort_order_check check (
    sort_order >= 0
  ),
  constraint content_authors_display_label_check check (
    display_label is null
    or length(btrim(display_label)) > 0
  ),
  constraint content_authors_attribution_note_check check (
    attribution_note is null
    or length(btrim(attribution_note)) > 0
  )
);

create unique index content_authors_primary_uidx
  on public.content_authors (content_id)
  where is_primary;

create unique index content_authors_person_role_uidx
  on public.content_authors (content_id, role_kind, person_id)
  where person_id is not null;

comment on table public.content_authors is
  'Owned Entity of contents: authorial and editorial responsibility roles (author, co_author, curator, editor, contributor, editorial_responsible). Distinct from contents owner (titolare). Subject is Persona and/or Professional Profile and/or Impresa XOR with person+business, or opaque display_label. No FK to Organizzazioni or auth.users. ON DELETE CASCADE from contents. Application invariant: published contents require ≥1 editorial_responsible (not DDL).';

comment on column public.content_authors.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.content_authors.content_id is
  'Owning Aggregate Root (public.contents). NOT NULL. ON DELETE CASCADE.';

comment on column public.content_authors.role_kind is
  'Closed role: author | co_author | curator | editor | contributor | editorial_responsible.';

comment on column public.content_authors.person_id is
  'Optional Persona subject. Mutually exclusive with business_id. ON DELETE SET NULL. May coexist with professional_profile_id or display_label.';

comment on column public.content_authors.business_id is
  'Optional Impresa subject. Mutually exclusive with person_id. ON DELETE SET NULL.';

comment on column public.content_authors.professional_profile_id is
  'Optional Professional Profile subject. ON DELETE SET NULL.';

comment on column public.content_authors.display_label is
  'Optional opaque external author label when no FK subject is used (or as complementary label). Not a FK to Organizzazioni.';

comment on column public.content_authors.is_primary is
  'Primary author flag. At most one primary per content (partial UNIQUE). Default false.';

comment on column public.content_authors.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.content_authors.attribution_note is
  'Optional free-text attribution note. Nullable; blank rejected when present.';

comment on column public.content_authors.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_authors.updated_at is
  'Last update timestamp. Maintained by content_authors_set_updated_at.';

create index content_authors_content_id_idx
  on public.content_authors (content_id);

create index content_authors_person_id_idx
  on public.content_authors (person_id)
  where person_id is not null;

create index content_authors_business_id_idx
  on public.content_authors (business_id)
  where business_id is not null;

create index content_authors_professional_profile_id_idx
  on public.content_authors (professional_profile_id)
  where professional_profile_id is not null;

create index content_authors_primary_idx
  on public.content_authors (content_id)
  where is_primary;

alter table public.content_authors enable row level security;

revoke all on table public.content_authors from public;
revoke all on table public.content_authors from anon, authenticated;

create or replace function public.set_content_authors_updated_at ()
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

comment on function public.set_content_authors_updated_at () is
  'BEFORE UPDATE trigger function for public.content_authors. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger content_authors_set_updated_at
before update on public.content_authors
for each row
execute function public.set_content_authors_updated_at ();
