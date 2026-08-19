-- D1-C.4 — Mercati internazionali: editor/admin SELECT on review-only rows
--
-- Gap (D1-C.3): international_market_support_resources / markets / countries
-- only expose public SELECT (visibility=public ∧ market published). Editors
-- had INSERT/UPDATE but could not SELECT drafting/review-only rows via
-- the session client — blocking /app/redazione Mercati.
--
-- Principle: editor OR application_admin + active account may SELECT for
-- redazione; ordinary authenticated / anon unchanged; no DELETE grants;
-- service_role not widened. Parallel admin UPDATE so Adm can publish via UI
-- (requireEditor allows admin; prior UPDATE policies were editor-only).

-- ---------------------------------------------------------------------------
-- international_markets
-- ---------------------------------------------------------------------------
create policy international_markets_select_editorial
  on public.international_markets
  for select
  to authenticated
  using (
    public.access_is_active_account()
    and (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
  );

create policy international_markets_update_admin
  on public.international_markets
  for update
  to authenticated
  using (
    public.access_is_application_admin()
    and public.access_is_active_account()
  )
  with check (
    public.access_is_application_admin()
    and public.access_is_active_account()
  );

-- ---------------------------------------------------------------------------
-- international_market_countries
-- ---------------------------------------------------------------------------
create policy international_market_countries_select_editorial
  on public.international_market_countries
  for select
  to authenticated
  using (
    public.access_is_active_account()
    and (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
  );

create policy international_market_countries_update_admin
  on public.international_market_countries
  for update
  to authenticated
  using (
    public.access_is_application_admin()
    and public.access_is_active_account()
  )
  with check (
    public.access_is_application_admin()
    and public.access_is_active_account()
    and market_id = market_id
  );

-- ---------------------------------------------------------------------------
-- international_market_support_resources
-- ---------------------------------------------------------------------------
create policy international_market_support_resources_select_editorial
  on public.international_market_support_resources
  for select
  to authenticated
  using (
    public.access_is_active_account()
    and (
      public.access_is_editor()
      or public.access_is_application_admin()
    )
  );

create policy international_market_support_resources_update_admin
  on public.international_market_support_resources
  for update
  to authenticated
  using (
    public.access_is_application_admin()
    and public.access_is_active_account()
  )
  with check (
    public.access_is_application_admin()
    and public.access_is_active_account()
    and market_id = market_id
  );
