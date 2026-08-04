-- M3.1 — create event editions
-- Implements owned EdizioneEvento of Eventi:
--   public.event_editions
-- (docs/architecture/migrations/eventi-migration-plan.md §12 M3.1;
--  docs/architecture/physical/domain-mapping/eventi.md §8, §16–§18, §21, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- Scope: concrete occurrence (time, timezone, place/link, capacity, occurrence
-- and registration axes). Explicitly out of scope: sessions (M3.2); RRULE;
-- ticketing; waitlist; check-in; seed; policies; GRANT.

create table public.event_editions (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null,
  title text null,
  starts_at timestamptz not null,
  ends_at timestamptz null,
  timezone text not null,
  all_day boolean not null default false,
  delivery_mode text not null,
  venue_label text null,
  address_text text null,
  city_text text null,
  country_ref text null,
  online_reference text null,
  occurrence_status text not null default 'scheduled',
  registration_status text not null default 'not_open',
  registration_access text not null default 'registration_required',
  registration_required boolean not null default true,
  capacity integer null,
  registration_opens_at timestamptz null,
  registration_deadline timestamptz null,
  previous_starts_at timestamptz null,
  cancelled_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_editions_pkey primary key (id),
  constraint event_editions_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on update no action
    on delete cascade,
  constraint event_editions_ends_at_check check (
    ends_at is null
    or ends_at >= starts_at
  ),
  constraint event_editions_timezone_not_blank_check check (
    length(btrim(timezone)) > 0
  ),
  constraint event_editions_delivery_mode_check check (
    delivery_mode in ('in_presence', 'online', 'hybrid')
  ),
  constraint event_editions_occurrence_status_check check (
    occurrence_status in (
      'scheduled',
      'ongoing',
      'concluded',
      'postponed',
      'cancelled'
    )
  ),
  constraint event_editions_registration_status_check check (
    registration_status in ('not_open', 'open', 'closed')
  ),
  constraint event_editions_registration_access_check check (
    registration_access in (
      'free',
      'registration_required',
      'by_invitation'
    )
  ),
  constraint event_editions_capacity_check check (
    capacity is null
    or capacity >= 0
  ),
  constraint event_editions_in_presence_place_check check (
    delivery_mode <> 'in_presence'
    or venue_label is not null
    or address_text is not null
    or city_text is not null
    or country_ref is not null
  ),
  constraint event_editions_hybrid_place_or_link_check check (
    delivery_mode <> 'hybrid'
    or venue_label is not null
    or address_text is not null
    or city_text is not null
    or country_ref is not null
    or (
      online_reference is not null
      and length(btrim(online_reference)) > 0
    )
  ),
  constraint event_editions_cancelled_gate_check check (
    (
      occurrence_status = 'cancelled'
      and cancelled_at is not null
    )
    or (
      occurrence_status <> 'cancelled'
      and cancelled_at is null
    )
  ),
  constraint event_editions_previous_starts_at_check check (
    previous_starts_at is null
    or occurrence_status in (
      'postponed',
      'scheduled',
      'ongoing',
      'concluded'
    )
  ),
  constraint event_editions_title_check check (
    title is null
    or length(btrim(title)) > 0
  ),
  constraint event_editions_venue_label_check check (
    venue_label is null
    or length(btrim(venue_label)) > 0
  ),
  constraint event_editions_address_text_check check (
    address_text is null
    or length(btrim(address_text)) > 0
  ),
  constraint event_editions_city_text_check check (
    city_text is null
    or length(btrim(city_text)) > 0
  ),
  constraint event_editions_country_ref_check check (
    country_ref is null
    or length(btrim(country_ref)) > 0
  ),
  constraint event_editions_online_reference_check check (
    online_reference is null
    or length(btrim(online_reference)) > 0
  )
);

comment on table public.event_editions is
  'Owned Entity of events: concrete EdizioneEvento occurrence (time, place/link, capacity, occurrence and registration axes). ON DELETE CASCADE from events. Not a separate Aggregate Root. Not RRULE recurrence (multiple editions model recurrence). Not ticketing, waitlist, check-in, or SedeImpresa.';

comment on column public.event_editions.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.event_editions.event_id is
  'Owning Aggregate Root (public.events). NOT NULL. ON DELETE CASCADE.';

comment on column public.event_editions.title is
  'Optional edition subtitle. Nullable; blank rejected when present.';

comment on column public.event_editions.starts_at is
  'Edition start instant (timestamptz), including indicative starts. Required.';

comment on column public.event_editions.ends_at is
  'Optional edition end instant. When present must be >= starts_at.';

comment on column public.event_editions.timezone is
  'IANA timezone label for the occurrence (e.g. Europe/Rome). Required non-blank. Not a calendar engine.';

comment on column public.event_editions.all_day is
  'Whether the occurrence is declared as all-day. Default false.';

comment on column public.event_editions.delivery_mode is
  'Authoritative occurrence mode: in_presence | online | hybrid. Distinct from Servizi in_person.';

comment on column public.event_editions.venue_label is
  'Declarative venue label. Not a FK to a venues table and not business_locations.';

comment on column public.event_editions.address_text is
  'Declarative address text. Not geocoded; not a geographic FK.';

comment on column public.event_editions.city_text is
  'Declarative city text. Not a geographic FK.';

comment on column public.event_editions.country_ref is
  'Opaque country reference (ISO-like). Not a geographic FK.';

comment on column public.event_editions.online_reference is
  'Declarative online URL/reference. Not Storage and not a meeting provider integration.';

comment on column public.event_editions.occurrence_status is
  'Occurrence axis: scheduled | ongoing | concluded | postponed | cancelled. Default scheduled.';

comment on column public.event_editions.registration_status is
  'Registration channel axis: not_open | open | closed. Default not_open. Distinct from event_registrations.registration_status.';

comment on column public.event_editions.registration_access is
  'Access mode: free | registration_required | by_invitation. Default registration_required. Not ticketing.';

comment on column public.event_editions.registration_required is
  'Explicit boolean for registration requirement. Default true. Kept for DDL clarity alongside registration_access.';

comment on column public.event_editions.capacity is
  'Optional declared capacity. NULL means unlimited. Remaining seats are derived, not stored.';

comment on column public.event_editions.registration_opens_at is
  'Optional registration opening instant.';

comment on column public.event_editions.registration_deadline is
  'Optional registration deadline instant.';

comment on column public.event_editions.previous_starts_at is
  'Previous start instant retained on postponement/history. Not RRULE.';

comment on column public.event_editions.cancelled_at is
  'Cancellation timestamp. Required iff occurrence_status = cancelled.';

comment on column public.event_editions.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_editions.updated_at is
  'Last update timestamp. Maintained by event_editions_set_updated_at.';

create index event_editions_event_id_idx
  on public.event_editions (event_id);

create index event_editions_starts_at_idx
  on public.event_editions (starts_at);

create index event_editions_occurrence_status_idx
  on public.event_editions (occurrence_status);

create index event_editions_registration_status_idx
  on public.event_editions (registration_status);

alter table public.event_editions enable row level security;

revoke all on table public.event_editions from public;
revoke all on table public.event_editions from anon, authenticated;

create or replace function public.set_event_editions_updated_at ()
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

comment on function public.set_event_editions_updated_at () is
  'BEFORE UPDATE trigger function for public.event_editions. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger event_editions_set_updated_at
before update on public.event_editions
for each row
execute function public.set_event_editions_updated_at ();
