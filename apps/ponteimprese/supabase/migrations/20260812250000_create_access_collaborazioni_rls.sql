-- A5.6 — Access/RLS v1: Collaborazioni
-- Plan §8.6; A2 §13. Ternary ownership; public editorial_status='published'.
-- Red write only on owned_by_editorial; ACT for Impresa; XOR immutable.
-- Out of scope: training_*; DELETE policies; matching.

-- ---------------------------------------------------------------------------
-- collaborations — AR (ternary ownership)
-- ---------------------------------------------------------------------------
grant select on table public.collaborations to anon, authenticated;
grant insert, update on table public.collaborations to authenticated;

create policy collaborations_select_public
  on public.collaborations
  for select
  to anon, authenticated
  using (editorial_status = 'published');

create policy collaborations_select_owner_person
  on public.collaborations
  for select
  to authenticated
  using (
    owner_person_id = public.access_current_person_id()
    and owned_by_editorial = false
  );

create policy collaborations_select_owner_business
  on public.collaborations
  for select
  to authenticated
  using (
    owner_business_id is not null
    and owned_by_editorial = false
    and (
      public.access_has_active_business_membership(owner_business_id)
      or public.access_can_act_for_business(owner_business_id)
    )
  );

create policy collaborations_select_editorial
  on public.collaborations
  for select
  to authenticated
  using (
    owned_by_editorial = true
    and public.access_is_editor()
  );

create policy collaborations_insert_owner_person
  on public.collaborations
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and owner_person_id = public.access_current_person_id()
    and owner_business_id is null
    and owned_by_editorial = false
  );

create policy collaborations_insert_owner_business
  on public.collaborations
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and owner_business_id is not null
    and owner_person_id is null
    and owned_by_editorial = false
    and public.access_can_act_for_business(owner_business_id)
  );

create policy collaborations_insert_editorial
  on public.collaborations
  for insert
  to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and owned_by_editorial = true
    and owner_person_id is null
    and owner_business_id is null
  );

create policy collaborations_update_owner_person
  on public.collaborations
  for update
  to authenticated
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

create policy collaborations_update_owner_business
  on public.collaborations
  for update
  to authenticated
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

create policy collaborations_update_editorial
  on public.collaborations
  for update
  to authenticated
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
-- collaboration_participants — owned by collaboration
-- ---------------------------------------------------------------------------
grant select on table public.collaboration_participants to anon, authenticated;
grant insert, update on table public.collaboration_participants to authenticated;

create policy collaboration_participants_select_public
  on public.collaboration_participants for select to anon, authenticated
  using (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
        and c.editorial_status = 'published'
    )
  );

create policy collaboration_participants_select_owner
  on public.collaboration_participants for select to authenticated
  using (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
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

create policy collaboration_participants_insert_owner_person
  on public.collaboration_participants for insert to authenticated
  with check (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
        and public.access_is_active_account()
    )
  );

create policy collaboration_participants_insert_owner_business
  on public.collaboration_participants for insert to authenticated
  with check (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  );

create policy collaboration_participants_insert_editorial
  on public.collaboration_participants for insert to authenticated
  with check (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
        and public.access_is_active_account()
    )
  );

create policy collaboration_participants_update_owner_person
  on public.collaboration_participants for update to authenticated
  using (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
        and c.owner_person_id = public.access_current_person_id()
        and c.owned_by_editorial = false
    )
  )
  with check (collaboration_id = collaboration_id);

create policy collaboration_participants_update_owner_business
  on public.collaboration_participants for update to authenticated
  using (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
        and c.owner_business_id is not null
        and c.owned_by_editorial = false
        and public.access_can_act_for_business(c.owner_business_id)
    )
  )
  with check (collaboration_id = collaboration_id);

create policy collaboration_participants_update_editorial
  on public.collaboration_participants for update to authenticated
  using (
    exists (
      select 1 from public.collaborations as c
      where c.id = collaboration_participants.collaboration_id
        and c.owned_by_editorial = true
        and public.access_is_editor()
    )
  )
  with check (collaboration_id = collaboration_id);
