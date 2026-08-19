-- Post-split self-delete hardening: remove inherited/default EXECUTE from anonymous/public.
revoke execute on function public.access_self_delete_preflight() from public, anon;
revoke execute on function public.access_self_close_account() from public, anon;
grant execute on function public.access_self_delete_preflight() to authenticated;
grant execute on function public.access_self_close_account() to authenticated;
