-- Public-read policies must never require EXECUTE on privileged role helpers.
-- MFA hardening intentionally restricts access_is_editor/access_is_application_admin
-- to authenticated users. Public rows are therefore exposed by pure public
-- predicates; the existing authenticated editor ALL policies remain responsible
-- for access to inactive/non-public rows.

begin;

drop policy if exists geo_territories_public_read on public.geo_territories;
create policy geo_territories_public_read
on public.geo_territories
for select
to anon, authenticated
using (is_active);

drop policy if exists migration_routes_public_read on public.migration_routes;
create policy migration_routes_public_read
on public.migration_routes
for select
to anon, authenticated
using (is_active);

drop policy if exists author_profiles_public_read on public.author_profiles;
create policy author_profiles_public_read
on public.author_profiles
for select
to anon, authenticated
using (is_public);

-- Keep the privileged helpers non-callable by anonymous visitors. Public access
-- must remain possible without relaxing the MFA authorization boundary.
revoke all on function public.access_is_editor() from anon;
revoke all on function public.access_is_application_admin() from anon;

commit;
