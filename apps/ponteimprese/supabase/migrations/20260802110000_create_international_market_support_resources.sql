-- M2.3 — create international market support resources
-- Implements the owned Market support-resource entity of Mercati Internazionali:
--   public.international_market_support_resources
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M2.3;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.6;
--  docs/architecture/logical/mercati-internazionali.md §2, §6).
--
-- Scope of this unit only: institutional, informational, or operational support
-- resources linked to a Market (chamber, embassy/consulate, association,
-- entrepreneurial network, public agency, other_support), with substantial /
-- verification / visibility axes, timestamps, RLS defense, updated_at trigger.
-- Explicitly out of scope: Opportunity, platform Service, platform Partner,
-- commercial relation, Presence, Interest, Activity, Organizations domain,
-- multi-market bridge tables, sources, evidences, verifications, demo/normative seed.
-- Depends on M2.1 public.international_markets.

create table public.international_market_support_resources (
  id uuid not null default gen_random_uuid (),
  market_id uuid not null,
  name text not null,
  resource_kind text not null,
  summary text null,
  website_url text null,
  contact_note text null,
  territorial_scope_note text null,
  substantial_status text not null default 'signaled',
  verification_status text not null default 'unverified',
  visibility_status text not null default 'editorial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint imsr_pkey primary key (id),
  constraint imsr_market_id_fkey foreign key (market_id)
    references public.international_markets (id)
    on delete cascade,
  constraint imsr_resource_kind_check check (
    resource_kind in (
      'chamber_of_commerce',
      'embassy_consulate',
      'association',
      'entrepreneurial_network',
      'public_agency',
      'other_support'
    )
  ),
  constraint imsr_substantial_status_check check (
    substantial_status in (
      'signaled',
      'active',
      'archived'
    )
  ),
  constraint imsr_verification_status_check check (
    verification_status in (
      'unverified',
      'in_review',
      'confirmed',
      'rejected'
    )
  ),
  constraint imsr_visibility_status_check check (
    visibility_status in (
      'private',
      'editorial',
      'public',
      'historical'
    )
  )
);

comment on table public.international_market_support_resources is
  'Owned Market support resource for Mercati Internazionali (Physical §35.6 / Logical §2, §6): an institutional, informational, or operational body supporting internationalization toward a specific Market. Local ownership in this domain until a future Organizations domain may absorb it. Not an Opportunity, platform Service, platform Partner, commercial relation, Presence, Interest, or Activity.';

comment on column public.international_market_support_resources.id is
  'Stable internal identity of the support resource row. Independent of name and of any future Organizations identity.';

comment on column public.international_market_support_resources.market_id is
  'Owning Market (public.international_markets). The resource supports this specific Market. ON DELETE CASCADE removes the resource when the Market is removed. Not a multi-market shared catalog key.';

comment on column public.international_market_support_resources.name is
  'Human-facing name of the support body or network. Descriptive identity label for this Market-linked row.';

comment on column public.international_market_support_resources.resource_kind is
  'Closed vocabulary for the kind of organism or network: chamber_of_commerce, embassy_consulate, association, entrepreneurial_network, public_agency, other_support. Not a Partner type and not an Opportunity category.';

comment on column public.international_market_support_resources.summary is
  'Optional short description of the support resource. Nullable. Not editorial content of another domain.';

comment on column public.international_market_support_resources.website_url is
  'Optional informational URL reference. Nullable. Not a structured external identity and not an Opportunity or Service link.';

comment on column public.international_market_support_resources.contact_note is
  'Optional free-text contact note. Descriptive only; not a structured contact entity, channel, or messaging address.';

comment on column public.international_market_support_resources.territorial_scope_note is
  'Optional free-text note describing territorial scope of the support offered. Not a Territori FK and not Market–Country composition.';

comment on column public.international_market_support_resources.substantial_status is
  'Substantial governance axis of the support resource (distinct from verification_status and visibility_status): signaled, active, archived. Default signaled.';

comment on column public.international_market_support_resources.verification_status is
  'Verification axis of the support resource (distinct from substantial_status and visibility_status): unverified, in_review, confirmed, rejected. Default unverified. Not a Presence verification.';

comment on column public.international_market_support_resources.visibility_status is
  'Visibility axis of the support resource (distinct from substantial_status and verification_status): private, editorial, public, historical. Default editorial. Not publication of an Opportunity or editorial Content.';

comment on column public.international_market_support_resources.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_market_support_resources.updated_at is
  'Last update timestamp. Maintained by international_market_support_resources_set_updated_at.';

create index imsr_market_id_idx
  on public.international_market_support_resources (market_id);

create index imsr_substantial_status_idx
  on public.international_market_support_resources (substantial_status);

alter table public.international_market_support_resources enable row level security;

-- Defense in depth: with RLS enabled and no policy, roles subject to RLS cannot
-- read or write. Access policies belong to Identità & Accessi. service_role and
-- owner privileges are not revoked.
revoke all on table public.international_market_support_resources from anon, authenticated;

create or replace function public.set_international_market_support_resources_updated_at ()
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

comment on function public.set_international_market_support_resources_updated_at () is
  'BEFORE UPDATE trigger function for public.international_market_support_resources. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_market_support_resources_set_updated_at
before update on public.international_market_support_resources
for each row
execute function public.set_international_market_support_resources_updated_at ();
