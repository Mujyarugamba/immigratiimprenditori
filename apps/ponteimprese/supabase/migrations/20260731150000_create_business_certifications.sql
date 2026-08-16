-- M5.1 — create business certifications
-- Persists CertificazioneImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §17 M5.1;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §4, §13.1, §11.4;
-- Logical imprese.md §2 / §10 regola 17.
--
-- Scope:
--   owned certification / qualification / registration / attestation
--   declarations of a Business: obligatory name; optional issuer;
--   current certification_status (five literals); optional expires_at.
--
-- Explicitly out of scope:
--   file / Storage / MIME; MediaImpresa; Entity Documento;
--   visibility_status / publication_status; active|removed axis;
--   Organizzazioni istituzionali as issuer FK; M6 multi-aspect verification;
--   badge Impresa verificata; UNIQUE on name; JSON/array.
--
-- Precondition: public.businesses (M1.1+). No dependency on M5.2 or M2–M4.

create table public.business_certifications (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Nome/tipo della certificazione (Physical §13.1; Logical §10 regola 17).
  name text not null,
  -- Ente emittente dichiarato (Physical §13.1). Not a FK to Ente.
  issuer text,
  -- Current certification status (Physical §13.1 / §11.4).
  -- expired ≠ revoked. No automatic sync with expires_at.
  certification_status text not null default 'self_declared',
  -- Optional T04 expiry date (Physical §13.1). Nullable; not forced by status.
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_certifications_name_check check (
    length(btrim(name)) > 0
  ),
  constraint business_certifications_certification_status_check check (
    certification_status in (
      'self_declared',
      'in_verification',
      'verified',
      'expired',
      'revoked'
    )
  )
);

comment on table public.business_certifications is
  'CertificazioneImpresa (E02) owned by the Imprese Aggregate Root: a declared certification, qualification, registration, or attestation. The declared fact is distinct from any supporting document/file (not modelled in M5.1). Not MediaImpresa, not M6 multi-aspect verification, not an institutional Ente Aggregate. Cardinality 0..N per business.';

comment on column public.business_certifications.id is
  'Local stable identity of this CertificazioneImpresa within the Aggregate. Not a public autonomous identity.';

comment on column public.business_certifications.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_certifications.name is
  'Declarative obligatory name or type of the certification (Logical §10 regola 17). Free-form, non-blank. Same name may appear on multiple rows for one business.';

comment on column public.business_certifications.issuer is
  'Optional declarative issuer text. Not a foreign key to an Ente or Organizzazioni istituzionali Aggregate. Empty string not constrained in M5.1.';

comment on column public.business_certifications.certification_status is
  'Current certification status: self_declared | in_verification | verified | expired | revoked. expired (time-based) is distinct from revoked (deliberate invalidation). Neither may be presented as valid (presentation / M7.1). Not M6 Impresa multi-aspect verification. Not publication or visibility.';

comment on column public.business_certifications.expires_at is
  'Optional expiry date (T04). Does not automatically set certification_status to expired. expired does not require expires_at.';

comment on column public.business_certifications.created_at is
  'Creation timestamp of the certification row. System-managed default.';

comment on column public.business_certifications.updated_at is
  'Last update timestamp. Maintained by business_certifications_set_updated_at; not a client-owned field.';

create index business_certifications_business_id_idx
  on public.business_certifications using btree (business_id);

create or replace function public.set_business_certifications_updated_at ()
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

comment on function public.set_business_certifications_updated_at () is
  'BEFORE UPDATE trigger function for public.business_certifications.updated_at. SECURITY INVOKER; empty search_path. Does not enforce verification, expiry sync, or publication gates.';

create trigger business_certifications_set_updated_at
before update on public.business_certifications
for each row
execute function public.set_business_certifications_updated_at ();

alter table public.business_certifications enable row level security;

-- Defense in depth: no policies in M5.1. Deny-by-default for anon/authenticated.
revoke all on table public.business_certifications from anon, authenticated;
