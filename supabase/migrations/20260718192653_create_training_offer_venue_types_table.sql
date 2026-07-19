-- Create public.training_offer_venue_types: a bridge linking a training
-- offer to the physical venue types (public.training_venue_types) it can
-- be delivered at (e.g. at the company's site and at the construction
-- site, but not at the provider's own site). Only meaningful for offers
-- that declare is_on_site_available = true on public.training_offers.

create table public.training_offer_venue_types (
  training_offer_id uuid not null references public.training_offers (id) on delete cascade,
  venue_type_id bigint not null references public.training_venue_types (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (training_offer_id, venue_type_id)
);

comment on table public.training_offer_venue_types is
  'Bridge table declaring which physical venue types (public.training_venue_types) a training offer can be delivered at. Only meaningful when the linked public.training_offers row has is_on_site_available = true, enforced by trigger.';

-- The primary key already indexes training_offer_id (as its leading
-- column), covering "venue types of a given offer". The reverse lookup
-- ("offers available at a given venue type", e.g. construction site)
-- needs its own index since venue_type_id is not a leading column of the
-- PK.
create index training_offer_venue_types_venue_idx on public.training_offer_venue_types using btree (venue_type_id);

-- Keeps the bridge consistent with the parent offer: a venue type can only
-- be declared when the offer itself is marked as available on site, and
-- the venue type must be active. A plain CHECK cannot query another
-- table, hence the trigger.
create or replace function public.validate_training_offer_venue_type ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.training_offers
    where id = new.training_offer_id and is_on_site_available = true
  ) then
    raise exception 'training_offer_id % is not marked as available on site (is_on_site_available = false)', new.training_offer_id;
  end if;

  if not exists (
    select 1 from public.training_venue_types
    where id = new.venue_type_id and is_active = true
  ) then
    raise exception 'venue_type_id % is unknown or not active', new.venue_type_id;
  end if;

  return new;
end;
$$;

create trigger training_offer_venue_types_validate
before insert or update on public.training_offer_venue_types
for each row
execute function public.validate_training_offer_venue_type ();

alter table public.training_offer_venue_types enable row level security;

-- 1. Publicly readable only when the underlying offer is itself publicly
-- visible (active offer, published provider profile - is_public = true,
-- is_active = true, deleted_at is null, the unified visibility formula
-- used across the Persone domain -, active course type, active delivery
-- mode) and the venue type is active.
create policy "Public can view venue types of active training offers"
  on public.training_offer_venue_types
  for select
  to public
  using (
    exists (
      select 1
      from public.training_offers o
      join public.profiles p on p.id = o.provider_profile_id
      join public.training_course_types t on t.id = o.course_type_id
      where
        o.id = training_offer_venue_types.training_offer_id
        and o.is_active = true
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
        and t.is_active = true
        and (
          o.delivery_mode_id is null
          or exists (
            select 1
            from public.training_delivery_modes m
            where
              m.id = o.delivery_mode_id
              and m.is_active = true
          )
        )
    )
    and exists (
      select 1
      from public.training_venue_types v
      where
        v.id = training_offer_venue_types.venue_type_id
        and v.is_active = true
    )
  );

-- 2. The provider can always see the venue types of their own offers.
create policy "Providers can view venue types of their own training offers"
  on public.training_offer_venue_types
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_venue_types.training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  );

-- 3. A provider may tag only their own offers.
create policy "Providers can add venue types to their own training offers"
  on public.training_offer_venue_types
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  );

-- 4. A provider may remove a venue type tag only from their own offer.
create policy "Providers can remove venue types from their own training offers"
  on public.training_offer_venue_types
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_venue_types.training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  );

grant select on public.training_offer_venue_types to anon;

grant select, insert, delete on public.training_offer_venue_types to authenticated;
