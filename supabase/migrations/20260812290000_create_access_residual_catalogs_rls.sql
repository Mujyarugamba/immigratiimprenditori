-- A6.4 — Access/RLS v1: cataloghi residui
-- Plan §9.4 / §12. SELECT public is_active; REVOKE write authenticated.
-- Covers: content_*, organization_*, professional_*, opportunity_* catalogs.
-- Out of scope: training_*; foundation (A4.6); service/event/MI catalogs in A5.

-- content_types
revoke all on table public.content_types from anon, authenticated;
grant select on table public.content_types to anon, authenticated;

create policy content_types_select_public
  on public.content_types for select to anon, authenticated
  using (is_active = true);

-- content_categories
revoke all on table public.content_categories from anon, authenticated;
grant select on table public.content_categories to anon, authenticated;

create policy content_categories_select_public
  on public.content_categories for select to anon, authenticated
  using (is_active = true);

-- content_tags
revoke all on table public.content_tags from anon, authenticated;
grant select on table public.content_tags to anon, authenticated;

create policy content_tags_select_public
  on public.content_tags for select to anon, authenticated
  using (is_active = true);

-- organization_types
revoke all on table public.organization_types from anon, authenticated;
grant select on table public.organization_types to anon, authenticated;

create policy organization_types_select_public
  on public.organization_types for select to anon, authenticated
  using (is_active = true);

-- organization_activity_scopes
revoke all on table public.organization_activity_scopes from anon, authenticated;
grant select on table public.organization_activity_scopes to anon, authenticated;

create policy organization_activity_scopes_select_public
  on public.organization_activity_scopes for select to anon, authenticated
  using (is_active = true);

-- professional_categories
revoke all on table public.professional_categories from anon, authenticated;
grant select on table public.professional_categories to anon, authenticated;

create policy professional_categories_select_public
  on public.professional_categories for select to anon, authenticated
  using (is_active = true);

-- professional_practice_modes
revoke all on table public.professional_practice_modes from anon, authenticated;
grant select on table public.professional_practice_modes to anon, authenticated;

create policy professional_practice_modes_select_public
  on public.professional_practice_modes for select to anon, authenticated
  using (is_active = true);

-- professional_service_natures
revoke all on table public.professional_service_natures from anon, authenticated;
grant select on table public.professional_service_natures to anon, authenticated;

create policy professional_service_natures_select_public
  on public.professional_service_natures for select to anon, authenticated
  using (is_active = true);

-- professional_source_kinds
revoke all on table public.professional_source_kinds from anon, authenticated;
grant select on table public.professional_source_kinds to anon, authenticated;

create policy professional_source_kinds_select_public
  on public.professional_source_kinds for select to anon, authenticated
  using (is_active = true);

-- opportunity_types
revoke all on table public.opportunity_types from anon, authenticated;
grant select on table public.opportunity_types to anon, authenticated;

create policy opportunity_types_select_public
  on public.opportunity_types for select to anon, authenticated
  using (is_active = true);

-- opportunity_access_modes
revoke all on table public.opportunity_access_modes from anon, authenticated;
grant select on table public.opportunity_access_modes to anon, authenticated;

create policy opportunity_access_modes_select_public
  on public.opportunity_access_modes for select to anon, authenticated
  using (is_active = true);

-- opportunity_audience_types
revoke all on table public.opportunity_audience_types from anon, authenticated;
grant select on table public.opportunity_audience_types to anon, authenticated;

create policy opportunity_audience_types_select_public
  on public.opportunity_audience_types for select to anon, authenticated
  using (is_active = true);
