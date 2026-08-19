begin;

-- Explicit grants for the editorial foundation. Supabase default privileges may
-- otherwise leave TRUNCATE/TRIGGER/REFERENCES privileges on new public tables.
revoke all on table
  public.geo_territories,
  public.migration_routes,
  public.content_geographies,
  public.content_routes,
  public.event_geographies,
  public.event_routes,
  public.editorial_inbox_items,
  public.editorial_submissions,
  public.editorial_inbox_activity
from anon, authenticated;

grant select on table
  public.geo_territories,
  public.migration_routes,
  public.content_geographies,
  public.content_routes,
  public.event_geographies,
  public.event_routes
  to anon, authenticated;

grant insert, update, delete on table
  public.geo_territories,
  public.migration_routes,
  public.content_geographies,
  public.content_routes,
  public.event_geographies,
  public.event_routes
  to authenticated;

grant select, insert, update, delete on table
  public.editorial_inbox_items,
  public.editorial_submissions
  to authenticated;

grant select on table public.editorial_inbox_activity to authenticated;

commit;
