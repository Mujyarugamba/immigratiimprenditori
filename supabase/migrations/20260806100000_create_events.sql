-- M2.1 — create events
-- Implements Aggregate Root Evento of Eventi:
--   public.events
-- (docs/architecture/migrations/eventi-migration-plan.md §11 M2.1;
--  docs/architecture/physical/domain-mapping/eventi.md §7, §19–§20, §24–§27;
--  docs/architecture/logical/eventi.md).
--
-- Scope of this unit only: AR structure, owner XOR, type_code, lifecycle axes,
-- optional context FKs, indexes, updated_at, RLS, REVOKE.
-- Explicitly out of scope: editions/sessions (M3); organizers/speakers (M4);
-- languages/markets/registrations (M5); seed; policies; GRANT; ticketing;
-- RRULE; FEV; Storage; Organizzazioni; attendance counters.
--
-- Application invariant (not DDL): publication_status = 'published' implies
-- at least one event_editions row with starts_at set. No cross-table trigger.

create table public.events (
  id uuid not null default gen_random_uuid (),
  owner_person_id uuid null,
  owner_business_id uuid null,
  type_code text not null,
  title text not null,
  summary text null,
  description text not null,
  delivery_mode text not null default 'in_presence',
  audience_kind text not null default 'both',
  audience_note text null,
  nature_label text null,
  economic_kind text not null default 'unspecified',
  economic_note text null,
  context_opportunity_id uuid null,
  context_service_offer_id uuid null,
  external_organization_label text null,
  editorial_status text not null default 'draft',
  publication_status text not null default 'unpublished',
  visibility_status text not null default 'private',
  published_at timestamptz null,
  withdrawn_at timestamptz null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_pkey primary key (id),
  constraint events_owner_person_id_fkey
    foreign key (owner_person_id)
    references public.profiles (id)
    on update no action
    on delete restrict,
  constraint events_owner_business_id_fkey
    foreign key (owner_business_id)
    references public.businesses (id)
    on update no action
    on delete restrict,
  constraint events_type_code_fkey
    foreign key (type_code)
    references public.event_types (code)
    on update cascade
    on delete restrict,
  constraint events_context_opportunity_id_fkey
    foreign key (context_opportunity_id)
    references public.opportunities (id)
    on update no action
    on delete set null,
  constraint events_context_service_offer_id_fkey
    foreign key (context_service_offer_id)
    references public.service_offers (id)
    on update no action
    on delete set null,
  constraint events_owner_xor_check check (
    (
      owner_person_id is not null
      and owner_business_id is null
    )
    or (
      owner_person_id is null
      and owner_business_id is not null
    )
  ),
  constraint events_title_not_blank_check check (
    length(btrim(title)) > 0
  ),
  constraint events_description_not_blank_check check (
    length(btrim(description)) > 0
  ),
  constraint events_delivery_mode_check check (
    delivery_mode in ('in_presence', 'online', 'hybrid')
  ),
  constraint events_audience_kind_check check (
    audience_kind in ('persons', 'businesses', 'both')
  ),
  constraint events_economic_kind_check check (
    economic_kind in ('free', 'paid', 'unspecified')
  ),
  constraint events_editorial_status_check check (
    editorial_status in ('draft', 'ready')
  ),
  constraint events_publication_status_check check (
    publication_status in ('unpublished', 'published', 'withdrawn')
  ),
  constraint events_visibility_status_check check (
    visibility_status in ('private', 'public')
  ),
  constraint events_publication_gates_check check (
    (
      publication_status = 'published'
      and published_at is not null
      and editorial_status = 'ready'
    )
    or (
      publication_status = 'withdrawn'
      and withdrawn_at is not null
    )
    or (
      publication_status = 'unpublished'
      and published_at is null
      and withdrawn_at is null
    )
  ),
  constraint events_nature_label_check check (
    nature_label is null
    or length(btrim(nature_label)) > 0
  ),
  constraint events_audience_note_check check (
    audience_note is null
    or length(btrim(audience_note)) > 0
  ),
  constraint events_economic_note_check check (
    economic_note is null
    or length(btrim(economic_note)) > 0
  ),
  constraint events_external_org_label_check check (
    external_organization_label is null
    or length(btrim(external_organization_label)) > 0
  ),
  constraint events_summary_check check (
    summary is null
    or length(btrim(summary)) > 0
  )
);

comment on table public.events is
  'Aggregate Root of Eventi: structured publishable Evento sheet, independent of concrete editions. Owned by Eventi. Distinct from OffertaDiServizio (service_offers), Opportunità (opportunities), and editorial Contenuti. Owner is exactly one of Persona (profiles) or Impresa (businesses). Not ticketing, not RRULE, not FEV, not Storage. Application invariant: published events require ≥1 event_editions row with starts_at (enforced outside DDL; no cross-table trigger in cycle 1).';

comment on column public.events.id is
  'Surrogate UUID primary key. Default gen_random_uuid(). Stable identity of the event sheet.';

comment on column public.events.owner_person_id is
  'Owning Persona when titolare is a person. XOR with owner_business_id. FK profiles ON DELETE RESTRICT.';

comment on column public.events.owner_business_id is
  'Owning Impresa when titolare is a business. XOR with owner_person_id. FK businesses ON DELETE RESTRICT.';

comment on column public.events.type_code is
  'FK to event_types(code). Required. ON UPDATE CASCADE; ON DELETE RESTRICT.';

comment on column public.events.title is
  'Required non-blank human-facing title. Homonyms allowed (no UNIQUE).';

comment on column public.events.summary is
  'Optional short synopsis. Nullable; blank rejected when present.';

comment on column public.events.description is
  'Required non-blank substantial description of the event. Not editorial CMS content.';

comment on column public.events.delivery_mode is
  'Closed typological delivery mode: in_presence | online | hybrid. Default in_presence. Edition may refine. Distinct from Servizi in_person.';

comment on column public.events.audience_kind is
  'Closed audience: persons | businesses | both. Default both.';

comment on column public.events.audience_note is
  'Optional free-text audience segment note. Not a CRM list.';

comment on column public.events.nature_label is
  'Optional free-text typological refinement. Not a separate catalog.';

comment on column public.events.economic_kind is
  'Descriptive economic classification only: free | paid | unspecified. No amounts, currency, or tickets.';

comment on column public.events.economic_note is
  'Optional free-text economic note. Not an amount, currency, invoice, or ticket price.';

comment on column public.events.context_opportunity_id is
  'Optional opaque context reference to opportunities. ON DELETE SET NULL. Not ownership of Opportunità.';

comment on column public.events.context_service_offer_id is
  'Optional opaque context reference to service_offers. ON DELETE SET NULL. Not ownership of OffertaDiServizio.';

comment on column public.events.external_organization_label is
  'Optional informative external organization label. Not a FK to Organizzazioni (future domain).';

comment on column public.events.editorial_status is
  'Editorial axis: draft | ready. Default draft.';

comment on column public.events.publication_status is
  'Publication axis: unpublished | published | withdrawn. Default unpublished. Published implies ≥1 edition (application invariant, not DDL).';

comment on column public.events.visibility_status is
  'Substantial visibility: private | public. Default private. Not an RLS policy.';

comment on column public.events.published_at is
  'Publication timestamp. Required when publication_status = published; NULL when unpublished.';

comment on column public.events.withdrawn_at is
  'Withdrawal timestamp. Required when publication_status = withdrawn.';

comment on column public.events.archived_at is
  'Archive timestamp. NULL means current; set means archived historically.';

comment on column public.events.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.events.updated_at is
  'Last update timestamp. Maintained by events_set_updated_at.';

create index events_owner_person_id_idx
  on public.events (owner_person_id)
  where owner_person_id is not null;

create index events_owner_business_id_idx
  on public.events (owner_business_id)
  where owner_business_id is not null;

create index events_type_code_idx
  on public.events (type_code);

create index events_publication_status_idx
  on public.events (publication_status);

create index events_published_idx
  on public.events (publication_status)
  where publication_status = 'published';

create index events_archived_at_idx
  on public.events (archived_at)
  where archived_at is not null;

alter table public.events enable row level security;

revoke all on table public.events from public;
revoke all on table public.events from anon, authenticated;

create or replace function public.set_events_updated_at ()
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

comment on function public.set_events_updated_at () is
  'BEFORE UPDATE trigger function for public.events. Sets updated_at to now(). SECURITY INVOKER; empty search_path.';

create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_events_updated_at ();
