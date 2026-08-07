-- A5.1 — Access/RLS v1: Mercati Internazionali
-- Plan §8.1; A2 §14–§15. Market write Red-only; subject XOR person/business; ACT for Impresa.
-- Out of scope: training_*; DELETE policies on domain AR.

-- ---------------------------------------------------------------------------
-- international_markets — governance AR (Red write)
-- ---------------------------------------------------------------------------
grant select on table public.international_markets to anon, authenticated;
grant insert, update on table public.international_markets to authenticated;

create policy international_markets_select_public
  on public.international_markets
  for select
  to anon, authenticated
  using (editorial_status = 'published');

create policy international_markets_insert_editorial
  on public.international_markets
  for insert
  to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
  );

create policy international_markets_update_editorial
  on public.international_markets
  for update
  to authenticated
  using (
    public.access_is_editor()
    and public.access_is_active_account()
  )
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
  );

-- ---------------------------------------------------------------------------
-- MI catalogs — SELECT public is_active; no authenticated write
-- ---------------------------------------------------------------------------
revoke all on table public.international_access_channels from anon, authenticated;
grant select on table public.international_access_channels to anon, authenticated;

create policy international_access_channels_select_public
  on public.international_access_channels for select to anon, authenticated
  using (is_active = true);

revoke all on table public.international_activity_types from anon, authenticated;
grant select on table public.international_activity_types to anon, authenticated;

create policy international_activity_types_select_public
  on public.international_activity_types for select to anon, authenticated
  using (is_active = true);

revoke all on table public.internationalization_need_types from anon, authenticated;
grant select on table public.internationalization_need_types to anon, authenticated;

create policy internationalization_need_types_select_public
  on public.internationalization_need_types for select to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- international_market_countries — owned by market (Red write)
-- ---------------------------------------------------------------------------
grant select on table public.international_market_countries to anon, authenticated;
grant insert, update on table public.international_market_countries to authenticated;

create policy international_market_countries_select_public
  on public.international_market_countries for select to anon, authenticated
  using (
    exists (
      select 1 from public.international_markets as m
      where m.id = international_market_countries.market_id
        and m.editorial_status = 'published'
    )
  );

create policy international_market_countries_insert_editorial
  on public.international_market_countries for insert to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and exists (
      select 1 from public.international_markets as m
      where m.id = international_market_countries.market_id
    )
  );

create policy international_market_countries_update_editorial
  on public.international_market_countries for update to authenticated
  using (public.access_is_editor() and public.access_is_active_account())
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and market_id = market_id
  );

-- ---------------------------------------------------------------------------
-- international_market_support_resources — owned by market (Red write)
-- ---------------------------------------------------------------------------
grant select on table public.international_market_support_resources to anon, authenticated;
grant insert, update on table public.international_market_support_resources to authenticated;

create policy international_market_support_resources_select_public
  on public.international_market_support_resources for select to anon, authenticated
  using (
    visibility_status = 'public'
    and exists (
      select 1 from public.international_markets as m
      where m.id = international_market_support_resources.market_id
        and m.editorial_status = 'published'
    )
  );

create policy international_market_support_resources_insert_editorial
  on public.international_market_support_resources for insert to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
  );

create policy international_market_support_resources_update_editorial
  on public.international_market_support_resources for update to authenticated
  using (public.access_is_editor() and public.access_is_active_account())
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and market_id = market_id
  );

-- ---------------------------------------------------------------------------
-- subject AR macros: presences, interests, relations, needs
-- public: visibility_status = public ∧ market published
-- write person: OwnP; write business: ACT; XOR immutable in WITH CHECK
-- ---------------------------------------------------------------------------

-- international_market_presences
grant select on table public.international_market_presences to anon, authenticated;
grant insert, update on table public.international_market_presences to authenticated;

create policy international_market_presences_select_public
  on public.international_market_presences for select to anon, authenticated
  using (
    visibility_status = 'public'
    and exists (
      select 1 from public.international_markets as m
      where m.id = international_market_presences.market_id
        and m.editorial_status = 'published'
    )
  );

create policy international_market_presences_select_owner_person
  on public.international_market_presences for select to authenticated
  using (
    subject_kind = 'person'
    and person_id = public.access_current_person_id()
  );

create policy international_market_presences_select_owner_business
  on public.international_market_presences for select to authenticated
  using (
    subject_kind = 'business'
    and (
      public.access_has_active_business_membership(business_id)
      or public.access_can_act_for_business(business_id)
    )
  );

create policy international_market_presences_insert_owner_person
  on public.international_market_presences for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'person'
    and person_id = public.access_current_person_id()
    and business_id is null
  );

create policy international_market_presences_insert_owner_business
  on public.international_market_presences for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'business'
    and person_id is null
    and public.access_can_act_for_business(business_id)
  );

create policy international_market_presences_update_owner_person
  on public.international_market_presences for update to authenticated
  using (
    subject_kind = 'person'
    and person_id = public.access_current_person_id()
    and public.access_is_active_account()
  )
  with check (
    subject_kind = 'person'
    and person_id = public.access_current_person_id()
    and business_id is null
  );

create policy international_market_presences_update_owner_business
  on public.international_market_presences for update to authenticated
  using (
    subject_kind = 'business'
    and public.access_can_act_for_business(business_id)
  )
  with check (
    subject_kind = 'business'
    and person_id is null
    and public.access_can_act_for_business(business_id)
  );

-- international_market_interests
grant select on table public.international_market_interests to anon, authenticated;
grant insert, update on table public.international_market_interests to authenticated;

create policy international_market_interests_select_public
  on public.international_market_interests for select to anon, authenticated
  using (
    visibility_status = 'public'
    and exists (
      select 1 from public.international_markets as m
      where m.id = international_market_interests.market_id
        and m.editorial_status = 'published'
    )
  );

create policy international_market_interests_select_owner_person
  on public.international_market_interests for select to authenticated
  using (subject_kind = 'person' and person_id = public.access_current_person_id());

create policy international_market_interests_select_owner_business
  on public.international_market_interests for select to authenticated
  using (
    subject_kind = 'business'
    and (
      public.access_has_active_business_membership(business_id)
      or public.access_can_act_for_business(business_id)
    )
  );

create policy international_market_interests_insert_owner_person
  on public.international_market_interests for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'person'
    and person_id = public.access_current_person_id()
    and business_id is null
  );

create policy international_market_interests_insert_owner_business
  on public.international_market_interests for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'business'
    and person_id is null
    and public.access_can_act_for_business(business_id)
  );

create policy international_market_interests_update_owner_person
  on public.international_market_interests for update to authenticated
  using (subject_kind = 'person' and person_id = public.access_current_person_id() and public.access_is_active_account())
  with check (subject_kind = 'person' and person_id = public.access_current_person_id() and business_id is null);

create policy international_market_interests_update_owner_business
  on public.international_market_interests for update to authenticated
  using (subject_kind = 'business' and public.access_can_act_for_business(business_id))
  with check (subject_kind = 'business' and person_id is null and public.access_can_act_for_business(business_id));

-- international_commercial_relations
grant select on table public.international_commercial_relations to anon, authenticated;
grant insert, update on table public.international_commercial_relations to authenticated;

create policy international_commercial_relations_select_public
  on public.international_commercial_relations for select to anon, authenticated
  using (
    visibility_status = 'public'
    and exists (
      select 1 from public.international_markets as m
      where m.id = international_commercial_relations.market_id
        and m.editorial_status = 'published'
    )
  );

create policy international_commercial_relations_select_owner_person
  on public.international_commercial_relations for select to authenticated
  using (subject_kind = 'person' and person_id = public.access_current_person_id());

create policy international_commercial_relations_select_owner_business
  on public.international_commercial_relations for select to authenticated
  using (
    subject_kind = 'business'
    and (
      public.access_has_active_business_membership(business_id)
      or public.access_can_act_for_business(business_id)
    )
  );

create policy international_commercial_relations_insert_owner_person
  on public.international_commercial_relations for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'person'
    and person_id = public.access_current_person_id()
    and business_id is null
  );

create policy international_commercial_relations_insert_owner_business
  on public.international_commercial_relations for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'business'
    and person_id is null
    and public.access_can_act_for_business(business_id)
  );

create policy international_commercial_relations_update_owner_person
  on public.international_commercial_relations for update to authenticated
  using (subject_kind = 'person' and person_id = public.access_current_person_id() and public.access_is_active_account())
  with check (subject_kind = 'person' and person_id = public.access_current_person_id() and business_id is null);

create policy international_commercial_relations_update_owner_business
  on public.international_commercial_relations for update to authenticated
  using (subject_kind = 'business' and public.access_can_act_for_business(business_id))
  with check (subject_kind = 'business' and person_id is null and public.access_can_act_for_business(business_id));

-- internationalization_needs
grant select on table public.internationalization_needs to anon, authenticated;
grant insert, update on table public.internationalization_needs to authenticated;

create policy internationalization_needs_select_public
  on public.internationalization_needs for select to anon, authenticated
  using (
    visibility_status = 'public'
    and (
      market_id is null
      or exists (
        select 1 from public.international_markets as m
        where m.id = internationalization_needs.market_id
          and m.editorial_status = 'published'
      )
    )
  );

create policy internationalization_needs_select_owner_person
  on public.internationalization_needs for select to authenticated
  using (subject_kind = 'person' and person_id = public.access_current_person_id());

create policy internationalization_needs_select_owner_business
  on public.internationalization_needs for select to authenticated
  using (
    subject_kind = 'business'
    and (
      public.access_has_active_business_membership(business_id)
      or public.access_can_act_for_business(business_id)
    )
  );

create policy internationalization_needs_insert_owner_person
  on public.internationalization_needs for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'person'
    and person_id = public.access_current_person_id()
    and business_id is null
  );

create policy internationalization_needs_insert_owner_business
  on public.internationalization_needs for insert to authenticated
  with check (
    public.access_is_active_account()
    and subject_kind = 'business'
    and person_id is null
    and public.access_can_act_for_business(business_id)
  );

create policy internationalization_needs_update_owner_person
  on public.internationalization_needs for update to authenticated
  using (subject_kind = 'person' and person_id = public.access_current_person_id() and public.access_is_active_account())
  with check (subject_kind = 'person' and person_id = public.access_current_person_id() and business_id is null);

create policy internationalization_needs_update_owner_business
  on public.internationalization_needs for update to authenticated
  using (subject_kind = 'business' and public.access_can_act_for_business(business_id))
  with check (subject_kind = 'business' and person_id is null and public.access_can_act_for_business(business_id));

-- ---------------------------------------------------------------------------
-- international_market_activities — owned by presence
-- ---------------------------------------------------------------------------
grant select on table public.international_market_activities to anon, authenticated;
grant insert, update on table public.international_market_activities to authenticated;

create policy international_market_activities_select_public
  on public.international_market_activities for select to anon, authenticated
  using (
    visibility_status = 'public'
    and exists (
      select 1
      from public.international_market_presences as p
      join public.international_markets as m on m.id = p.market_id
      where p.id = international_market_activities.presence_id
        and p.visibility_status = 'public'
        and m.editorial_status = 'published'
    )
  );

create policy international_market_activities_select_owner
  on public.international_market_activities for select to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_activities.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (
            p.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(p.business_id)
              or public.access_can_act_for_business(p.business_id)
            )
          )
        )
    )
  );

create policy international_market_activities_insert_owner
  on public.international_market_activities for insert to authenticated
  with check (
    public.access_is_active_account()
    and exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_activities.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  );

create policy international_market_activities_update_owner
  on public.international_market_activities for update to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_activities.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  )
  with check (
    presence_id = presence_id
    and exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_activities.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  );

-- international_market_activity_type_links — owned by activity
grant select on table public.international_market_activity_type_links to anon, authenticated;
grant insert, update on table public.international_market_activity_type_links to authenticated;

create policy international_market_activity_type_links_select_public
  on public.international_market_activity_type_links for select to anon, authenticated
  using (
    exists (
      select 1
      from public.international_market_activities as a
      join public.international_market_presences as p on p.id = a.presence_id
      join public.international_markets as m on m.id = p.market_id
      where a.id = international_market_activity_type_links.activity_id
        and a.visibility_status = 'public'
        and p.visibility_status = 'public'
        and m.editorial_status = 'published'
    )
  );

create policy international_market_activity_type_links_select_owner
  on public.international_market_activity_type_links for select to authenticated
  using (
    exists (
      select 1
      from public.international_market_activities as a
      join public.international_market_presences as p on p.id = a.presence_id
      where a.id = international_market_activity_type_links.activity_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (
            p.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(p.business_id)
              or public.access_can_act_for_business(p.business_id)
            )
          )
        )
    )
  );

create policy international_market_activity_type_links_insert_owner
  on public.international_market_activity_type_links for insert to authenticated
  with check (
    exists (
      select 1
      from public.international_market_activities as a
      join public.international_market_presences as p on p.id = a.presence_id
      where a.id = international_market_activity_type_links.activity_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  );

create policy international_market_activity_type_links_update_owner
  on public.international_market_activity_type_links for update to authenticated
  using (
    exists (
      select 1
      from public.international_market_activities as a
      join public.international_market_presences as p on p.id = a.presence_id
      where a.id = international_market_activity_type_links.activity_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  )
  with check (activity_id = activity_id);

-- ---------------------------------------------------------------------------
-- restricted owned: presence/relation evidences, sources, verifications
-- ---------------------------------------------------------------------------

-- presence evidences
grant select on table public.international_market_presence_evidences to authenticated;
grant insert, update on table public.international_market_presence_evidences to authenticated;

create policy international_market_presence_evidences_select_owner
  on public.international_market_presence_evidences for select to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_evidences.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (
            p.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(p.business_id)
              or public.access_can_act_for_business(p.business_id)
            )
          )
        )
    )
  );

create policy international_market_presence_evidences_insert_owner
  on public.international_market_presence_evidences for insert to authenticated
  with check (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_evidences.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  );

create policy international_market_presence_evidences_update_owner
  on public.international_market_presence_evidences for update to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_evidences.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  )
  with check (presence_id = presence_id);

-- presence sources
grant select on table public.international_market_presence_sources to authenticated;
grant insert, update on table public.international_market_presence_sources to authenticated;

create policy international_market_presence_sources_select_owner
  on public.international_market_presence_sources for select to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_sources.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (
            p.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(p.business_id)
              or public.access_can_act_for_business(p.business_id)
            )
          )
        )
    )
  );

create policy international_market_presence_sources_insert_owner
  on public.international_market_presence_sources for insert to authenticated
  with check (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_sources.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  );

create policy international_market_presence_sources_update_owner
  on public.international_market_presence_sources for update to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_sources.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  )
  with check (presence_id = presence_id);

-- presence verifications
grant select on table public.international_market_presence_verifications to authenticated;
grant insert, update on table public.international_market_presence_verifications to authenticated;

create policy international_market_presence_verifications_select_owner
  on public.international_market_presence_verifications for select to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_verifications.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (
            p.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(p.business_id)
              or public.access_can_act_for_business(p.business_id)
            )
          )
        )
    )
  );

create policy international_market_presence_verifications_insert_owner
  on public.international_market_presence_verifications for insert to authenticated
  with check (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_verifications.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  );

create policy international_market_presence_verifications_update_owner
  on public.international_market_presence_verifications for update to authenticated
  using (
    exists (
      select 1 from public.international_market_presences as p
      where p.id = international_market_presence_verifications.presence_id
        and (
          (p.subject_kind = 'person' and p.person_id = public.access_current_person_id())
          or (p.subject_kind = 'business' and public.access_can_act_for_business(p.business_id))
        )
    )
  )
  with check (presence_id = presence_id);

-- commercial relation evidences
grant select on table public.international_commercial_relation_evidences to authenticated;
grant insert, update on table public.international_commercial_relation_evidences to authenticated;

create policy international_commercial_relation_evidences_select_owner
  on public.international_commercial_relation_evidences for select to authenticated
  using (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_evidences.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (
            r.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(r.business_id)
              or public.access_can_act_for_business(r.business_id)
            )
          )
        )
    )
  );

create policy international_commercial_relation_evidences_insert_owner
  on public.international_commercial_relation_evidences for insert to authenticated
  with check (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_evidences.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (r.subject_kind = 'business' and public.access_can_act_for_business(r.business_id))
        )
    )
  );

create policy international_commercial_relation_evidences_update_owner
  on public.international_commercial_relation_evidences for update to authenticated
  using (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_evidences.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (r.subject_kind = 'business' and public.access_can_act_for_business(r.business_id))
        )
    )
  )
  with check (commercial_relation_id = commercial_relation_id);

-- commercial relation sources
grant select on table public.international_commercial_relation_sources to authenticated;
grant insert, update on table public.international_commercial_relation_sources to authenticated;

create policy international_commercial_relation_sources_select_owner
  on public.international_commercial_relation_sources for select to authenticated
  using (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_sources.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (
            r.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(r.business_id)
              or public.access_can_act_for_business(r.business_id)
            )
          )
        )
    )
  );

create policy international_commercial_relation_sources_insert_owner
  on public.international_commercial_relation_sources for insert to authenticated
  with check (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_sources.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (r.subject_kind = 'business' and public.access_can_act_for_business(r.business_id))
        )
    )
  );

create policy international_commercial_relation_sources_update_owner
  on public.international_commercial_relation_sources for update to authenticated
  using (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_sources.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (r.subject_kind = 'business' and public.access_can_act_for_business(r.business_id))
        )
    )
  )
  with check (commercial_relation_id = commercial_relation_id);

-- commercial relation verifications
grant select on table public.international_commercial_relation_verifications to authenticated;
grant insert, update on table public.international_commercial_relation_verifications to authenticated;

create policy international_commercial_relation_verifications_select_owner
  on public.international_commercial_relation_verifications for select to authenticated
  using (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_verifications.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (
            r.subject_kind = 'business'
            and (
              public.access_has_active_business_membership(r.business_id)
              or public.access_can_act_for_business(r.business_id)
            )
          )
        )
    )
  );

create policy international_commercial_relation_verifications_insert_owner
  on public.international_commercial_relation_verifications for insert to authenticated
  with check (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_verifications.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (r.subject_kind = 'business' and public.access_can_act_for_business(r.business_id))
        )
    )
  );

create policy international_commercial_relation_verifications_update_owner
  on public.international_commercial_relation_verifications for update to authenticated
  using (
    exists (
      select 1 from public.international_commercial_relations as r
      where r.id = international_commercial_relation_verifications.commercial_relation_id
        and (
          (r.subject_kind = 'person' and r.person_id = public.access_current_person_id())
          or (r.subject_kind = 'business' and public.access_can_act_for_business(r.business_id))
        )
    )
  )
  with check (commercial_relation_id = commercial_relation_id);
