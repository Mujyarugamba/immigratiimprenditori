-- M1.2 — create international access channels
-- Implements the normative C05/C06 access-channel catalog of Mercati Internazionali:
--   public.international_access_channels
-- (docs/architecture/migrations/mercati-internazionali-migration-plan.md §8 M1.2;
--  docs/architecture/physical/domain-mapping/mercati-internazionali.md §35.2;
--  docs/architecture/logical/mercati-internazionali.md §2 Canale di accesso).
--
-- Scope of this unit only: catalog structure and 6 normative seed rows.
-- Explicitly out of scope: need types, markets, countries, support resources,
-- presences, interests, activity instances, type/channel links, commercial
-- relations, needs, sources, evidences, verifications, business_channels,
-- Opportunity access modes, demo data. Does not alter M1.1.

create table public.international_access_channels (
  code text not null,
  label_it text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint iac_pkey primary key (code),
  constraint iac_code_not_blank_check check (length(btrim(code)) > 0),
  constraint iac_label_it_not_blank_check check (length(btrim(label_it)) > 0),
  constraint iac_sort_order_check check (sort_order >= 0)
);

comment on table public.international_access_channels is
  'Normative controlled catalog (C05/C06) of market access channels for Mercati Internazionali. Owned by Mercati Internazionali. Each row defines a stable channel vocabulary entry, not a concrete activity, Presence, Interest, commercial relation, support resource, or technical permission. Distinct from Imprese business_channels and from Opportunity access modes. Does not confer publication, visibility, verification, badge, or score. M1.2 seed is normative, not demo (M8.1).';

comment on column public.international_access_channels.code is
  'Stable technical English identifier of the access channel. Primary key. Not a localized label. Immutable by convention; referenced by future activity primary_access_channel_code.';

comment on column public.international_access_channels.label_it is
  'Italian display label aligned to Logical §2 access-channel names. Descriptive only; not unique and not identity.';

comment on column public.international_access_channels.sort_order is
  'Canonical administrative display order within this catalog, lower values first. Not priority, not identity, and not unique.';

comment on column public.international_access_channels.is_active is
  'Catalog activation flag. Deactivating a value does not delete the row and does not automatically invalidate existing references; does not drive RLS, publication, or verification.';

comment on column public.international_access_channels.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.international_access_channels.updated_at is
  'Last update timestamp. Maintained by international_access_channels_set_updated_at.';

alter table public.international_access_channels enable row level security;

-- Defense in depth: no policies in M1.2. With RLS enabled and no policy,
-- roles subject to RLS cannot read or write. Access policies belong to
-- Identità & Accessi. service_role and owner privileges are not revoked.
revoke all on table public.international_access_channels from anon, authenticated;

create or replace function public.set_international_access_channels_updated_at ()
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

comment on function public.set_international_access_channels_updated_at () is
  'BEFORE UPDATE trigger function for public.international_access_channels. Sets updated_at to now(). SECURITY INVOKER; empty search_path. Does not touch created_at or other tables.';

create trigger international_access_channels_set_updated_at
before update on public.international_access_channels
for each row
execute function public.set_international_access_channels_updated_at ();

-- Normative seed from Logical §2 / Physical §35.2 / Migration Plan M1.2.
-- Exactly 6 channels. Not demo data. Duplicate codes fail the primary key (no upsert).
insert into public.international_access_channels (
  code,
  label_it,
  sort_order,
  is_active
)
values
  (
    'distributor',
    'Distributore',
    10,
    true
  ),
  (
    'marketplace',
    'Marketplace',
    20,
    true
  ),
  (
    'direct_branch',
    'Filiale diretta',
    30,
    true
  ),
  (
    'agent',
    'Agente',
    40,
    true
  ),
  (
    'trade_fair',
    'Fiera',
    50,
    true
  ),
  (
    'sales_network',
    'Rete di vendita',
    60,
    true
  );
