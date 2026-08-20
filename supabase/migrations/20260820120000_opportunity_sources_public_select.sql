-- D1-B.3 — Public SELECT on opportunity_sources for published sheets
--
-- Official URL / authority / attribution must be readable on public
-- /opportunita/[id] without widening write grants. Uses the existing
-- access_opportunity_is_public_published() helper (no RLS recursion).

grant select on table public.opportunity_sources to anon, authenticated;

drop policy if exists opportunity_sources_select_public on public.opportunity_sources;

create policy opportunity_sources_select_public
  on public.opportunity_sources
  for select
  to anon, authenticated
  using (
    public.access_opportunity_is_public_published(opportunity_id)
  );

comment on policy opportunity_sources_select_public on public.opportunity_sources is
  'D1-B.3: anon/authenticated may read sources only for published+public opportunities.';
