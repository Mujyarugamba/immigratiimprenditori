-- Create public.personal_stories, implementing the StoriaPersonale entity
-- of the Persone domain: the first-person autobiographical narrative a
-- Persona may publish about themselves, with a minimal editorial workflow
-- (draft/in_review/published/archived). Implements M5 of
-- docs/architecture/migrations/persone-migration-plan.md, per
-- docs/architecture/physical/persone.md (§6, §9.1, §10.4, §11, §13).
--
-- Deliberately not a general CMS: no staff/admin role, no authorization
-- system, no additional editorial workflow, no approvals beyond what is
-- described below, no content revisions/versioning, no comments, no
-- reactions, no attachments/media, no categories/tags, no seed data. For
-- the first version, the author self-publishes (physical model §6, §10.4):
-- no reviewer role exists yet to approve a transition to 'published' or to
-- write rejection_reason.
--
-- Depends on public.profiles (extended by
-- 20260718113000_extend_profiles_for_person_domain.sql, for is_public,
-- is_active, deleted_at), already applied or applied-pending.

create table public.personal_stories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null unique,
  title text not null,
  summary text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft',
  rejection_reason text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint personal_stories_slug_check check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  -- title/content are always required and always non-empty, even in draft:
  -- no real draft needs to be saved with an empty title or body (physical
  -- model §6.1).
  constraint personal_stories_title_check check (length(trim(title)) > 0),
  constraint personal_stories_content_check check (length(trim(content)) > 0),
  constraint personal_stories_status_check check (
    status in ('draft', 'in_review', 'published', 'archived')
  )
);

comment on table public.personal_stories is
  'First-person autobiographical narrative published by a Persona (StoriaPersonale). Not a general CMS: no revisions/versioning, comments, reactions, attachments or categories. A row is publicly visible only when status = ''published'', deleted_at is null, and the linked profile is published (see the public select policy below); an archived story is never publicly visible, exactly like a draft.';

comment on column public.personal_stories.slug is
  'Public URL identifier for the story, unique across the table. Normalized by the normalize_personal_story_slug trigger (same logic as profiles.slug).';

comment on column public.personal_stories.status is
  'Editorial status: draft, in_review, published or archived. For the first version the author self-publishes (no staff review role exists yet); in_review is available as a self-selected status but has no reviewer behind it today. A rejection is represented by status = ''draft'' together with a non-null rejection_reason, not by a dedicated status value.';

comment on column public.personal_stories.rejection_reason is
  'Free-text motivation for a rejection during review. Not owner-writable in this phase (see grants below): no reviewer role exists yet to produce it, so the column stays NULL until a future Identità & Accessi extension introduces one.';

comment on column public.personal_stories.published_at is
  'Date of the first publication only, fully system-managed. Set once, the first time status transitions into ''published'' from a different status, and never cleared or altered afterwards, even if the story is later archived. Not a client-updatable column: any value supplied directly by the owner is discarded by the handle_personal_story_publication trigger, and the column is excluded from both the insert and update column grants below.';

comment on column public.personal_stories.deleted_at is
  'Voluntary soft-delete of the story, owner-controlled. Once set, the row becomes publicly invisible and is frozen against further changes through the standard update path (protect_personal_story_lifecycle_fields). Monotonic: cannot be reset to NULL by the owner.';

-- The unique constraint on slug already provides personal_stories_slug_key.
create index personal_stories_profile_id_idx on public.personal_stories using btree (profile_id);

-- Supports the most common public query ("list of published stories"),
-- orderable by first-publication date. Archived stories are deliberately
-- excluded: they are not publicly visible (§6.1 of the physical model).
create index personal_stories_public_listing_idx on public.personal_stories using btree (published_at)
where
  status = 'published'
  and deleted_at is null;

alter table public.personal_stories enable row level security;

-- 1. Publicly readable only when the story itself is published and not
-- deleted, and the linked profile is published (is_public = true, is_active
-- = true, deleted_at is null, the same formula used throughout this
-- domain). An archived story never satisfies status = 'published', so it is
-- never publicly visible, exactly like a draft.
create policy "Public can view published stories"
  on public.personal_stories
  for select
  to public
  using (
    deleted_at is null
    and status = 'published'
    and exists (
      select 1
      from public.profiles p
      where
        p.id = personal_stories.profile_id
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
  );

-- 2. The author can always read their own stories, including drafts and
-- soft-deleted ones, regardless of the profile's own publication state.
create policy "Users can view their own stories"
  on public.personal_stories
  for select
  to authenticated
  using (auth.uid () = profile_id);

-- 3. A user may create a story only for their own profile, and every new
-- story is always born as a draft: no direct publication at creation time.
create policy "Users can add their own stories"
  on public.personal_stories
  for insert
  to authenticated
  with check (
    auth.uid () = profile_id
    and status = 'draft'
  );

-- 4. The author may update only their own stories. Fine-grained control
-- (which columns, which status transitions) is left to the column grants
-- and triggers below, not to this policy, the same approach already used
-- for profiles (physical model §10.1).
create policy "Users can update their own stories"
  on public.personal_stories
  for update
  to authenticated
  using (auth.uid () = profile_id)
  with check (auth.uid () = profile_id);

-- 5. No delete policy and no delete grant (below): there is no direct
-- physical deletion for authenticated, only soft-delete via an update that
-- sets deleted_at.

grant select on public.personal_stories to anon;

-- Explicit defense in depth: without this, anon/authenticated would still
-- be unable to write beyond what is granted back below, but this removes
-- the underlying table-level privilege too, in case RLS is ever disabled
-- by mistake.
revoke insert, update, delete
on public.personal_stories
from anon, authenticated;

grant select on public.personal_stories to authenticated;

-- Insert is restricted by column, not just by row (the policy above): id,
-- created_at and updated_at are system-managed (defaults apply when
-- omitted); published_at and deleted_at must start NULL, not whatever a
-- client supplies (a client-supplied published_at at insert time would
-- otherwise permanently defeat handle_personal_story_publication's "only on
-- first transition, if still NULL" guard); rejection_reason has no
-- reviewer to write it yet, for the same reason it is excluded below.
grant insert (
  profile_id,
  slug,
  title,
  summary,
  content,
  cover_image_url,
  status
) on public.personal_stories to authenticated;

-- Table-level UPDATE is intentionally not granted, for the same reason as
-- profile_languages/profile_competencies. Excluded from the column list:
-- id and profile_id (identity of the row, never changeable in place);
-- created_at/updated_at (system-managed); published_at (system-managed,
-- protected further by the trigger below); rejection_reason (no reviewer
-- role exists yet to write it). deleted_at can only ever be set going
-- forward: protect_personal_story_lifecycle_fields rejects any further
-- update once it is non-null, so this grant alone does not allow the
-- owner to restore a deleted story.
grant update (
  slug,
  title,
  summary,
  content,
  cover_image_url,
  status,
  deleted_at
) on public.personal_stories to authenticated;

-- Keeps updated_at current on every row update.
create or replace function public.set_personal_stories_updated_at ()
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

create trigger personal_stories_set_updated_at
before update on public.personal_stories
for each row
execute function public.set_personal_stories_updated_at ();

-- Normalizes any manually inserted/updated slug (lowercase, single hyphens,
-- no leading/trailing hyphens), the exact same logic already applied to
-- profiles.slug by public.normalize_profile_slug.
create or replace function public.normalize_personal_story_slug ()
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

create trigger personal_stories_normalize_slug
before insert or update on public.personal_stories
for each row
execute function public.normalize_personal_story_slug ();

-- Enforces the lifecycle rule that a check constraint or a column grant
-- cannot express on their own: published_at is fully system-managed,
-- computed on every update, set exactly once at the first transition into
-- 'published', and any other value supplied by the client is discarded and
-- replaced with its previous value, so the owner can never change it
-- directly, even if a future migration mistakenly grants it. Depends on
-- OLD, so it cannot be expressed as a check constraint.
create or replace function public.handle_personal_story_publication ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.status <> 'published' and new.status = 'published' and old.published_at is null then
    new.published_at := now();
  else
    new.published_at := old.published_at;
  end if;

  return new;
end;
$$;

create trigger personal_stories_handle_publication
before update on public.personal_stories
for each row
execute function public.handle_personal_story_publication ();

-- Freezes a soft-deleted story against the standard update path used by
-- authenticated authors (depends on OLD, so it cannot be expressed as a
-- check constraint). This also makes deleted_at monotonic in practice: any
-- further update, including an attempt to reset it to NULL, is rejected
-- once it is non-null. A restore, if ever needed, requires a separate
-- authorized administrative procedure outside this path.
create or replace function public.protect_personal_story_lifecycle_fields ()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.deleted_at is not null then
    raise exception
      'This story has been deleted and can no longer be modified through the standard update path.';
  end if;

  return new;
end;
$$;

create trigger personal_stories_protect_lifecycle_fields
before update on public.personal_stories
for each row
execute function public.protect_personal_story_lifecycle_fields ();
