-- Create public.training_offers: a training/workplace-safety course or
-- service offered by a profile (public.profiles). provider_profile_id is a
-- generic reference to public.profiles: the provider may be a training
-- body, a freelance trainer, a safety consultant, an enterprise offering
-- internal training, or another type of organization, not only a single
-- person. See public.training_provider_qualifications for the (separate,
-- non-authoritative) declaration of a provider's qualifications for a
-- given course type.
--
-- PRICING NOTE: price_amount/price_type/is_price_on_request model a simple
-- display/listing price only (what the provider advertises), not a
-- billing or payment system. Invoicing, payments, quote requests and
-- bookings are intentionally out of scope for this migration; this keeps
-- the table ready to become monetizable later without pretending a
-- transactional pricing engine already exists today.

create table public.training_offers (
  id uuid primary key default gen_random_uuid (),
  provider_profile_id uuid not null references public.profiles (id) on delete cascade,
  course_type_id bigint not null references public.training_course_types (id) on delete restrict,
  title text not null,
  description text,
  duration_hours numeric(6, 2),
  delivery_mode_id bigint references public.training_delivery_modes (id) on delete restrict,
  is_on_site_available boolean not null default false,
  minimum_participants integer,
  maximum_participants integer,
  price_amount numeric(12, 2),
  price_type text,
  is_price_on_request boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_offers_title_not_blank_check check (length(trim(title)) > 0),
  constraint training_offers_duration_positive_check check (
    duration_hours is null
    or duration_hours > 0
  ),
  constraint training_offers_minimum_participants_positive_check check (
    minimum_participants is null
    or minimum_participants > 0
  ),
  constraint training_offers_maximum_participants_positive_check check (
    maximum_participants is null
    or maximum_participants > 0
  ),
  constraint training_offers_participants_range_check check (
    minimum_participants is null
    or maximum_participants is null
    or maximum_participants >= minimum_participants
  ),
  constraint training_offers_price_amount_non_negative_check check (
    price_amount is null
    or price_amount >= 0
  ),
  constraint training_offers_price_type_check check (
    price_type is null
    or price_type in ('per_person', 'per_group', 'per_course', 'hourly', 'daily')
  ),
  -- When a price is not advertised as "on request", an actual amount must
  -- be given: an offer cannot claim a fixed price while leaving it empty.
  constraint training_offers_price_consistency_check check (
    is_price_on_request = true
    or price_amount is not null
  )
);

comment on table public.training_offers is
  'A training/workplace-safety course or service offered by a profile (see public.training_course_types for what is taught). Independent from the linguistic-services domain: language availability is a property of the offer, tracked in public.training_offer_languages, not the offer''s identity.';

comment on column public.training_offers.provider_profile_id is
  'Generic reference to public.profiles: the provider may be a training body, freelance trainer, safety consultant, enterprise or other organization type, not only an individual person.';

comment on column public.training_offers.course_type_id is
  'What is being taught (see public.training_course_types), e.g. high-risk specific training, scaffolding training.';

comment on column public.training_offers.duration_hours is
  'Total course duration in hours, when known. Must be positive when set.';

comment on column public.training_offers.delivery_mode_id is
  'How the course is delivered (see public.training_delivery_modes): in person, synchronous video conference, e-learning or blended.';

comment on column public.training_offers.is_on_site_available is
  'True when the provider can deliver this course on site (see public.training_offer_venue_types for which venue types). Kept as a simple flag for now; a full territorial/availability model (province, region, travel radius) belongs to a future, platform-wide territorial domain and is intentionally not duplicated here.';

comment on column public.training_offers.minimum_participants is
  'Minimum group size for the course to run, when applicable. Must be positive when set.';

comment on column public.training_offers.maximum_participants is
  'Maximum group size the course can accommodate, when applicable. Must be positive when set and not lower than minimum_participants.';

comment on column public.training_offers.price_amount is
  'Advertised listing price, when the provider chooses to disclose one. Not a billing/invoicing amount. Must be non-negative when set.';

comment on column public.training_offers.price_type is
  'Unit the advertised price refers to: per_person, per_group, per_course, hourly or daily.';

comment on column public.training_offers.is_price_on_request is
  'True (default) when the provider prefers to negotiate the price directly rather than publish a fixed amount. When false, price_amount must be set.';

comment on column public.training_offers.is_active is
  'False hides the offer from public listings and search. The provider can still see and manage it.';

-- Covers "courses offered by a profile" (leftmost prefix), i.e. all offers
-- a provider manages.
create index training_offers_provider_idx on public.training_offers using btree (provider_profile_id);

-- Covers "courses by type", e.g. filtering by high-risk specific training.
create index training_offers_course_type_idx on public.training_offers using btree (course_type_id);

-- Covers "courses with in-person or online delivery mode".
create index training_offers_delivery_mode_idx on public.training_offers using btree (delivery_mode_id);

-- Mirrors the is_active indexing pattern already used on the platform's
-- other catalogs/entities; helps the public listing query filter quickly.
create index training_offers_is_active_idx on public.training_offers using btree (is_active);

-- Validates business rules that depend on other tables and therefore
-- cannot be expressed with a plain CHECK: the course type must be active,
-- and the delivery mode (when set) must be active. security invoker + RLS
-- on the referenced catalogs means an inactive (and therefore invisible)
-- row is correctly rejected as "unknown or inactive" for the
-- inserting/updating user.
create or replace function public.validate_training_offer ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.training_course_types
    where id = new.course_type_id and is_active = true
  ) then
    raise exception 'course_type_id % is unknown or not active', new.course_type_id;
  end if;

  if new.delivery_mode_id is not null and not exists (
    select 1 from public.training_delivery_modes
    where id = new.delivery_mode_id and is_active = true
  ) then
    raise exception 'delivery_mode_id % is unknown or not active', new.delivery_mode_id;
  end if;

  return new;
end;
$$;

create trigger training_offers_validate
before insert or update on public.training_offers
for each row
execute function public.validate_training_offer ();

alter table public.training_offers enable row level security;

-- 1. Publicly readable only when the offer, the provider profile and the
-- course type are all active, and the delivery mode (when set) is active.
create policy "Public can view active training offers"
  on public.training_offers
  for select
  to public
  using (
    is_active = true
    and exists (
      select 1
      from public.profiles p
      where
        p.id = training_offers.provider_profile_id
        and p.is_active = true
    )
    and exists (
      select 1
      from public.training_course_types t
      where
        t.id = training_offers.course_type_id
        and t.is_active = true
    )
    and (
      training_offers.delivery_mode_id is null
      or exists (
        select 1
        from public.training_delivery_modes m
        where
          m.id = training_offers.delivery_mode_id
          and m.is_active = true
      )
    )
  );

-- 2. A provider can always see their own offers, even when inactive.
create policy "Providers can view their own training offers"
  on public.training_offers
  for select
  to authenticated
  using (auth.uid () = provider_profile_id);

-- 3. A provider may add offers only under their own profile.
create policy "Providers can add their own training offers"
  on public.training_offers
  for insert
  to authenticated
  with check (auth.uid () = provider_profile_id);

-- 4. A provider may update only their own offers.
create policy "Providers can update their own training offers"
  on public.training_offers
  for update
  to authenticated
  using (auth.uid () = provider_profile_id)
  with check (auth.uid () = provider_profile_id);

-- 5. A provider may delete only their own offers.
create policy "Providers can delete their own training offers"
  on public.training_offers
  for delete
  to authenticated
  using (auth.uid () = provider_profile_id);

grant select on public.training_offers to anon;

grant select, insert, update, delete on public.training_offers to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_training_offers_updated_at ()
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

create trigger training_offers_set_updated_at
before update on public.training_offers
for each row
execute function public.set_training_offers_updated_at ();
