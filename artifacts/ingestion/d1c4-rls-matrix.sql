-- D1-C.4 local RLS matrix for Mercati review-only SELECT
\set ON_ERROR_STOP on

-- Fixtures
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'd1c4-ordinary@example.test', crypt('x', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'd1c4-editor@example.test', crypt('x', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, display_name, slug)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'D1C4 Ordinary', 'd1c4-ordinary'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'D1C4 Editor', 'd1c4-editor')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.accounts (id, auth_user_id, account_status, person_id, person_association_status, person_linked_at, activated_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'active', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'verified', now(), now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'active', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'verified', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.account_role_assignments (account_id, role_code, assignment_status, assigned_at)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'redattore', 'active', now())
ON CONFLICT (account_id, role_code) DO NOTHING;

\echo === ANON ===
BEGIN;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claim.sub', '', true);
SELECT set_config('request.jwt.claims', '{"role":"anon"}', true);
SELECT
  (SELECT count(*) FROM international_market_support_resources WHERE contact_note ILIKE '%natural_key=worldbank:%' AND visibility_status='editorial') AS anon_review_only,
  (SELECT count(*) FROM international_market_support_resources WHERE contact_note ILIKE '%natural_key=worldbank:%' AND visibility_status='public') AS anon_public,
  (SELECT count(*) FROM international_markets WHERE code IN ('it','de','fr') AND editorial_status='drafting') AS anon_draft_markets;
COMMIT;

\echo === ORDINARY authenticated ===
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', true);
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1","role":"authenticated"}', true);
SELECT
  (SELECT count(*) FROM international_market_support_resources WHERE contact_note ILIKE '%natural_key=worldbank:%' AND visibility_status='editorial') AS ordinary_review_only,
  (SELECT count(*) FROM international_markets WHERE code IN ('it','de','fr') AND editorial_status='drafting') AS ordinary_draft_markets,
  public.access_is_editor() AS is_editor,
  public.access_is_active_account() AS is_active;
COMMIT;

\echo === EDITOR ===
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', true);
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2","role":"authenticated"}', true);
SELECT
  (SELECT count(*) FROM international_market_support_resources WHERE contact_note ILIKE '%natural_key=worldbank:%' AND visibility_status='editorial') AS editor_review_only,
  (SELECT count(*) FROM international_markets WHERE code IN ('it','de','fr') AND editorial_status='drafting') AS editor_draft_markets,
  public.access_is_editor() AS is_editor,
  public.access_is_active_account() AS is_active;
COMMIT;

\echo === ADMIN ===
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '15efeadb-4ff3-4cba-a2b8-fa39a4f7b794', true);
SELECT set_config('request.jwt.claims', '{"sub":"15efeadb-4ff3-4cba-a2b8-fa39a4f7b794","role":"authenticated"}', true);
SELECT
  (SELECT count(*) FROM international_market_support_resources WHERE contact_note ILIKE '%natural_key=worldbank:%' AND visibility_status='editorial') AS admin_review_only,
  (SELECT count(*) FROM international_markets WHERE code IN ('it','de','fr') AND editorial_status='drafting') AS admin_draft_markets,
  public.access_is_application_admin() AS is_admin,
  public.access_is_active_account() AS is_active;
COMMIT;

\echo === SERVICE_ROLE ===
BEGIN;
SET LOCAL ROLE service_role;
SELECT
  (SELECT count(*) FROM international_market_support_resources WHERE contact_note ILIKE '%natural_key=worldbank:%' AND visibility_status='editorial') AS service_review_only;
COMMIT;

\echo === DELETE grants (expect 0 rows) ===
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema='public'
  AND table_name = 'international_market_support_resources'
  AND privilege_type = 'DELETE'
  AND grantee IN ('anon', 'authenticated', 'public');

-- Cleanup
DELETE FROM public.account_role_assignments WHERE account_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2' AND role_code='redattore';
DELETE FROM public.accounts WHERE id IN ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2');
DELETE FROM public.profiles WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2');
DELETE FROM auth.users WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2');
