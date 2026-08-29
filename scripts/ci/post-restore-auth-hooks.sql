-- Reattach application-owned hooks that target Supabase-managed Auth objects.
--
-- Supabase logical schema dumps intentionally do not own/restore the managed
-- auth schema. The application function public.handle_new_user() is part of
-- the public schema backup, but its trigger on auth.users must be reattached
-- after restoring into a fresh Supabase-managed project.
--
-- This script is intentionally narrow and idempotent: it does not restore,
-- alter, copy, or delete auth.users data, credentials, sessions, factors, or
-- any other Supabase-managed Auth object.

BEGIN;

DO $post_restore_preflight$
BEGIN
  IF to_regclass('auth.users') IS NULL THEN
    RAISE EXCEPTION 'POST_RESTORE_AUTH_USERS_MISSING';
  END IF;

  IF to_regprocedure('public.handle_new_user()') IS NULL THEN
    RAISE EXCEPTION 'POST_RESTORE_HANDLE_NEW_USER_MISSING';
  END IF;
END;
$post_restore_preflight$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

DO $post_restore_verify$
DECLARE
  v_trigger_count integer;
BEGIN
  SELECT count(*)
    INTO v_trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_proc p ON p.oid = t.tgfoid
  JOIN pg_namespace pn ON pn.oid = p.pronamespace
  WHERE NOT t.tgisinternal
    AND n.nspname = 'auth'
    AND c.relname = 'users'
    AND t.tgname = 'on_auth_user_created'
    AND pn.nspname = 'public'
    AND p.proname = 'handle_new_user';

  IF v_trigger_count <> 1 THEN
    RAISE EXCEPTION 'POST_RESTORE_AUTH_TRIGGER_VERIFY_FAILED: expected 1, found %', v_trigger_count;
  END IF;
END;
$post_restore_verify$;

COMMIT;

SELECT 'POST_RESTORE_AUTH_HOOKS = PASS' AS result;
