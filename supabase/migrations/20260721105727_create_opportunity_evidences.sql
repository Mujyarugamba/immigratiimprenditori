-- M3.2 — create opportunity evidences
-- Implements E02 Evidenza of the Opportunità domain as an owned dependent
-- entity of public.opportunities
-- (docs/architecture/migrations/opportunita-migration-plan.md §11, §14;
--  docs/architecture/physical/domain-mapping/opportunita.md §7.1, §14, §29;
--  approved M3 architectural review).
--
-- Depends on:
--   public.opportunities         (M1.1)
--   public.opportunity_sources   (M3.1)
--
-- Scope of this unit only: Evidenza structure, optional provenance link to
-- Fonte, and local invariants. Explicitly out of scope: Documents/Files/
-- Attachments/Storage, evidence_types catalog by format, Verification (M7),
-- publication, editorial content, promoters as entities, M4–M6 objects,
-- polymorphic targets, versioning chains.
--
-- Evidenza ≠ Fonte ≠ Documento ≠ Allegato ≠ URL ≠ Verifica ≠ contenuto editoriale.
-- Soft deletion of opportunities (deleted_at) does not remove evidence rows;
-- physical delete of an opportunity cascades owned evidences.

-- Technical support for a composite FK (source_id, opportunity_id) →
-- opportunity_sources (id, opportunity_id). Does not change M3.1 semantics:
-- id remains the primary key; opportunity_id remains the owning opportunity.
-- Unique (id, opportunity_id) is implied by PK(id) + NOT NULL opportunity_id
-- and is declared explicitly so PostgreSQL can target it as a foreign key.
alter table public.opportunity_sources
add constraint opportunity_sources_id_opportunity_id_key unique (id, opportunity_id);

create table public.opportunity_evidences (
  id uuid primary key default gen_random_uuid (),
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  source_id uuid,
  supports_aspect text,
  extract text,
  citation_locator text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunity_evidences_supports_aspect_check check (
    supports_aspect is null
    or supports_aspect in (
      'existence',
      'deadline',
      'benefit',
      'requirement',
      'promoter'
    )
  ),
  constraint opportunity_evidences_extract_not_blank_check check (
    extract is null
    or length(trim(extract)) > 0
  ),
  constraint opportunity_evidences_citation_locator_not_blank_check check (
    citation_locator is null
    or length(trim(citation_locator)) > 0
  ),
  constraint opportunity_evidences_source_same_opportunity_fkey foreign key (source_id, opportunity_id)
  references public.opportunity_sources (id, opportunity_id)
  on delete set null (source_id)
);

comment on table public.opportunity_evidences is
  'E02 Evidenza owned by an Opportunità: riscontro supporting a represented fact. Not Fonte, not Document/File/Attachment storage, not editorial content, not Verification. Optional provenance link to opportunity_sources of the same opportunity. Physical delete of the opportunity cascades owned evidences; physical delete of a linked Fonte sets source_id to NULL and keeps the Evidence.';

comment on column public.opportunity_evidences.id is
  'Stable internal identity of the evidence row.';

comment on column public.opportunity_evidences.opportunity_id is
  'Owning opportunity (Aggregate Root). Required; ON DELETE CASCADE. Soft deletion of the opportunity does not remove this row.';

comment on column public.opportunity_evidences.source_id is
  'Optional Fonte (public.opportunity_sources) providing provenance for this riscontro. NULL when the evidence is recorded without a linked source, or after physical delete of the Fonte. When set, must belong to the same opportunity (composite FK). ON DELETE SET NULL (source_id): Evidence ownership and opportunity_id remain unchanged.';

comment on column public.opportunity_evidences.supports_aspect is
  'Optional classification of the represented fact this evidence supports (at most one per row). NULL = classification not declared. Allowed when set: existence (documented existence of the opportunity as a possibility, not platform publication); deadline (declared date/window of the opportunity, not Evidence lifecycle); benefit (declared benefit/access on the sheet, not a FK to Benefici); requirement (declared requirement/condition on the sheet, not a FK to Requisiti); promoter (declared promoter on the sheet, not a FK/relation to Promotori). Not a format catalog; does not assert truth or verification.';

comment on column public.opportunity_evidences.extract is
  'Optional minimal faithful extract of the riscontro. Not a summary, comment, interpretation, FAQ, article, translation, or editorial note.';

comment on column public.opportunity_evidences.citation_locator is
  'Optional pinpoint within the source or material (e.g. page, article, section). Does not duplicate Fonte url/external_identifier/reference_text.';

comment on column public.opportunity_evidences.created_at is
  'Row creation timestamp. System-managed default.';

comment on column public.opportunity_evidences.updated_at is
  'Last update timestamp. Maintained by opportunity_evidences_set_updated_at.';

comment on constraint opportunity_sources_id_opportunity_id_key on public.opportunity_sources is
  'Technical unique target for opportunity_evidences composite FK (source_id, opportunity_id). No semantic change to M3.1 Fonte ownership or identity.';

-- Lookup of evidences for a given opportunity.
create index opportunity_evidences_opportunity_id_idx
  on public.opportunity_evidences using btree (opportunity_id);

-- Lookup / FK support for evidences of a given source.
create index opportunity_evidences_source_id_idx
  on public.opportunity_evidences using btree (source_id);

alter table public.opportunity_evidences enable row level security;

-- Defense in depth: no policies in M3.2. Publication/visibility of evidences
-- follows the opportunity and belongs to later units (M7). With RLS enabled
-- and no policy, roles subject to RLS cannot read or write. service_role
-- and owner privileges are not revoked.
revoke all on table public.opportunity_evidences from anon, authenticated;

create or replace function public.set_opportunity_evidences_updated_at ()
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

create trigger opportunity_evidences_set_updated_at
before update on public.opportunity_evidences
for each row
execute function public.set_opportunity_evidences_updated_at ();
