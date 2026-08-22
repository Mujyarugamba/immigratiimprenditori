-- Persistent application-side throttling for the editorial/contributor password login.
-- Branch/local validation only. Production activation remains an explicit release step.
-- Raw email/IP values are never stored: the shared primitive persists SHA-256 hashes only.

create or replace function public.consume_editorial_login_rate_limit(
  p_email text,
  p_client_ip text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_ip text := btrim(coalesce(p_client_ip, ''));
  v_email_allowed boolean;
  v_pair_allowed boolean := true;
  v_ip_allowed boolean := true;
begin
  if length(v_email) = 0 or length(v_email) > 320 then
    raise exception 'invalid login rate limit email' using errcode = '22023';
  end if;

  -- Netlify provides a plain IPv4/IPv6 client address. If the trusted header is
  -- unavailable or malformed, keep the account-level limiter active and skip
  -- only the IP-specific buckets rather than storing arbitrary header content.
  if length(v_ip) > 128 or v_ip !~ '^[0-9A-Fa-f:.]+$' then
    v_ip := '';
  end if;

  select public.consume_request_rate_limit(
    'editorial_login_email',
    v_email,
    20,
    900
  ) into v_email_allowed;

  if length(v_ip) > 0 then
    select public.consume_request_rate_limit(
      'editorial_login_email_ip',
      v_email || E'\n' || v_ip,
      8,
      900
    ) into v_pair_allowed;

    select public.consume_request_rate_limit(
      'editorial_login_ip',
      v_ip,
      60,
      900
    ) into v_ip_allowed;
  end if;

  return v_email_allowed and v_pair_allowed and v_ip_allowed;
end;
$$;

revoke all on function public.consume_editorial_login_rate_limit(text,text)
  from public, anon, authenticated;
grant execute on function public.consume_editorial_login_rate_limit(text,text)
  to service_role;

comment on function public.consume_editorial_login_rate_limit(text,text) is
  'Service-role-only persistent login throttle: 8/email+IP, 20/email, 60/IP per 15 minutes. Raw identifiers are hashed by consume_request_rate_limit and never stored.';
