# Production security patch — 2026-08-24

Status: **PASS**

## Scope

Single explicitly authorized Production hardening migration:

`20260824103000_harden_publication_gate_execute_privileges.sql`

The patch removes unnecessary direct `EXECUTE` privileges from the trigger-only `SECURITY DEFINER` function `public.enforce_content_human_publication_gate()` for `anon`, `authenticated` and `service_role`. The `contents_human_publication_gate` trigger remains present and continues to enforce the editorial publication gate.

## Execution evidence

- GitHub Actions workflow: `Authorized Production security patch`
- run: `32707529881`
- conclusion: **SUCCESS**
- preflight: **PASS**
- encrypted pre-patch Production backup: **PASS**
- exact patch dry-run/apply: **PASS**
- postflight: **PASS**

Backup artifact:

- artifact id: `9512852962`
- digest: `sha256:bc96aa18621f58cd397cae13dfc869cdae67924df28796445412ee6e6eee5cb6`
- finite GitHub retention; this artifact is evidence, not a permanent archival strategy.

## Hosted postflight

Production migration ledger after apply:

- rows: **234**
- max version: **`20260824103000`**
- patch ledger rows: **1**

Privilege verification:

- `anon` direct EXECUTE on publication-gate function: **false**
- `authenticated` direct EXECUTE: **false**
- `service_role` direct EXECUTE: **false**
- `contents_human_publication_gate` trigger count: **1**
- verified MFA factor linked to an active application administrator: **>= 1**

Fresh Supabase Security Advisor verification no longer reports `public.enforce_content_human_publication_gate()` as directly executable by anon/authenticated users.

The remaining Security Advisor notices are separate contracts/triage items: public editorial contribution RPC, authenticated access-role helpers/self-service RPCs, two RLS-with-no-client-policy informational findings, and leaked-password protection disabled. None is changed by this patch.

## Cleanup / boundaries

- operational PR #12 closed **without merge**
- temporary write workflow removed from the ops branch
- temporary marker removed; PR #12 final changed-file count is zero
- `main` not modified
- no application Production deployment performed
- no DNS change performed

`PRODUCTION_SECURITY_PATCH = PASS`
