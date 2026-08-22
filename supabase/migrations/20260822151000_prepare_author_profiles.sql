-- Stable author/contributor identity layer for publications and research outputs.
-- Prepared only; do not expose public author profiles until identities are reviewed
-- and the linked profile has substantive public information.

create table if not exists public.author_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_name text not null check (length(btrim(display_name)) > 0),
  profile_kind text not null check (profile_kind in ('person','organization','editorial_group')),
  bio text null check (bio is null or length(btrim(bio)) > 0),
  affiliation text null check (affiliation is null or length(btrim(affiliation)) > 0),
  orcid text null check (orcid is null or orcid ~ '^0000-[0-9]{4}-[0-9]{4}-[0-9]{3}[0-9X]$'),
  website_url text null check (website_url is null or length(btrim(website_url)) > 0),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_authors
  add column if not exists author_profile_id uuid null
  references public.author_profiles(id) on delete set null;

create index if not exists content_authors_author_profile_idx
  on public.content_authors(author_profile_id)
  where author_profile_id is not null;

alter table public.author_profiles enable row level security;

drop policy if exists author_profiles_public_read on public.author_profiles;
create policy author_profiles_public_read
on public.author_profiles for select to public
using (is_public or access_is_editor() or access_is_application_admin());

drop policy if exists author_profiles_editor_all on public.author_profiles;
create policy author_profiles_editor_all
on public.author_profiles for all to authenticated
using (access_is_editor() or access_is_application_admin())
with check (access_is_editor() or access_is_application_admin());

grant select on public.author_profiles to anon, authenticated;
grant insert, update, delete on public.author_profiles to authenticated;

comment on table public.author_profiles is
  'Reviewed stable identities for people, organizations and editorial groups credited as authors or contributors.';
comment on column public.author_profiles.orcid is
  'ORCID for person profiles only; editorial validation must enforce semantic applicability.';
