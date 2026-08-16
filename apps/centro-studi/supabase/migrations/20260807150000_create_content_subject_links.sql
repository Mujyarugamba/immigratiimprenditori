-- M4.1 — create content subject links
-- Implements typed narrated-subject links of Contenuti:
--   public.content_subject_links
-- (docs/architecture/migrations/contenuti-migration-plan.md §13 M4.1;
--  docs/architecture/physical/domain-mapping/contenuti.md §23, §29–§32;
--  docs/architecture/logical/contenuti.md).
--
-- Exactly one of person / business / professional_profile. No entity_type/entity_id.

create table public.content_subject_links (
  id uuid not null default gen_random_uuid (),
  content_id uuid not null,
  person_id uuid null,
  business_id uuid null,
  professional_profile_id uuid null,
  relation_kind text not null default 'subject',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_subject_links_pkey primary key (id),
  constraint content_subject_links_content_id_fkey
    foreign key (content_id)
    references public.contents (id)
    on update no action
    on delete cascade,
  constraint content_subject_links_person_id_fkey
    foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint content_subject_links_business_id_fkey
    foreign key (business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint content_subject_links_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete set null,
  constraint content_subject_links_subject_xor_check check (
    (
      person_id is not null
      and business_id is null
      and professional_profile_id is null
    )
    or (
      person_id is null
      and business_id is not null
      and professional_profile_id is null
    )
    or (
      person_id is null
      and business_id is null
      and professional_profile_id is not null
    )
  ),
  constraint content_subject_links_relation_kind_check check (
    relation_kind in ('subject', 'cited', 'interviewed', 'context')
  ),
  constraint content_subject_links_sort_order_check check (
    sort_order >= 0
  )
);

create unique index content_subject_links_person_uidx
  on public.content_subject_links (content_id, person_id, relation_kind)
  where person_id is not null;

create unique index content_subject_links_business_uidx
  on public.content_subject_links (content_id, business_id, relation_kind)
  where business_id is not null;

create unique index content_subject_links_professional_uidx
  on public.content_subject_links (content_id, professional_profile_id, relation_kind)
  where professional_profile_id is not null;

comment on table public.content_subject_links is
  'Owned Entity of contents: typed narrated subject (Persona, Impresa, or Professional Profile). Exactly one subject FK. No generic entity_type/entity_id polymorphism. Distinct from contents owner. Covers Persone/Imprese/Professionisti subjects without duplicate link tables. ON DELETE CASCADE from contents.';

comment on column public.content_subject_links.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.content_subject_links.content_id is
  'Owning Aggregate Root (public.contents). NOT NULL. ON DELETE CASCADE.';

comment on column public.content_subject_links.person_id is
  'Narrated Persona subject when used. XOR with business_id and professional_profile_id. FK profiles ON DELETE RESTRICT.';

comment on column public.content_subject_links.business_id is
  'Narrated Impresa subject when used. XOR with person_id and professional_profile_id. FK businesses ON DELETE RESTRICT. Distinct from contents.owner_business_id.';

comment on column public.content_subject_links.professional_profile_id is
  'Narrated Professional Profile subject when used. XOR with person_id and business_id. FK professional_profiles ON DELETE SET NULL.';

comment on column public.content_subject_links.relation_kind is
  'Closed relation: subject | cited | interviewed | context. Default subject.';

comment on column public.content_subject_links.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.content_subject_links.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.content_subject_links.updated_at is
  'Last update timestamp. Maintained by content_subject_links_set_updated_at.';

create index content_subject_links_content_id_idx
  on public.content_subject_links (content_id);

create index content_subject_links_person_id_idx
  on public.content_subject_links (person_id)
  where person_id is not null;

create index content_subject_links_business_id_idx
  on public.content_subject_links (business_id)
  where business_id is not null;

create index content_subject_links_professional_profile_id_idx
  on public.content_subject_links (professional_profile_id)
  where professional_profile_id is not null;

alter table public.content_subject_links enable row level security;

revoke all on table public.content_subject_links from public;
revoke all on table public.content_subject_links from anon, authenticated;

create or replace function public.set_content_subject_links_updated_at ()
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

comment on function public.set_content_subject_links_updated_at () is
  'BEFORE UPDATE trigger function for public.content_subject_links. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger content_subject_links_set_updated_at
before update on public.content_subject_links
for each row
execute function public.set_content_subject_links_updated_at ();
