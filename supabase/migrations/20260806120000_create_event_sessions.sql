-- M3.2 — create event sessions
-- Implements owned SessioneEvento of Eventi:
--   public.event_sessions
-- (docs/architecture/migrations/eventi-migration-plan.md §12 M3.2;
--  docs/architecture/physical/domain-mapping/eventi.md §9, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- Temporal coherence of session window within edition window is an application
-- invariant (no cross-table trigger in cycle 1).

create table public.event_sessions (
  id uuid not null default gen_random_uuid (),
  event_edition_id uuid not null,
  title text not null,
  description text null,
  starts_at timestamptz null,
  ends_at timestamptz null,
  sort_order integer not null default 0,
  room_label text null,
  track_label text null,
  delivery_mode text null,
  online_reference text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_sessions_pkey primary key (id),
  constraint event_sessions_event_edition_id_fkey
    foreign key (event_edition_id)
    references public.event_editions (id)
    on update no action
    on delete cascade,
  constraint event_sessions_edition_sort_order_uidx unique (
    event_edition_id,
    sort_order
  ),
  constraint event_sessions_title_not_blank_check check (
    length(btrim(title)) > 0
  ),
  constraint event_sessions_ends_at_check check (
    ends_at is null
    or starts_at is null
    or ends_at >= starts_at
  ),
  constraint event_sessions_sort_order_check check (
    sort_order >= 0
  ),
  constraint event_sessions_delivery_mode_check check (
    delivery_mode is null
    or delivery_mode in ('in_presence', 'online', 'hybrid')
  ),
  constraint event_sessions_description_check check (
    description is null
    or length(btrim(description)) > 0
  ),
  constraint event_sessions_room_label_check check (
    room_label is null
    or length(btrim(room_label)) > 0
  ),
  constraint event_sessions_track_label_check check (
    track_label is null
    or length(btrim(track_label)) > 0
  ),
  constraint event_sessions_online_reference_check check (
    online_reference is null
    or length(btrim(online_reference)) > 0
  )
);

comment on table public.event_sessions is
  'Owned Entity of event_editions: program unit SessioneEvento (0..N). ON DELETE CASCADE from editions. Session time within edition time is an application invariant (no cross-table trigger in cycle 1). Not RRULE and not a separate Aggregate Root.';

comment on column public.event_sessions.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.event_sessions.event_edition_id is
  'Owning edition (public.event_editions). NOT NULL. ON DELETE CASCADE.';

comment on column public.event_sessions.title is
  'Required non-blank session title.';

comment on column public.event_sessions.description is
  'Optional session description. Nullable; blank rejected when present.';

comment on column public.event_sessions.starts_at is
  'Optional session start instant. Coherence with edition window is application-level.';

comment on column public.event_sessions.ends_at is
  'Optional session end instant. When both ends_at and starts_at are set, ends_at >= starts_at.';

comment on column public.event_sessions.sort_order is
  'Unique order within the edition (UNIQUE with event_edition_id). Default 0. Must be >= 0.';

comment on column public.event_sessions.room_label is
  'Optional declarative room label. Not a venues FK.';

comment on column public.event_sessions.track_label is
  'Optional declarative track/label. Not a taxonomy catalog.';

comment on column public.event_sessions.delivery_mode is
  'Optional override of edition delivery_mode: in_presence | online | hybrid.';

comment on column public.event_sessions.online_reference is
  'Optional override online reference for the session. Not Storage.';

comment on column public.event_sessions.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_sessions.updated_at is
  'Last update timestamp. Maintained by event_sessions_set_updated_at.';

create index event_sessions_event_edition_id_idx
  on public.event_sessions (event_edition_id);

alter table public.event_sessions enable row level security;

revoke all on table public.event_sessions from public;
revoke all on table public.event_sessions from anon, authenticated;

create or replace function public.set_event_sessions_updated_at ()
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

comment on function public.set_event_sessions_updated_at () is
  'BEFORE UPDATE trigger function for public.event_sessions. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger event_sessions_set_updated_at
before update on public.event_sessions
for each row
execute function public.set_event_sessions_updated_at ();
