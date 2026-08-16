-- M4.1 — create international commercial relations
-- Implements the Aggregate Root Relazione commerciale internazionale of
-- Mercati Internazionali:
--   public.international_commercial_relations
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M4.1;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.10;
--  docs/architecture/logical/mercati-internazionali.md §6, §12).
--
-- Scope of this unit only: commercial link of a business XOR person to a
-- counterpart in a required Market context, with relation_nature, counterpart
-- pattern, editorial / relation / verification / visibility axes, is_contested,
-- optional period, notes, timestamps, RLS defense, updated_at trigger.
-- Explicitly out of scope: Presence, Interest, Activity, internationalization
-- need, Opportunity, Collaboration, Service, Source, Evidence, Verification,
-- Organizations domain, structured commercial volumes or values,
-- Professionisti subject, CASCADE from subjects, demo seed.
-- Depends on M2.1 public.international_markets; public.profiles;
-- public.businesses; public.business_memberships.

create table public.international_commercial_relations (
  id uuid not null default gen_random_uuid (),
  market_id uuid not null,
  subject_kind text not null,
  business_id uuid null,
  person_id uuid null,
  membership_id uuid null,
  relation_nature text not null,
  counterpart_kind text not null default 'external',
  counterpart_business_id uuid null,
  counterpart_person_id uuid null,
  counterpart_label text null,
  editorial_status text not null default 'proposed',
  relation_status text not null default 'active',
  verification_status text not null default 'unverified',
  is_contested boolean not null default false,
  visibility_status text not null default 'private',
  started_at date null,
  ended_at date null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint icr_pkey primary key (id),
  constraint icr_market_id_fkey foreign key (market_id)
    references public.international_markets (id)
    on delete restrict,
  constraint icr_business_id_fkey foreign key (business_id)
    references public.businesses (id)
    on delete restrict,
  constraint icr_person_id_fkey foreign key (person_id)
    references public.profiles (id)
    on delete restrict,
  constraint icr_membership_id_fkey foreign key (membership_id)
    references public.business_memberships (id)
    on delete restrict,
  constraint icr_counterpart_business_id_fkey foreign key (counterpart_business_id)
    references public.businesses (id)
    on delete restrict,
  constraint icr_counterpart_person_id_fkey foreign key (counterpart_person_id)
    references public.profiles (id)
    on delete restrict,
  constraint icr_subject_check check (
    (
      subject_kind = 'business'
      and business_id is not null
      and person_id is null
    )
    or (
      subject_kind = 'person'
      and person_id is not null
      and business_id is null
    )
  ),
  constraint icr_membership_check check (
    membership_id is null
    or subject_kind = 'business'
  ),
  constraint icr_relation_nature_check check (
    relation_nature in (
      'customer',
      'supplier',
      'distributor',
      'agent',
      'partner',
      'investor'
    )
  ),
  constraint icr_counterpart_kind_check check (
    counterpart_kind in (
      'external',
      'business',
      'person'
    )
  ),
  constraint icr_counterpart_check check (
    (
      counterpart_kind = 'external'
      and counterpart_label is not null
      and counterpart_business_id is null
      and counterpart_person_id is null
    )
    or (
      counterpart_kind = 'business'
      and counterpart_business_id is not null
      and counterpart_person_id is null
    )
    or (
      counterpart_kind = 'person'
      and counterpart_person_id is not null
      and counterpart_business_id is null
    )
  ),
  constraint icr_relation_status_check check (
    relation_status in (
      'active',
      'suspended',
      'concluded',
      'contested_hold',
      'archived'
    )
  )
);

comment on table public.international_commercial_relations is
  'Aggregate Root Relazione commerciale internazionale (Physical §35.10 / Logical §6): a commercial link of a declaring business XOR person to a counterpart in a required Market context. Owned by Mercati Internazionali. Distinct from Presence, Interest, Activity, internationalization need, Opportunity, Collaboration, and Service. Not a structured commercial contract and not an economic volume record.';

comment on column public.international_commercial_relations.id is
  'Stable internal identity of the commercial relation. Independent of market, subject, counterpart, and status axes.';

comment on column public.international_commercial_relations.market_id is
  'Referenced Market (public.international_markets). Required context of the commercial relation. ON DELETE RESTRICT: a Market referenced by commercial relations cannot be removed. Not owned composition.';

comment on column public.international_commercial_relations.subject_kind is
  'Declaring subject discriminator: business or person. Professionisti excluded. XOR with business_id / person_id enforced by icr_subject_check.';

comment on column public.international_commercial_relations.business_id is
  'Opaque identity reference to public.businesses when subject_kind = business. ON DELETE RESTRICT. Null when subject is person.';

comment on column public.international_commercial_relations.person_id is
  'Opaque identity reference to public.profiles when subject_kind = person. ON DELETE RESTRICT. Null when subject is business.';

comment on column public.international_commercial_relations.membership_id is
  'Optional Appartenenza title (public.business_memberships) when the declaring subject is a business. Allowed only if subject_kind = business. ON DELETE RESTRICT. Contextual representation reference only; not ownership of Appartenenze.';

comment on column public.international_commercial_relations.relation_nature is
  'Closed commercial nature of the relation toward the counterpart: customer, supplier, distributor, agent, partner, investor. Commercial partner nature is not a platform Partnership agreement and not a Collaboration.';

comment on column public.international_commercial_relations.counterpart_kind is
  'Counterpart discriminator: external (informational label), business, or person. Default external. Determines which counterpart fields identify the commercial counterparty.';

comment on column public.international_commercial_relations.counterpart_business_id is
  'Opaque identity reference to public.businesses when counterpart_kind = business. ON DELETE RESTRICT. Null for external or person counterparts.';

comment on column public.international_commercial_relations.counterpart_person_id is
  'Opaque identity reference to public.profiles when counterpart_kind = person. ON DELETE RESTRICT. Null for external or business counterparts.';

comment on column public.international_commercial_relations.counterpart_label is
  'Human-facing informational label of the counterpart. Required when counterpart_kind = external; optional descriptive label when counterpart_kind is business or person. Not an Organizations identity and not a structured contact entity.';

comment on column public.international_commercial_relations.editorial_status is
  'Editorial axis of the commercial relation declaration. Default proposed. Distinct from relation_status, verification_status, visibility_status, and is_contested.';

comment on column public.international_commercial_relations.relation_status is
  'Lifecycle axis of the commercial relation: active, suspended, concluded, contested_hold, archived. Default active. Distinct from Presence relation_status and from is_contested.';

comment on column public.international_commercial_relations.verification_status is
  'Verification axis of the commercial relation declaration. Default unverified. Contestation is the separate is_contested overlay. Not a Source, Evidence, or Verification entity.';

comment on column public.international_commercial_relations.is_contested is
  'Independent contestation overlay. Default false. Not a verification_status value and not equivalent to relation_status contested_hold alone.';

comment on column public.international_commercial_relations.visibility_status is
  'Visibility axis of the commercial relation. Default private. Publication of commercial counterparts is never automatic. Distinct from editorial_status and verification_status.';

comment on column public.international_commercial_relations.started_at is
  'Optional start date of the commercial relation period. Nullable.';

comment on column public.international_commercial_relations.ended_at is
  'Optional end date of the commercial relation period. Nullable.';

comment on column public.international_commercial_relations.notes is
  'Optional free-text notes about the commercial relation. Nullable. Not structured volume, value, contract document, or Opportunity content.';

comment on column public.international_commercial_relations.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_commercial_relations.updated_at is
  'Last update timestamp. Maintained by international_commercial_relations_set_updated_at.';

alter table public.international_commercial_relations enable row level security;

-- Defense in depth: with RLS enabled and no policy, roles subject to RLS cannot
-- read or write. Access policies belong to Identità & Accessi. service_role and
-- owner privileges are not revoked.
revoke all on table public.international_commercial_relations from anon, authenticated;

create or replace function public.set_international_commercial_relations_updated_at ()
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

comment on function public.set_international_commercial_relations_updated_at () is
  'BEFORE UPDATE trigger function for public.international_commercial_relations. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_commercial_relations_set_updated_at
before update on public.international_commercial_relations
for each row
execute function public.set_international_commercial_relations_updated_at ();
