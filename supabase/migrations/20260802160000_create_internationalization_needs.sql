-- M4.2 — create internationalization needs
-- Implements the Aggregate Root Esigenza di internazionalizzazione of
-- Mercati Internazionali:
--   public.internationalization_needs
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M4.2;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.11;
--  docs/architecture/logical/mercati-internazionali.md §8, §12).
--
-- Scope of this unit only: typed internationalization need declared by a
-- business XOR person, optionally linked to a Market, with priority,
-- need_status, editorial / visibility axes, optional open/close dates,
-- timestamps, RLS defense, updated_at trigger.
-- Explicitly out of scope: Presence, Interest, Activity, commercial relation,
-- Opportunity, Collaboration, Service, Source, Evidence, Verification,
-- Professionisti subject, CASCADE from subjects, demo seed.
-- Depends on M1.3 public.internationalization_need_types;
-- M2.1 public.international_markets; public.profiles; public.businesses;
-- public.business_memberships.

create table public.internationalization_needs (
  id uuid not null default gen_random_uuid (),
  market_id uuid null,
  subject_kind text not null,
  business_id uuid null,
  person_id uuid null,
  membership_id uuid null,
  need_type_code text not null,
  summary text not null,
  description text null,
  priority text not null default 'normal',
  editorial_status text not null default 'proposed',
  need_status text not null default 'open',
  visibility_status text not null default 'private',
  opened_at date null,
  closed_at date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inn_pkey primary key (id),
  constraint inn_market_id_fkey foreign key (market_id)
    references public.international_markets (id)
    on delete set null,
  constraint inn_business_id_fkey foreign key (business_id)
    references public.businesses (id)
    on delete restrict,
  constraint inn_person_id_fkey foreign key (person_id)
    references public.profiles (id)
    on delete restrict,
  constraint inn_membership_id_fkey foreign key (membership_id)
    references public.business_memberships (id)
    on delete restrict,
  constraint inn_need_type_code_fkey foreign key (need_type_code)
    references public.internationalization_need_types (code)
    on delete restrict,
  constraint inn_subject_check check (
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
  constraint inn_membership_check check (
    membership_id is null
    or subject_kind = 'business'
  ),
  constraint inn_priority_check check (
    priority in (
      'low',
      'normal',
      'high'
    )
  ),
  constraint inn_need_status_check check (
    need_status in (
      'open',
      'in_progress',
      'fulfilled',
      'withdrawn',
      'archived'
    )
  )
);

comment on table public.internationalization_needs is
  'Aggregate Root Esigenza di internazionalizzazione (Physical §35.11 / Logical §8): a typed need declared by a business XOR person for its internationalization path. Owned by Mercati Internazionali. Distinct from Interest, Presence, Activity, commercial relation, Opportunity, Collaboration, and Service. Does not create Opportunities or Collaborations.';

comment on column public.internationalization_needs.id is
  'Stable internal identity of the internationalization need. Independent of market, subject, type, and status axes.';

comment on column public.internationalization_needs.market_id is
  'Optional referenced Market (public.international_markets). Nullable when the need is not yet geographically scoped. ON DELETE SET NULL clears the reference if the Market is removed, without deleting the need.';

comment on column public.internationalization_needs.subject_kind is
  'Declaring subject discriminator: business or person. Professionisti excluded. XOR with business_id / person_id enforced by inn_subject_check.';

comment on column public.internationalization_needs.business_id is
  'Opaque identity reference to public.businesses when subject_kind = business. ON DELETE RESTRICT. Null when subject is person.';

comment on column public.internationalization_needs.person_id is
  'Opaque identity reference to public.profiles when subject_kind = person. ON DELETE RESTRICT. Null when subject is business.';

comment on column public.internationalization_needs.membership_id is
  'Optional Appartenenza title (public.business_memberships) when the declaring subject is a business. Allowed only if subject_kind = business. ON DELETE RESTRICT. Contextual representation reference only; not ownership of Appartenenze.';

comment on column public.internationalization_needs.need_type_code is
  'Required reference to public.internationalization_need_types.code. Classifies the need type from the Mercati Internazionali catalog. ON DELETE RESTRICT. Not a local copy of catalog labels or sort order.';

comment on column public.internationalization_needs.summary is
  'Required short human-facing statement of the need. Descriptive identity of this need instance, not an Opportunity title and not a Service description.';

comment on column public.internationalization_needs.description is
  'Optional longer description of the need. Nullable. Not Opportunity content, not a requirement/benefit structure, and not a Collaboration proposal.';

comment on column public.internationalization_needs.priority is
  'Declared priority of the need: low, normal, high. Default normal. Not urgency of an Opportunity process and not ranking score.';

comment on column public.internationalization_needs.editorial_status is
  'Editorial axis of the need declaration. Default proposed. Distinct from need_status and visibility_status.';

comment on column public.internationalization_needs.need_status is
  'Lifecycle axis of the need: open, in_progress, fulfilled, withdrawn, archived. Default open. Distinct from Interest relation_status, Presence relation_status, and commercial relation_status.';

comment on column public.internationalization_needs.visibility_status is
  'Visibility axis of the need. Default private. Distinct from editorial_status and need_status. Not publication of an Opportunity.';

comment on column public.internationalization_needs.opened_at is
  'Optional date when the need was opened. Nullable.';

comment on column public.internationalization_needs.closed_at is
  'Optional date when the need was closed. Nullable.';

comment on column public.internationalization_needs.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.internationalization_needs.updated_at is
  'Last update timestamp. Maintained by internationalization_needs_set_updated_at.';

alter table public.internationalization_needs enable row level security;

-- Defense in depth: with RLS enabled and no policy, roles subject to RLS cannot
-- read or write. Access policies belong to Identità & Accessi. service_role and
-- owner privileges are not revoked.
revoke all on table public.internationalization_needs from anon, authenticated;

create or replace function public.set_internationalization_needs_updated_at ()
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

comment on function public.set_internationalization_needs_updated_at () is
  'BEFORE UPDATE trigger function for public.internationalization_needs. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger internationalization_needs_set_updated_at
before update on public.internationalization_needs
for each row
execute function public.set_internationalization_needs_updated_at ();
