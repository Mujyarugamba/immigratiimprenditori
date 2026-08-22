\set ON_ERROR_STOP on

begin;

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

do $$
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
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'editorial_submissions_rate_limit'
      and not tgisinternal
  ) then
    raise exception 'editorial submission rate limit trigger is missing';
  end if;
end;
$$;

rollback;

select 'PERSISTENT_RATE_LIMIT_SECURITY = PASS' as result;
