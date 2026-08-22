\set ON_ERROR_STOP on

begin;

-- Primitive: the fixed-window counter allows exactly the configured threshold.
do $$
declare
  i integer;
  allowed boolean;
begin
  for i in 1..5 loop
    select public.consume_request_rate_limit(
      'ci_submission_email',
      'same@example.test',
      5,
      3600
    ) into allowed;
    if allowed is distinct from true then
      raise exception 'rate limit rejected request % before the configured threshold', i;
    end if;
  end loop;

  select public.consume_request_rate_limit(
    'ci_submission_email',
    'same@example.test',
    5,
    3600
  ) into allowed;

  if allowed is distinct from false then
    raise exception 'rate limit did not reject the request above threshold';
  end if;
end;
$$;

-- Integration: exercise the actual public submission RPC. The trigger must
-- allow five submissions for one email and reject the sixth atomically.
do $$
declare
  i integer;
  blocked boolean := false;
begin
  for i in 1..5 loop
    perform public.submit_editorial_contribution(
      'story',
      'CI Rate Limit',
      'trigger-limit@example.test',
      format('CI persistent rate-limit integration submission %s', i)
    );
  end loop;

  begin
    perform public.submit_editorial_contribution(
      'story',
      'CI Rate Limit',
      'trigger-limit@example.test',
      'CI persistent rate-limit integration submission 6'
    );
  exception
    when sqlstate 'P0001' then
      if sqlerrm = 'submission rate limit exceeded' then
        blocked := true;
      else
        raise;
      end if;
  end;

  if not blocked then
    raise exception 'editorial submission trigger did not reject the sixth request';
  end if;
end;
$$;

-- Privilege and implementation checks: counters/functions stay private and
-- deprecated auth.role() must not re-enter the SECURITY DEFINER trigger.
do $$
declare
  trigger_definition text;
begin
  if has_table_privilege('anon', 'public.request_rate_limit_buckets', 'SELECT') then
    raise exception 'anon unexpectedly has SELECT on rate limit buckets';
  end if;
  if has_table_privilege('authenticated', 'public.request_rate_limit_buckets', 'SELECT') then
    raise exception 'authenticated unexpectedly has SELECT on rate limit buckets';
  end if;
  if has_function_privilege(
    'anon',
    'public.consume_request_rate_limit(text,text,integer,integer)',
    'EXECUTE'
  ) then
    raise exception 'anon unexpectedly has EXECUTE on internal rate limit function';
  end if;
  if has_function_privilege(
    'authenticated',
    'public.consume_request_rate_limit(text,text,integer,integer)',
    'EXECUTE'
  ) then
    raise exception 'authenticated unexpectedly has EXECUTE on internal rate limit function';
  end if;
  if has_function_privilege(
    'anon',
    'public.enforce_editorial_submission_rate_limit()',
    'EXECUTE'
  ) then
    raise exception 'anon unexpectedly has EXECUTE on trigger function';
  end if;
  if has_function_privilege(
    'authenticated',
    'public.enforce_editorial_submission_rate_limit()',
    'EXECUTE'
  ) then
    raise exception 'authenticated unexpectedly has EXECUTE on trigger function';
  end if;
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'editorial_submissions_rate_limit'
      and not tgisinternal
  ) then
    raise exception 'editorial submission rate limit trigger is missing';
  end if;

  select lower(pg_get_functiondef('public.enforce_editorial_submission_rate_limit()'::regprocedure))
    into trigger_definition;
  if position('auth.role()' in trigger_definition) > 0 then
    raise exception 'deprecated auth.role() found in rate-limit trigger';
  end if;
  if position("auth.jwt()->>'role'" in trigger_definition) = 0 then
    raise exception 'signed JWT role claim check missing from rate-limit trigger';
  end if;
end;
$$;

rollback;

select 'PERSISTENT_RATE_LIMIT_SECURITY = PASS' as result;
