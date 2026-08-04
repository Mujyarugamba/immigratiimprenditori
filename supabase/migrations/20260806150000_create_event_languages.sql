-- M5.1 — create event languages
-- Implements owned language links for Evento:
--   public.event_languages
-- (docs/architecture/migrations/eventi-migration-plan.md §14 M5.1;
--  docs/architecture/physical/domain-mapping/eventi.md §15, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- language_id is bigint FK to languages. Distinct from professional_operational_languages
-- and service_*_languages. Languages per edition/session deferred.

create table public.event_languages (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null,
  language_id bigint not null,
  usage_role text not null default 'event',
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_languages_pkey primary key (id),
  constraint event_languages_event_id_fkey
    foreign key (event_id)
    references public.events (id)
    on update no action
    on delete cascade,
  constraint event_languages_language_id_fkey
    foreign key (language_id)
    references public.languages (id)
    on update no action
    on delete restrict,
  constraint event_languages_uidx unique (
    event_id,
    language_id,
    usage_role
  ),
  constraint event_languages_usage_role_check check (
    usage_role in ('event', 'materials', 'interpretation')
  ),
  constraint event_languages_sort_order_check check (
    sort_order >= 0
  )
);

comment on table public.event_languages is
  'Owned Entity of events: languages of the Evento (cycle 1 on the AR only). language_id is bigint FK to languages. Distinct from professional_operational_languages and service_*_languages. ON DELETE CASCADE from events; ON DELETE RESTRICT on languages.';

comment on column public.event_languages.id is
  'Surrogate UUID primary key. Default gen_random_uuid().';

comment on column public.event_languages.event_id is
  'Owning Aggregate Root (public.events). NOT NULL. ON DELETE CASCADE.';

comment on column public.event_languages.language_id is
  'FK to public.languages(id) bigint. ON DELETE RESTRICT.';

comment on column public.event_languages.usage_role is
  'Closed role: event | materials | interpretation. Default event. Part of UNIQUE key.';

comment on column public.event_languages.is_primary is
  'Whether this language is primary for the event. At most one primary per event (partial UNIQUE).';

comment on column public.event_languages.sort_order is
  'Display/order weight. Default 0. Must be >= 0.';

comment on column public.event_languages.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.event_languages.updated_at is
  'Last update timestamp. Maintained by event_languages_set_updated_at.';

create unique index event_languages_primary_uidx
  on public.event_languages (event_id)
  where is_primary;

create index event_languages_event_id_idx
  on public.event_languages (event_id);

create index event_languages_language_id_idx
  on public.event_languages (language_id);

alter table public.event_languages enable row level security;

revoke all on table public.event_languages from public;
revoke all on table public.event_languages from anon, authenticated;

create or replace function public.set_event_languages_updated_at ()
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

comment on function public.set_event_languages_updated_at () is
  'BEFORE UPDATE trigger function for public.event_languages. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger event_languages_set_updated_at
before update on public.event_languages
for each row
execute function public.set_event_languages_updated_at ();
