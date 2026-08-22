-- Prepare a language-neutral grouping model for editorial translations.
-- IMPORTANT: this migration is prepared on the working branch and is not
-- automatically applied to production.

create table if not exists public.content_translation_groups (
  id uuid primary key default gen_random_uuid(),
  canonical_content_id uuid null references public.contents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contents
  add column if not exists translation_group_id uuid null
    references public.content_translation_groups(id) on delete set null,
  add column if not exists translation_source_content_id uuid null
    references public.contents(id) on delete set null,
  add column if not exists translation_review_status text null;

alter table public.contents
  drop constraint if exists contents_translation_review_status_check;

alter table public.contents
  add constraint contents_translation_review_status_check
  check (
    translation_review_status is null
    or translation_review_status in (
      'original',
      'machine_draft',
      'human_review',
      'reviewed'
    )
  );

create unique index if not exists contents_translation_group_language_uidx
  on public.contents (translation_group_id, language_id)
  where translation_group_id is not null;

create index if not exists contents_translation_source_idx
  on public.contents (translation_source_content_id)
  where translation_source_content_id is not null;

comment on table public.content_translation_groups is
  'Groups language versions of the same editorial work. Public availability remains controlled by contents publication and visibility fields.';

comment on column public.contents.translation_group_id is
  'Language-neutral group that links translations of the same editorial work.';

comment on column public.contents.translation_source_content_id is
  'Source content row used to produce this language version, when applicable.';

comment on column public.contents.translation_review_status is
  'Translation workflow state. Null is allowed for legacy rows until they are assigned to a translation workflow.';

alter table public.content_translation_groups enable row level security;

-- Translation-group metadata is intentionally not exposed directly to anon or
-- authenticated clients. Public resolution is performed through already-public
-- content rows under the existing contents RLS rules.
revoke all on table public.content_translation_groups from anon, authenticated;
