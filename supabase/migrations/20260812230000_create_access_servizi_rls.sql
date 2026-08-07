-- A5.4 — Access/RLS v1: Servizi
-- Plan §8.4; A2 §14. Owner XOR Persona|Impresa; ACT for Impresa write; publication_status='published'.
-- Out of scope: training_*; DELETE policies.

-- ---------------------------------------------------------------------------
-- service_categories, service_economic_bands — domain catalogs
-- ---------------------------------------------------------------------------
revoke all on table public.service_categories from anon, authenticated;
grant select on table public.service_categories to anon, authenticated;

create policy service_categories_select_public
  on public.service_categories for select to anon, authenticated
  using (is_active = true);

revoke all on table public.service_economic_bands from anon, authenticated;
grant select on table public.service_economic_bands to anon, authenticated;

create policy service_economic_bands_select_public
  on public.service_economic_bands for select to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- service_offers — AR (owner XOR)
-- ---------------------------------------------------------------------------
grant select on table public.service_offers to anon, authenticated;
grant insert, update on table public.service_offers to authenticated;

create policy service_offers_select_public
  on public.service_offers for select to anon, authenticated
  using (
    publication_status = 'published'
    and visibility_status = 'public'
  );

create policy service_offers_select_owner_person
  on public.service_offers for select to authenticated
  using (owner_person_id = public.access_current_person_id());

create policy service_offers_select_owner_business
  on public.service_offers for select to authenticated
  using (
    owner_business_id is not null
    and (
      public.access_has_active_business_membership(owner_business_id)
      or public.access_can_act_for_business(owner_business_id)
    )
  );

create policy service_offers_insert_owner_person
  on public.service_offers for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_person_id = public.access_current_person_id()
    and owner_business_id is null
  );

create policy service_offers_insert_owner_business
  on public.service_offers for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_business_id is not null
    and owner_person_id is null
    and public.access_can_act_for_business(owner_business_id)
  );

create policy service_offers_update_owner_person
  on public.service_offers for update to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and public.access_is_active_account()
  )
  with check (
    owner_person_id = public.access_current_person_id()
    and owner_business_id is null
  );

create policy service_offers_update_owner_business
  on public.service_offers for update to authenticated
  using (owner_business_id is not null and public.access_can_act_for_business(owner_business_id))
  with check (
    owner_business_id is not null
    and owner_person_id is null
    and public.access_can_act_for_business(owner_business_id)
  );

-- ---------------------------------------------------------------------------
-- service_requests — AR (owner XOR)
-- ---------------------------------------------------------------------------
grant select on table public.service_requests to anon, authenticated;
grant insert, update on table public.service_requests to authenticated;

create policy service_requests_select_public
  on public.service_requests for select to anon, authenticated
  using (
    publication_status = 'published'
    and visibility_status = 'public'
  );

create policy service_requests_select_owner_person
  on public.service_requests for select to authenticated
  using (owner_person_id = public.access_current_person_id());

create policy service_requests_select_owner_business
  on public.service_requests for select to authenticated
  using (
    owner_business_id is not null
    and (
      public.access_has_active_business_membership(owner_business_id)
      or public.access_can_act_for_business(owner_business_id)
    )
  );

create policy service_requests_insert_owner_person
  on public.service_requests for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_person_id = public.access_current_person_id()
    and owner_business_id is null
  );

create policy service_requests_insert_owner_business
  on public.service_requests for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_business_id is not null
    and owner_person_id is null
    and public.access_can_act_for_business(owner_business_id)
  );

create policy service_requests_update_owner_person
  on public.service_requests for update to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and public.access_is_active_account()
  )
  with check (
    owner_person_id = public.access_current_person_id()
    and owner_business_id is null
  );

create policy service_requests_update_owner_business
  on public.service_requests for update to authenticated
  using (owner_business_id is not null and public.access_can_act_for_business(owner_business_id))
  with check (
    owner_business_id is not null
    and owner_person_id is null
    and public.access_can_act_for_business(owner_business_id)
  );

-- ---------------------------------------------------------------------------
-- service_offer owned tables
-- ---------------------------------------------------------------------------

-- service_offer_languages
grant select on table public.service_offer_languages to anon, authenticated;
grant insert, update on table public.service_offer_languages to authenticated;

create policy service_offer_languages_select_public
  on public.service_offer_languages for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_languages.service_offer_id
        and o.publication_status = 'published'
        and o.visibility_status = 'public'
    )
  );

create policy service_offer_languages_select_owner
  on public.service_offer_languages for select to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_languages.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (
            o.owner_business_id is not null
            and (
              public.access_has_active_business_membership(o.owner_business_id)
              or public.access_can_act_for_business(o.owner_business_id)
            )
          )
        )
    )
  );

create policy service_offer_languages_insert_owner
  on public.service_offer_languages for insert to authenticated
  with check (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_languages.service_offer_id
        and (
          (o.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  );

create policy service_offer_languages_update_owner
  on public.service_offer_languages for update to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_languages.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  )
  with check (service_offer_id = service_offer_id);

-- service_offer_markets
grant select on table public.service_offer_markets to anon, authenticated;
grant insert, update on table public.service_offer_markets to authenticated;

create policy service_offer_markets_select_public
  on public.service_offer_markets for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_markets.service_offer_id
        and o.publication_status = 'published'
        and o.visibility_status = 'public'
    )
  );

create policy service_offer_markets_select_owner
  on public.service_offer_markets for select to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_markets.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (
            o.owner_business_id is not null
            and (
              public.access_has_active_business_membership(o.owner_business_id)
              or public.access_can_act_for_business(o.owner_business_id)
            )
          )
        )
    )
  );

create policy service_offer_markets_insert_owner
  on public.service_offer_markets for insert to authenticated
  with check (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_markets.service_offer_id
        and (
          (o.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  );

create policy service_offer_markets_update_owner
  on public.service_offer_markets for update to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_markets.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  )
  with check (service_offer_id = service_offer_id);

-- service_offer_sectors
grant select on table public.service_offer_sectors to anon, authenticated;
grant insert, update on table public.service_offer_sectors to authenticated;

create policy service_offer_sectors_select_public
  on public.service_offer_sectors for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_sectors.service_offer_id
        and o.publication_status = 'published'
        and o.visibility_status = 'public'
    )
  );

create policy service_offer_sectors_select_owner
  on public.service_offer_sectors for select to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_sectors.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (
            o.owner_business_id is not null
            and (
              public.access_has_active_business_membership(o.owner_business_id)
              or public.access_can_act_for_business(o.owner_business_id)
            )
          )
        )
    )
  );

create policy service_offer_sectors_insert_owner
  on public.service_offer_sectors for insert to authenticated
  with check (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_sectors.service_offer_id
        and (
          (o.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  );

create policy service_offer_sectors_update_owner
  on public.service_offer_sectors for update to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_sectors.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  )
  with check (service_offer_id = service_offer_id);

-- service_offer_territories
grant select on table public.service_offer_territories to anon, authenticated;
grant insert, update on table public.service_offer_territories to authenticated;

create policy service_offer_territories_select_public
  on public.service_offer_territories for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_territories.service_offer_id
        and o.publication_status = 'published'
        and o.visibility_status = 'public'
    )
  );

create policy service_offer_territories_select_owner
  on public.service_offer_territories for select to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_territories.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (
            o.owner_business_id is not null
            and (
              public.access_has_active_business_membership(o.owner_business_id)
              or public.access_can_act_for_business(o.owner_business_id)
            )
          )
        )
    )
  );

create policy service_offer_territories_insert_owner
  on public.service_offer_territories for insert to authenticated
  with check (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_territories.service_offer_id
        and (
          (o.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  );

create policy service_offer_territories_update_owner
  on public.service_offer_territories for update to authenticated
  using (
    exists (
      select 1 from public.service_offers as o
      where o.id = service_offer_territories.service_offer_id
        and (
          o.owner_person_id = public.access_current_person_id()
          or (o.owner_business_id is not null and public.access_can_act_for_business(o.owner_business_id))
        )
    )
  )
  with check (service_offer_id = service_offer_id);

-- ---------------------------------------------------------------------------
-- service_request owned tables
-- ---------------------------------------------------------------------------

-- service_request_languages
grant select on table public.service_request_languages to anon, authenticated;
grant insert, update on table public.service_request_languages to authenticated;

create policy service_request_languages_select_public
  on public.service_request_languages for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_languages.service_request_id
        and r.publication_status = 'published'
        and r.visibility_status = 'public'
    )
  );

create policy service_request_languages_select_owner
  on public.service_request_languages for select to authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_languages.service_request_id
        and (
          r.owner_person_id = public.access_current_person_id()
          or (
            r.owner_business_id is not null
            and (
              public.access_has_active_business_membership(r.owner_business_id)
              or public.access_can_act_for_business(r.owner_business_id)
            )
          )
        )
    )
  );

create policy service_request_languages_insert_owner
  on public.service_request_languages for insert to authenticated
  with check (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_languages.service_request_id
        and (
          (r.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (r.owner_business_id is not null and public.access_can_act_for_business(r.owner_business_id))
        )
    )
  );

create policy service_request_languages_update_owner
  on public.service_request_languages for update to authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_languages.service_request_id
        and (
          r.owner_person_id = public.access_current_person_id()
          or (r.owner_business_id is not null and public.access_can_act_for_business(r.owner_business_id))
        )
    )
  )
  with check (service_request_id = service_request_id);

-- service_request_sectors
grant select on table public.service_request_sectors to anon, authenticated;
grant insert, update on table public.service_request_sectors to authenticated;

create policy service_request_sectors_select_public
  on public.service_request_sectors for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_sectors.service_request_id
        and r.publication_status = 'published'
        and r.visibility_status = 'public'
    )
  );

create policy service_request_sectors_select_owner
  on public.service_request_sectors for select to authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_sectors.service_request_id
        and (
          r.owner_person_id = public.access_current_person_id()
          or (
            r.owner_business_id is not null
            and (
              public.access_has_active_business_membership(r.owner_business_id)
              or public.access_can_act_for_business(r.owner_business_id)
            )
          )
        )
    )
  );

create policy service_request_sectors_insert_owner
  on public.service_request_sectors for insert to authenticated
  with check (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_sectors.service_request_id
        and (
          (r.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (r.owner_business_id is not null and public.access_can_act_for_business(r.owner_business_id))
        )
    )
  );

create policy service_request_sectors_update_owner
  on public.service_request_sectors for update to authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_sectors.service_request_id
        and (
          r.owner_person_id = public.access_current_person_id()
          or (r.owner_business_id is not null and public.access_can_act_for_business(r.owner_business_id))
        )
    )
  )
  with check (service_request_id = service_request_id);

-- service_request_territories
grant select on table public.service_request_territories to anon, authenticated;
grant insert, update on table public.service_request_territories to authenticated;

create policy service_request_territories_select_public
  on public.service_request_territories for select to anon, authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_territories.service_request_id
        and r.publication_status = 'published'
        and r.visibility_status = 'public'
    )
  );

create policy service_request_territories_select_owner
  on public.service_request_territories for select to authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_territories.service_request_id
        and (
          r.owner_person_id = public.access_current_person_id()
          or (
            r.owner_business_id is not null
            and (
              public.access_has_active_business_membership(r.owner_business_id)
              or public.access_can_act_for_business(r.owner_business_id)
            )
          )
        )
    )
  );

create policy service_request_territories_insert_owner
  on public.service_request_territories for insert to authenticated
  with check (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_territories.service_request_id
        and (
          (r.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (r.owner_business_id is not null and public.access_can_act_for_business(r.owner_business_id))
        )
    )
  );

create policy service_request_territories_update_owner
  on public.service_request_territories for update to authenticated
  using (
    exists (
      select 1 from public.service_requests as r
      where r.id = service_request_territories.service_request_id
        and (
          r.owner_person_id = public.access_current_person_id()
          or (r.owner_business_id is not null and public.access_can_act_for_business(r.owner_business_id))
        )
    )
  )
  with check (service_request_id = service_request_id);
