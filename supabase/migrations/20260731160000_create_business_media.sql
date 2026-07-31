-- M5.2 — create business media
-- Persists MediaImpresa (E02) for the Imprese domain:
-- docs/architecture/migrations/imprese-migration-plan.md §17 M5.2;
-- docs/architecture/physical/domain-mapping/imprese.md §3, §4, §17.1, §11.2;
-- Logical imprese.md §2 / §10 regola 18.
--
-- Scope:
--   owned presentation media of a Business: media_kind (C05);
--   obligatory media_reference (declarative); optional primary logo role;
--   own visibility (S04 — non_public|public); removal retention (S08).
--
-- Explicitly out of scope:
--   Supabase Storage / buckets / Storage policies; MIME/size/alt/title;
--   CMS Editoriali / StorieImpresa; FK to services/products/certifications;
--   central asset library; gallery sort_order; JSON/array; publication gates (M7.1).
--
-- Precondition: public.businesses (M1.1+). No dependency on M5.1 or M2–M4.
-- Note: S04 uses visibility_status (non_public|public) per Physical §17.1 /
-- Plan M5.2 — not publication_status draft|published (Servizio/Prodotto vocabulary).

create table public.business_media (
  id uuid primary key default gen_random_uuid (),
  business_id uuid not null references public.businesses (id) on delete cascade,
  -- Natura del media (Physical §17.1 C05; Logical §2 MediaImpresa).
  media_kind text not null,
  -- Riferimento concreto dichiarativo (Physical §17.1; Logical §10 regola 18).
  -- Not a Storage FK, bucket path contract, or byte payload.
  media_reference text not null,
  -- Logo principale role (Physical §17.1). Only meaningful when media_kind = logo.
  is_primary boolean not null default false,
  -- S04 of MediaImpresa (Physical §17.1 / §11.2): Non pubblico / Pubblico.
  -- Ceiling vs Impresa publication is an M7.1 gate, not a composite CHECK here.
  visibility_status text not null default 'non_public',
  -- Existence/removal of the dependent media (Physical §17.1 S08).
  media_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_media_media_kind_check check (
    media_kind in (
      'logo',
      'cover',
      'image',
      'video',
      'public_document'
    )
  ),
  constraint business_media_media_reference_check check (
    length(btrim(media_reference)) > 0
  ),
  constraint business_media_is_primary_logo_check check (
    (not is_primary)
    or (media_kind = 'logo')
  ),
  constraint business_media_visibility_status_check check (
    visibility_status in (
      'non_public',
      'public'
    )
  ),
  constraint business_media_media_status_check check (
    media_status in (
      'active',
      'removed'
    )
  )
);

comment on table public.business_media is
  'MediaImpresa (E02) owned by the Imprese Aggregate Root: declarative presentation media (logo, cover, image, video, public document). Not product/service media, not certification evidence, not CMS/editorial content, not a Storage bucket. Cardinality 0..N per business; media_reference is declarative only.';

comment on column public.business_media.id is
  'Local stable identity of this MediaImpresa within the Aggregate. Not a public autonomous identity, slug, or Storage object id.';

comment on column public.business_media.business_id is
  'Owning Impresa (public.businesses). Required. ON DELETE CASCADE. Soft-delete of the business (deleted_at) does not remove this row.';

comment on column public.business_media.media_kind is
  'Media nature (C05): logo | cover | image | video | public_document. Local closed vocabulary. Brochure PDFs use public_document. Not a shared taxonomy VO03.';

comment on column public.business_media.media_reference is
  'Declarative concrete reference for this media (URL, label, or other readable reference). Required, non-blank. Not a Storage FK, bucket contract, MIME, or file bytes. Retained when media_status = removed.';

comment on column public.business_media.is_primary is
  'Primary-logo role. May be true only when media_kind = logo. At most one active primary logo per business (partial unique index). Default false.';

comment on column public.business_media.visibility_status is
  'S04 own visibility of the media: non_public | public. Not publication_status draft|published (Servizio/Prodotto vocabulary). Ceiling vs Impresa publication is M7.1. Independent of media_status.';

comment on column public.business_media.media_status is
  'S08 existence in the Aggregate composition: active | removed. removed retains the row and media_reference. Reactivation allowed. Not publication, not verification, not businesses.deleted_at.';

comment on column public.business_media.created_at is
  'Creation timestamp of the media row. System-managed default.';

comment on column public.business_media.updated_at is
  'Last update timestamp. Maintained by business_media_set_updated_at; not a client-owned field.';

create index business_media_business_id_idx
  on public.business_media using btree (business_id);

-- At most one active primary logo per business (Physical §17.1; Logical §10 regola 18).
create unique index business_media_primary_logo_uidx
  on public.business_media using btree (business_id)
  where (
    is_primary = true
    and media_kind = 'logo'
    and media_status = 'active'
  );

create or replace function public.set_business_media_updated_at ()
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

comment on function public.set_business_media_updated_at () is
  'BEFORE UPDATE trigger function for public.business_media.updated_at. SECURITY INVOKER; empty search_path. Does not enforce publication or Storage gates.';

create trigger business_media_set_updated_at
before update on public.business_media
for each row
execute function public.set_business_media_updated_at ();

alter table public.business_media enable row level security;

-- Defense in depth: no policies in M5.2. Deny-by-default for anon/authenticated.
revoke all on table public.business_media from anon, authenticated;
