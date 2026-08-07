-- A5.3 — Access/RLS v1: Opportunità
-- Plan §8.3; A2 §18. Party-based access via opportunity_party_references; no owner_* on AR.
-- Public: publication_status='published' AND visibility_level='public'.
-- Out of scope: opportunity_* catalogs (A6.4); DELETE policies; Red curated (default no).

-- ---------------------------------------------------------------------------
-- opportunities — AR (party-based titolarità)
-- ---------------------------------------------------------------------------
grant select on table public.opportunities to anon, authenticated;
grant insert, update on table public.opportunities to authenticated;

create policy opportunities_select_public
  on public.opportunities
  for select
  to anon, authenticated
  using (
    publication_status = 'published'
    and visibility_level = 'public'
    and deleted_at is null
  );

create policy opportunities_select_party
  on public.opportunities
  for select
  to authenticated
  using (
    deleted_at is null
    and (
      exists (
        select 1
        from public.opportunity_party_references as pr
        where pr.opportunity_id = opportunities.id
          and (
            pr.person_id = public.access_current_person_id()
            or (
              pr.business_id is not null
              and (
                public.access_has_active_business_membership(pr.business_id)
                or public.access_can_act_for_business(pr.business_id)
              )
            )
          )
      )
      or exists (
        select 1
        from public.opportunity_representation_utilizations as ru
        join public.opportunity_party_references as pr on pr.id = ru.party_reference_id
        where ru.opportunity_id = opportunities.id
          and pr.person_id = public.access_current_person_id()
      )
    )
  );

create policy opportunities_insert_party
  on public.opportunities
  for insert
  to authenticated
  with check (
    public.access_is_active_account()
    and public.access_current_person_id() is not null
  );

create policy opportunities_update_party
  on public.opportunities
  for update
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunities.id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (
            pr.business_id is not null
            and public.access_can_act_for_business(pr.business_id)
          )
        )
    )
  )
  with check (
    deleted_at is null
    and exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunities.id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (
            pr.business_id is not null
            and public.access_can_act_for_business(pr.business_id)
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- opportunity_party_references — owned; write follows opportunity party manager
-- ---------------------------------------------------------------------------
grant select on table public.opportunity_party_references to authenticated;
grant insert, update on table public.opportunity_party_references to authenticated;

create policy opportunity_party_references_select_public
  on public.opportunity_party_references for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_party_references.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_party_references_select_party
  on public.opportunity_party_references for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_party_references.opportunity_id
        and o.deleted_at is null
        and (
          exists (
            select 1
            from public.opportunity_party_references as pr2
            where pr2.opportunity_id = o.id
              and (
                pr2.person_id = public.access_current_person_id()
                or (
                  pr2.business_id is not null
                  and (
                    public.access_has_active_business_membership(pr2.business_id)
                    or public.access_can_act_for_business(pr2.business_id)
                  )
                )
              )
          )
        )
    )
  );

create policy opportunity_party_references_insert_party
  on public.opportunity_party_references for insert to authenticated
  with check (
    public.access_is_active_account()
    and (
      exists (
        select 1
        from public.opportunity_party_references as pr
        where pr.opportunity_id = opportunity_party_references.opportunity_id
          and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
          and (
            pr.person_id = public.access_current_person_id()
            or (
              pr.business_id is not null
              and public.access_can_act_for_business(pr.business_id)
            )
          )
      )
      or (
        subject_kind = 'person'
        and person_id = public.access_current_person_id()
        and not exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = opportunity_party_references.opportunity_id
        )
      )
    )
  );

create policy opportunity_party_references_update_party
  on public.opportunity_party_references for update to authenticated
  using (
    exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_party_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (
            pr.business_id is not null
            and public.access_can_act_for_business(pr.business_id)
          )
        )
    )
  )
  with check (
    opportunity_id = opportunity_id
    and exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_party_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (
            pr.business_id is not null
            and public.access_can_act_for_business(pr.business_id)
          )
        )
    )
  );

-- ---------------------------------------------------------------------------
-- owned macro: public via parent opportunity; write via party manager
-- ---------------------------------------------------------------------------

-- opportunity_representation_utilizations
grant select on table public.opportunity_representation_utilizations to authenticated;
grant insert, update on table public.opportunity_representation_utilizations to authenticated;

create policy opportunity_representation_utilizations_select_public
  on public.opportunity_representation_utilizations for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_representation_utilizations.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_representation_utilizations_select_party
  on public.opportunity_representation_utilizations for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_representation_utilizations.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_representation_utilizations_insert_party
  on public.opportunity_representation_utilizations for insert to authenticated
  with check (
    exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_representation_utilizations.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (
            pr.business_id is not null
            and public.access_can_act_for_business(pr.business_id)
          )
        )
    )
  );

create policy opportunity_representation_utilizations_update_party
  on public.opportunity_representation_utilizations for update to authenticated
  using (
    exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_representation_utilizations.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (
            pr.business_id is not null
            and public.access_can_act_for_business(pr.business_id)
          )
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_requirements
grant select on table public.opportunity_requirements to anon, authenticated;
grant insert, update on table public.opportunity_requirements to authenticated;

create policy opportunity_requirements_select_public
  on public.opportunity_requirements for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_requirements.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_requirements_select_party
  on public.opportunity_requirements for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_requirements.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_requirements_insert_party
  on public.opportunity_requirements for insert to authenticated
  with check (
    exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_requirements.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_requirements_update_party
  on public.opportunity_requirements for update to authenticated
  using (
    exists (
      select 1
      from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_requirements.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_benefits
grant select on table public.opportunity_benefits to anon, authenticated;
grant insert, update on table public.opportunity_benefits to authenticated;

create policy opportunity_benefits_select_public
  on public.opportunity_benefits for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_benefits.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_benefits_select_party
  on public.opportunity_benefits for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_benefits.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_benefits_insert_party
  on public.opportunity_benefits for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_benefits.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_benefits_update_party
  on public.opportunity_benefits for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_benefits.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_time_windows
grant select on table public.opportunity_time_windows to anon, authenticated;
grant insert, update on table public.opportunity_time_windows to authenticated;

create policy opportunity_time_windows_select_public
  on public.opportunity_time_windows for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_time_windows.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_time_windows_select_party
  on public.opportunity_time_windows for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_time_windows.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_time_windows_insert_party
  on public.opportunity_time_windows for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_time_windows.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_time_windows_update_party
  on public.opportunity_time_windows for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_time_windows.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_access_procedures
grant select on table public.opportunity_access_procedures to anon, authenticated;
grant insert, update on table public.opportunity_access_procedures to authenticated;

create policy opportunity_access_procedures_select_public
  on public.opportunity_access_procedures for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_access_procedures.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_access_procedures_select_party
  on public.opportunity_access_procedures for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_access_procedures.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_access_procedures_insert_party
  on public.opportunity_access_procedures for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_access_procedures.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_access_procedures_update_party
  on public.opportunity_access_procedures for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_access_procedures.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_access_mode_assignments
grant select on table public.opportunity_access_mode_assignments to anon, authenticated;
grant insert, update on table public.opportunity_access_mode_assignments to authenticated;

create policy opportunity_access_mode_assignments_select_public
  on public.opportunity_access_mode_assignments for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_access_mode_assignments.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_access_mode_assignments_select_party
  on public.opportunity_access_mode_assignments for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_access_mode_assignments.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_access_mode_assignments_insert_party
  on public.opportunity_access_mode_assignments for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_access_mode_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_access_mode_assignments_update_party
  on public.opportunity_access_mode_assignments for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_access_mode_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_audience_type_assignments
grant select on table public.opportunity_audience_type_assignments to anon, authenticated;
grant insert, update on table public.opportunity_audience_type_assignments to authenticated;

create policy opportunity_audience_type_assignments_select_public
  on public.opportunity_audience_type_assignments for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_audience_type_assignments.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_audience_type_assignments_select_party
  on public.opportunity_audience_type_assignments for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_audience_type_assignments.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_audience_type_assignments_insert_party
  on public.opportunity_audience_type_assignments for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_audience_type_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_audience_type_assignments_update_party
  on public.opportunity_audience_type_assignments for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_audience_type_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_type_assignments
grant select on table public.opportunity_type_assignments to anon, authenticated;
grant insert, update on table public.opportunity_type_assignments to authenticated;

create policy opportunity_type_assignments_select_public
  on public.opportunity_type_assignments for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_type_assignments.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_type_assignments_select_party
  on public.opportunity_type_assignments for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_type_assignments.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_type_assignments_insert_party
  on public.opportunity_type_assignments for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_type_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_type_assignments_update_party
  on public.opportunity_type_assignments for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_type_assignments.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_professional_references
grant select on table public.opportunity_professional_references to anon, authenticated;
grant insert, update on table public.opportunity_professional_references to authenticated;

create policy opportunity_professional_references_select_public
  on public.opportunity_professional_references for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_professional_references.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_professional_references_select_party
  on public.opportunity_professional_references for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_professional_references.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_professional_references_insert_party
  on public.opportunity_professional_references for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_professional_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_professional_references_update_party
  on public.opportunity_professional_references for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_professional_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_market_references
grant select on table public.opportunity_market_references to anon, authenticated;
grant insert, update on table public.opportunity_market_references to authenticated;

create policy opportunity_market_references_select_public
  on public.opportunity_market_references for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_market_references.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_market_references_select_party
  on public.opportunity_market_references for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_market_references.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_market_references_insert_party
  on public.opportunity_market_references for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_market_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_market_references_update_party
  on public.opportunity_market_references for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_market_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- opportunity_sector_references
grant select on table public.opportunity_sector_references to anon, authenticated;
grant insert, update on table public.opportunity_sector_references to authenticated;

create policy opportunity_sector_references_select_public
  on public.opportunity_sector_references for select to anon, authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_sector_references.opportunity_id
        and o.publication_status = 'published'
        and o.visibility_level = 'public'
        and o.deleted_at is null
    )
  );

create policy opportunity_sector_references_select_party
  on public.opportunity_sector_references for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_sector_references.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_sector_references_insert_party
  on public.opportunity_sector_references for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_sector_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_sector_references_update_party
  on public.opportunity_sector_references for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_sector_references.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

-- ---------------------------------------------------------------------------
-- restricted owned: sources, evidences, verifications (party only, not public)
-- ---------------------------------------------------------------------------
grant select on table public.opportunity_sources to authenticated;
grant insert, update on table public.opportunity_sources to authenticated;

create policy opportunity_sources_select_party
  on public.opportunity_sources for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_sources.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_sources_insert_party
  on public.opportunity_sources for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_sources.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_sources_update_party
  on public.opportunity_sources for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_sources.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

grant select on table public.opportunity_evidences to authenticated;
grant insert, update on table public.opportunity_evidences to authenticated;

create policy opportunity_evidences_select_party
  on public.opportunity_evidences for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_evidences.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_evidences_insert_party
  on public.opportunity_evidences for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_evidences.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_evidences_update_party
  on public.opportunity_evidences for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_evidences.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);

grant select on table public.opportunity_verifications to authenticated;
grant insert, update on table public.opportunity_verifications to authenticated;

create policy opportunity_verifications_select_party
  on public.opportunity_verifications for select to authenticated
  using (
    exists (
      select 1 from public.opportunities as o
      where o.id = opportunity_verifications.opportunity_id
        and o.deleted_at is null
        and exists (
          select 1 from public.opportunity_party_references as pr
          where pr.opportunity_id = o.id
            and (
              pr.person_id = public.access_current_person_id()
              or (
                pr.business_id is not null
                and (
                  public.access_has_active_business_membership(pr.business_id)
                  or public.access_can_act_for_business(pr.business_id)
                )
              )
            )
        )
    )
  );

create policy opportunity_verifications_insert_party
  on public.opportunity_verifications for insert to authenticated
  with check (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_verifications.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  );

create policy opportunity_verifications_update_party
  on public.opportunity_verifications for update to authenticated
  using (
    exists (
      select 1 from public.opportunity_party_references as pr
      where pr.opportunity_id = opportunity_verifications.opportunity_id
        and pr.role in ('publisher', 'manager', 'promoter', 'signaler')
        and (
          pr.person_id = public.access_current_person_id()
          or (pr.business_id is not null and public.access_can_act_for_business(pr.business_id))
        )
    )
  )
  with check (opportunity_id = opportunity_id);
