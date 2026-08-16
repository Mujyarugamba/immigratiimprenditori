-- L1.3-M3 runtime harness (ROLLBACK ONLY — disposable fixtures)
-- DO NOT run against production. DO NOT COMMIT transaction.
-- Requires: migration 20260817100000 applied in a scratch DB or local begin/rollback session.
-- Auth ban is OUT OF SCOPE here (not rollbackable safely).
--
-- Usage (psql / supabase db execute in a transaction you control):
--   begin;
--   \i scripts/m3-self-delete-runtime-check.sql
--   -- inspect notices / results
--   rollback;

-- This script is documentation-grade: it encodes the intended fixture matrix.
-- Prefer calling from a Node harness after M3 apply authorization.

/*
MATRIX (expected):
1. normal account → can_proceed true → closed + minimized
2. public persona → /persone slug gone (is_public false, deleted_at set)
3. public phone channel → person_contact_channels empty
4. professional → unpublished/private/ceased contacts null
5. simple member → membership revoked; business remains
6. manager with peers → grant revoked; business remains
7. sole ACT manager → blocked last_business_manager; m4_required true
8. org official only → official anonymized; org remains
9. sole org owner_person_id → blocked sole_organization_owner
10. last application admin → blocked last_application_admin
11. terms present → remain after soft-close (no auto M2)
12. concurrent → advisory lock; second call idempotent
13. anonymous → not authenticated
14. spoof → no account_id parameter (N/A)
*/

select 'm3_harness_placeholder' as status,
       'Apply M3 only after M4 authorization; then replace this with fixture SQL under BEGIN/ROLLBACK' as note;
