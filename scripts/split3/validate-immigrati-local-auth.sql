\set ON_ERROR_STOP on

BEGIN;

SELECT set_config('split3.auth_user_id', '74fd0c91-f5f1-4db2-93b2-2fb39a840002', true);

INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at
) VALUES (
  current_setting('split3.auth_user_id')::uuid,
  'split3-immigrati-auth-smoke@example.invalid',
  '{"full_name":"Split3 Immigrati Auth Smoke"}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
);

DO $$
DECLARE
  v_user uuid := current_setting('split3.auth_user_id')::uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_user
      AND p.display_name = 'Split3 Immigrati Auth Smoke'
      AND p.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Auth trigger did not create the expected Immigrati profile';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claim.role', 'service_role', true);
SELECT public.access_provision_account(current_setting('split3.auth_user_id')::uuid) AS account_id \gset
SELECT set_config('split3.account_id', :'account_id', true);

SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SELECT set_config('request.jwt.claim.sub', current_setting('split3.auth_user_id'), true);
SELECT public.access_link_person(
  current_setting('split3.account_id')::uuid,
  current_setting('split3.auth_user_id')::uuid
);

DO $$
DECLARE
  v_user uuid := current_setting('split3.auth_user_id')::uuid;
  v_account uuid := current_setting('split3.account_id')::uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.accounts a
    WHERE a.id = v_account
      AND a.auth_user_id = v_user
      AND a.person_id = v_user
      AND a.person_association_status = 'declared'
      AND a.account_status = 'active'
      AND a.person_linked_at IS NOT NULL
      AND a.activated_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Authenticated Immigrati self-link did not activate the account';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claim.role', 'service_role', true);
SELECT public.assign_application_role(
  current_setting('split3.account_id')::uuid,
  'redattore'
);

SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SELECT set_config('request.jwt.claim.sub', current_setting('split3.auth_user_id'), true);

DO $$
DECLARE
  v_user uuid := current_setting('split3.auth_user_id')::uuid;
  v_account uuid := current_setting('split3.account_id')::uuid;
BEGIN
  IF public.access_current_account_id() IS DISTINCT FROM v_account THEN
    RAISE EXCEPTION 'Immigrati access_current_account_id mismatch';
  END IF;
  IF public.access_current_person_id() IS DISTINCT FROM v_user THEN
    RAISE EXCEPTION 'Immigrati access_current_person_id mismatch';
  END IF;
  IF NOT public.access_is_active_account() THEN
    RAISE EXCEPTION 'Immigrati account is not active for authenticated user';
  END IF;
  IF NOT public.access_is_editor() THEN
    RAISE EXCEPTION 'Immigrati redattore role is not visible to authenticated user';
  END IF;
  IF public.access_is_application_admin() THEN
    RAISE EXCEPTION 'Immigrati synthetic redattore unexpectedly became application admin';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM public.account_role_assignments r
    WHERE r.account_id = v_account
      AND r.role_code = 'redattore'
      AND r.assignment_status = 'active'
  ) THEN
    RAISE EXCEPTION 'Immigrati redattore assignment missing';
  END IF;
END;
$$;

SELECT 'SPLIT3_IMMIGRATI_AUTH_IDENTITY_FLOW' AS check_name, 'PASS' AS result;

ROLLBACK;

DO $$
DECLARE
  v_user uuid := '74fd0c91-f5f1-4db2-93b2-2fb39a840002'::uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users u WHERE u.id = v_user)
     OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_user)
     OR EXISTS (SELECT 1 FROM public.accounts a WHERE a.auth_user_id = v_user) THEN
    RAISE EXCEPTION 'Immigrati Auth smoke rollback left test rows behind';
  END IF;
END;
$$;

SELECT 'SPLIT3_IMMIGRATI_AUTH_ROLLBACK' AS check_name, 'PASS' AS result;
