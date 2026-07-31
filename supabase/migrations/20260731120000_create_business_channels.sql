-- M3.2 — create business channels
-- Persists CanaleImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §15 M3.2;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §4, §6, §8, §11.2, §15;
-- Logical imprese.md §2 / §10 regola 14.
--
-- Scope:
--   owned concrete channels of a Business: channel nature (C05);
--   obligatory channel_value (ValoreCanale); own visibility (S04);
--   removal retention (S08 — active|removed). Digital/physical contact concepts
--   are unified in this Entity (Physical §8) — no separate Contatto Entity.
--   No principal/priority among channels (Physical §8: unlike SedeImpresa).
--
-- Explicitly out of scope:
--   Contatto as Aggregate/Entity; marketplace as a domain; social sync;
--   account absorption / Identità & Accessi; personal contacts of referenti
--   (Persone/Appartenenze); verification of channel (none in Physical §12);
--   publication gates (M7.1); Territori; MercatoImpresa; Event venues;
--   street addresses / GPS; FK to business_locations; advanced URL/email/phone
--   validation; services/products/media/certifications (M4+).
--
-- Precondition: public.businesses (M1.1+). No dependency on M3.1 locations.

create table public.business_channels (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Natura del canale (Physical §4/§6/§8.1 C05; Logical §2 CanaleImpresa).
  channel_type text not null,
  -- ValoreCanale (Physical §8.2; Logical §10 regola 14). Concrete declared
  -- reference; meaning depends on channel_type. Not a FK, credential, or Account.
  channel_value text not null,
  -- S04 of CanaleImpresa (Physical §11.2): Non pubblico / Pubblico.
  -- Ceiling vs Impresa publication is an M7.1 gate, not a composite CHECK here.
  visibility_status text not null default 'non_public',
  -- Existence/removal of the dependent channel (Physical §11.2 S01 N/A as a
  -- distinct real-world axis; S08 historization on removal §14).
  -- Distinct from businesses.deleted_at and from M2 declaration_status.
  channel_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_channels_channel_type_check check (
    channel_type in (
      'own_site',
      'ecommerce',
      'marketplace',
      'social',
      'commercial_phone',
      'commercial_email',
      'retail_point',
      'distribution_network'
    )
  ),
  constraint business_channels_channel_value_check check (
    length(btrim(channel_value)) > 0
  ),
  constraint business_channels_visibility_status_check check (
    visibility_status in (
      'non_public',
      'public'
    )
  ),
  constraint business_channels_channel_status_check check (
    channel_status in (
      'active',
      'removed'
    )
  )
);

comment on table public.business_channels is
  'CanaleImpresa (E02) owned by the Imprese Aggregate Root: a concrete channel through which the business operates or communicates externally (channel_type + channel_value). Not a typological flag alone. Unifies digital/physical contact concepts without a separate Contatto Entity (Physical §8). Not marketplace-as-domain, not personal contact of a referente, not Identità & Accessi account. Cardinality 0..N per business; each channel belongs to exactly one business. No principal-channel role (unlike SedeImpresa).';

comment on column public.business_channels.id is
  'Local stable identity of this CanaleImpresa within the Aggregate (Physical §5/§8). Distinguishes channels of the same business. Not a public autonomous identity.';

comment on column public.business_channels.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_channels.channel_type is
  'Natura del canale (C05): own_site | ecommerce | marketplace | social | commercial_phone | commercial_email | retail_point | distribution_network. Classifies this concrete channel; multiple channels of the same nature may coexist when channel_value differs. Not a shared taxonomy VO03. marketplace is a local channel nature only (not a Marketplace domain). retail_point is a commercial-channel nature, not business_locations and not a structured location FK. commercial_email is the business commercial email, not a personal email, Account credential, or Identità & Accessi identity.';

comment on column public.business_channels.channel_value is
  'ValoreCanale: concrete declared reference for this channel (Physical §8.2; Logical §10 regola 14). Meaning depends on channel_type (URL, phone number, commercial email, handle/profile, retail-point label, distribution-network name, or other coherent text). Required, non-blank. Not a foreign key, credential, Account, ownership proof, or verification. No type-specific semantic validation in M3.2. Retained when channel_status = removed.';

comment on column public.business_channels.visibility_status is
  'S04 own visibility of the channel: non_public | public. May be stricter than Impresa publication (Physical §9/§15); ceiling coherence is M7.1. Not RLS.';

comment on column public.business_channels.channel_status is
  'Existence of this channel in the Aggregate composition: active | removed. removed retains the row and channel_value (S08). Distinct from businesses.is_archived, businesses.deleted_at, and M2 declaration_status.';

comment on column public.business_channels.created_at is
  'Creation timestamp of the channel row. System-managed default.';

comment on column public.business_channels.updated_at is
  'Last update timestamp. Maintained by business_channels_set_updated_at; not a client-owned field.';

create index business_channels_business_id_idx
  on public.business_channels using btree (business_id);

create index business_channels_channel_type_idx
  on public.business_channels using btree (channel_type);

create or replace function public.set_business_channels_updated_at ()
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

create trigger business_channels_set_updated_at
before update on public.business_channels
for each row
execute function public.set_business_channels_updated_at ();

alter table public.business_channels enable row level security;

-- Defense in depth: no policies in M3.2. Deny-by-default for anon/authenticated.
revoke all on table public.business_channels from anon, authenticated;
