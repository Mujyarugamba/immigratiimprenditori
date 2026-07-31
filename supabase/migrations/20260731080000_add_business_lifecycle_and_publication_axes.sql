-- M1.2 — add business lifecycle and publication axes
-- Extends public.businesses created by M1.1
-- (20260731070000_create_businesses_core.sql)
-- with independent current-state axes assigned by
-- docs/architecture/migrations/imprese-migration-plan.md §13 M1.2 and
-- docs/architecture/physical/domain-mapping/imprese.md §11.1.
--
-- Axes in this unit (Impresa Aggregate Root only):
--   S01 substantial_status      — active | ceased
--   S02 editorial_status        — draft | incomplete | complete
--   S04 publication_status      — unpublished | public
--   S07 administrative_status   — in_review | suspended_voluntary |
--                                 suspended_moderation | NULL (no overlay)
--   S08/VR06 is_archived        — boolean current-state archival flag
--
-- Explicitly out of scope:
--   S03 verification (M6.1); S05 access (Identità & Accessi / Appartenenze);
--   S06 security; visibility_level / publication gates / coherence (M7.1);
--   owned entities (M2–M5); history tables; workflow timestamps; RLS policies;
--   indexes; new triggers/functions; size_band / organization_form changes.
--
-- Soft deletion (deleted_at from M1.1) remains independent: no CHECK ties
-- deleted_at to any axis in this unit.
--
-- Precondition: public.businesses exists (M1.1). Absence fails this migration.
-- Additive only: NOT NULL columns carry defaults so existing M1.1 rows (if any)
-- receive census-initial values without backfill scripts.

alter table public.businesses
  add column substantial_status text not null default 'active',
  add column editorial_status text not null default 'draft',
  add column publication_status text not null default 'unpublished',
  add column administrative_status text,
  add column is_archived boolean not null default false,
  -- S01 Stato sostanziale (Physical §11.1): Attiva / Cessata.
  -- Text check (not ENUM). Distinct from sheet suspension (S07), archival
  -- (is_archived), and technical soft-delete (deleted_at).
  add constraint businesses_substantial_status_check check (
    substantial_status in (
      'active',
      'ceased'
    )
  ),
  -- S02 Stato editoriale (Physical §11.1): Bozza / Incompleta / Completa.
  -- Completeness of the sheet for evaluation — not publication (S04), not
  -- administrative review/suspension (S07), not verification (M6.1).
  add constraint businesses_editorial_status_check check (
    editorial_status in (
      'draft',
      'incomplete',
      'complete'
    )
  ),
  -- S04 Stato di pubblicazione (Physical §11.1): Non pubblicata / Pubblica.
  -- Current publication decision only. Cumulative publishability gates and
  -- visibility coherence of owned entities belong to M7.1, not this unit.
  add constraint businesses_publication_status_check check (
    publication_status in (
      'unpublished',
      'public'
    )
  ),
  -- S07 Stato amministrativo (Physical §11.1): In revisione /
  -- Sospesa-volontaria / Sospesa-per moderazione.
  -- Additional qualification on the sheet; NULL = no administrative overlay.
  -- Distinct from S01 ceased and from S04 unpublished.
  add constraint businesses_administrative_status_check check (
    administrative_status is null
    or administrative_status in (
      'in_review',
      'suspended_voluntary',
      'suspended_moderation'
    )
  );

comment on column public.businesses.substantial_status is
  'S01 Stato sostanziale of the economic activity: active | ceased. Real-world operating condition. Distinct from editorial_status, publication_status, administrative_status, is_archived, verification (M6.1), and soft deletion (deleted_at).';

comment on column public.businesses.editorial_status is
  'S02 Stato editoriale of the business sheet: draft | incomplete | complete. Redactional completeness for evaluation. Distinct from publication_status (S04), administrative_status (S07 in_review/suspensions), verification (M6.1), and soft deletion (deleted_at).';

comment on column public.businesses.publication_status is
  'S04 Stato di pubblicazione of the business sheet: unpublished | public. Current publication decision only. Does not implement cumulative publishability gates, owned-entity visibility ceilings, or RLS (those are M7.1 / Identità & Accessi). Distinct from editorial_status, substantial_status, is_archived, and deleted_at.';

comment on column public.businesses.administrative_status is
  'S07 Stato amministrativo overlay: in_review | suspended_voluntary | suspended_moderation; NULL when no administrative qualification applies. Distinguishes review vs voluntary suspension vs moderation suspension. Distinct from S01 ceased, S04 unpublished, is_archived, and deleted_at.';

comment on column public.businesses.is_archived is
  'S08/VR06 current-state archival flag on the Impresa Aggregate Root (Physical §11.1: Archiviata is S08+VR06, not a seventh fused axis). true = sheet retained historically and not actively proposed; false = not archived. Distinct from substantial_status = ceased, from publication_status, from administrative_status, and from technical soft deletion (deleted_at). No history table in this unit.';
