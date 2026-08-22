-- Persistent abuse protection for anonymous/contributor editorial submissions.
-- Prepared and validated on the development branch only. Production activation
-- remains a separate explicit release step.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.request_rate_limit_buckets (
  scope text not null check (scope ~ '^[a-z0-9_:-]{1,80}$'),
  key_hash text not null check (key_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (scope, key_hash, window_started_at)
);

create index if not exists request_rate_limit_buckets_window_idx
  on public.request_rate_limit_buckets(window_started_at);

alter table public.request_rate_limit_buckets enable row level security;
revoke all on table public.request_rate_limit_buckets from anon, authenticated;

create or replace function public.consume_request_rate_limit(
  p_scope text,
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scope text := lower(btrim(coalesce(p_scope, '')));
  v_key text := btrim(coalesce(p_key, ''));
  v_hash text;
  v_window_started timestamptz;
  v_count integer;
begin
  if v_scope !~ '^[a-z0-9_:-]{1,80}$' then
    raise exception 'invalid rate limit scope' using errcode = '22023';
  end if;
  if length(v_key) = 0 or length(v_key) > 1024 then
    raise exception 'invalid rate limit key' using errcode = '22023';
  end if;
  if p_limit < 1 or p_limit > 100000 then
    raise exception 'invalid rate limit' using errcode = '22023';
  end if;
  if p_window_seconds < 10 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit window' using errcode = '22023';
  end if;

  v_hash := encode(extensions.digest(convert_to(v_key, 'UTF8'), 'sha256'), 'hex');
  v_window_started := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.request_rate_limit_buckets (
    scope,
    key_hash,
    window_started_at,
    request_count,
    updated_at
  ) values (
    v_scope,
    v_hash,
    v_window_started,
    1,
    now()
  )
  on conflict (scope, key_hash, window_started_at)
  do update set
    request_count = public.request_rate_limit_buckets.request_count + 1,
    updated_at = now()
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_request_rate_limit(text,text,integer,integer)
  from public, anon, authenticated;

create or replace function public.enforce_editorial_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(new.submitter_email, '')));
begin
  -- Trusted service operations and editorial users are not anonymous intake.
  if auth.role() = 'service_role'
     or public.access_is_editor()
     or public.access_is_application_admin() then
    return new;
  end if;

  -- A global ceiling limits distributed automated intake. The tighter per-email
  -- bucket prevents repeated submissions using the same identity. Both counters
  -- are private and store only SHA-256 key hashes.
  if not public.consume_request_rate_limit(
    'editorial_submission_global',
    'all-public-submissions',
    200,
    3600
  ) then
    raise exception 'submission rate limit exceeded' using errcode = 'P0001';
  end if;

  if not public.consume_request_rate_limit(
    'editorial_submission_email',
    v_email,
    5,
    3600
  ) then
    raise exception 'submission rate limit exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_editorial_submission_rate_limit()
  from public, anon, authenticated;

drop trigger if exists editorial_submissions_rate_limit
  on public.editorial_submissions;
create trigger editorial_submissions_rate_limit
before insert on public.editorial_submissions
for each row execute function public.enforce_editorial_submission_rate_limit();

comment on table public.request_rate_limit_buckets is
  'Private fixed-window counters for persistent abuse protection. Raw client identifiers are never stored.';
comment on function public.consume_request_rate_limit(text,text,integer,integer) is
  'Internal security-definer primitive for atomic fixed-window rate limiting. Not executable by client roles.';
