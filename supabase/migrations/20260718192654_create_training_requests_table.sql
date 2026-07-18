-- Create public.training_requests: a training/workplace-safety need
-- published by a profile (public.profiles) looking for a provider, e.g.
-- "Impresa edile, corso rischio alto, 8 lavoratori, 5 di lingua araba".
-- requester_profile_id is a generic reference to public.profiles: the
-- requester may be an enterprise, a professional, an association or
-- another organization type, not only an individual.
--
-- DEVIATION FROM THE PROPOSED SCHEMA: a nullable sector_id column
-- (references public.business_sectors) was added on top of the originally
-- proposed structure. Without it, a required search pattern from this
-- same request ("richieste di imprese edili", i.e. requests from
-- construction businesses) could not be served: training_requests has no
-- other place to record which sector the requester operates in, since
-- public.profiles does not carry a sector today and a single request
-- concerns one requester, so a single nullable FK is proportionate here
-- (unlike public.training_offers, which uses a many-to-many bridge because
-- one offer can legitimately serve several sectors at once).

create table public.training_requests (
  id uuid primary key default gen_random_uuid (),
  requester_profile_id uuid not null references public.profiles (id) on delete cascade,
  course_type_id bigint references public.training_course_types (id) on delete restrict,
  sector_id bigint references public.business_sectors (id) on delete restrict,
  title text not null,
  description text not null,
  participant_count integer,
  preferred_start_date date,
  delivery_preference text,
  location_text text,
  status text not null default 'open',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_requests_title_not_blank_check check (length(trim(title)) > 0),
  constraint training_requests_description_not_blank_check check (length(trim(description)) > 0),
  constraint training_requests_participant_count_positive_check check (
    participant_count is null
    or participant_count > 0
  ),
  constraint training_requests_status_check check (
    status in ('draft', 'open', 'in_progress', 'closed', 'cancelled', 'expired')
  ),
  constraint training_requests_delivery_preference_check check (
    delivery_preference is null
    or delivery_preference in (
      'in_person',
      'online',
      'hybrid',
      'company_site',
      'construction_site',
      'flexible'
    )
  ),
  constraint training_requests_expires_after_created_check check (
    expires_at is null
    or expires_at > created_at
  )
);

comment on table public.training_requests is
  'A training/workplace-safety need published by a profile looking for a provider (see public.training_offers for the supply side). Language needs of the workforce are recorded per language group in public.training_request_languages, not here.';

comment on column public.training_requests.requester_profile_id is
  'Generic reference to public.profiles: the requester may be an enterprise, a professional, an association or other organization type, not only an individual.';

comment on column public.training_requests.course_type_id is
  'Requested course type (see public.training_course_types), when known. Nullable because a requester may describe a need before a specific catalog course type is identified.';

comment on column public.training_requests.sector_id is
  'Economic sector of the requester (see public.business_sectors), when known. Enables sector-based search (e.g. requests from construction businesses) without requiring public.profiles to carry sector data.';

comment on column public.training_requests.participant_count is
  'Total number of workers to be trained, when known. See public.training_request_languages for the breakdown by language group. Must be positive when set.';

comment on column public.training_requests.delivery_preference is
  'Requester''s preferred delivery arrangement: in_person, online, hybrid, company_site, construction_site or flexible.';

comment on column public.training_requests.status is
  'Lifecycle of the request: draft, open, in_progress, closed, cancelled or expired.';

comment on column public.training_requests.expires_at is
  'Optional deadline after which the request should no longer be considered open. When set, must be after created_at.';

-- Covers "all requests of a profile" (owner view), which is not otherwise
-- covered by any prefix since the primary key is the surrogate id.
create index training_requests_requester_idx on public.training_requests using btree (requester_profile_id);

-- Covers "open requests" (leftmost prefix) and "open requests by course
-- type", e.g. filtering high-risk specific training requests.
create index training_requests_status_course_type_idx on public.training_requests using btree (status, course_type_id);

-- Covers "open requests" (leftmost prefix) and "requests expiring soon",
-- e.g. open requests ordered/filtered by expires_at.
create index training_requests_status_expires_idx on public.training_requests using btree (status, expires_at);

-- Covers "requests by sector" (leftmost prefix) and "open requests in a
-- given sector", e.g. requests from construction businesses.
create index training_requests_sector_status_idx on public.training_requests using btree (sector_id, status);

-- Validates business rules that depend on other tables: the course type
-- (when set) and the sector (when set) must be active.
create or replace function public.validate_training_request ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.course_type_id is not null and not exists (
    select 1 from public.training_course_types
    where id = new.course_type_id and is_active = true
  ) then
    raise exception 'course_type_id % is unknown or not active', new.course_type_id;
  end if;

  if new.sector_id is not null and not exists (
    select 1 from public.business_sectors
    where id = new.sector_id and is_active = true
  ) then
    raise exception 'sector_id % is unknown or not active', new.sector_id;
  end if;

  return new;
end;
$$;

create trigger training_requests_validate
before insert or update on public.training_requests
for each row
execute function public.validate_training_request ();

alter table public.training_requests enable row level security;

-- 1. Publicly readable only when the request is open and the requester
-- profile is active.
create policy "Public can view open training requests"
  on public.training_requests
  for select
  to public
  using (
    status = 'open'
    and exists (
      select 1
      from public.profiles p
      where
        p.id = training_requests.requester_profile_id
        and p.is_active = true
    )
  );

-- 2. The requester can always see all of their own requests, regardless
-- of status.
create policy "Requesters can view their own training requests"
  on public.training_requests
  for select
  to authenticated
  using (auth.uid () = requester_profile_id);

-- 3. A user may create requests only under their own profile.
create policy "Requesters can add their own training requests"
  on public.training_requests
  for insert
  to authenticated
  with check (auth.uid () = requester_profile_id);

-- 4. A user may update only their own requests.
create policy "Requesters can update their own training requests"
  on public.training_requests
  for update
  to authenticated
  using (auth.uid () = requester_profile_id)
  with check (auth.uid () = requester_profile_id);

-- 5. A user may delete only their own requests.
create policy "Requesters can delete their own training requests"
  on public.training_requests
  for delete
  to authenticated
  using (auth.uid () = requester_profile_id);

grant select on public.training_requests to anon;

grant select, insert, update, delete on public.training_requests to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_training_requests_updated_at ()
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

create trigger training_requests_set_updated_at
before update on public.training_requests
for each row
execute function public.set_training_requests_updated_at ();
