-- Restore the intended public contributor/profile surface without exposing
-- private account fields. RLS already limits anon rows to public + active +
-- non-deleted profiles; this migration grants only the columns required by
-- the public contributor page and contributor sitemap.

begin;

-- Never give anon table-wide SELECT on profiles: the table also contains
-- private fields such as phone and internal identifiers.
revoke select on table public.profiles from anon;

-- Defensive revokes in case a previous environment accumulated column grants.
revoke select (id, phone, created_at) on public.profiles from anon;

-- Public presentation fields used by /contributori/[slug] and
-- /sitemap-contributors.xml. RLS still controls which rows are visible.
grant select (
  display_name,
  slug,
  bio,
  organization_name,
  organization_type,
  role_description,
  city,
  province,
  region,
  country,
  website,
  avatar_url,
  is_active,
  updated_at,
  is_public,
  published_at,
  deleted_at
) on public.profiles to anon;

-- Fail closed if the intended privilege boundary is not exactly present.
do $$
begin
  if has_table_privilege('anon', 'public.profiles', 'select') then
    raise exception 'anon must not have table-wide SELECT on public.profiles';
  end if;

  if not has_column_privilege('anon', 'public.profiles', 'slug', 'select')
     or not has_column_privilege('anon', 'public.profiles', 'display_name', 'select')
     or not has_column_privilege('anon', 'public.profiles', 'is_public', 'select')
     or not has_column_privilege('anon', 'public.profiles', 'is_active', 'select')
     or not has_column_privilege('anon', 'public.profiles', 'deleted_at', 'select')
     or not has_column_privilege('anon', 'public.profiles', 'published_at', 'select')
     or not has_column_privilege('anon', 'public.profiles', 'updated_at', 'select') then
    raise exception 'anon is missing required public profile SELECT columns';
  end if;

  if has_column_privilege('anon', 'public.profiles', 'phone', 'select')
     or has_column_privilege('anon', 'public.profiles', 'id', 'select')
     or has_column_privilege('anon', 'public.profiles', 'created_at', 'select') then
    raise exception 'anon unexpectedly has SELECT on private profile columns';
  end if;
end
$$;

commit;
