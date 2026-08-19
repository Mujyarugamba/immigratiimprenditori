begin;

revoke insert, update, delete, truncate, references, trigger
on table public.content_media
from anon;

revoke truncate, references, trigger
on table public.content_media
from authenticated;

grant select on table public.content_media to anon, authenticated;
grant insert, update, delete on table public.content_media to authenticated;

commit;
