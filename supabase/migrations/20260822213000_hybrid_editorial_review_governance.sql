-- Immigrati Imprenditori — hybrid editorial review governance
--
-- Decision recorded 2026-08-23: ordinary editorial content may be published
-- by one authenticated editor, while sensitive/institutional material requires
-- a second, distinct editor approval tied to the exact reviewed state.
--
-- Prepared on the research branch only. This file does not authorize Production
-- apply. Production remains gated by backup/restore, fresh migration audit and
-- explicit authorization.

begin;

alter table public.contents
  add column if not exists force_secondary_review boolean not null default false;

comment on column public.contents.force_secondary_review is
  'Manual escalation for ordinary content. Automatically sensitive content still requires secondary review regardless of this flag.';

create table if not exists public.editorial_secondary_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_kind text not null check (
    entity_kind in ('content', 'observatory_indicator', 'content_correction')
  ),
  entity_id uuid not null,
  review_scope text not null default 'publication' check (
    review_scope in ('publication', 'substantive_correction')
  ),
  reason_code text not null check (length(btrim(reason_code)) > 0),
  basis_fingerprint text not null check (basis_fingerprint ~ '^[0-9a-f]{32}$'),
  requested_by_account_id uuid not null references public.accounts(id) on delete restrict,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'revoked')
  ),
  approved_by_account_id uuid null references public.accounts(id) on delete restrict,
  approved_at timestamptz null,
  revoked_by_account_id uuid null references public.accounts(id) on delete restrict,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    approved_by_account_id is null
    or approved_by_account_id <> requested_by_account_id
  ),
  check (
    status <> 'approved'
    or (approved_by_account_id is not null and approved_at is not null)
  )
);

create index if not exists editorial_secondary_reviews_entity_idx
  on public.editorial_secondary_reviews(entity_kind, entity_id, review_scope, created_at desc);

create index if not exists editorial_secondary_reviews_approved_idx
  on public.editorial_secondary_reviews(entity_kind, entity_id, review_scope, basis_fingerprint)
  where status = 'approved';

alter table public.editorial_secondary_reviews enable row level security;

drop policy if exists editorial_secondary_reviews_editor_read on public.editorial_secondary_reviews;
create policy editorial_secondary_reviews_editor_read
on public.editorial_secondary_reviews for select to authenticated
using (public.access_is_editor() or public.access_is_application_admin());

drop policy if exists editorial_secondary_reviews_editor_insert on public.editorial_secondary_reviews;
create policy editorial_secondary_reviews_editor_insert
on public.editorial_secondary_reviews for insert to authenticated
with check (public.access_is_editor() or public.access_is_application_admin());

drop policy if exists editorial_secondary_reviews_editor_update on public.editorial_secondary_reviews;
create policy editorial_secondary_reviews_editor_update
on public.editorial_secondary_reviews for update to authenticated
using (public.access_is_editor() or public.access_is_application_admin())
with check (public.access_is_editor() or public.access_is_application_admin());

revoke all on public.editorial_secondary_reviews from public, anon;
revoke delete on public.editorial_secondary_reviews from authenticated;
grant select, insert, update on public.editorial_secondary_reviews to authenticated;

create or replace function public.editorial_content_review_fingerprint(p_content public.contents)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  return md5(
    jsonb_build_object(
      'type_code', p_content.type_code,
      'primary_category_code', p_content.primary_category_code,
      'language_id', p_content.language_id,
      'title', p_content.title,
      'subtitle', p_content.subtitle,
      'abstract', p_content.abstract,
      'body', p_content.body,
      'body_format', p_content.body_format,
      'cover_url', p_content.cover_url,
      'source_url', p_content.source_url,
      'source_label', p_content.source_label,
      'force_secondary_review', p_content.force_secondary_review
    )::text
  );
end;
$$;

create or replace function public.editorial_indicator_review_fingerprint(
  p_indicator public.observatory_indicators
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  return md5(
    jsonb_build_object(
      'code', p_indicator.code,
      'slug', p_indicator.slug,
      'title', p_indicator.title,
      'description', p_indicator.description,
      'purpose_text', p_indicator.purpose_text,
      'methodology_summary', p_indicator.methodology_summary,
      'value_nature', p_indicator.value_nature,
      'unit_code', p_indicator.unit_code,
      'periodicity', p_indicator.periodicity
    )::text
  );
end;
$$;

create or replace function public.editorial_correction_review_fingerprint(
  p_correction public.content_corrections
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  return md5(
    jsonb_build_object(
      'content_id', p_correction.content_id,
      'version_id', p_correction.version_id,
      'correction_kind', p_correction.correction_kind,
      'notice', p_correction.notice
    )::text
  );
end;
$$;

create or replace function public.content_requires_secondary_review(p_content public.contents)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  return
    coalesce(p_content.force_secondary_review, false)
    or p_content.type_code in (
      'research_report',
      'data_note',
      'interview',
      'testimony',
      'policy_brief',
      'institutional_page'
    )
    or p_content.primary_category_code in (
      'regulation_compliance',
      'stories'
    );
end;
$$;

create or replace function public.editorial_review_current_fingerprint(
  p_entity_kind text,
  p_entity_id uuid
)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_fingerprint text;
begin
  case p_entity_kind
    when 'content' then
      select public.editorial_content_review_fingerprint(c)
        into v_fingerprint
      from public.contents c
      where c.id = p_entity_id;

    when 'observatory_indicator' then
      select public.editorial_indicator_review_fingerprint(i)
        into v_fingerprint
      from public.observatory_indicators i
      where i.id = p_entity_id;

    when 'content_correction' then
      select public.editorial_correction_review_fingerprint(cc)
        into v_fingerprint
      from public.content_corrections cc
      where cc.id = p_entity_id;

    else
      raise exception 'EDITORIAL_REVIEW_ENTITY_KIND_UNSUPPORTED'
        using errcode = '22023';
  end case;

  return v_fingerprint;
end;
$$;

create or replace function public.enforce_editorial_secondary_review_transition()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account_id uuid;
  v_current_fingerprint text;
begin
  if not (
    coalesce(public.access_is_editor(), false)
    or coalesce(public.access_is_application_admin(), false)
  ) then
    raise exception 'EDITORIAL_REVIEW_REQUIRES_EDITOR'
      using errcode = '42501';
  end if;

  v_account_id := public.access_current_account_id();
  if v_account_id is null then
    raise exception 'EDITORIAL_REVIEW_ACCOUNT_REQUIRED'
      using errcode = '42501';
  end if;

  if tg_op = 'INSERT' then
    v_current_fingerprint := public.editorial_review_current_fingerprint(
      new.entity_kind,
      new.entity_id
    );
    if v_current_fingerprint is null then
      raise exception 'EDITORIAL_REVIEW_ENTITY_NOT_FOUND'
        using errcode = 'P0002';
    end if;

    new.basis_fingerprint := v_current_fingerprint;
    new.requested_by_account_id := v_account_id;
    new.requested_at := now();
    new.status := 'pending';
    new.approved_by_account_id := null;
    new.approved_at := null;
    new.revoked_by_account_id := null;
    new.revoked_at := null;
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := now();
    return new;
  end if;

  if new.entity_kind is distinct from old.entity_kind
     or new.entity_id is distinct from old.entity_id
     or new.review_scope is distinct from old.review_scope
     or new.reason_code is distinct from old.reason_code
     or new.basis_fingerprint is distinct from old.basis_fingerprint
     or new.requested_by_account_id is distinct from old.requested_by_account_id
     or new.requested_at is distinct from old.requested_at
     or new.created_at is distinct from old.created_at then
    raise exception 'EDITORIAL_REVIEW_REQUEST_IS_IMMUTABLE'
      using errcode = '42501';
  end if;

  if old.status = 'pending' and new.status = 'approved' then
    if old.requested_by_account_id = v_account_id then
      raise exception 'EDITORIAL_REVIEW_SELF_APPROVAL_FORBIDDEN'
        using errcode = '42501';
    end if;

    v_current_fingerprint := public.editorial_review_current_fingerprint(
      old.entity_kind,
      old.entity_id
    );
    if v_current_fingerprint is distinct from old.basis_fingerprint then
      raise exception 'EDITORIAL_REVIEW_STALE'
        using errcode = '55000';
    end if;

    new.approved_by_account_id := v_account_id;
    new.approved_at := now();
    new.revoked_by_account_id := null;
    new.revoked_at := null;
    new.updated_at := now();
    return new;
  end if;

  if old.status in ('pending', 'approved') and new.status = 'revoked' then
    new.approved_by_account_id := old.approved_by_account_id;
    new.approved_at := old.approved_at;
    new.revoked_by_account_id := v_account_id;
    new.revoked_at := now();
    new.updated_at := now();
    return new;
  end if;

  raise exception 'EDITORIAL_REVIEW_TRANSITION_NOT_ALLOWED'
    using errcode = '42501';
end;
$$;

drop trigger if exists editorial_secondary_reviews_transition_guard
  on public.editorial_secondary_reviews;
create trigger editorial_secondary_reviews_transition_guard
before insert or update on public.editorial_secondary_reviews
for each row execute function public.enforce_editorial_secondary_review_transition();

create or replace function public.editorial_has_approved_secondary_review(
  p_entity_kind text,
  p_entity_id uuid,
  p_review_scope text,
  p_basis_fingerprint text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.editorial_secondary_reviews r
    where r.entity_kind = p_entity_kind
      and r.entity_id = p_entity_id
      and r.review_scope = p_review_scope
      and r.status = 'approved'
      and r.basis_fingerprint = p_basis_fingerprint
      and r.approved_by_account_id is not null
      and r.approved_by_account_id <> r.requested_by_account_id
  );
$$;

create or replace function public.enforce_hybrid_content_review_gate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fingerprint text;
begin
  if not (
    new.publication_status = 'published'
    or new.visibility_status = 'public'
  ) then
    return new;
  end if;

  if not public.content_requires_secondary_review(new) then
    return new;
  end if;

  v_fingerprint := public.editorial_content_review_fingerprint(new);
  if not public.editorial_has_approved_secondary_review(
    'content',
    new.id,
    'publication',
    v_fingerprint
  ) then
    raise exception 'CONTENT_PUBLICATION_REQUIRES_SECONDARY_REVIEW'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists contents_hybrid_secondary_review_gate on public.contents;
create trigger contents_hybrid_secondary_review_gate
before insert or update on public.contents
for each row execute function public.enforce_hybrid_content_review_gate();

create or replace function public.enforce_observatory_indicator_secondary_review_gate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fingerprint text;
begin
  if new.publication_status <> 'published' then
    return new;
  end if;

  v_fingerprint := public.editorial_indicator_review_fingerprint(new);
  if not public.editorial_has_approved_secondary_review(
    'observatory_indicator',
    new.id,
    'publication',
    v_fingerprint
  ) then
    raise exception 'OBSERVATORY_PUBLICATION_REQUIRES_SECONDARY_REVIEW'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists observatory_indicators_secondary_review_gate
  on public.observatory_indicators;
create trigger observatory_indicators_secondary_review_gate
before insert or update on public.observatory_indicators
for each row execute function public.enforce_observatory_indicator_secondary_review_gate();

create or replace function public.enforce_substantive_correction_secondary_review_gate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fingerprint text;
begin
  if new.public_notice is distinct from true
     or new.correction_kind not in ('substantive', 'retraction') then
    return new;
  end if;

  v_fingerprint := public.editorial_correction_review_fingerprint(new);
  if not public.editorial_has_approved_secondary_review(
    'content_correction',
    new.id,
    'substantive_correction',
    v_fingerprint
  ) then
    raise exception 'SUBSTANTIVE_CORRECTION_REQUIRES_SECONDARY_REVIEW'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists content_corrections_secondary_review_gate
  on public.content_corrections;
create trigger content_corrections_secondary_review_gate
before insert or update on public.content_corrections
for each row execute function public.enforce_substantive_correction_secondary_review_gate();

revoke all on function public.editorial_content_review_fingerprint(public.contents)
  from public, anon, authenticated;
revoke all on function public.editorial_indicator_review_fingerprint(public.observatory_indicators)
  from public, anon, authenticated;
revoke all on function public.editorial_correction_review_fingerprint(public.content_corrections)
  from public, anon, authenticated;
revoke all on function public.content_requires_secondary_review(public.contents)
  from public, anon, authenticated;
revoke all on function public.editorial_review_current_fingerprint(text, uuid)
  from public, anon, authenticated;
revoke all on function public.enforce_editorial_secondary_review_transition()
  from public, anon, authenticated;
revoke all on function public.editorial_has_approved_secondary_review(text, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.enforce_hybrid_content_review_gate()
  from public, anon, authenticated;
revoke all on function public.enforce_observatory_indicator_secondary_review_gate()
  from public, anon, authenticated;
revoke all on function public.enforce_substantive_correction_secondary_review_gate()
  from public, anon, authenticated;

comment on table public.editorial_secondary_reviews is
  'Append-preserving secondary review ledger. Approval is valid only for the exact entity fingerprint reviewed; requester and approver must be distinct accounts.';
comment on function public.content_requires_secondary_review(public.contents) is
  'Hybrid governance classifier: reports, data notes, interviews/testimonies, policy/legal/institutional content, stories/regulation categories and manually escalated content require 4-eyes review.';
comment on function public.enforce_hybrid_content_review_gate() is
  'Requires a current distinct-account approval before sensitive content can become published/public. Ordinary content remains same-editor eligible subject to the existing human editorial publication gate.';
comment on function public.enforce_observatory_indicator_secondary_review_gate() is
  'All Observatory indicator publication requires distinct-account secondary approval tied to the current indicator fingerprint.';
comment on function public.enforce_substantive_correction_secondary_review_gate() is
  'Public substantive corrections and retractions require distinct-account secondary approval. Draft them with public_notice=false before review.';

commit;
