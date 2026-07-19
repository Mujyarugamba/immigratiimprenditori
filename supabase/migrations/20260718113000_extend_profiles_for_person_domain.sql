-- Additive extension of public.profiles for the Persone (Person) domain,
-- implementing M1 of docs/architecture/migrations/persone-migration-plan.md,
-- as specified in docs/architecture/physical/persone.md (§3, §9.1, §10.1,
-- §11, §13). Separates voluntary publication (is_public), first-publication
-- date (published_at) and soft-delete (deleted_at) from the existing
-- is_active column, which is reinterpreted as a moderation/suspension
-- signal only. No existing column, constraint, policy, or trigger is
-- removed or renamed.

alter table public.profiles
  add column is_public boolean not null default false,
  add column published_at timestamptz,
  add column deleted_at timestamptz;

comment on column public.profiles.is_public is
  'Voluntary publication signal, owned by the profile owner: true once the person has explicitly chosen to make the profile publicly visible. Independent from is_active (moderation) and always false by default.';

comment on column public.profiles.published_at is
  'Date of the first publication only, fully system-managed. Set once, the first time is_public transitions from false to true, and never cleared or altered afterwards, even if the profile later goes private again. Cannot be set on insert. Not a client-updatable column: any value supplied directly by the owner is discarded by the protect_profile_lifecycle_fields trigger.';

comment on column public.profiles.deleted_at is
  'Voluntary soft-delete of the profile. Once set, the row (and its dependent rows) become publicly invisible and are frozen against further changes through the standard update path. Not resettable by the owner through ordinary policies; recovery, if ever needed, requires a separate authorized administrative procedure outside this path.';

-- Minimum publication requirements: a profile can only be marked public
-- when it is not deleted, not suspended, and has a valid public name. The
-- act of setting is_public = true is itself the explicit consent required
-- for publication; no separate consent column is introduced.
alter table public.profiles
  add constraint profiles_publication_requirements_check check (
    is_public = false
    or (
      deleted_at is null
      and is_active = true
      and display_name is not null
      and length(trim(display_name)) > 0
    )
  );

-- Supports the most common public query ("list of public profiles"),
-- orderable by first-publication date.
create index profiles_public_listing_idx on public.profiles using btree (published_at)
where
  is_public = true
  and is_active = true
  and deleted_at is null;

-- Replaces the public select policy applied in
-- 20260718103949_create_profiles_table.sql (which only checked is_active).
-- Public visibility now requires explicit publication, active status and
-- absence of a soft-delete, all at once.
drop policy if exists "Public can view active profiles" on public.profiles;

create policy "Public can view published profiles"
  on public.profiles
  for select
  to public
  using (
    is_public = true
    and is_active = true
    and deleted_at is null
  );

-- Column-level grants are only meaningful because authenticated does not
-- hold table-level UPDATE: if it did, column grants would be irrelevant and
-- every column would be updatable regardless of the column list below.
-- Table-level UPDATE was already revoked from authenticated once and for
-- all in 20260718103949_create_profiles_table.sql; it does not need to be
-- revoked again here, and column-level grants (below, and the ones already
-- applied in that migration) remain independently in effect.

-- Owners may additionally set is_public (to publish/unpublish, subject to
-- the check constraint above) and deleted_at (to soft-delete their own
-- profile), on top of the descriptive columns already granted in
-- 20260718103949_create_profiles_table.sql. deleted_at can only ever be set
-- going forward: the trigger below rejects any further update once it is
-- non-null, so this grant alone does not allow an owner to restore a
-- deleted profile. is_active and published_at remain system-managed and are
-- intentionally not granted here: published_at is additionally protected at
-- the trigger level below, in case it is ever granted by mistake in a
-- future migration.
grant update (
  is_public,
  deleted_at
) on public.profiles to authenticated;

-- Enforces the lifecycle rules that a check constraint or a column grant
-- cannot express on their own:
-- 1. a row can never be inserted already published: publication is always
--    a deliberate, separate action performed after the row exists
--    (decision 5), never a side effect of its creation, regardless of
--    which path performs the insert;
-- 2. once deleted_at is set, the row is frozen for the standard update
--    path used by authenticated profile owners (depends on OLD);
-- 3. published_at is fully system-managed: it is computed by this trigger
--    on every update, set exactly once at the first transition of
--    is_public from false to true, and any other value supplied by the
--    client — an attempt to alter it or to reset it to NULL — is discarded
--    and replaced with its previous value, so the owner can never change
--    it directly, even if a future migration mistakenly grants it.
create or replace function public.protect_profile_lifecycle_fields ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'insert' then
    if new.is_public = true then
      raise exception
        'A profile cannot be inserted with is_public = true; it must be published with a separate update afterwards.';
    end if;

    -- No row can be born already carrying a publication date either.
    new.published_at := null;

    return new;
  end if;

  -- From this point on, tg_op = 'update'.
  if old.deleted_at is not null then
    raise exception
      'This profile has been deleted and can no longer be modified through the standard update path.';
  end if;

  if old.is_public = false and new.is_public = true and old.published_at is null then
    new.published_at := now();
  else
    new.published_at := old.published_at;
  end if;

  return new;
end;
$$;

create trigger profiles_protect_lifecycle_fields
before insert or update on public.profiles
for each row
execute function public.protect_profile_lifecycle_fields ();
