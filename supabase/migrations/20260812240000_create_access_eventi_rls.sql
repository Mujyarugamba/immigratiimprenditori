-- A5.5 — Access/RLS v1: Eventi
-- Plan §8.5; A2 §14. Owner XOR; ACT for Impresa; published+visibility public.
-- event_registrations: participant self insert/select.
-- Out of scope: training_*; DELETE policies.

-- ---------------------------------------------------------------------------
-- event_types — domain catalog
-- ---------------------------------------------------------------------------
revoke all on table public.event_types from anon, authenticated;
grant select on table public.event_types to anon, authenticated;

create policy event_types_select_public
  on public.event_types for select to anon, authenticated
  using (is_active = true);

-- ---------------------------------------------------------------------------
-- events — AR (owner XOR)
-- ---------------------------------------------------------------------------
grant select on table public.events to anon, authenticated;
grant insert, update on table public.events to authenticated;

create policy events_select_public
  on public.events for select to anon, authenticated
  using (
    publication_status = 'published'
    and visibility_status = 'public'
  );

create policy events_select_owner_person
  on public.events for select to authenticated
  using (owner_person_id = public.access_current_person_id());

create policy events_select_owner_business
  on public.events for select to authenticated
  using (
    owner_business_id is not null
    and (
      public.access_has_active_business_membership(owner_business_id)
      or public.access_can_act_for_business(owner_business_id)
    )
  );

create policy events_insert_owner_person
  on public.events for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_person_id = public.access_current_person_id()
    and owner_business_id is null
  );

create policy events_insert_owner_business
  on public.events for insert to authenticated
  with check (
    public.access_is_active_account()
    and owner_business_id is not null
    and owner_person_id is null
    and public.access_can_act_for_business(owner_business_id)
  );

create policy events_update_owner_person
  on public.events for update to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and public.access_is_active_account()
  )
  with check (
    owner_person_id = public.access_current_person_id()
    and owner_business_id is null
  );

create policy events_update_owner_business
  on public.events for update to authenticated
  using (owner_business_id is not null and public.access_can_act_for_business(owner_business_id))
  with check (
    owner_business_id is not null
    and owner_person_id is null
    and public.access_can_act_for_business(owner_business_id)
  );

-- ---------------------------------------------------------------------------
-- event_editions — owned by event
-- ---------------------------------------------------------------------------
grant select on table public.event_editions to anon, authenticated;
grant insert, update on table public.event_editions to authenticated;

create policy event_editions_select_public
  on public.event_editions for select to anon, authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_editions.event_id
        and e.publication_status = 'published'
        and e.visibility_status = 'public'
    )
  );

create policy event_editions_select_owner
  on public.event_editions for select to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_editions.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (
            e.owner_business_id is not null
            and (
              public.access_has_active_business_membership(e.owner_business_id)
              or public.access_can_act_for_business(e.owner_business_id)
            )
          )
        )
    )
  );

create policy event_editions_insert_owner
  on public.event_editions for insert to authenticated
  with check (
    exists (
      select 1 from public.events as e
      where e.id = event_editions.event_id
        and (
          (e.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  );

create policy event_editions_update_owner
  on public.event_editions for update to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_editions.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  )
  with check (event_id = event_id);

-- ---------------------------------------------------------------------------
-- event_sessions — owned by edition → event
-- ---------------------------------------------------------------------------
grant select on table public.event_sessions to anon, authenticated;
grant insert, update on table public.event_sessions to authenticated;

create policy event_sessions_select_public
  on public.event_sessions for select to anon, authenticated
  using (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_sessions.event_edition_id
        and e.publication_status = 'published'
        and e.visibility_status = 'public'
    )
  );

create policy event_sessions_select_owner
  on public.event_sessions for select to authenticated
  using (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_sessions.event_edition_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (
            e.owner_business_id is not null
            and (
              public.access_has_active_business_membership(e.owner_business_id)
              or public.access_can_act_for_business(e.owner_business_id)
            )
          )
        )
    )
  );

create policy event_sessions_insert_owner
  on public.event_sessions for insert to authenticated
  with check (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_sessions.event_edition_id
        and (
          (e.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  );

create policy event_sessions_update_owner
  on public.event_sessions for update to authenticated
  using (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_sessions.event_edition_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  )
  with check (event_edition_id = event_edition_id);

-- ---------------------------------------------------------------------------
-- event_organizers — owned by event (optional edition)
-- ---------------------------------------------------------------------------
grant select on table public.event_organizers to anon, authenticated;
grant insert, update on table public.event_organizers to authenticated;

create policy event_organizers_select_public
  on public.event_organizers for select to anon, authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_organizers.event_id
        and e.publication_status = 'published'
        and e.visibility_status = 'public'
    )
  );

create policy event_organizers_select_owner
  on public.event_organizers for select to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_organizers.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (
            e.owner_business_id is not null
            and (
              public.access_has_active_business_membership(e.owner_business_id)
              or public.access_can_act_for_business(e.owner_business_id)
            )
          )
        )
    )
  );

create policy event_organizers_insert_owner
  on public.event_organizers for insert to authenticated
  with check (
    exists (
      select 1 from public.events as e
      where e.id = event_organizers.event_id
        and (
          (e.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  );

create policy event_organizers_update_owner
  on public.event_organizers for update to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_organizers.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  )
  with check (event_id = event_id);

-- ---------------------------------------------------------------------------
-- event_speakers — owned by edition
-- ---------------------------------------------------------------------------
grant select on table public.event_speakers to anon, authenticated;
grant insert, update on table public.event_speakers to authenticated;

create policy event_speakers_select_public
  on public.event_speakers for select to anon, authenticated
  using (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_speakers.event_edition_id
        and e.publication_status = 'published'
        and e.visibility_status = 'public'
    )
  );

create policy event_speakers_select_owner
  on public.event_speakers for select to authenticated
  using (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_speakers.event_edition_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (
            e.owner_business_id is not null
            and (
              public.access_has_active_business_membership(e.owner_business_id)
              or public.access_can_act_for_business(e.owner_business_id)
            )
          )
        )
    )
  );

create policy event_speakers_insert_owner
  on public.event_speakers for insert to authenticated
  with check (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_speakers.event_edition_id
        and (
          (e.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  );

create policy event_speakers_update_owner
  on public.event_speakers for update to authenticated
  using (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_speakers.event_edition_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  )
  with check (event_edition_id = event_edition_id);

-- ---------------------------------------------------------------------------
-- event_languages, event_markets — owned by event
-- ---------------------------------------------------------------------------
grant select on table public.event_languages to anon, authenticated;
grant insert, update on table public.event_languages to authenticated;

create policy event_languages_select_public
  on public.event_languages for select to anon, authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_languages.event_id
        and e.publication_status = 'published'
        and e.visibility_status = 'public'
    )
  );

create policy event_languages_select_owner
  on public.event_languages for select to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_languages.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (
            e.owner_business_id is not null
            and (
              public.access_has_active_business_membership(e.owner_business_id)
              or public.access_can_act_for_business(e.owner_business_id)
            )
          )
        )
    )
  );

create policy event_languages_insert_owner
  on public.event_languages for insert to authenticated
  with check (
    exists (
      select 1 from public.events as e
      where e.id = event_languages.event_id
        and (
          (e.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  );

create policy event_languages_update_owner
  on public.event_languages for update to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_languages.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  )
  with check (event_id = event_id);

grant select on table public.event_markets to anon, authenticated;
grant insert, update on table public.event_markets to authenticated;

create policy event_markets_select_public
  on public.event_markets for select to anon, authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_markets.event_id
        and e.publication_status = 'published'
        and e.visibility_status = 'public'
    )
  );

create policy event_markets_select_owner
  on public.event_markets for select to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_markets.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (
            e.owner_business_id is not null
            and (
              public.access_has_active_business_membership(e.owner_business_id)
              or public.access_can_act_for_business(e.owner_business_id)
            )
          )
        )
    )
  );

create policy event_markets_insert_owner
  on public.event_markets for insert to authenticated
  with check (
    exists (
      select 1 from public.events as e
      where e.id = event_markets.event_id
        and (
          (e.owner_person_id = public.access_current_person_id() and public.access_is_active_account())
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  );

create policy event_markets_update_owner
  on public.event_markets for update to authenticated
  using (
    exists (
      select 1 from public.events as e
      where e.id = event_markets.event_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (e.owner_business_id is not null and public.access_can_act_for_business(e.owner_business_id))
        )
    )
  )
  with check (event_id = event_id);

-- ---------------------------------------------------------------------------
-- event_registrations — participant self insert/select; owner read via edition
-- ---------------------------------------------------------------------------
grant select on table public.event_registrations to authenticated;
grant insert, update on table public.event_registrations to authenticated;

create policy event_registrations_select_self
  on public.event_registrations for select to authenticated
  using (participant_person_id = public.access_current_person_id());

create policy event_registrations_select_owner
  on public.event_registrations for select to authenticated
  using (
    exists (
      select 1
      from public.event_editions as ed
      join public.events as e on e.id = ed.event_id
      where ed.id = event_registrations.event_edition_id
        and (
          e.owner_person_id = public.access_current_person_id()
          or (
            e.owner_business_id is not null
            and (
              public.access_has_active_business_membership(e.owner_business_id)
              or public.access_can_act_for_business(e.owner_business_id)
            )
          )
        )
    )
  );

create policy event_registrations_insert_self
  on public.event_registrations for insert to authenticated
  with check (
    public.access_is_active_account()
    and participant_person_id = public.access_current_person_id()
  );

create policy event_registrations_update_self
  on public.event_registrations for update to authenticated
  using (
    participant_person_id = public.access_current_person_id()
    and public.access_is_active_account()
  )
  with check (
    participant_person_id = public.access_current_person_id()
    and public.access_is_active_account()
  );
