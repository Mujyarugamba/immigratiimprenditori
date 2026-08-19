begin;

revoke select on table public.content_media from anon;

grant select (
  id,
  content_id,
  media_kind,
  provider,
  external_id,
  url,
  title,
  caption,
  is_primary,
  sort_order,
  created_at,
  updated_at
) on table public.content_media to anon;

-- Authenticated editorial users retain full SELECT under RLS.
grant select on table public.content_media to authenticated;

commit;
