-- M3.3 — create international market activities
-- Implements Attività internazionale (E02 owned by Presenza) and its type links:
--   public.international_market_activities
--   public.international_market_activity_type_links
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M3.3;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.9;
--  docs/architecture/logical/mercati-internazionali.md §5).
--
-- Scope of this unit only: concrete international activity owned by a Presence,
-- optional access channel and sector references, visibility and activity status,
-- optional period, multi-type links to international_activity_types, timestamps,
-- RLS defense, updated_at triggers.
-- Explicitly out of scope: Interest (M3.2), commercial relations, needs (M4),
-- sources/evidences/verifications (M5), direct subject/market FKs on activity,
-- demo/normative seed, policy/GRANT.
-- Depends on M3.1 international_market_presences; M1.1 international_activity_types;
-- M1.2 international_access_channels; public.business_sectors.
-- Does not alter M1.*, M2.*, M3.1, or M3.2.

create table public.international_market_activities (
  id uuid not null default gen_random_uuid (),
  presence_id uuid not null,
  summary text null,
  description text null,
  activity_status text not null default 'planned',
  primary_access_channel_code text null,
  sector_id bigint null,
  location_note text null,
  visibility_status text not null default 'private',
  started_at date null,
  ended_at date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ima_pkey primary key (id),
  constraint ima_presence_id_fkey foreign key (presence_id)
    references public.international_market_presences (id)
    on delete cascade,
  constraint ima_primary_access_channel_code_fkey foreign key (primary_access_channel_code)
    references public.international_access_channels (code)
    on delete restrict,
  constraint ima_sector_id_fkey foreign key (sector_id)
    references public.business_sectors (id)
    on delete restrict,
  constraint ima_activity_status_check check (
    activity_status in (
      'planned',
      'started',
      'active',
      'suspended',
      'concluded',
      'interrupted'
    )
  ),
  constraint ima_visibility_status_check check (
    visibility_status in (
      'private',
      'involved',
      'editorial',
      'public',
      'historical'
    )
  )
);

comment on table public.international_market_activities is
  'Attività internazionale owned by a PresenzaDiMercato (Physical §35.9 / Logical §5): a classified instance of what is concretely carried out in a Market under that Presence. Owned by Mercati Internazionali. Distinct from Presence itself, from Interest (intention only), from commercial relation, from internationalization need, from Opportunity, and from Service. Subject and Market are obtained via presence_id; they are not duplicated here.';

comment on column public.international_market_activities.id is
  'Stable internal identity of the Activity row.';

comment on column public.international_market_activities.presence_id is
  'Owning Presence (public.international_market_presences). ON DELETE CASCADE removes activities when the Presence is removed. Subject and Market are resolved through this Presence, not stored again on the Activity.';

comment on column public.international_market_activities.summary is
  'Optional short description of the Activity. Nullable. Not an Interest motivation and not an Opportunity title.';

comment on column public.international_market_activities.description is
  'Optional extended description of the Activity. Nullable. Not editorial Content of another domain.';

comment on column public.international_market_activities.activity_status is
  'Lifecycle status of the Activity: planned, started, active, suspended, concluded, interrupted. Default planned. Distinct from Presence relation_status and from Interest relation_status.';

comment on column public.international_market_activities.primary_access_channel_code is
  'Optional primary access channel from public.international_access_channels. ON DELETE RESTRICT. Not a business_channels value from the Imprese domain.';

comment on column public.international_market_activities.sector_id is
  'Optional economic sector from the shared public.business_sectors catalog. ON DELETE RESTRICT. Nullable: an Activity need not declare a sector.';

comment on column public.international_market_activities.location_note is
  'Optional free-text note on where the Activity is carried out. Not a Territori FK and not a Presence configuration.';

comment on column public.international_market_activities.visibility_status is
  'Visibility of the Activity: private, involved, editorial, public, historical. Default private. Distinct from verification and from Presence contestation.';

comment on column public.international_market_activities.started_at is
  'Optional start date of the Activity period. Nullable.';

comment on column public.international_market_activities.ended_at is
  'Optional end date of the Activity period. Nullable.';

comment on column public.international_market_activities.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_activities.updated_at is
  'Last update timestamp. Maintained by international_market_activities_set_updated_at.';

create table public.international_market_activity_type_links (
  id uuid not null default gen_random_uuid (),
  activity_id uuid not null,
  activity_type_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imatl_pkey primary key (id),
  constraint imatl_activity_id_fkey foreign key (activity_id)
    references public.international_market_activities (id)
    on delete cascade,
  constraint imatl_activity_type_code_fkey foreign key (activity_type_code)
    references public.international_activity_types (code)
    on delete restrict,
  constraint imatl_activity_type_unique unique (activity_id, activity_type_code)
);

comment on table public.international_market_activity_type_links is
  'Many-to-many link between an international Activity and one or more international_activity_types codes (Physical §35.9). An Activity may carry multiple types at once (Logical §5). Owned by Mercati Internazionali. Not a need type, not an Opportunity category, and not a Presence attribute.';

comment on column public.international_market_activity_type_links.id is
  'Stable internal identity of the type-link row.';

comment on column public.international_market_activity_type_links.activity_id is
  'Linked Activity (public.international_market_activities). ON DELETE CASCADE removes type links when the Activity is removed.';

comment on column public.international_market_activity_type_links.activity_type_code is
  'Activity type code from public.international_activity_types (M1.1). ON DELETE RESTRICT. Together with activity_id forms the unique pair that prevents duplicate type assignment.';

comment on column public.international_market_activity_type_links.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_activity_type_links.updated_at is
  'Last update timestamp. Maintained by international_market_activity_type_links_set_updated_at.';

alter table public.international_market_activities enable row level security;
alter table public.international_market_activity_type_links enable row level security;

-- Defense in depth: no policies in M3.3. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.international_market_activities from anon, authenticated;
revoke all on table public.international_market_activity_type_links from anon, authenticated;

create or replace function public.set_international_market_activities_updated_at ()
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

comment on function public.set_international_market_activities_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_activities. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger international_market_activities_set_updated_at
before update on public.international_market_activities
for each row
execute function public.set_international_market_activities_updated_at ();

create or replace function public.set_international_market_activity_type_links_updated_at ()
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

comment on function public.set_international_market_activity_type_links_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_activity_type_links. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger international_market_activity_type_links_set_updated_at
before update on public.international_market_activity_type_links
for each row
execute function public.set_international_market_activity_type_links_updated_at ();
