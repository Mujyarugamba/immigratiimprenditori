-- L1.1b follow-up: legacy profiles.phone must stay empty.
-- Contact SoT is public.person_contact_channels.
-- Observed: REVOKE SELECT (phone) under table-level GRANT ALL to anon does not
-- produce a durable column ACL (attacl remains null). Enforce emptiness instead.

alter table public.profiles
  drop constraint if exists profiles_phone_must_be_null_chk;

alter table public.profiles
  add constraint profiles_phone_must_be_null_chk
  check (phone is null);

comment on constraint profiles_phone_must_be_null_chk on public.profiles is
  'L1.1b: legacy profiles.phone is retired. Professional phone lives in person_contact_channels.';
