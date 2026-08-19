-- SPLIT-3B candidate baseline — ImmigratiImprenditori
-- Target: fresh Supabase project (auth schema already provisioned by Supabase).
-- IMPORTANT: candidate baseline only. Must pass cold-start validation before merge/use.
-- No FK in this baseline points to PonteImprese-owned tables.

begin;

-- -----------------------------------------------------------------------------
-- Foundation
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
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

-- -----------------------------------------------------------------------------
-- Local identity compatibility layer
-- Keeps the application contract used by getApplicationSession(), without
-- importing PonteImprese business/membership domains.
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  slug text not null unique,
  bio text,
  organization_name text,
  organization_type text,
  role_description text,
  city text,
  province text,
  region text,
  country text not null default 'Italia',
  website text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  is_public boolean not null default false,
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_slug_format_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint profiles_display_name_not_blank check (length(btrim(display_name)) > 0)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  person_id uuid unique references public.profiles(id) on delete set null,
  person_association_status text,
  person_linked_at timestamptz,
  account_status text not null default 'registered',
  activated_at timestamptz,
  suspended_at timestamptz,
  disabled_at timestamptz,
  closed_at timestamptz,
  status_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_status_check check (
    account_status in ('registered','active','limited','suspended','disabled','closed')
  ),
  constraint accounts_person_association_check check (
    (person_id is null and person_association_status is null and person_linked_at is null)
    or
    (person_id is not null and person_association_status in ('declared','verified','contested') and person_linked_at is not null)
  ),
  constraint accounts_active_person_check check (account_status <> 'active' or person_id is not null),
  constraint accounts_active_timestamp_check check (account_status <> 'active' or activated_at is not null),
  constraint accounts_suspended_timestamp_check check (account_status <> 'suspended' or suspended_at is not null),
  constraint accounts_disabled_timestamp_check check (account_status <> 'disabled' or disabled_at is not null),
  constraint accounts_closed_timestamp_check check (account_status <> 'closed' or closed_at is not null),
  constraint accounts_reason_check check (status_reason is null or length(btrim(status_reason)) > 0)
);

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

create table public.account_role_assignments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  role_code text not null,
  assignment_status text not null default 'active',
  assigned_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_role_unique unique (account_id, role_code),
  constraint account_role_code_check check (role_code in ('redattore','amministratore_applicativo')),
  constraint account_role_status_check check (assignment_status in ('active','revoked')),
  constraint account_role_revocation_check check (
    (assignment_status = 'active' and revoked_at is null)
    or (assignment_status = 'revoked' and revoked_at is not null)
  )
);

create trigger account_role_assignments_set_updated_at
before update on public.account_role_assignments
for each row execute function public.set_updated_at();

create or replace function public.access_current_account_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select a.id
  from public.accounts a
  where a.auth_user_id = auth.uid()
  limit 1;
$$;

create or replace function public.access_current_person_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select a.person_id
  from public.accounts a
  where a.auth_user_id = auth.uid()
    and a.person_id is not null
    and a.person_association_status in ('declared','verified')
    and a.account_status <> 'closed'
  limit 1;
$$;

create or replace function public.access_is_active_account()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.accounts a
    where a.auth_user_id = auth.uid()
      and a.account_status = 'active'
      and a.person_id is not null
      and a.person_association_status in ('declared','verified')
  );
$$;

create or replace function public.access_has_active_application_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (
    p_role is not null
    and public.access_is_active_account()
    and p_role in ('redattore','amministratore_applicativo')
    and exists (
      select 1
      from public.account_role_assignments r
      where r.account_id = public.access_current_account_id()
        and r.role_code = p_role
        and r.assignment_status = 'active'
    )
  );
$$;

create or replace function public.access_is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.access_has_active_application_role('redattore');
$$;

create or replace function public.access_is_application_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.access_has_active_application_role('amministratore_applicativo');
$$;

revoke all on function public.access_current_account_id() from public;
revoke all on function public.access_current_person_id() from public;
revoke all on function public.access_is_active_account() from public;
revoke all on function public.access_has_active_application_role(text) from public;
revoke all on function public.access_is_editor() from public;
revoke all on function public.access_is_application_admin() from public;
grant execute on function public.access_current_account_id() to authenticated;
grant execute on function public.access_current_person_id() to authenticated;
grant execute on function public.access_is_active_account() to authenticated;
grant execute on function public.access_has_active_application_role(text) to authenticated;
grant execute on function public.access_is_editor() to authenticated;
grant execute on function public.access_is_application_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- Shared-by-copy catalogs (physically local; no cross-project FK)
-- -----------------------------------------------------------------------------

create table public.languages (
  id bigint primary key,
  code text not null unique,
  english_name text not null,
  native_name text not null,
  text_direction text not null default 'ltr' check (text_direction in ('ltr','rtl')),
  is_active boolean not null default true,
  sort_order integer not null default 100 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger languages_set_updated_at
before update on public.languages
for each row execute function public.set_updated_at();

create table public.business_sectors (
  id bigint primary key,
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_sectors_slug_not_blank check (length(btrim(slug)) > 0),
  constraint business_sectors_name_not_blank check (length(btrim(name)) > 0)
);

create trigger business_sectors_set_updated_at
before update on public.business_sectors
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Contenuti
-- Cross-product UUID columns are retained only as opaque compatibility fields;
-- no FK targets PonteImprese tables.
-- -----------------------------------------------------------------------------

create table public.content_types (
  code text primary key,
  name_it text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(btrim(code)) > 0),
  check (length(btrim(name_it)) > 0)
);

create table public.content_categories (
  code text primary key,
  name_it text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(btrim(code)) > 0),
  check (length(btrim(name_it)) > 0)
);

create table public.content_tags (
  code text primary key,
  name_it text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (length(btrim(code)) > 0),
  check (length(btrim(name_it)) > 0)
);

create table public.contents (
  id uuid primary key default gen_random_uuid(),
  owner_person_id uuid references public.profiles(id) on delete restrict,
  owner_business_id uuid,
  owned_by_editorial boolean not null default false,
  type_code text not null references public.content_types(code) on update cascade on delete restrict,
  primary_category_code text references public.content_categories(code) on update cascade on delete restrict,
  language_id bigint not null references public.languages(id) on delete restrict,
  title text not null,
  subtitle text,
  abstract text,
  body text not null,
  body_format text not null default 'markdown',
  slug text not null unique,
  cover_url text,
  source_url text,
  source_label text,
  editorial_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  visibility_status text not null default 'private',
  is_featured boolean not null default false,
  published_at timestamptz,
  withdrawn_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contents_ownership_check check (
    (owner_person_id is not null and owner_business_id is null and owned_by_editorial = false)
    or (owner_person_id is null and owner_business_id is not null and owned_by_editorial = false)
    or (owner_person_id is null and owner_business_id is null and owned_by_editorial = true)
  ),
  constraint contents_title_check check (length(btrim(title)) > 0),
  constraint contents_body_check check (length(btrim(body)) > 0),
  constraint contents_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint contents_body_format_check check (body_format in ('plain_text','markdown')),
  constraint contents_editorial_status_check check (editorial_status in ('draft','ready')),
  constraint contents_publication_status_check check (publication_status in ('unpublished','published','withdrawn')),
  constraint contents_visibility_status_check check (visibility_status in ('private','public')),
  constraint contents_publication_gate check (
    (publication_status='published' and published_at is not null and editorial_status='ready')
    or (publication_status='withdrawn' and withdrawn_at is not null)
    or (publication_status='unpublished' and published_at is null and withdrawn_at is null)
  )
);

create index contents_type_code_idx on public.contents(type_code);
create index contents_language_id_idx on public.contents(language_id);
create index contents_publication_idx on public.contents(publication_status, visibility_status);
create index contents_editorial_idx on public.contents(owned_by_editorial, updated_at desc);
create trigger contents_set_updated_at before update on public.contents
for each row execute function public.set_updated_at();

create table public.content_authors (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  role_kind text not null check (role_kind in ('author','co_author','curator','editor','contributor','editorial_responsible')),
  person_id uuid references public.profiles(id) on delete set null,
  business_id uuid,
  professional_profile_id uuid,
  display_label text,
  is_primary boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  attribution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_authors_subject_check check (
    person_id is not null or business_id is not null or professional_profile_id is not null
    or (display_label is not null and length(btrim(display_label)) > 0)
  )
);
create unique index content_authors_primary_uidx on public.content_authors(content_id) where is_primary;
create trigger content_authors_set_updated_at before update on public.content_authors
for each row execute function public.set_updated_at();

create table public.content_tag_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  tag_code text not null references public.content_tags(code) on update cascade on delete restrict,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id, tag_code)
);

create table public.content_subject_links (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.contents(id) on delete cascade,
  person_id uuid references public.profiles(id) on delete restrict,
  business_id uuid,
  professional_profile_id uuid,
  relation_kind text not null check (relation_kind in ('subject','cited','interviewed','context')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_subject_links_one_subject check (
    num_nonnulls(person_id,business_id,professional_profile_id)=1
  )
);

create table public.content_relations (
  id uuid primary key default gen_random_uuid(),
  source_content_id uuid not null references public.contents(id) on delete cascade,
  target_content_id uuid not null references public.contents(id) on delete cascade,
  relation_kind text not null check (relation_kind in ('related','follow_up','recommended')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_content_id,target_content_id,relation_kind),
  check(source_content_id<>target_content_id)
);

-- -----------------------------------------------------------------------------
-- Eventi
-- Legacy business/opportunity/service identifiers are opaque compatibility UUIDs
-- only. The database has no FK to PonteImprese.
-- -----------------------------------------------------------------------------

create table public.event_types (
  code text primary key,
  name_it text not null,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(length(btrim(code))>0),
  check(length(btrim(name_it))>0)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_person_id uuid references public.profiles(id) on delete restrict,
  owner_business_id uuid,
  type_code text not null references public.event_types(code) on update cascade on delete restrict,
  title text not null,
  summary text,
  description text not null,
  delivery_mode text not null default 'in_presence',
  audience_kind text not null default 'both',
  audience_note text,
  nature_label text,
  economic_kind text not null default 'unspecified',
  economic_note text,
  context_opportunity_id uuid,
  context_service_offer_id uuid,
  external_organization_label text,
  editorial_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  visibility_status text not null default 'private',
  published_at timestamptz,
  withdrawn_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owned_by_editorial boolean not null default false,
  source_url text,
  source_label text,
  external_source_code text,
  external_id text,
  canonical_url text,
  external_natural_key text,
  acquisition_fingerprint text,
  acquired_at timestamptz,
  source_updated_at timestamptz,
  editorial_internal_notes text,
  constraint events_ownership_check check (
    (owner_person_id is not null and owner_business_id is null and owned_by_editorial=false)
    or (owner_person_id is null and owner_business_id is not null and owned_by_editorial=false)
    or (owner_person_id is null and owner_business_id is null and owned_by_editorial=true)
  ),
  check(length(btrim(title))>0),
  check(length(btrim(description))>0),
  check(delivery_mode in ('in_presence','online','hybrid')),
  check(audience_kind in ('persons','businesses','both')),
  check(economic_kind in ('free','paid','unspecified')),
  check(editorial_status in ('draft','ready')),
  check(publication_status in ('unpublished','published','withdrawn')),
  check(visibility_status in ('private','public')),
  constraint events_publication_gate check (
    (publication_status='published' and published_at is not null and editorial_status='ready')
    or (publication_status='withdrawn' and withdrawn_at is not null)
    or (publication_status='unpublished' and published_at is null and withdrawn_at is null)
  )
);

create unique index events_editorial_source_external_id_uidx
  on public.events(external_source_code,external_id)
  where owned_by_editorial=true and external_id is not null;
create unique index events_editorial_canonical_url_uidx
  on public.events(canonical_url)
  where owned_by_editorial=true and canonical_url is not null;
create unique index events_editorial_natural_key_uidx
  on public.events(external_natural_key)
  where owned_by_editorial=true and external_natural_key is not null;
create unique index events_editorial_fingerprint_uidx
  on public.events(acquisition_fingerprint)
  where owned_by_editorial=true and acquisition_fingerprint is not null;
create index events_publication_idx on public.events(publication_status,visibility_status);
create trigger events_set_updated_at before update on public.events
for each row execute function public.set_updated_at();

create table public.event_editions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Europe/Rome',
  all_day boolean not null default false,
  delivery_mode text not null default 'in_presence',
  venue_label text,
  address_text text,
  city_text text,
  country_ref text,
  online_reference text,
  occurrence_status text not null default 'scheduled',
  registration_status text not null default 'not_open',
  registration_access text not null default 'free',
  registration_required boolean not null default false,
  capacity integer,
  registration_opens_at timestamptz,
  registration_deadline timestamptz,
  previous_starts_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(ends_at is null or ends_at>=starts_at),
  check(delivery_mode in ('in_presence','online','hybrid')),
  check(occurrence_status in ('scheduled','ongoing','concluded','postponed','cancelled')),
  check(registration_status in ('not_open','open','closed')),
  check(registration_access in ('free','registration_required','by_invitation')),
  check(capacity is null or capacity>=0),
  constraint event_editions_cancel_check check (
    (occurrence_status='cancelled' and cancelled_at is not null)
    or (occurrence_status<>'cancelled' and cancelled_at is null)
  )
);
create index event_editions_event_start_idx on public.event_editions(event_id,starts_at);
create trigger event_editions_set_updated_at before update on public.event_editions
for each row execute function public.set_updated_at();

create table public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  event_edition_id uuid not null references public.event_editions(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0 check(sort_order>=0),
  room_label text,
  track_label text,
  delivery_mode text,
  online_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_edition_id,sort_order),
  check(ends_at is null or starts_at is null or ends_at>=starts_at),
  check(delivery_mode is null or delivery_mode in ('in_presence','online','hybrid'))
);

create table public.event_organizers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_edition_id uuid references public.event_editions(id) on delete cascade,
  role_kind text not null check(role_kind in ('co_organizer','promoter','partner','sponsor','host','patron','operational_contact')),
  person_id uuid references public.profiles(id) on delete set null,
  business_id uuid,
  display_label text,
  sort_order integer not null default 0 check(sort_order>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_organizers_subject_check check (
    person_id is not null or business_id is not null or (display_label is not null and length(btrim(display_label))>0)
  )
);

create table public.event_speakers (
  id uuid primary key default gen_random_uuid(),
  event_edition_id uuid not null references public.event_editions(id) on delete cascade,
  event_session_id uuid references public.event_sessions(id) on delete cascade,
  role_kind text not null default 'speaker' check(role_kind in ('speaker','moderator','facilitator','trainer')),
  person_id uuid references public.profiles(id) on delete set null,
  professional_profile_id uuid,
  display_label text,
  sort_order integer not null default 0 check(sort_order>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_speakers_subject_check check (
    person_id is not null or professional_profile_id is not null or (display_label is not null and length(btrim(display_label))>0)
  )
);

create table public.event_languages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  language_id bigint not null references public.languages(id) on delete restrict,
  usage_role text not null check(usage_role in ('event','materials','interpretation')),
  is_primary boolean not null default false,
  sort_order integer not null default 0 check(sort_order>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id,language_id,usage_role)
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_edition_id uuid not null references public.event_editions(id) on delete cascade,
  participant_person_id uuid not null references public.profiles(id) on delete restrict,
  on_behalf_business_id uuid,
  registration_status text not null default 'submitted' check(registration_status in ('submitted','confirmed','cancelled')),
  registered_at timestamptz not null default now(),
  cancelled_at timestamptz,
  note text,
  source_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_registrations_cancel_check check (
    (registration_status='cancelled' and cancelled_at is not null)
    or (registration_status<>'cancelled' and cancelled_at is null)
  )
);

-- -----------------------------------------------------------------------------
-- Osservatorio
-- -----------------------------------------------------------------------------

create table public.observatory_indicators (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  title text not null,
  description text not null,
  purpose_text text not null,
  methodology_summary text not null,
  value_nature text not null check(value_nature in ('count','percentage','currency','ratio','index')),
  unit_code text not null check(unit_code in ('units','percent','eur','eur_thousands','ratio','index_points')),
  periodicity text not null check(periodicity in ('annual','quarterly','monthly','point_in_time')),
  operational_status text not null default 'draft' check(operational_status in ('draft','active','deprecated','retired')),
  publication_status text not null default 'unpublished' check(publication_status in ('unpublished','published','withdrawn')),
  published_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(length(btrim(code))>0),
  check(slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check(length(btrim(title))>0),
  constraint observatory_indicator_publication_gate check (
    (publication_status='unpublished' and published_at is null and withdrawn_at is null)
    or (publication_status='published' and published_at is not null and withdrawn_at is null and operational_status<>'draft')
    or (publication_status='withdrawn' and withdrawn_at is not null)
  )
);
create trigger observatory_indicators_set_updated_at before update on public.observatory_indicators
for each row execute function public.set_updated_at();

create table public.observatory_statistical_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  producer_name text not null,
  publication_title text not null,
  url text,
  external_identifier text,
  edition_label text,
  source_published_on date,
  license_note text,
  methodology_note text,
  lifecycle_status text not null default 'active' check(lifecycle_status in ('active','deprecated','unavailable')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(length(btrim(name))>0),
  check(length(btrim(producer_name))>0),
  check(length(btrim(publication_title))>0)
);
create trigger observatory_sources_set_updated_at before update on public.observatory_statistical_sources
for each row execute function public.set_updated_at();

create table public.observatory_indicator_values (
  id uuid primary key default gen_random_uuid(),
  indicator_id uuid not null references public.observatory_indicators(id) on delete restrict,
  source_id uuid not null references public.observatory_statistical_sources(id) on delete restrict,
  numeric_value numeric(24,8) not null,
  period_start date not null,
  period_end date not null,
  status text not null check(status in ('provisional','final','revised','withdrawn')),
  quality_code text not null check(quality_code in ('official','estimated','derived','self_reported')),
  territory_level text,
  territory_code text,
  territory_label text,
  business_sector_id bigint references public.business_sectors(id) on delete restrict,
  country_code text,
  country_label text,
  methodology_note text,
  published_at timestamptz,
  withdrawn_at timestamptz,
  revised_at timestamptz,
  supersedes_value_id uuid references public.observatory_indicator_values(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(period_end>=period_start),
  check(territory_level is null or territory_level in ('italy','region','province','municipality','other')),
  check(supersedes_value_id is null or supersedes_value_id<>id)
);
create index observatory_values_indicator_period_idx on public.observatory_indicator_values(indicator_id,period_start,period_end);
create trigger observatory_values_set_updated_at before update on public.observatory_indicator_values
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.account_role_assignments enable row level security;
alter table public.languages enable row level security;
alter table public.business_sectors enable row level security;
alter table public.content_types enable row level security;
alter table public.content_categories enable row level security;
alter table public.content_tags enable row level security;
alter table public.contents enable row level security;
alter table public.content_authors enable row level security;
alter table public.content_tag_links enable row level security;
alter table public.content_subject_links enable row level security;
alter table public.content_relations enable row level security;
alter table public.event_types enable row level security;
alter table public.events enable row level security;
alter table public.event_editions enable row level security;
alter table public.event_sessions enable row level security;
alter table public.event_organizers enable row level security;
alter table public.event_speakers enable row level security;
alter table public.event_languages enable row level security;
alter table public.event_registrations enable row level security;
alter table public.observatory_indicators enable row level security;
alter table public.observatory_statistical_sources enable row level security;
alter table public.observatory_indicator_values enable row level security;

-- Identity policies
create policy profiles_public_read on public.profiles
for select to anon, authenticated
using (is_public=true and is_active=true and deleted_at is null);
create policy profiles_self_read on public.profiles
for select to authenticated using (id=auth.uid());
create policy profiles_self_update on public.profiles
for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

create policy accounts_self_read on public.accounts
for select to authenticated using (auth_user_id=auth.uid());
create policy account_roles_self_read on public.account_role_assignments
for select to authenticated using (account_id=public.access_current_account_id());

-- Catalogs: public read
create policy languages_read on public.languages for select to anon, authenticated using (is_active=true);
create policy sectors_read on public.business_sectors for select to anon, authenticated using (is_active=true);
create policy content_types_read on public.content_types for select to anon, authenticated using (is_active=true);
create policy content_categories_read on public.content_categories for select to anon, authenticated using (is_active=true);
create policy content_tags_read on public.content_tags for select to anon, authenticated using (is_active=true);
create policy event_types_read on public.event_types for select to anon, authenticated using (is_active=true);

-- Editorial helper expression intentionally repeated for policy readability.
-- Content public/editorial
create policy contents_public_read on public.contents
for select to anon, authenticated
using (publication_status='published' and visibility_status='public');
create policy contents_editor_read on public.contents
for select to authenticated
using (public.access_is_editor() or public.access_is_application_admin());
create policy contents_editor_insert on public.contents
for insert to authenticated
with check ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true);
create policy contents_editor_update on public.contents
for update to authenticated
using ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true)
with check ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true);
create policy contents_editor_delete on public.contents
for delete to authenticated
using ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true);

create policy content_authors_public_read on public.content_authors
for select to anon, authenticated
using (exists(select 1 from public.contents c where c.id=content_id and c.publication_status='published' and c.visibility_status='public'));
create policy content_authors_editor_all on public.content_authors
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_tag_links_public_read on public.content_tag_links
for select to anon, authenticated
using (exists(select 1 from public.contents c where c.id=content_id and c.publication_status='published' and c.visibility_status='public'));
create policy content_tag_links_editor_all on public.content_tag_links
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_subject_links_public_read on public.content_subject_links
for select to anon, authenticated
using (exists(select 1 from public.contents c where c.id=content_id and c.publication_status='published' and c.visibility_status='public'));
create policy content_subject_links_editor_all on public.content_subject_links
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy content_relations_public_read on public.content_relations
for select to anon, authenticated
using (
  exists(select 1 from public.contents c where c.id=source_content_id and c.publication_status='published' and c.visibility_status='public')
  and exists(select 1 from public.contents c where c.id=target_content_id and c.publication_status='published' and c.visibility_status='public')
);
create policy content_relations_editor_all on public.content_relations
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

-- Events public/editorial
create policy events_public_read on public.events
for select to anon, authenticated
using (publication_status='published' and visibility_status='public');
create policy events_editor_read on public.events
for select to authenticated using (public.access_is_editor() or public.access_is_application_admin());
create policy events_editor_insert on public.events
for insert to authenticated
with check ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true);
create policy events_editor_update on public.events
for update to authenticated
using ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true)
with check ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true);
create policy events_editor_delete on public.events
for delete to authenticated
using ((public.access_is_editor() or public.access_is_application_admin()) and owned_by_editorial=true);

create policy event_editions_public_read on public.event_editions
for select to anon, authenticated
using (exists(select 1 from public.events e where e.id=event_id and e.publication_status='published' and e.visibility_status='public'));
create policy event_editions_editor_all on public.event_editions
for all to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_sessions_public_read on public.event_sessions
for select to anon, authenticated
using (exists(select 1 from public.event_editions d join public.events e on e.id=d.event_id where d.id=event_edition_id and e.publication_status='published' and e.visibility_status='public'));
create policy event_sessions_editor_all on public.event_sessions
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_organizers_public_read on public.event_organizers
for select to anon, authenticated
using (exists(select 1 from public.events e where e.id=event_id and e.publication_status='published' and e.visibility_status='public'));
create policy event_organizers_editor_all on public.event_organizers
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_speakers_public_read on public.event_speakers
for select to anon, authenticated
using (exists(select 1 from public.event_editions d join public.events e on e.id=d.event_id where d.id=event_edition_id and e.publication_status='published' and e.visibility_status='public'));
create policy event_speakers_editor_all on public.event_speakers
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_languages_public_read on public.event_languages
for select to anon, authenticated
using (exists(select 1 from public.events e where e.id=event_id and e.publication_status='published' and e.visibility_status='public'));
create policy event_languages_editor_all on public.event_languages
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy event_registrations_self_read on public.event_registrations
for select to authenticated using (participant_person_id=public.access_current_person_id());
create policy event_registrations_editor_read on public.event_registrations
for select to authenticated using (public.access_is_editor() or public.access_is_application_admin());

-- Observatory: published public, full editorial control
create policy observatory_indicators_public_read on public.observatory_indicators
for select to anon, authenticated using (publication_status='published');
create policy observatory_indicators_editor_all on public.observatory_indicators
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy observatory_sources_public_read on public.observatory_statistical_sources
for select to anon, authenticated using (lifecycle_status='active');
create policy observatory_sources_editor_all on public.observatory_statistical_sources
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

create policy observatory_values_public_read on public.observatory_indicator_values
for select to anon, authenticated
using (status in ('final','revised') and published_at is not null and withdrawn_at is null);
create policy observatory_values_editor_all on public.observatory_indicator_values
for all to authenticated using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

-- -----------------------------------------------------------------------------
-- Privileges
-- -----------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;

grant select on public.languages, public.business_sectors,
  public.content_types, public.content_categories, public.content_tags,
  public.contents, public.content_authors, public.content_tag_links,
  public.content_subject_links, public.content_relations,
  public.event_types, public.events, public.event_editions, public.event_sessions,
  public.event_organizers, public.event_speakers, public.event_languages,
  public.observatory_indicators, public.observatory_statistical_sources,
  public.observatory_indicator_values
  to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.accounts, public.account_role_assignments to authenticated;

grant insert, update, delete on public.contents, public.content_authors,
  public.content_tag_links, public.content_subject_links, public.content_relations,
  public.events, public.event_editions, public.event_sessions,
  public.event_organizers, public.event_speakers, public.event_languages,
  public.observatory_indicators, public.observatory_statistical_sources,
  public.observatory_indicator_values
  to authenticated;

grant select on public.event_registrations to authenticated;

-- -----------------------------------------------------------------------------
-- Deterministic catalogs
-- -----------------------------------------------------------------------------

insert into public.languages(id,code,english_name,native_name,text_direction,is_active,sort_order) values
(1,'it','Italian','Italiano','ltr',true,1),
(2,'en','English','English','ltr',true,2),
(3,'fr','French','Français','ltr',true,3),
(4,'es','Spanish','Español','ltr',true,4),
(5,'pt','Portuguese','Português','ltr',true,100),
(6,'de','German','Deutsch','ltr',true,100),
(7,'ar','Arabic','العربية','rtl',true,100),
(8,'zh','Chinese','中文','ltr',true,100),
(9,'sw','Swahili','Kiswahili','ltr',true,100),
(10,'ro','Romanian','Română','ltr',true,100),
(11,'sq','Albanian','Shqip','ltr',true,100),
(12,'uk','Ukrainian','Українська','ltr',true,100),
(13,'ru','Russian','Русский','ltr',true,100),
(14,'tr','Turkish','Türkçe','ltr',true,100),
(15,'bn','Bengali','বাংলা','ltr',true,100),
(16,'ur','Urdu','اردو','rtl',true,100),
(17,'hi','Hindi','हिन्दी','ltr',true,100),
(18,'pa','Punjabi','ਪੰਜਾਬੀ','ltr',true,100),
(19,'fa','Persian','فارسی','rtl',true,100),
(20,'ti','Tigrinya','ትግርኛ','ltr',true,100),
(21,'am','Amharic','አማርኛ','ltr',true,100),
(22,'wo','Wolof','Wolof','ltr',true,100),
(23,'zu','Zulu','isiZulu','ltr',true,100),
(24,'so','Somali','Soomaali','ltr',true,100),
(25,'ha','Hausa','Hausa','ltr',true,100),
(26,'yo','Yoruba','Yorùbá','ltr',true,100),
(27,'ig','Igbo','Igbo','ltr',true,100),
(28,'nl','Dutch','Nederlands','ltr',true,100),
(29,'pl','Polish','Polski','ltr',true,100),
(30,'el','Greek','Ελληνικά','ltr',true,100);

insert into public.business_sectors(id,slug,name,is_active,sort_order) values
(1,'construction','Edilizia',true,10),(2,'building_systems','Impiantistica',true,20),
(3,'maintenance','Manutenzione',true,30),(4,'facility_management','Facility management',true,40),
(5,'cleaning','Pulizie',true,50),(6,'logistics','Logistica',true,60),
(7,'transport','Trasporti',true,70),(8,'manufacturing','Manifattura',true,80),
(9,'industry','Industria',true,90),(10,'agriculture','Agricoltura',true,100),
(11,'food_service','Ristorazione',true,110),(12,'commerce','Commercio',true,120),
(13,'personal_services','Servizi alla persona',true,130),
(14,'audiovisual','Produzione audiovisiva',true,200),(15,'publishing','Editoria',true,210),
(16,'music_industry','Industria musicale',true,220),(17,'live_performance','Spettacolo dal vivo',true,230),
(18,'design_creative','Design creativo',true,240),(19,'fashion','Moda',true,250),
(20,'artistic_crafts','Artigianato artistico / creativo',true,260),
(21,'cultural_heritage_services','Servizi per il patrimonio culturale',true,270);

insert into public.content_types(code,name_it,is_active,sort_order) values
('news','Notizia',true,10),('guide','Guida',true,20),('insight','Approfondimento',true,30),
('interview','Intervista',true,40),('business_story','Storia di Impresa',true,50),
('event_presentation','Presentazione Evento',true,60),('opportunity_presentation','Presentazione Opportunità',true,70),
('service_presentation','Presentazione Servizio',true,80),('market_content','Contenuto su Mercato',true,90),
('institutional_page','Pagina informativa',true,100),('personal_story','Storia personale (classificazione)',true,110);

insert into public.content_categories(code,name_it,description,is_active,sort_order) values
('internationalization','Internazionalizzazione',null,true,10),
('entrepreneurship','Imprenditoria',null,true,20),
('regulation_compliance','Normativa e adempimenti',null,true,30),
('markets','Mercati',null,true,40),
('services_guidance','Orientamento ai servizi',null,true,50),
('events_community','Eventi e comunità',null,true,60),
('stories','Storie e testimonianze',null,true,70),
('culture','Cultura','Categoria strutturata per contenuti culturali. Distinta da events_community.',true,75),
('other','Altro',null,true,90);

insert into public.event_types(code,name_it,is_active,sort_order) values
('networking','Networking / incontro',true,10),
('conference','Convegno / conferenza / webinar / workshop',true,20),
('fair','Fiera / esposizione',true,30),('mission','Missione imprenditoriale',true,40),
('visit','Visita aziendale',true,50),('institutional','Istituzionale / associativo',true,60),
('course','Corso / attività formativa',true,70),('award','Premiazione',true,80),
('cultural','Culturale / sociale',true,90),('other','Altro',true,100);

commit;
