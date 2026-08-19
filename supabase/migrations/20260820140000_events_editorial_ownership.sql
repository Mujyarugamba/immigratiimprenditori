-- D1-D.5 E5.1 — Eventi editorial ownership (ternary)
-- Adds owned_by_editorial and replaces binary owner XOR with ternary ownership
-- (Persona | Impresa | Redazione), matching contents/organizations pattern.
-- No data rewrite: existing rows keep owned_by_editorial = false with a person
-- or business owner. No policies here (E5.3). No external identity columns (E5.2).

alter table public.events
  add column owned_by_editorial boolean not null default false;

comment on column public.events.owned_by_editorial is
  'D1-D.5: when true, Evento is custodied by Redazione (no person/business owner). Mutually exclusive with owner_person_id and owner_business_id. Distinct from external organizer labels. Does not imply publication.';

alter table public.events
  drop constraint events_owner_xor_check;

alter table public.events
  add constraint events_ownership_ternary_check check (
    (
      owner_person_id is not null
      and owner_business_id is null
      and owned_by_editorial = false
    )
    or (
      owner_person_id is null
      and owner_business_id is not null
      and owned_by_editorial = false
    )
    or (
      owner_person_id is null
      and owner_business_id is null
      and owned_by_editorial = true
    )
  );

create index events_owned_by_editorial_idx
  on public.events (owned_by_editorial)
  where owned_by_editorial = true;

comment on table public.events is
  'Aggregate Root of Eventi: structured publishable Evento sheet, independent of concrete editions. Owned by Eventi. Distinct from OffertaDiServizio (service_offers), Opportunità (opportunities), and editorial Contenuti. Owner is exactly one of Persona (profiles), Impresa (businesses), or Redazione (owned_by_editorial). Not ticketing, not RRULE, not FEV, not Storage. Application invariant: published events require ≥1 event_editions row with starts_at (enforced outside DDL; no cross-table trigger in cycle 1).';
