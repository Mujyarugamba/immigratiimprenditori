-- A6.1 — Access/RLS v1: Contenuti
-- Plan §9.1; A2 §9–§13. Ternary ownership; Red CRUD editorial; Adm without Red deny write.
-- Public: publication_status='published' AND visibility_status='public'.
-- Out of scope: training_*; content_* catalogs (A6.4); DELETE policies.

-- ---------------------------------------------------------------------------
-- contents — AR (ternary ownership)
-- ---------------------------------------------------------------------------
grant select on table public.contents to anon, authenticated;
grant insert, update on table public.contents to authenticated;

create policy contents_select_public
  on public.contents for select to anon, authenticated
  using (
    publication_status = 'published'
    and visibility_status = 'public'
  );

create policy contents_select_owner_person
  on public.contents for select to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and owned_by_editorial = false
  );

create policy contents_select_owner_business
  on public.contents for select to authenticated
  using (
    owner_business_id is not null
    and owned_by_editorial = false
    and (
      public.access_has_active_business_membership(owner_business_id)
      or public.access_can_act_for_business(owner_business_id)
    )
  );

create policy contents_select_editorial
  on public.contents for select to authenticated
  using (owned_by_editorial = true and public.access_is_editor());

create policy contents_insert_owner_person
  on public.contents for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_person_id = public.access_current_person_id()
    and owner_business_id is null
    and owned_by_editorial = false
  );

create policy contents_insert_owner_business
  on public.contents for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_business_id is not null
    and owner_person_id is null
    and owned_by_editorial = false
    and public.access_can_act_for_business(owner_business_id)
  );

create policy contents_insert_editorial
  on public.contents for insert to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and owned_by_editorial = true
    and owner_person_id is null
    and owner_business_id is null
  );

create policy contents_update_owner_person
  on public.contents for update to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and owned_by_editorial = false
    and public.access_is_active_account()
  )
  with check (
    owner_person_id = public.access_current_person_id()
    and owner_business_id is null
    and owned_by_editorial = false
  );

create policy contents_update_owner_business
  on public.contents for update to authenticated
  using (
    owner_business_id is not null
    and owned_by_editorial = false
    and public.access_can_act_for_business(owner_business_id)
  )
  with check (
    owner_business_id is not null
    and owner_person_id is null
    and owned_by_editorial = false
    and public.access_can_act_for_business(owner_business_id)
  );

create policy contents_update_editorial
  on public.contents for update to authenticated
  using (
    owned_by_editorial = true
    and public.access_is_editor()
    and public.access_is_active_account()
  )
  with check (
    owned_by_editorial = true
    and owner_person_id is null
    and owner_business_id is null
    and public.access_is_editor()
  );

-- ---------------------------------------------------------------------------
-- owned macro helper predicate (inline): content writable by current subject
-- ---------------------------------------------------------------------------

-- content_authors
grant select on table public.content_authors to anon, authenticated;
grant insert, update on table public.content_authors to authenticated;

create policy content_authors_select_public
  on public.content_authors for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
  );

create policy content_authors_select_owner
  on public.content_authors for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null
            and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_authors_insert_owner_person
  on public.content_authors for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_authors_insert_owner_business
  on public.content_authors for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_authors_insert_editorial
  on public.content_authors for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_authors_update_owner_person
  on public.content_authors for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (content_id = content_id);

create policy content_authors_update_owner_business
  on public.content_authors for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (content_id = content_id);

create policy content_authors_update_editorial
  on public.content_authors for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_authors.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (content_id = content_id);

-- content_tag_links
grant select on table public.content_tag_links to anon, authenticated;
grant insert, update on table public.content_tag_links to authenticated;

create policy content_tag_links_select_public
  on public.content_tag_links for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
  );

create policy content_tag_links_select_owner
  on public.content_tag_links for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_tag_links_insert_owner_person
  on public.content_tag_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_tag_links_insert_owner_business
  on public.content_tag_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_tag_links_insert_editorial
  on public.content_tag_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_tag_links_update_owner_person
  on public.content_tag_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (content_id = content_id);

create policy content_tag_links_update_owner_business
  on public.content_tag_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (content_id = content_id);

create policy content_tag_links_update_editorial
  on public.content_tag_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_tag_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (content_id = content_id);

-- content_relations (write via source content owner)
grant select on table public.content_relations to anon, authenticated;
grant insert, update on table public.content_relations to authenticated;

create policy content_relations_select_public
  on public.content_relations for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
    and exists (
      select 1 from public.contents as t
      where t.id = content_relations.target_content_id
        and t.publication_status = 'published'
        and t.visibility_status = 'public'
    )
  );

create policy content_relations_select_owner
  on public.content_relations for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_relations_insert_owner_person
  on public.content_relations for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_relations_insert_owner_business
  on public.content_relations for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_relations_insert_editorial
  on public.content_relations for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_relations_update_owner_person
  on public.content_relations for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (source_content_id = source_content_id);

create policy content_relations_update_owner_business
  on public.content_relations for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (source_content_id = source_content_id);

create policy content_relations_update_editorial
  on public.content_relations for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_relations.source_content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (source_content_id = source_content_id);

-- content_event_links
grant select on table public.content_event_links to anon, authenticated;
grant insert, update on table public.content_event_links to authenticated;

create policy content_event_links_select_public
  on public.content_event_links for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
  );

create policy content_event_links_select_owner
  on public.content_event_links for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_event_links_insert_owner_person
  on public.content_event_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_event_links_insert_owner_business
  on public.content_event_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_event_links_insert_editorial
  on public.content_event_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_event_links_update_owner_person
  on public.content_event_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (content_id = content_id);

create policy content_event_links_update_owner_business
  on public.content_event_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (content_id = content_id);

create policy content_event_links_update_editorial
  on public.content_event_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_event_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (content_id = content_id);

-- content_market_links
grant select on table public.content_market_links to anon, authenticated;
grant insert, update on table public.content_market_links to authenticated;

create policy content_market_links_select_public
  on public.content_market_links for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
  );

create policy content_market_links_select_owner
  on public.content_market_links for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_market_links_insert_owner_person
  on public.content_market_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_market_links_insert_owner_business
  on public.content_market_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_market_links_insert_editorial
  on public.content_market_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_market_links_update_owner_person
  on public.content_market_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (content_id = content_id);

create policy content_market_links_update_owner_business
  on public.content_market_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (content_id = content_id);

create policy content_market_links_update_editorial
  on public.content_market_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_market_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (content_id = content_id);

-- content_opportunity_links
grant select on table public.content_opportunity_links to anon, authenticated;
grant insert, update on table public.content_opportunity_links to authenticated;

create policy content_opportunity_links_select_public
  on public.content_opportunity_links for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
  );

create policy content_opportunity_links_select_owner
  on public.content_opportunity_links for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_opportunity_links_insert_owner_person
  on public.content_opportunity_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_opportunity_links_insert_owner_business
  on public.content_opportunity_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_opportunity_links_insert_editorial
  on public.content_opportunity_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_opportunity_links_update_owner_person
  on public.content_opportunity_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (content_id = content_id);

create policy content_opportunity_links_update_owner_business
  on public.content_opportunity_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (content_id = content_id);

create policy content_opportunity_links_update_editorial
  on public.content_opportunity_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_opportunity_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (content_id = content_id);

-- content_service_links
grant select on table public.content_service_links to anon, authenticated;
grant insert, update on table public.content_service_links to authenticated;

create policy content_service_links_select_public
  on public.content_service_links for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
  );

create policy content_service_links_select_owner
  on public.content_service_links for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_service_links_insert_owner_person
  on public.content_service_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_service_links_insert_owner_business
  on public.content_service_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_service_links_insert_editorial
  on public.content_service_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_service_links_update_owner_person
  on public.content_service_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (content_id = content_id);

create policy content_service_links_update_owner_business
  on public.content_service_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (content_id = content_id);

create policy content_service_links_update_editorial
  on public.content_service_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_service_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (content_id = content_id);

-- content_subject_links
grant select on table public.content_subject_links to anon, authenticated;
grant insert, update on table public.content_subject_links to authenticated;

create policy content_subject_links_select_public
  on public.content_subject_links for select to anon, authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and c.publication_status = 'published'
        and c.visibility_status = 'public'
    )
  );

create policy content_subject_links_select_owner
  on public.content_subject_links for select to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and (
          (c.owner_person_id = public.access_current_person_id() and c.owned_by_editorial = false)
          or (
            c.owner_business_id is not null and c.owned_by_editorial = false
            and (
              public.access_has_active_business_membership(c.owner_business_id)
              or public.access_can_act_for_business(c.owner_business_id)
            )
          )
          or (c.owned_by_editorial = true and public.access_is_editor())
        )
    )
  );

create policy content_subject_links_insert_owner_person
  on public.content_subject_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy content_subject_links_insert_owner_business
  on public.content_subject_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy content_subject_links_insert_editorial
  on public.content_subject_links for insert to authenticated
  with check (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy content_subject_links_update_owner_person
  on public.content_subject_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (content_id = content_id);

create policy content_subject_links_update_owner_business
  on public.content_subject_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (content_id = content_id);

create policy content_subject_links_update_editorial
  on public.content_subject_links for update to authenticated
  using (
    exists (
      select 1 from public.contents as c
      where c.id = content_subject_links.content_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (content_id = content_id);
