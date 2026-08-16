-- L1.3 unit 2 — Minimized legal retention archive (NOT a backup, NOT a full-account copy)
-- Micro-review M2 (adversarial): separate · non-public · reason-bound · retention-bound · admin/service only.
-- Scope ONLY:
--   public.legal_retention_records
--   public.legal_retention_insert_record(...)
--   public.legal_retention_dispose_record(...)
--   RLS/grants: admin SELECT; no authenticated INSERT/UPDATE/DELETE; service_role EXECUTE on helpers
-- Explicitly OUT OF SCOPE:
--   account self-deletion (M3); orphan reassignment (M4); profile/contact/UGC dumps;
--   AuthForm changes; seeds; browser service_role; automatic archive of businesses/orgs/content.

-- ---------------------------------------------------------------------------
-- 1) Table — typed & minimized (no JSONB profile dump)
-- ---------------------------------------------------------------------------
create table public.legal_retention_records (
  id uuid not null default gen_random_uuid (),
  -- Opaque subject reference that survives eventual hard Account DELETE.
  -- Not auth.users id. Not email. Not a reversible pointer by itself.
  subject_ref text not null,
  -- Live link while Account still exists; SET NULL so hard DELETE does not destroy archive evidence.
  source_account_id uuid null,
  reason_code text not null,
  retention_class text not null,
  retained_data_kind text not null,
  -- Typed Terms-acceptance proof fields (used ONLY when retained_data_kind = terms_acceptance_proof).
  proof_document_kind text null,
  proof_document_version text null,
  proof_accepted_at timestamptz null,
  proof_acceptance_channel text null,
  -- Internal case/ticket marker (not a PII dump).
  case_reference text null,
  archived_at timestamptz not null default now (),
  -- Determinable retention: retain_until OR explicit indefinite-review flag + note.
  retain_until timestamptz null,
  retention_indefinite_review boolean not null default false,
  admin_note text null,
  record_status text not null default 'active',
  disposed_at timestamptz null,
  disposal_method text null,
  constraint legal_retention_records_pkey primary key (id),
  constraint legal_retention_records_source_account_id_fkey
    foreign key (source_account_id)
    references public.accounts (id)
    on update no action
    on delete set null,
  constraint legal_retention_records_reason_code_check check (
    reason_code in (
      'legal_obligation',
      'dispute',
      'security',
      'abuse_investigation',
      'legal_claim',
      'transaction_evidence'
    )
  ),
  constraint legal_retention_records_retention_class_check check (
    retention_class in ('law_mandated', 'policy_defined', 'case_specific')
  ),
  constraint legal_retention_records_retained_data_kind_check check (
    retained_data_kind in (
      'terms_acceptance_proof',
      'security_incident_marker',
      'dispute_marker',
      'legal_claim_marker',
      'abuse_investigation_marker'
    )
  ),
  constraint legal_retention_records_subject_ref_chk check (
    length(btrim(subject_ref)) >= 16
    and position('@' in subject_ref) = 0
  ),
  -- Active-row integrity only: disposed rows may clear proof/marker fields.
  constraint legal_retention_records_retention_determinable_chk check (
    record_status <> 'active'
    or (
      retain_until is not null
      and retention_indefinite_review = false
    )
    or (
      retain_until is null
      and retention_indefinite_review = true
      and admin_note is not null
      and length(btrim(admin_note)) > 0
    )
  ),
  constraint legal_retention_records_admin_note_len_chk check (
    admin_note is null
    or char_length(admin_note) <= 500
  ),
  constraint legal_retention_records_case_reference_len_chk check (
    case_reference is null
    or (
      char_length(case_reference) <= 120
      and position('@' in case_reference) = 0
    )
  ),
  constraint legal_retention_records_terms_proof_required_chk check (
    record_status <> 'active'
    or retained_data_kind <> 'terms_acceptance_proof'
    or (
      proof_document_kind = 'terms_of_use'
      and proof_document_version is not null
      and length(btrim(proof_document_version)) > 0
      and proof_accepted_at is not null
      and proof_acceptance_channel is not null
      and length(btrim(proof_acceptance_channel)) > 0
    )
  ),
  constraint legal_retention_records_terms_proof_null_otherwise_chk check (
    retained_data_kind = 'terms_acceptance_proof'
    or (
      proof_document_kind is null
      and proof_document_version is null
      and proof_accepted_at is null
      and proof_acceptance_channel is null
    )
  ),
  constraint legal_retention_records_non_terms_marker_chk check (
    record_status <> 'active'
    or retained_data_kind = 'terms_acceptance_proof'
    or (
      case_reference is not null
      and length(btrim(case_reference)) > 0
    )
    or (
      admin_note is not null
      and length(btrim(admin_note)) > 0
    )
  ),
  constraint legal_retention_records_status_check check (
    record_status in ('active', 'disposed')
  ),
  constraint legal_retention_records_disposal_gate_check check (
    (
      record_status = 'active'
      and disposed_at is null
      and disposal_method is null
    )
    or (
      record_status = 'disposed'
      and disposed_at is not null
      and disposal_method in ('deleted', 'anonymized')
    )
  )
);

comment on table public.legal_retention_records is
  'L1.3-M2: minimized legal retention archive AFTER account closure/deletion needs. NOT a backup. NOT a full Account/Persona/profile copy. No automatic archive of businesses, organizations, content, opportunities, or events. Rows exist only for a concrete reason_code with determinable retention. Access: application admin SELECT; writes via service_role SECURITY DEFINER helpers only (future M3 path).';

comment on column public.legal_retention_records.subject_ref is
  'Opaque minimized subject token that remains after source_account_id is nulled by hard Account DELETE. Must not be an email or Auth user id.';
comment on column public.legal_retention_records.source_account_id is
  'Optional live FK to public.accounts while the Account still exists. ON DELETE SET NULL preserves archive evidence for M3 hard-delete compatibility. Soft close (account_status=closed) does not touch this table.';
comment on column public.legal_retention_records.reason_code is
  'Concrete conservation reason. Closed catalog — no other/misc/general.';
comment on column public.legal_retention_records.retention_class is
  'law_mandated | policy_defined | case_specific (see docs/architecture/legal/retention-schedule.md).';
comment on column public.legal_retention_records.retained_data_kind is
  'Typed retained artifact kind. terms_acceptance_proof uses proof_* columns; other kinds are markers only (no PII dump).';
comment on column public.legal_retention_records.proof_document_kind is
  'Only for terms_acceptance_proof; must be terms_of_use when set.';
comment on column public.legal_retention_records.retain_until is
  'Determinable end of retention when known. Required unless retention_indefinite_review=true with admin_note.';
comment on column public.legal_retention_records.retention_indefinite_review is
  'Exceptional: no fixed date yet; requires admin_note and administrative review. Not a license for indefinite silent retention.';
comment on column public.legal_retention_records.disposed_at is
  'Final disposal timestamp (delete or irreversible anonymization of retained fields).';

comment on constraint legal_retention_records_source_account_id_fkey on public.legal_retention_records is
  'SET NULL (not CASCADE, not RESTRICT): archive evidence must outlive hard Account DELETE; soft close does not null this column.';

create index legal_retention_records_subject_ref_idx
  on public.legal_retention_records (subject_ref);

create index legal_retention_records_source_account_id_idx
  on public.legal_retention_records (source_account_id)
  where source_account_id is not null;

create index legal_retention_records_active_retain_until_idx
  on public.legal_retention_records (retain_until)
  where record_status = 'active' and retain_until is not null;

create index legal_retention_records_reason_code_idx
  on public.legal_retention_records (reason_code);

-- ---------------------------------------------------------------------------
-- 2) RLS + grants (no public / no ordinary authenticated write)
-- ---------------------------------------------------------------------------
alter table public.legal_retention_records enable row level security;

revoke all on table public.legal_retention_records from public, anon, authenticated;

-- Admin read only. No INSERT/UPDATE/DELETE grants for authenticated (incl. redattori).
grant select on table public.legal_retention_records to authenticated;

create policy legal_retention_records_select_admin
  on public.legal_retention_records
  for select
  to authenticated
  using (public.access_is_application_admin ());

-- No INSERT/UPDATE/DELETE policies for authenticated.
-- service_role bypasses RLS for SECURITY DEFINER helpers below (not browser).

-- ---------------------------------------------------------------------------
-- 3) Server/service write path (contract for future M3; no browser service_role)
-- ---------------------------------------------------------------------------
create function public.legal_retention_insert_record (
  p_subject_ref text,
  p_source_account_id uuid,
  p_reason_code text,
  p_retention_class text,
  p_retained_data_kind text,
  p_proof_document_kind text,
  p_proof_document_version text,
  p_proof_accepted_at timestamptz,
  p_proof_acceptance_channel text,
  p_case_reference text,
  p_retain_until timestamptz,
  p_retention_indefinite_review boolean,
  p_admin_note text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_id uuid;
begin
  if not v_is_svc then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  insert into public.legal_retention_records (
    subject_ref,
    source_account_id,
    reason_code,
    retention_class,
    retained_data_kind,
    proof_document_kind,
    proof_document_version,
    proof_accepted_at,
    proof_acceptance_channel,
    case_reference,
    retain_until,
    retention_indefinite_review,
    admin_note
  ) values (
    p_subject_ref,
    p_source_account_id,
    p_reason_code,
    p_retention_class,
    p_retained_data_kind,
    p_proof_document_kind,
    p_proof_document_version,
    p_proof_accepted_at,
    p_proof_acceptance_channel,
    p_case_reference,
    p_retain_until,
    coalesce(p_retention_indefinite_review, false),
    p_admin_note
  )
  returning id into v_id;

  return v_id;
end;
$$;

comment on function public.legal_retention_insert_record (
  text, uuid, text, text, text, text, text, timestamptz, text, text, timestamptz, boolean, text
) is
  'L1.3-M2 service_role-only insert into minimized legal archive. Intended for server/M3 deletion pipeline. Not granted to anon/authenticated. Does not implement account self-deletion.';

revoke all on function public.legal_retention_insert_record (
  text, uuid, text, text, text, text, text, timestamptz, text, text, timestamptz, boolean, text
) from public, anon, authenticated;

grant execute on function public.legal_retention_insert_record (
  text, uuid, text, text, text, text, text, timestamptz, text, text, timestamptz, boolean, text
) to service_role;

create function public.legal_retention_dispose_record (
  p_id uuid,
  p_disposal_method text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_row public.legal_retention_records%rowtype;
begin
  if not v_is_svc then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  if p_disposal_method not in ('deleted', 'anonymized') then
    raise exception 'disposal method not allowed'
      using errcode = '22023';
  end if;

  select *
  into v_row
  from public.legal_retention_records as r
  where r.id = p_id
  for update;

  if not found then
    raise exception 'record not found'
      using errcode = 'P0002';
  end if;

  if v_row.record_status = 'disposed' then
    return v_row.id;
  end if;

  update public.legal_retention_records as r
  set
    record_status = 'disposed',
    disposed_at = now (),
    disposal_method = p_disposal_method,
    -- Irreversible minimization of retained proof fields on dispose.
    proof_document_kind = null,
    proof_document_version = null,
    proof_accepted_at = null,
    proof_acceptance_channel = null,
    case_reference = null,
    admin_note = null,
    source_account_id = null
  where r.id = p_id;

  return p_id;
end;
$$;

comment on function public.legal_retention_dispose_record (uuid, text) is
  'L1.3-M2 service_role-only final disposal: marks disposed and clears retained proof/marker fields. Idempotent if already disposed. Does not hard-DELETE the row (audit of disposal remains).';

revoke all on function public.legal_retention_dispose_record (uuid, text)
  from public, anon, authenticated;

grant execute on function public.legal_retention_dispose_record (uuid, text)
  to service_role;
