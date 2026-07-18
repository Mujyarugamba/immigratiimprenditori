-- Create public.training_offer_sectors: a bridge linking a training offer
-- to the economic sectors (public.business_sectors) it is relevant to,
-- e.g. a scaffolding course tagged construction, or a HACCP course tagged
-- food_service and commerce at the same time.

create table public.training_offer_sectors (
  training_offer_id uuid not null references public.training_offers (id) on delete cascade,
  sector_id bigint not null references public.business_sectors (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (training_offer_id, sector_id)
);

comment on table public.training_offer_sectors is
  'Bridge table tagging a training_offers row with one or more relevant economic sectors (public.business_sectors). A single offer can be relevant to several sectors.';

-- The primary key already indexes training_offer_id (as its leading
-- column), covering "sectors of a given offer". The reverse lookup
-- ("offers relevant to a given sector", e.g. construction) needs its own
-- index since sector_id is not a leading column of the PK.
create index training_offer_sectors_sector_idx on public.training_offer_sectors using btree (sector_id);

alter table public.training_offer_sectors enable row level security;

-- 1. Publicly readable only when the underlying offer is itself publicly
-- visible and the sector is active.
create policy "Public can view sectors of active training offers"
  on public.training_offer_sectors
  for select
  to public
  using (
    exists (
      select 1
      from public.training_offers o
      join public.profiles p on p.id = o.provider_profile_id
      join public.training_course_types t on t.id = o.course_type_id
      where
        o.id = training_offer_sectors.training_offer_id
        and o.is_active = true
        and p.is_active = true
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
      from public.business_sectors s
      where
        s.id = training_offer_sectors.sector_id
        and s.is_active = true
    )
  );

-- 2. The provider can always see the sectors of their own offers.
create policy "Providers can view sectors of their own training offers"
  on public.training_offer_sectors
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_sectors.training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  );

-- 3. A provider may tag only their own offers, and only with active
-- sectors.
create policy "Providers can add sectors to their own training offers"
  on public.training_offer_sectors
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
    and exists (
      select 1
      from public.business_sectors s
      where
        s.id = sector_id
        and s.is_active = true
    )
  );

-- 4. A provider may remove a sector tag only from their own offer.
create policy "Providers can remove sectors from their own training offers"
  on public.training_offer_sectors
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.training_offers o
      where
        o.id = training_offer_sectors.training_offer_id
        and o.provider_profile_id = auth.uid ()
    )
  );

grant select on public.training_offer_sectors to anon;

grant select, insert, delete on public.training_offer_sectors to authenticated;
