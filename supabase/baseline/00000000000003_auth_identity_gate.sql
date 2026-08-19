-- SPLIT-3B ImmigratiImprenditori Auth/editorial identity gate.
-- Rebuilds the minimum identity flow from the hosted source without copying
-- auth.users rows, credentials, sessions, emails, passwords, or application roles.

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_uuid_suffix text;
  v_display_name text;
  v_slug_base text;
  v_slug text;
BEGIN
  v_uuid_suffix := substring(new.id::text from 1 for 8);
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(split_part(new.email, '@', 1)), ''),
    'utente-' || v_uuid_suffix
  );
  v_slug_base := lower(v_display_name);
  v_slug_base := regexp_replace(v_slug_base, '[^a-z0-9]+', '-', 'g');
  v_slug_base := regexp_replace(v_slug_base, '^-+|-+$', '', 'g');
  IF v_slug_base IS NULL OR v_slug_base = '' THEN
    v_slug := 'utente-' || v_uuid_suffix;
  ELSE
    v_slug := v_slug_base || '-' || v_uuid_suffix;
  END IF;
  INSERT INTO public.profiles (id, display_name, slug)
  VALUES (new.id, v_display_name, v_slug);
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.access_provision_account(p_auth_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_account_id uuid;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;
  IF p_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'auth user id required' USING errcode = '22004';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p_auth_user_id) THEN
    RAISE EXCEPTION 'auth user not available' USING errcode = 'P0002';
  END IF;
  SELECT a.id INTO v_account_id
  FROM public.accounts a
  WHERE a.auth_user_id = p_auth_user_id
  FOR UPDATE;
  IF v_account_id IS NOT NULL THEN
    RAISE EXCEPTION 'account already exists' USING errcode = '23505';
  END IF;
  INSERT INTO public.accounts (
    auth_user_id, person_id, person_association_status, person_linked_at, account_status
  ) VALUES (
    p_auth_user_id, NULL, NULL, NULL, 'registered'
  ) RETURNING id INTO v_account_id;
  RETURN v_account_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'account already exists' USING errcode = '23505';
END;
$function$;

CREATE OR REPLACE FUNCTION public.access_link_person(p_account_id uuid, p_person_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_uid uuid := auth.uid();
  v_account public.accounts%rowtype;
  v_assoc text;
BEGIN
  IF p_account_id IS NULL OR p_person_id IS NULL THEN
    RAISE EXCEPTION 'account id and person id required' USING errcode = '22004';
  END IF;
  IF NOT v_is_svc AND v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING errcode = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = p_person_id AND p.deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'person not available' USING errcode = 'P0002';
  END IF;
  SELECT * INTO v_account
  FROM public.accounts a
  WHERE a.id = p_account_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'account not available' USING errcode = 'P0002';
  END IF;
  IF v_account.account_status = 'closed' THEN
    RAISE EXCEPTION 'account state incompatible' USING errcode = '55000';
  END IF;
  IF NOT v_is_svc AND NOT v_is_adm THEN
    IF v_account.auth_user_id IS DISTINCT FROM v_uid OR p_person_id IS DISTINCT FROM v_uid THEN
      RAISE EXCEPTION 'not authorized' USING errcode = '42501';
    END IF;
    IF v_account.account_status IN ('suspended','disabled') THEN
      RAISE EXCEPTION 'account not operational' USING errcode = '55000';
    END IF;
    v_assoc := 'declared';
  ELSE
    v_assoc := 'verified';
  END IF;
  IF v_account.person_id IS NOT NULL AND v_account.person_id IS DISTINCT FROM p_person_id THEN
    RAISE EXCEPTION 'person association already set' USING errcode = '55000';
  END IF;
  IF v_account.person_association_status = 'contested' AND NOT v_is_svc AND NOT v_is_adm THEN
    RAISE EXCEPTION 'person association contested' USING errcode = '55000';
  END IF;
  IF v_account.person_id IS NOT DISTINCT FROM p_person_id
     AND v_account.person_association_status IN ('declared','verified')
     AND (
       (NOT v_is_svc AND NOT v_is_adm AND v_account.person_association_status = 'declared')
       OR ((v_is_svc OR v_is_adm) AND v_account.person_association_status = 'verified')
     ) THEN
    RETURN v_account.id;
  END IF;
  UPDATE public.accounts a
  SET person_id = p_person_id,
      person_association_status = CASE
        WHEN v_is_svc OR v_is_adm THEN 'verified'
        ELSE coalesce(a.person_association_status, v_assoc)
      END,
      person_linked_at = coalesce(a.person_linked_at, now()),
      account_status = CASE
        WHEN a.account_status IN ('registered','limited') THEN 'active'
        ELSE a.account_status
      END,
      activated_at = CASE
        WHEN a.account_status IN ('registered','limited') THEN coalesce(a.activated_at, now())
        ELSE a.activated_at
      END
  WHERE a.id = p_account_id;
  RETURN p_account_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'person already linked to another account' USING errcode = '23505';
END;
$function$;

CREATE OR REPLACE FUNCTION public.assign_application_role(p_account_id uuid, p_role_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_is_svc boolean := (auth.role() is not distinct from 'service_role');
  v_is_adm boolean := public.access_is_application_admin();
  v_actor_account_id uuid := public.access_current_account_id();
  v_assignment_id uuid;
  v_status text;
BEGIN
  IF NOT v_is_svc AND NOT v_is_adm THEN
    RAISE EXCEPTION 'not authorized' USING errcode = '42501';
  END IF;
  IF p_account_id IS NULL OR p_role_code IS NULL THEN
    RAISE EXCEPTION 'account id and role code required' USING errcode = '22004';
  END IF;
  IF p_role_code NOT IN ('redattore','amministratore_applicativo') THEN
    RAISE EXCEPTION 'role not allowed' USING errcode = '22023';
  END IF;
  IF NOT v_is_svc AND v_actor_account_id IS NOT NULL AND v_actor_account_id = p_account_id THEN
    RAISE EXCEPTION 'self-elevate not allowed' USING errcode = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = p_account_id AND a.account_status <> 'closed'
  ) THEN
    RAISE EXCEPTION 'account not available' USING errcode = 'P0002';
  END IF;
  SELECT r.id, r.assignment_status INTO v_assignment_id, v_status
  FROM public.account_role_assignments r
  WHERE r.account_id = p_account_id AND r.role_code = p_role_code
  FOR UPDATE;
  IF v_assignment_id IS NOT NULL THEN
    IF v_status = 'active' THEN RETURN v_assignment_id; END IF;
    UPDATE public.account_role_assignments r
    SET assignment_status='active', revoked_at=NULL, assigned_at=now()
    WHERE r.id=v_assignment_id;
    RETURN v_assignment_id;
  END IF;
  BEGIN
    INSERT INTO public.account_role_assignments (
      account_id, role_code, assignment_status, assigned_at, revoked_at
    ) VALUES (
      p_account_id, p_role_code, 'active', now(), NULL
    ) RETURNING id INTO v_assignment_id;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT r.id INTO v_assignment_id
      FROM public.account_role_assignments r
      WHERE r.account_id=p_account_id AND r.role_code=p_role_code;
      UPDATE public.account_role_assignments r
      SET assignment_status='active', revoked_at=NULL, assigned_at=now()
      WHERE r.id=v_assignment_id AND r.assignment_status='revoked';
      RETURN v_assignment_id;
  END;
  RETURN v_assignment_id;
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC, anon, authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.access_provision_account(uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.access_provision_account(uuid) TO service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.access_link_person(uuid,uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.access_link_person(uuid,uuid) TO authenticated, service_role;

REVOKE ALL PRIVILEGES ON FUNCTION public.assign_application_role(uuid,text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.assign_application_role(uuid,text) TO authenticated, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

COMMIT;
