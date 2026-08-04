-- M4.2 — create event speakers
-- Implements owned speaker/moderator/facilitator/trainer roles of Eventi:
--   public.event_speakers
-- (docs/architecture/migrations/eventi-migration-plan.md §13 M4.2;
--  docs/architecture/physical/domain-mapping/eventi.md §11, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- No polymorphic entity_type/entity_id. Session coherence with edition is application-level.

create table public.event_speakers (
  id uuid not null default gen_random_uuid (),
  event_edition_id uuid not null,
  event_session_id uuid null,
  role_kind text not null default 'speaker',
  person_id uuid null,
  professional_profile_id uuid null,
  display_label text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_speakers_pkey primary key (id),
  constraint event_speakers_event_edition_id_fkey
    foreign key (event_edition_id)
    references public.event_editions (id)
    on update no action
    on delete cascade,
  constraint event_speakers_event_session_id_fkey
    foreign key (event_session_id)
    references public.event_sessions (id)
    on update no action
    on delete cascade,
  constraint event_speakers_person_id_fkey
    foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete set null,
  constraint event_speakers_professional_profile_id_fkey
    foreign key (professional_profile_id)
    references public.professional_profiles (id)
    on update no action
    on delete set null,
  constraint event_speakers_role_kind_check check (
    role_kind in ('speaker', 'moderator', 'facilitator', 'trainer')
  ),
  constraint event_speakers_subject_present_check check (
    person_id is not null
    or professional_profile_id is not null
    or (
      display_label is not null
      and length(btrim(display_label)) > 0
    )
  ),
  constraint event_speakers_sort_order_check check (
    sort_order >= 0
  ),
  constraint event_speakers_display_label_check check (
    display_label is null
    or length(btrim(display_label)) > 0
  )
);

comment on table public.event_speakers is
  'Owned Entity of event_editions: speaker/moderator/facilitator/trainer roles, optionally scoped to a session. Subjects via profiles and/or professional_profiles and/or opaque display_label. No polymorphic entity_type/entity_id. ON DELETE CASCADE from edition/session.';

comment on column public.event_speakers.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.event_speakers.event_edition_id is
  'Owning edition (public.event_editions). NOT NULL. ON DELETE CASCADE.';

comment on column public.event_speakers.event_session_id is
  'Optional session scope. ON DELETE CASCADE. session.edition_id = event_edition_id is application-level.';

comment on column public.event_speakers.role_kind is
  'Closed role: speaker | moderator | facilitator | trainer. Default speaker.';

comment on column public.event_speakers.person_id is
  'Optional Persona subject. ON DELETE SET NULL. Partial UNIQUE with edition/session/role when set.';

comment on column public.event_speakers.professional_profile_id is
  'Optional professional profile subject. ON DELETE SET NULL. Distinct from Organizzazioni.';

comment on column public.event_speakers.display_label is
  'Optional opaque display label when no person/professional profile FK is used (or as complementary label).';

comment on column public.event_speakers.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.event_speakers.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_speakers.updated_at is
  'Last update timestamp. Maintained by event_speakers_set_updated_at.';

create unique index event_speakers_edition_session_person_role_uidx
  on public.event_speakers (
    event_edition_id,
    event_session_id,
    person_id,
    role_kind
  )
  where person_id is not null;

create index event_speakers_event_edition_id_idx
  on public.event_speakers (event_edition_id);

create index event_speakers_event_session_id_idx
  on public.event_speakers (event_session_id)
  where event_session_id is not null;

create index event_speakers_person_id_idx
  on public.event_speakers (person_id)
  where person_id is not null;

alter table public.event_speakers enable row level security;

revoke all on table public.event_speakers from public;
revoke all on table public.event_speakers from anon, authenticated;

create or replace function public.set_event_speakers_updated_at ()
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

comment on function public.set_event_speakers_updated_at () is
  'BEFORE UPDATE trigger function for public.event_speakers. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger event_speakers_set_updated_at
before update on public.event_speakers
for each row
execute function public.set_event_speakers_updated_at ();
