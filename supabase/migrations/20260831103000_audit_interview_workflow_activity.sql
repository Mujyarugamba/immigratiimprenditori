-- Audit interview workflow state and consent changes in the existing append-only
-- editorial activity log. Prepared on the working branch; not an authorization
-- to apply anything on Production.

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

    -- updated_at, internal_notes and source bookkeeping are deliberately outside
    -- this audit payload. In particular, internal notes must never be copied into
    -- editorial_content_activity.
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

comment on function public.log_interview_workflow_activity() is
  'Atomically records interview workflow state/date/consent changes in editorial_content_activity without copying internal notes.';
