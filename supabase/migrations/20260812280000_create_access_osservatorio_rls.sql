-- A6.3 — Access/RLS v1: Osservatorio
-- Plan §9.3; A2 §15. Red CRUD; Adm without Red deny write; values subordinate to indicators.
-- Out of scope: training_*; DELETE policies.

-- ---------------------------------------------------------------------------
-- observatory_indicators — AR (implicit editorial ownership)
-- ---------------------------------------------------------------------------
grant select on table public.observatory_indicators to anon, authenticated;
grant insert, update on table public.observatory_indicators to authenticated;

create policy observatory_indicators_select_public
  on public.observatory_indicators for select to anon, authenticated
  using (publication_status = 'published');

create policy observatory_indicators_select_editorial
  on public.observatory_indicators for select to authenticated
  using (public.access_is_editor());

create policy observatory_indicators_insert_editorial
  on public.observatory_indicators for insert to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
  );

create policy observatory_indicators_update_editorial
  on public.observatory_indicators for update to authenticated
  using (
    public.access_is_editor()
    and public.access_is_active_account()
  )
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
  );

-- ---------------------------------------------------------------------------
-- observatory_statistical_sources — shared provenance (SELECT public active)
-- ---------------------------------------------------------------------------
grant select on table public.observatory_statistical_sources to anon, authenticated;
grant insert, update on table public.observatory_statistical_sources to authenticated;

create policy observatory_statistical_sources_select_public
  on public.observatory_statistical_sources for select to anon, authenticated
  using (lifecycle_status = 'active');

create policy observatory_statistical_sources_select_editorial
  on public.observatory_statistical_sources for select to authenticated
  using (public.access_is_editor());

create policy observatory_statistical_sources_insert_editorial
  on public.observatory_statistical_sources for insert to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
  );

create policy observatory_statistical_sources_update_editorial
  on public.observatory_statistical_sources for update to authenticated
  using (
    public.access_is_editor()
    and public.access_is_active_account()
  )
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
  );

-- ---------------------------------------------------------------------------
-- observatory_indicator_values — owned by indicator
-- ---------------------------------------------------------------------------
grant select on table public.observatory_indicator_values to anon, authenticated;
grant insert, update on table public.observatory_indicator_values to authenticated;

create policy observatory_indicator_values_select_public
  on public.observatory_indicator_values for select to anon, authenticated
  using (
    published_at is not null
    and status <> 'withdrawn'
    and exists (
      select 1 from public.observatory_indicators as i
      where i.id = observatory_indicator_values.indicator_id
        and i.publication_status = 'published'
    )
  );

create policy observatory_indicator_values_select_editorial
  on public.observatory_indicator_values for select to authenticated
  using (public.access_is_editor());

create policy observatory_indicator_values_insert_editorial
  on public.observatory_indicator_values for insert to authenticated
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and exists (
      select 1 from public.observatory_indicators as i
      where i.id = observatory_indicator_values.indicator_id
    )
  );

create policy observatory_indicator_values_update_editorial
  on public.observatory_indicator_values for update to authenticated
  using (
    public.access_is_editor()
    and public.access_is_active_account()
  )
  with check (
    public.access_is_editor()
    and public.access_is_active_account()
    and indicator_id = indicator_id
  );
