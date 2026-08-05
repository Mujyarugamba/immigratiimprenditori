-- M2.1 — create organizations
-- Implements Aggregate Root Organizzazione of Organizzazioni:
--   public.organizations
-- (docs/architecture/migrations/organizzazioni-migration-plan.md §10 M2.1;
--  docs/architecture/physical/domain-mapping/organizzazioni.md §7–§12, §16–§19;
--  docs/architecture/logical/organizzazioni.md).
--
-- Scope of this unit only: AR structure, ternary ownership, catalog FKs,
-- optional language bigint, descriptive seat columns, optional linked Impresa,
-- lifecycle axes, slug, opaque logo/document URLs, indexes, updated_at, RLS, REVOKE.
-- Explicitly out of scope: officials; membership; Org–Org; multi-seat;
-- Storage; FEV; CRM; HR; auth.users owner; Eventi/Servizi/Contenuti/Opp/MI FK;
-- profiles.organization_type; seed; policies; GRANT.

create table public.organizations (
  id uuid not null default gen_random_uuid (),
  owner_person_id uuid null,
  owner_business_id uuid null,
  owned_by_editorial boolean not null default false,
  type_code text not null,
  primary_scope_code text null,
  language_id bigint null,
  linked_business_id uuid null,
  name text not null,
  short_name text null,
  summary text null,
  description text not null,
  slug text not null,
  founded_year integer null,
  website_url text null,
  email text null,
  phone text null,
  logo_url text null,
  document_url text null,
  affiliation_note text null,
  seat_address_text text null,
  seat_city_label text null,
  seat_region_label text null,
  seat_country_label text null,
  editorial_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  visibility_status text not null default 'private',
  operational_status text not null default 'active',
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  activity_started_on date null,
  activity_ended_on date null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_pkey primary key (id),
  constraint organizations_owner_person_id_fkey
    foreign key (owner_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint organizations_owner_business_id_fkey
    foreign key (owner_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint organizations_type_code_fkey
    foreign key (type_code)
    references public.organization_types (code)
    on update cascade
    on delete restrict,
  constraint organizations_primary_scope_code_fkey
    foreign key (primary_scope_code)
    references public.organization_activity_scopes (code)
    on update cascade
    on delete restrict,
  constraint organizations_language_id_fkey
    foreign key (language_id)
    references public.languages (id)
    on update no action
    on delete restrict,
  constraint organizations_linked_business_id_fkey
    foreign key (linked_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint organizations_slug_key unique (slug),
  constraint organizations_ownership_ternary_check check (
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
  constraint organizations_name_not_blank_check check (
    length(btrim(name)) > 0
  ),
  constraint organizations_description_not_blank_check check (
    length(btrim(description)) > 0
  ),
  constraint organizations_slug_not_blank_check check (
    length(btrim(slug)) > 0
  ),
  constraint organizations_slug_format_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint organizations_editorial_status_check check (
    editorial_status in ('draft', 'ready')
  ),
  constraint organizations_publication_status_check check (
    publication_status in ('unpublished', 'published', 'withdrawn')
  ),
  constraint organizations_visibility_status_check check (
    visibility_status in ('private', 'public')
  ),
  constraint organizations_operational_status_check check (
    operational_status in ('active', 'inactive', 'suspended', 'dissolved')
  ),
  constraint organizations_publication_gates_check check (
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
  constraint organizations_short_name_check check (
    short_name is null
    or length(btrim(short_name)) > 0
  ),
  constraint organizations_summary_check check (
    summary is null
    or length(btrim(summary)) > 0
  ),
  constraint organizations_website_url_check check (
    website_url is null
    or length(btrim(website_url)) > 0
  ),
  constraint organizations_email_check check (
    email is null
    or length(btrim(email)) > 0
  ),
  constraint organizations_phone_check check (
    phone is null
    or length(btrim(phone)) > 0
  ),
  constraint organizations_logo_url_check check (
    logo_url is null
    or length(btrim(logo_url)) > 0
  ),
  constraint organizations_document_url_check check (
    document_url is null
    or length(btrim(document_url)) > 0
  ),
  constraint organizations_affiliation_note_check check (
    affiliation_note is null
    or length(btrim(affiliation_note)) > 0
  ),
  constraint organizations_seat_address_text_check check (
    seat_address_text is null
    or length(btrim(seat_address_text)) > 0
  ),
  constraint organizations_seat_city_label_check check (
    seat_city_label is null
    or length(btrim(seat_city_label)) > 0
  ),
  constraint organizations_seat_region_label_check check (
    seat_region_label is null
    or length(btrim(seat_region_label)) > 0
  ),
  constraint organizations_seat_country_label_check check (
    seat_country_label is null
    or length(btrim(seat_country_label)) > 0
  ),
  constraint organizations_founded_year_check check (
    founded_year is null
    or (
      founded_year >= 1000
      and founded_year <= 9999
    )
  ),
  constraint organizations_activity_dates_check check (
    activity_ended_on is null
    or activity_started_on is null
    or activity_ended_on >= activity_started_on
  )
);

comment on table public.organizations is
  'Aggregate Root of Organizzazioni: institutional organization anagraphic sheet with typology, ternary ownership, descriptive single seat, optional Impresa link, and multi-axis lifecycle. Owned by Organizzazioni. Distinct from Impresa (businesses), not cooperative economic forms, not membership/Appartenenze, not Evento/Servizio/Contenuto/Opportunità, not Org–Org graph, not Storage/FEV/CRM/HR. Owner is exactly one of Persona (profiles), Impresa (businesses), or Redazione (owned_by_editorial). Not auth.users owner. linked_business_id is declarative continuity, not ownership fusion. Seat is seat_* columns only (no multi-seat table).';

comment on column public.organizations.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Stable identity of the organization sheet.';

comment on column public.organizations.owner_person_id is
  'Owning Persona when titolare is a person. Mutually exclusive with owner_business_id and owned_by_editorial. FK profiles ON DELETE RESTRICT. Not auth.users. Not self-ownership of organizations.';

comment on column public.organizations.owner_business_id is
  'Owning Impresa when titolare is a business. Mutually exclusive with owner_person_id and owned_by_editorial. FK businesses ON DELETE RESTRICT. Distinct from linked_business_id.';

comment on column public.organizations.owned_by_editorial is
  'When true, titolare is platform Redazione (no organizations FK as owner, no auth.users). Requires both owner_* NULL. Default false.';

comment on column public.organizations.type_code is
  'Required FK to organization_types(code). ON UPDATE CASCADE; ON DELETE RESTRICT. Institutional typology; not profiles.organization_type legacy.';

comment on column public.organizations.primary_scope_code is
  'Optional FK to organization_activity_scopes(code). At most one primary scope in cycle 1. ON UPDATE CASCADE; ON DELETE RESTRICT. Not business_sectors.';

comment on column public.organizations.language_id is
  'Optional primary language of the sheet. FK languages(id) bigint. ON DELETE RESTRICT. Nullable in cycle 1.';

comment on column public.organizations.linked_business_id is
  'Optional declarative 0..1 link to businesses(id). ON DELETE RESTRICT. Continuity / dual nature declared; not ownership, not anagraphic fusion with Impresa. Not UNIQUE globally.';

comment on column public.organizations.name is
  'Required non-blank denomination of the organization.';

comment on column public.organizations.short_name is
  'Optional short denomination. Nullable; blank rejected when present.';

comment on column public.organizations.summary is
  'Optional short synopsis. Nullable; blank rejected when present.';

comment on column public.organizations.description is
  'Required non-blank description / mission text.';

comment on column public.organizations.slug is
  'Required globally unique URL slug. Pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$. Not blank.';

comment on column public.organizations.founded_year is
  'Optional declarative founding year. NULL or integer in 1000..9999.';

comment on column public.organizations.website_url is
  'Optional opaque website URL. Not Storage.';

comment on column public.organizations.email is
  'Optional declarative contact email. Blank rejected when present.';

comment on column public.organizations.phone is
  'Optional declarative contact phone. Blank rejected when present.';

comment on column public.organizations.logo_url is
  'Optional opaque logo URL reference. Not a Storage bucket path, not media library.';

comment on column public.organizations.document_url is
  'Optional opaque public document URL. Not FEV structured sources, not document library, not Storage.';

comment on column public.organizations.affiliation_note is
  'Optional free-text “fa parte di…” note without Org–Org graph. Not membership.';

comment on column public.organizations.seat_address_text is
  'Optional opaque descriptive seat address. Part of single logical seat 0..1 on AR. Not multi-seat.';

comment on column public.organizations.seat_city_label is
  'Optional declarative city label of the seat. Not a geographic catalog FK.';

comment on column public.organizations.seat_region_label is
  'Optional declarative region/area label of the seat. Not a geographic catalog FK.';

comment on column public.organizations.seat_country_label is
  'Optional declarative country label of the seat. Not a geographic catalog FK.';

comment on column public.organizations.editorial_status is
  'Editorial axis: draft | ready. Default draft. Published requires ready (DDL publication gates).';

comment on column public.organizations.publication_status is
  'Publication axis: unpublished | published | withdrawn. Default unpublished. Independent from operational_status.';

comment on column public.organizations.visibility_status is
  'Substantial visibility: private | public. Default private. Not an RLS policy.';

comment on column public.organizations.operational_status is
  'Operational axis: active | inactive | suspended | dissolved. Default active. Independent from publication; dissolved does not imply withdrawn.';

comment on column public.organizations.published_at is
  'Publication timestamp. Required when publication_status = published; NULL when unpublished.';

comment on column public.organizations.withdrawn_at is
  'Withdrawal timestamp. Required when publication_status = withdrawn.';

comment on column public.organizations.activity_started_on is
  'Optional declarative activity start date.';

comment on column public.organizations.activity_ended_on is
  'Optional declarative activity end date. When both dates set, must be >= activity_started_on.';

comment on column public.organizations.archived_at is
  'Archive timestamp. NULL means current; set means archived historically. Independent from dissolved.';

comment on column public.organizations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.organizations.updated_at is
  'Last update timestamp. Maintained by organizations_set_updated_at.';

create index organizations_owner_person_id_idx
  on public.organizations (owner_person_id)
  where owner_person_id is not null;

create index organizations_owner_business_id_idx
  on public.organizations (owner_business_id)
  where owner_business_id is not null;

create index organizations_owned_by_editorial_idx
  on public.organizations (owned_by_editorial)
  where owned_by_editorial = true;

create index organizations_type_code_idx
  on public.organizations (type_code);

create index organizations_publication_status_idx
  on public.organizations (publication_status);

create index organizations_published_idx
  on public.organizations (publication_status)
  where publication_status = 'published';

create index organizations_operational_status_idx
  on public.organizations (operational_status);

create index organizations_linked_business_id_idx
  on public.organizations (linked_business_id)
  where linked_business_id is not null;

create index organizations_archived_at_idx
  on public.organizations (archived_at)
  where archived_at is not null;

alter table public.organizations enable row level security;

revoke all on table public.organizations from public;
revoke all on table public.organizations from anon, authenticated;

create or replace function public.set_organizations_updated_at ()
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

comment on function public.set_organizations_updated_at () is
  'BEFORE UPDATE trigger function for public.organizations. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger organizations_set_updated_at
before update on public.organizations
for each row
execute function public.set_organizations_updated_at ();
