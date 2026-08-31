-- Enforce and audit interview workflow state and consent changes.
-- Prepared on the working branch; not an authorization to apply anything on Production.

create or replace function public.enforce_interview_workflow_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_consent_touched boolean;
begin
  if tg_op = 'INSERT' then
    if new.workflow_status <> 'candidate' then
      raise exception 'INTERVIEW_WORKFLOW_MUST_START_AS_CANDIDATE'
        using errcode = '23514';
    end if;

    if new.contacted_at is not null
       or new.scheduled_for is not null
       or new.interviewed_at is not null then
      raise exception 'INTERVIEW_WORKFLOW_INITIAL_DATES_INVALID'
        using errcode = '23514';
    end if;

    if new.publication_consent_status <> 'pending'
       or new.quote_approval_status <> 'pending'
       or new.image_consent_status <> 'pending'
       or new.video_consent_status not in ('pending', 'not_required') then
      raise exception 'INTERVIEW_WORKFLOW_INITIAL_CONSENTS_INVALID'
        using errcode = '23514';
    end if;

    new.publication_consent_at := null;
    new.quote_approval_at := null;
    new.image_consent_at := null;
    new.video_consent_at := null;
    return new;
  end if;

  if new.content_id is distinct from old.content_id
     or new.source_origin is distinct from old.source_origin then
    raise exception 'INTERVIEW_WORKFLOW_PROVENANCE_IMMUTABLE'
      using errcode = '23514';
  end if;

  if new.workflow_status is distinct from old.workflow_status then
    if not (
      (old.workflow_status = 'candidate' and new.workflow_status = 'contacted')
      or (old.workflow_status = 'contacted' and new.workflow_status in ('scheduled', 'interviewed', 'declined'))
      or (old.workflow_status = 'scheduled' and new.workflow_status in ('interviewed', 'declined'))
      or (old.workflow_status = 'interviewed' and new.workflow_status = 'fact_check')
      or (old.workflow_status = 'fact_check' and new.workflow_status = 'approved')
    ) then
      raise exception 'INTERVIEW_WORKFLOW_INVALID_TRANSITION: % -> %', old.workflow_status, new.workflow_status
        using errcode = '23514';
    end if;
  end if;

  if old.workflow_status = 'candidate' and new.workflow_status = 'contacted' then
    new.contacted_at := now();
  elsif new.contacted_at is distinct from old.contacted_at then
    raise exception 'INTERVIEW_WORKFLOW_CONTACTED_AT_IMMUTABLE'
      using errcode = '23514';
  end if;

  if new.scheduled_for is distinct from old.scheduled_for then
    if old.workflow_status not in ('contacted', 'scheduled')
       or new.workflow_status <> 'scheduled'
       or new.scheduled_for is null
       or new.scheduled_for <= now() then
      raise exception 'INTERVIEW_WORKFLOW_INVALID_SCHEDULE'
        using errcode = '23514';
    end if;
  elsif old.workflow_status = 'contacted' and new.workflow_status = 'scheduled' then
    if new.scheduled_for is null or new.scheduled_for <= now() then
      raise exception 'INTERVIEW_WORKFLOW_INVALID_SCHEDULE'
        using errcode = '23514';
    end if;
  end if;

  if old.workflow_status in ('contacted', 'scheduled') and new.workflow_status = 'interviewed' then
    new.interviewed_at := now();
  elsif new.interviewed_at is distinct from old.interviewed_at then
    raise exception 'INTERVIEW_WORKFLOW_INTERVIEWED_AT_IMMUTABLE'
      using errcode = '23514';
  end if;

  v_consent_touched :=
    new.publication_consent_status is distinct from old.publication_consent_status
    or new.publication_consent_at is distinct from old.publication_consent_at
    or new.quote_approval_status is distinct from old.quote_approval_status
    or new.quote_approval_at is distinct from old.quote_approval_at
    or new.image_consent_status is distinct from old.image_consent_status
    or new.image_consent_at is distinct from old.image_consent_at
    or new.video_consent_status is distinct from old.video_consent_status
    or new.video_consent_at is distinct from old.video_consent_at;

  if v_consent_touched
     and old.workflow_status not in ('contacted', 'scheduled', 'interviewed', 'fact_check') then
    raise exception 'INTERVIEW_WORKFLOW_CONSENTS_NOT_EDITABLE'
      using errcode = '23514';
  end if;

  if new.publication_consent_status = 'not_required'
     or new.quote_approval_status = 'not_required' then
    raise exception 'INTERVIEW_WORKFLOW_REQUIRED_CONSENT_DECISION_MISSING'
      using errcode = '23514';
  end if;

  if new.publication_consent_status is distinct from old.publication_consent_status then
    new.publication_consent_at := case when new.publication_consent_status = 'granted' then now() else null end;
  else
    new.publication_consent_at := old.publication_consent_at;
  end if;

  if new.quote_approval_status is distinct from old.quote_approval_status then
    new.quote_approval_at := case when new.quote_approval_status = 'granted' then now() else null end;
  else
    new.quote_approval_at := old.quote_approval_at;
  end if;

  if new.image_consent_status is distinct from old.image_consent_status then
    new.image_consent_at := case when new.image_consent_status = 'granted' then now() else null end;
  else
    new.image_consent_at := old.image_consent_at;
  end if;

  if new.video_consent_status is distinct from old.video_consent_status then
    new.video_consent_at := case when new.video_consent_status = 'granted' then now() else null end;
  else
    new.video_consent_at := old.video_consent_at;
  end if;

  if old.workflow_status = 'fact_check' and new.workflow_status = 'approved' then
    if old.publication_consent_status <> 'granted'
       or old.quote_approval_status <> 'granted' then
      raise exception 'INTERVIEW_WORKFLOW_APPROVAL_REQUIRES_CONSENTS'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_interview_workflow_transition() from public, anon, authenticated;

create trigger content_interview_workflow_enforce_transition
before insert or update on public.content_interview_workflow
for each row execute function public.enforce_interview_workflow_transition();

create or replace function public.log_interview_workflow_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old jsonb := case when tg_op = 'INSERT' then '{}'::jsonb else to_jsonb(old) end;
  v_new jsonb := to_jsonb(new);
  v_fields jsonb := '[]'::jsonb;
  v_action text := 'updated';
  v_actor uuid;
  v_slug text;
begin
  if tg_op = 'INSERT' then
    v_fields := '["workflow_created"]'::jsonb;
  else
    select coalesce(jsonb_agg(k order by k), '[]'::jsonb)
      into v_fields
    from unnest(array[
      'workflow_status',
      'contacted_at',
      'scheduled_for',
      'interviewed_at',
      'publication_consent_status',
      'publication_consent_at',
      'quote_approval_status',
      'quote_approval_at',
      'image_consent_status',
      'image_consent_at',
      'video_consent_status',
      'video_consent_at'
    ]) as k
    where (v_old -> k) is distinct from (v_new -> k);

    -- updated_at and internal_notes are deliberately outside this audit payload.
    if jsonb_array_length(v_fields) = 0 then
      return new;
    end if;

    if old.workflow_status is distinct from new.workflow_status then
      v_action := 'status_changed';
    end if;
  end if;

  select c.slug
    into v_slug
  from public.contents c
  where c.id = new.content_id;

  v_actor := public.access_current_account_id();

  insert into public.editorial_content_activity (
    content_id,
    content_slug,
    actor_account_id,
    action,
    changes
  ) values (
    new.content_id,
    v_slug,
    v_actor,
    v_action,
    jsonb_build_object(
      'scope', 'interview_workflow',
      'fields', v_fields,
      'before_interview', case
        when tg_op = 'INSERT' then '{}'::jsonb
        else jsonb_strip_nulls(jsonb_build_object(
          'workflow_status', old.workflow_status,
          'contacted_at', old.contacted_at,
          'scheduled_for', old.scheduled_for,
          'interviewed_at', old.interviewed_at,
          'publication_consent_status', old.publication_consent_status,
          'publication_consent_at', old.publication_consent_at,
          'quote_approval_status', old.quote_approval_status,
          'quote_approval_at', old.quote_approval_at,
          'image_consent_status', old.image_consent_status,
          'image_consent_at', old.image_consent_at,
          'video_consent_status', old.video_consent_status,
          'video_consent_at', old.video_consent_at
        ))
      end,
      'after_interview', jsonb_strip_nulls(jsonb_build_object(
        'workflow_status', new.workflow_status,
        'contacted_at', new.contacted_at,
        'scheduled_for', new.scheduled_for,
        'interviewed_at', new.interviewed_at,
        'publication_consent_status', new.publication_consent_status,
        'publication_consent_at', new.publication_consent_at,
        'quote_approval_status', new.quote_approval_status,
        'quote_approval_at', new.quote_approval_at,
        'image_consent_status', new.image_consent_status,
        'image_consent_at', new.image_consent_at,
        'video_consent_status', new.video_consent_status,
        'video_consent_at', new.video_consent_at
      ))
    )
  );

  return new;
end;
$$;

revoke all on function public.log_interview_workflow_activity() from public, anon, authenticated;

create trigger content_interview_workflow_log_activity
after insert or update on public.content_interview_workflow
for each row execute function public.log_interview_workflow_activity();

revoke delete on table public.content_interview_workflow from authenticated;

comment on function public.enforce_interview_workflow_transition() is
  'Enforces the named editorial interview transitions and normalizes operational/consent timestamps at the database boundary.';
comment on function public.log_interview_workflow_activity() is
  'Atomically records interview workflow state/date/consent changes in editorial_content_activity without copying internal notes.';
