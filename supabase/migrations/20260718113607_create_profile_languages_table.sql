-- Create public.profile_languages, linking profiles to the business
-- languages (public.languages) they know, use in their professional or
-- entrepreneurial activity, or use to assist clients. Translation and
-- interpreting services between language pairs are handled separately by
-- public.profile_language_services. This table is unrelated to the site's
-- interface languages, which are not managed here either.

create table public.profile_languages (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  language_id bigint not null references public.languages (id) on delete restrict,
  proficiency_level text,
  is_working_language boolean not null default true,
  can_assist_clients boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, language_id),
  -- proficiency_level stays optional: not every profile (e.g. a business or
  -- institution) has a personal language proficiency to report.
  constraint profile_languages_proficiency_level_check check (
    proficiency_level is null
    or proficiency_level in (
      'native',
      'fluent',
      'professional',
      'intermediate',
      'basic'
    )
  ),
  -- Prevents a row that carries no actual meaning: at least one of these
  -- signals must be present for the relation to say anything useful.
  constraint profile_languages_has_usage_check check (
    proficiency_level is not null
    or is_working_language = true
    or can_assist_clients = true
  )
);

comment on table public.profile_languages is
  'Business languages known by a profile: professional/entrepreneurial working languages and client assistance. Does not represent translation or interpreting services (see public.profile_language_services) nor the site''s interface languages.';

comment on column public.profile_languages.proficiency_level is
  'Personal proficiency in the language, when applicable to a person or professional: native, fluent, professional, intermediate or basic. NULL when not applicable (e.g. a business or institution).';

comment on column public.profile_languages.is_working_language is
  'True when the language is normally used in the profile''s professional or entrepreneurial activity.';

comment on column public.profile_languages.can_assist_clients is
  'True when the profile can provide client assistance or support in this language.';

-- The composite primary key already indexes profile_id (as its leading
-- column); the indexes below cover the remaining lookup patterns.
create index profile_languages_language_id_idx on public.profile_languages using btree (language_id);

create index profile_languages_proficiency_level_idx on public.profile_languages using btree (proficiency_level);

create index profile_languages_client_assistance_idx on public.profile_languages using btree (language_id)
where
  can_assist_clients = true;

alter table public.profile_languages enable row level security;

-- 1. Publicly readable only when both the linked profile and the linked
-- language are active.
create policy "Public can view languages of active profiles"
  on public.profile_languages
  for select
  to public
  using (
    exists (
      select 1
      from public.profiles p
      where
        p.id = profile_languages.profile_id
        and p.is_active = true
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = profile_languages.language_id
        and l.is_active = true
    )
  );

-- 2. A user can always read their own profile's languages, even when the
-- profile is inactive or not otherwise publicly visible.
create policy "Users can view their own profile languages"
  on public.profile_languages
  for select
  to authenticated
  using (auth.uid () = profile_id);

-- 3. A user may add languages only to their own profile, and only for
-- languages that are currently active.
create policy "Users can add their own profile languages"
  on public.profile_languages
  for insert
  to authenticated
  with check (
    auth.uid () = profile_id
    and exists (
      select 1
      from public.languages l
      where
        l.id = language_id
        and l.is_active = true
    )
  );

-- 4. A user may update only their own profile's languages, and the
-- language referenced after the update must still be active.
create policy "Users can update their own profile languages"
  on public.profile_languages
  for update
  to authenticated
  using (auth.uid () = profile_id)
  with check (
    auth.uid () = profile_id
    and exists (
      select 1
      from public.languages l
      where
        l.id = language_id
        and l.is_active = true
    )
  );

-- 5. A user may delete only their own profile's languages.
create policy "Users can delete their own profile languages"
  on public.profile_languages
  for delete
  to authenticated
  using (auth.uid () = profile_id);

grant select on public.profile_languages to anon;

grant select, insert, update, delete on public.profile_languages to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_profile_languages_updated_at ()
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

create trigger profile_languages_set_updated_at
before update on public.profile_languages
for each row
execute function public.set_profile_languages_updated_at ();
