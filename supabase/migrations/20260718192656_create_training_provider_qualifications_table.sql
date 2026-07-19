-- Create public.training_provider_qualifications: self-declared
-- qualifications/accreditations of a profile to deliver a given training
-- course type, e.g. "Formatore qualificato per la formazione rischio alto,
-- accordo con Ente XYZ".
--
-- WHAT THIS IS, AND WHAT IT IS NOT: this table only records a DECLARATION
-- by the profile itself. It does not implement certification, document
-- upload/storage, or any administrative verification workflow - those are
-- explicitly out of scope for this migration and would require a
-- follow-up, human-reviewed process. verification_status starts at
-- 'declared' and can only move to 'under_review', 'verified', 'rejected'
-- or 'expired' through administrative action (service role), never by the
-- profile itself: regular users are only granted INSERT/UPDATE on the
-- declarative columns (qualification_name, issuing_body, notes,
-- course_type_id), not on verification_status or verified_at. No profile
-- is ever automatically treated as a verified training body just by
-- declaring itself as one.
--
-- A single training_provider_profiles "extension" table (one row per
-- provider with an overall status) was considered but not created
-- separately: public.profiles already distinguishes subject types via
-- organization_type, and a course-type-scoped qualification is the
-- concrete unit that actually matters for search (e.g. "formatore
-- qualificato per rischio alto"), so a single, per-qualification table
-- covers the requirement without adding a redundant 1:1 table.

create table public.training_provider_qualifications (
  id uuid primary key default gen_random_uuid (),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  course_type_id bigint not null references public.training_course_types (id) on delete restrict,
  qualification_name text not null,
  issuing_body text,
  verification_status text not null default 'declared',
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_provider_qualifications_name_not_blank_check check (length(trim(qualification_name)) > 0),
  constraint training_provider_qualifications_status_check check (
    verification_status in ('declared', 'under_review', 'verified', 'rejected', 'expired')
  ),
  -- A verification timestamp only makes sense once a qualification has
  -- actually been verified (or has lapsed after having been verified).
  constraint training_provider_qualifications_verified_at_check check (
    verified_at is null
    or verification_status in ('verified', 'expired')
  )
);

comment on table public.training_provider_qualifications is
  'Self-declared qualifications of a profile (public.profiles) to deliver a given training course type (public.training_course_types). Declarative only: verification_status defaults to declared and can only be advanced by administrative review (service role), never by the profile itself.';

comment on column public.training_provider_qualifications.profile_id is
  'The profile declaring the qualification. Generic reference to public.profiles: may be a training body, freelance trainer, safety consultant or enterprise, not only an individual.';

comment on column public.training_provider_qualifications.course_type_id is
  'The training course type (see public.training_course_types) this qualification applies to.';

comment on column public.training_provider_qualifications.qualification_name is
  'Free-form name of the declared qualification/accreditation, e.g. "Formatore qualificato Accordo Stato-Regioni".';

comment on column public.training_provider_qualifications.issuing_body is
  'Optional free-form name of the body that issued or accredited the qualification, as declared by the profile.';

comment on column public.training_provider_qualifications.verification_status is
  'declared (self-reported, default; not yet reviewed), under_review (administrative review in progress), verified (confirmed by the platform), rejected (review did not confirm the declaration), expired (was verified but is no longer current). Regular users cannot set this column directly (see grants below); only declared is reachable by a normal INSERT.';

comment on column public.training_provider_qualifications.verified_at is
  'When the qualification was last confirmed as verified, set only through administrative review. NULL unless verification_status is verified or expired.';

-- Covers "qualifications of a profile" (leftmost prefix).
create index training_provider_qualifications_profile_idx on public.training_provider_qualifications using btree (profile_id);

-- Covers "profiles qualified for a course type" and, combined, "verified
-- providers qualified for a course type" (e.g. formatori qualificati per
-- rischio alto).
create index training_provider_qualifications_course_type_status_idx on public.training_provider_qualifications using btree (course_type_id, verification_status);

-- Validates that the referenced course type is active. A plain CHECK
-- cannot query another table, hence the trigger.
create or replace function public.validate_training_provider_qualification ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.training_course_types
    where id = new.course_type_id and is_active = true
  ) then
    raise exception 'course_type_id % is unknown or not active', new.course_type_id;
  end if;

  return new;
end;
$$;

create trigger training_provider_qualifications_validate
before insert or update on public.training_provider_qualifications
for each row
execute function public.validate_training_provider_qualification ();

alter table public.training_provider_qualifications enable row level security;

-- 1. Publicly readable only when not rejected/expired, the profile is
-- published (is_public = true, is_active = true, deleted_at is null, the
-- unified visibility formula used across the Persone domain) and the
-- course type is active. Rejected/expired declarations are not shown
-- publicly.
create policy "Public can view standing qualifications of active profiles"
  on public.training_provider_qualifications
  for select
  to public
  using (
    verification_status in ('declared', 'under_review', 'verified')
    and exists (
      select 1
      from public.profiles p
      where
        p.id = training_provider_qualifications.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
    and exists (
      select 1
      from public.training_course_types t
      where
        t.id = training_provider_qualifications.course_type_id
        and t.is_active = true
    )
  );

-- 2. A profile can always see its own declared qualifications, whatever
-- their status.
create policy "Users can view their own provider qualifications"
  on public.training_provider_qualifications
  for select
  to authenticated
  using (auth.uid () = profile_id);

-- 3. A user may declare a qualification only for their own profile, and
-- only starting at the default 'declared' status: they cannot self-assign
-- 'verified' (also enforced by the column grants below).
create policy "Users can add their own provider qualifications"
  on public.training_provider_qualifications
  for insert
  to authenticated
  with check (
    auth.uid () = profile_id
    and verification_status = 'declared'
  );

-- 4. A user may update only their own declarations, and only while they
-- remain at 'declared' (they cannot move their own row into 'verified' or
-- out of a status set administratively).
create policy "Users can update their own provider qualifications"
  on public.training_provider_qualifications
  for update
  to authenticated
  using (auth.uid () = profile_id)
  with check (
    auth.uid () = profile_id
    and verification_status = 'declared'
  );

-- 5. A user may delete only their own declarations.
create policy "Users can delete their own provider qualifications"
  on public.training_provider_qualifications
  for delete
  to authenticated
  using (auth.uid () = profile_id);

grant select on public.training_provider_qualifications to anon;

grant select, delete on public.training_provider_qualifications to authenticated;

-- Column-level grants: regular users can declare/edit the descriptive
-- content of a qualification, but can never write verification_status or
-- verified_at directly - those are only reachable via the service role
-- during administrative review.
grant insert (
  profile_id,
  course_type_id,
  qualification_name,
  issuing_body,
  notes
) on public.training_provider_qualifications to authenticated;

grant update (
  course_type_id,
  qualification_name,
  issuing_body,
  notes
) on public.training_provider_qualifications to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_training_provider_qualifications_updated_at ()
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

create trigger training_provider_qualifications_set_updated_at
before update on public.training_provider_qualifications
for each row
execute function public.set_training_provider_qualifications_updated_at ();
