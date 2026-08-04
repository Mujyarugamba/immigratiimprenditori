-- M5.3 — create event registrations
-- Implements owned IscrizioneEvento of Eventi:
--   public.event_registrations
-- (docs/architecture/migrations/eventi-migration-plan.md §14 M5.3;
--  docs/architecture/physical/domain-mapping/eventi.md §12, §21, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- Participant is required Persona; on_behalf_business_id optional.
-- Explicitly out of scope: waitlist; ticket; payment; check-in; attendance;
-- auth.users owner; seed; policies; GRANT.

create table public.event_registrations (
  id uuid not null default gen_random_uuid (),
  event_edition_id uuid not null,
  participant_person_id uuid not null,
  on_behalf_business_id uuid null,
  registration_status text not null default 'submitted',
  registered_at timestamptz not null default now(),
  cancelled_at timestamptz null,
  note text null,
  source_label text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_registrations_pkey primary key (id),
  constraint event_registrations_event_edition_id_fkey
    foreign key (event_edition_id)
    references public.event_editions (id)
    on update no action
    on delete cascade,
  constraint event_registrations_participant_person_id_fkey
    foreign key (participant_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint event_registrations_on_behalf_business_id_fkey
    foreign key (on_behalf_business_id)
    references public.businesses (id)
    on update no action
    on delete set null,
  constraint event_registrations_status_check check (
    registration_status in ('submitted', 'confirmed', 'cancelled')
  ),
  constraint event_registrations_cancelled_gate_check check (
    (
      registration_status = 'cancelled'
      and cancelled_at is not null
    )
    or (
      registration_status <> 'cancelled'
      and cancelled_at is null
    )
  ),
  constraint event_registrations_note_check check (
    note is null
    or length(btrim(note)) > 0
  ),
  constraint event_registrations_source_label_check check (
    source_label is null
    or length(btrim(source_label)) > 0
  )
);

comment on table public.event_registrations is
  'Owned Entity of event_editions: IscrizioneEvento (submitted | confirmed | cancelled). Participant is Persona (profiles). Optional on_behalf_business_id. Not waitlist, ticket, payment, check-in, or attendance. Not auth.users. ON DELETE CASCADE from editions.';

comment on column public.event_registrations.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.event_registrations.event_edition_id is
  'Owning edition (public.event_editions). NOT NULL. ON DELETE CASCADE.';

comment on column public.event_registrations.participant_person_id is
  'Required participant Persona. FK profiles ON DELETE RESTRICT. Not XOR with Impresa as AR owner.';

comment on column public.event_registrations.on_behalf_business_id is
  'Optional Impresa on whose behalf the person registers. ON DELETE SET NULL. Not a substitute participant.';

comment on column public.event_registrations.registration_status is
  'Registration status: submitted | confirmed | cancelled. Default submitted. Distinct from edition registration_status channel.';

comment on column public.event_registrations.registered_at is
  'Registration timestamp. Default now().';

comment on column public.event_registrations.cancelled_at is
  'Cancellation timestamp. Required iff registration_status = cancelled.';

comment on column public.event_registrations.note is
  'Optional free-text note. Nullable; blank rejected when present.';

comment on column public.event_registrations.source_label is
  'Optional declarative provenance label. Not a marketing attribution engine.';

comment on column public.event_registrations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_registrations.updated_at is
  'Last update timestamp. Maintained by event_registrations_set_updated_at.';

create unique index event_registrations_active_uidx
  on public.event_registrations (event_edition_id, participant_person_id)
  where registration_status <> 'cancelled';

create index event_registrations_event_edition_id_idx
  on public.event_registrations (event_edition_id);

create index event_registrations_participant_person_id_idx
  on public.event_registrations (participant_person_id);

alter table public.event_registrations enable row level security;

revoke all on table public.event_registrations from public;
revoke all on table public.event_registrations from anon, authenticated;

create or replace function public.set_event_registrations_updated_at ()
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

comment on function public.set_event_registrations_updated_at () is
  'BEFORE UPDATE trigger function for public.event_registrations. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger event_registrations_set_updated_at
before update on public.event_registrations
for each row
execute function public.set_event_registrations_updated_at ();
