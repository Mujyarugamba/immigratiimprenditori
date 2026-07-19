-- Create public.training_request_languages: the distinct language groups
-- of workers a training request needs to cover, each with its own
-- required support level. E.g. a construction company's request for
-- high-risk training with 8 workers can record 5 Arabic-speaking workers
-- needing a full course or an Arabic-speaking trainer, and 3
-- French-speaking workers for whom interpreter support is enough.

create table public.training_request_languages (
  training_request_id uuid not null references public.training_requests (id) on delete cascade,
  language_id bigint not null references public.languages (id) on delete restrict,
  participant_count integer,
  required_support_level text not null,
  notes text,
  created_at timestamptz not null default now(),
  primary key (training_request_id, language_id),
  constraint training_request_languages_participant_count_positive_check check (
    participant_count is null
    or participant_count > 0
  ),
  constraint training_request_languages_support_level_check check (
    required_support_level in (
      'full_course',
      'trainer_language',
      'interpreter_supported',
      'materials_only',
      'to_be_assessed'
    )
  )
);

comment on table public.training_request_languages is
  'Language groups of workers covered by a training request, each with a participant_count and a required_support_level. Mirrors the delivery_level vocabulary of public.training_offer_languages so a request can be matched against what offers actually provide.';

comment on column public.training_request_languages.participant_count is
  'Number of workers in this language group, when known. Must be positive when set. May be left NULL and only the overall public.training_requests.participant_count used, if the breakdown is not yet known.';

comment on column public.training_request_languages.required_support_level is
  'Level of language support the requester needs for this group: full_course (the course must be delivered entirely in this language), trainer_language (a trainer speaking this language directly), interpreter_supported (an interpreter/mediator is acceptable), materials_only (translated materials are enough), to_be_assessed (not yet decided).';

comment on column public.training_request_languages.notes is
  'Optional free-form clarification for this language group.';

-- The primary key already indexes training_request_id (as its leading
-- column), covering "language groups of a given request". The reverse
-- lookup ("open requests needing a given language", optionally filtered
-- by required_support_level) needs its own index since language_id is
-- not a leading column of the PK.
create index training_request_languages_language_level_idx on public.training_request_languages using btree (language_id, required_support_level);

alter table public.training_request_languages enable row level security;

-- 1. Publicly readable only when the underlying request is open and the
-- requester profile is published (is_public = true, is_active = true,
-- deleted_at is null, the unified visibility formula used across the
-- Persone domain), and the language is active.
create policy "Public can view languages of open training requests"
  on public.training_request_languages
  for select
  to public
  using (
    exists (
      select 1
      from public.training_requests r
      join public.profiles p on p.id = r.requester_profile_id
      where
        r.id = training_request_languages.training_request_id
        and r.status = 'open'
        and p.is_public = true
        and p.is_active = true
        and p.deleted_at is null
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = training_request_languages.language_id
        and l.is_active = true
    )
  );

-- 2. The requester can always see the language groups of their own
-- requests, regardless of status.
create policy "Requesters can view languages of their own training requests"
  on public.training_request_languages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.training_requests r
      where
        r.id = training_request_languages.training_request_id
        and r.requester_profile_id = auth.uid ()
    )
  );

-- 3. A user may add a language group only to their own request, and only
-- an active language.
create policy "Requesters can add languages to their own training requests"
  on public.training_request_languages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.training_requests r
      where
        r.id = training_request_id
        and r.requester_profile_id = auth.uid ()
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = language_id
        and l.is_active = true
    )
  );

-- 4. A user may update only the language groups of their own requests.
create policy "Requesters can update languages of their own training requests"
  on public.training_request_languages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.training_requests r
      where
        r.id = training_request_languages.training_request_id
        and r.requester_profile_id = auth.uid ()
    )
  )
  with check (
    exists (
      select 1
      from public.training_requests r
      where
        r.id = training_request_id
        and r.requester_profile_id = auth.uid ()
    )
    and exists (
      select 1
      from public.languages l
      where
        l.id = language_id
        and l.is_active = true
    )
  );

-- 5. A user may remove a language group only from their own request.
create policy "Requesters can remove languages from their own training requests"
  on public.training_request_languages
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.training_requests r
      where
        r.id = training_request_languages.training_request_id
        and r.requester_profile_id = auth.uid ()
    )
  );

grant select on public.training_request_languages to anon;

grant select, insert, update, delete on public.training_request_languages to authenticated;
