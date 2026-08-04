-- M4.1 — create event organizers
-- Implements owned additional organizational roles of Eventi:
--   public.event_organizers
-- (docs/architecture/migrations/eventi-migration-plan.md §13 M4.1;
--  docs/architecture/physical/domain-mapping/eventi.md §10, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- Primary organizer = events.owner_*. No FK to future Organizzazioni.
-- Edition scope coherence (edition.event_id = organizers.event_id) is application-level.

create table public.event_organizers (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null,
  event_edition_id uuid null,
  role_kind text not null,
  person_id uuid null,
  business_id uuid null,
  display_label text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_organizers_pkey primary key (id),
  constraint event_organizers_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on update no action
    on delete cascade,
  constraint event_organizers_event_edition_id_fkey
    foreign key (event_edition_id)
    references public.event_editions (id)
    on update no action
    on delete cascade,
  constraint event_organizers_person_id_fkey
    foreign key (person_id)
    references public.profiles (id)
    on update no action
    on delete set null,
  constraint event_organizers_business_id_fkey
    foreign key (business_id)
    references public.businesses (id)
    on update no action
    on delete set null,
  constraint event_organizers_role_kind_check check (
    role_kind in (
      'co_organizer',
      'promoter',
      'partner',
      'sponsor',
      'host',
      'patron',
      'operational_contact'
    )
  ),
  constraint event_organizers_subject_present_check check (
    person_id is not null
    or business_id is not null
    or (
      display_label is not null
      and length(btrim(display_label)) > 0
    )
  ),
  constraint event_organizers_person_business_xor_check check (
    not (
      person_id is not null
      and business_id is not null
    )
  ),
  constraint event_organizers_sort_order_check check (
    sort_order >= 0
  ),
  constraint event_organizers_display_label_check check (
    display_label is null
    or length(btrim(display_label)) > 0
  )
);

comment on table public.event_organizers is
  'Owned Entity of events: additional organizational roles beyond the AR titolare (co_organizer, promoter, partner, sponsor, host, patron, operational_contact). Primary organizer is events.owner_*. No FK to Organizzazioni. ON DELETE CASCADE from events (and from edition when scoped).';

comment on column public.event_organizers.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.event_organizers.event_id is
  'Owning Aggregate Root (public.events). NOT NULL. ON DELETE CASCADE.';

comment on column public.event_organizers.event_edition_id is
  'Optional edition scope. NULL means event-level role. ON DELETE CASCADE. edition.event_id = event_id is application-level.';

comment on column public.event_organizers.role_kind is
  'Closed role: co_organizer | promoter | partner | sponsor | host | patron | operational_contact.';

comment on column public.event_organizers.person_id is
  'Optional Persona subject. Mutually exclusive with business_id. ON DELETE SET NULL. May coexist with display_label.';

comment on column public.event_organizers.business_id is
  'Optional Impresa subject. Mutually exclusive with person_id. ON DELETE SET NULL. May coexist with display_label.';

comment on column public.event_organizers.display_label is
  'Optional opaque external subject label when no Person/Business FK is used (or as complementary label). Not a FK to Organizzazioni.';

comment on column public.event_organizers.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.event_organizers.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_organizers.updated_at is
  'Last update timestamp. Maintained by event_organizers_set_updated_at.';

create index event_organizers_event_id_idx
  on public.event_organizers (event_id);

create index event_organizers_event_edition_id_idx
  on public.event_organizers (event_edition_id)
  where event_edition_id is not null;

alter table public.event_organizers enable row level security;

revoke all on table public.event_organizers from public;
revoke all on table public.event_organizers from anon, authenticated;

create or replace function public.set_event_organizers_updated_at ()
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

comment on function public.set_event_organizers_updated_at () is
  'BEFORE UPDATE trigger function for public.event_organizers. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger event_organizers_set_updated_at
before update on public.event_organizers
for each row
execute function public.set_event_organizers_updated_at ();
