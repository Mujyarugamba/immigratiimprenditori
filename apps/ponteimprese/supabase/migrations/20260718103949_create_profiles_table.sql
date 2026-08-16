-- Create public.profiles, linked 1:1 to auth.users, with RLS policies and
-- triggers to keep updated_at in sync and to auto-provision a profile row
-- whenever a new user signs up.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  slug text not null unique,
  bio text,
  organization_name text,
  organization_type text,
  role_description text,
  city text,
  province text,
  region text,
  country text not null default 'Italia',
  website text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- organization_type stays optional: NULL is allowed, only non-null values
  -- are restricted to this list.
  constraint profiles_organization_type_check check (
    organization_type is null
    or organization_type in (
      'company',
      'professional',
      'association',
      'institution',
      'embassy',
      'consulate',
      'chamber_of_commerce',
      'foundation',
      'cooperative',
      'public_body',
      'other'
    )
  ),
  constraint profiles_slug_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

comment on table public.profiles is
  'Public profile data for each auth.users account.';

-- B-tree lookup indexes (slug already has one via its unique constraint).
create index profiles_display_name_idx on public.profiles using btree (display_name);

create index profiles_organization_name_idx on public.profiles using btree (organization_name);

create index profiles_city_idx on public.profiles using btree (city);

create index profiles_organization_type_idx on public.profiles using btree (organization_type);

alter table public.profiles enable row level security;

-- Anyone (including anonymous visitors) can read active profiles only.
create policy "Public can view active profiles"
  on public.profiles
  for select
  to public
  using (is_active = true);

-- An authenticated user can always read their own profile, even when it has
-- been deactivated (is_active = false).
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid () = id);

-- An authenticated user may update only their own profile row. The column
-- grants below further restrict this to descriptive fields only: rows are
-- never inserted or deleted directly by end users, and technical columns
-- (id, is_active, created_at, updated_at) stay out of reach even on their
-- own row.
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid () = id)
  with check (auth.uid () = id);

grant select on public.profiles to anon, authenticated;

revoke insert, update, delete on public.profiles from authenticated;

grant update (
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
  phone,
  avatar_url
) on public.profiles to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_profiles_updated_at ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at ();

-- Auto-provisions a profile row for every new auth.users account, deriving
-- a display name and a unique slug so the row is always valid immediately.
-- security definer is required because this function must write to
-- public.profiles on behalf of the auth schema trigger, bypassing RLS.
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uuid_suffix text;
  v_display_name text;
  v_slug_base text;
  v_slug text;
begin
  v_uuid_suffix := substring(new.id::text from 1 for 8);

  -- display_name priority: full_name from metadata, then the email's local
  -- part, then a generic fallback built from the user's UUID.
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(split_part(new.email, '@', 1)), ''),
    'utente-' || v_uuid_suffix
  );

  -- slug base: display_name lowercased, non-alphanumeric runs collapsed to
  -- a single hyphen, then leading/trailing hyphens stripped.
  v_slug_base := lower(v_display_name);
  v_slug_base := regexp_replace(v_slug_base, '[^a-z0-9]+', '-', 'g');
  v_slug_base := regexp_replace(v_slug_base, '^-+|-+$', '', 'g');

  -- The UUID suffix is always appended to guarantee uniqueness, even when
  -- two users share the same display name.
  if v_slug_base is null or v_slug_base = '' then
    v_slug := 'utente-' || v_uuid_suffix;
  else
    v_slug := v_slug_base || '-' || v_uuid_suffix;
  end if;

  insert into public.profiles (id, display_name, slug)
  values (new.id, v_display_name, v_slug);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user ();

-- Normalizes any manually inserted/updated slug (lowercase, single hyphens,
-- no leading/trailing hyphens). Does not append the UUID suffix and leaves
-- NULL untouched, unlike the auto-provisioning logic above.
create or replace function public.normalize_profile_slug ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.slug is null then
    return new;
  end if;

  new.slug := lower(new.slug);
  new.slug := regexp_replace(new.slug, '[^a-z0-9]+', '-', 'g');
  new.slug := regexp_replace(new.slug, '^-+|-+$', '', 'g');

  return new;
end;
$$;

create trigger profiles_normalize_slug
before insert or update on public.profiles
for each row
execute function public.normalize_profile_slug ();
