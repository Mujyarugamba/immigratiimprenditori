# Production-source restore drill — 2026-08-23

Status: **PASS**

This record closes the runbook gate `PRODUCTION_SOURCE_RESTORE_DRILL` for the release candidate. It documents the explicitly authorized restore of the real Production logical dataset into the existing non-Production Supabase staging project. It does **not** authorize Production migrations, merge, deploy, DNS changes, or any other Production write.

## Scope and authorization

- Source: real Supabase Production project `immigratiimprenditori` (`hvfvfatlaspcpszgizhg`).
- Target: existing Supabase non-Production project `immigratiimprenditori-staging` (`uhtolyagqbzphdaxoany`).
- Operator path: GitHub Actions on isolated branch `ops/production-restore-drill-20260823`.
- Database connections: Supabase Session pooler, PostgreSQL port 5432; credentials supplied only through repository Actions secrets and never printed.
- User authorization: explicit authorization to overwrite staging with the Production copy was given in this work session.
- Production access during restore: read-only logical dump/query operations only.

## Preservation before overwrite

The pre-existing staging state was preserved before the destructive target operation.

GitHub Actions run `32669477735` — **PASS**:

- required secret validation;
- logical staging dump creation and validation;
- encryption;
- plaintext removal;
- encrypted artifact upload.

Artifact evidence:

- artifact: `staging-preservation-backup-32669477735`
- artifact id: `9500962451`
- size: 430286 bytes
- digest: `sha256:b391da1fe8eb1edf5f2605702a2ca611557dd76d2f15e5ff45457700aa98eb07`
- GitHub retention expiry: `2026-08-30T22:05:35Z`

Pre-restore staging sentinel used by the atomic restore:

- `public.contents = 18`
- `public.observatory_indicators = 1`
- `public.accounts = 0`
- `public.profiles = 0`
- `auth.users = 0`
- `auth.identities = 0`

## Production-source backup

GitHub Actions run `32669477733` — **PASS**:

- Production connection identity validated without exposing credentials;
- official Supabase logical backup components generated;
- platform-managed role statements normalized for portability;
- bundle encrypted;
- plaintext removed;
- encrypted Production-source artifact uploaded.

Artifact evidence:

- artifact: `production-source-backup-32669477733`
- artifact id: `9500967813`
- size: 430657 bytes
- digest: `sha256:47dcb33614fe904d55b39a87142eb71f6039b6bd637073ab8e0a7f41b69cf59a`
- GitHub retention expiry: `2026-08-30T22:05:57Z`

The finite GitHub artifact retention does not replace the release-time backup requirement: immediately before any future authorized Production migration apply, a fresh Production backup and fresh hosted-state read must still be taken.

## Restore execution

GitHub Actions run `32669477734` — **PASS**.

The successful path used:

1. read-only identity and schema-compatibility preflight;
2. fresh Production schema/data/migration-history dump;
3. separate logical copy of `auth.users` and `auth.identities`;
4. removal of all other `auth.*` COPY blocks from the general Supabase data dump to avoid duplicating Auth rows and copying transient managed Auth state;
5. atomic single-transaction staging replacement;
6. `session_replication_role = replica` during controlled data load;
7. restoration of the application-owned `on_auth_user_created` trigger on `auth.users`;
8. in-transaction count/RLS/Auth-orphan validation;
9. external read-only postflight after commit;
10. plaintext restore material removal.

Earlier failed attempts were fully rolled back by PostgreSQL and did not leave partial staging state. The failures identified and closed were:

- Supabase-managed reserved roles such as `supabase_admin` must not be modified on hosted targets;
- the Supabase general data dump already contains Auth rows, so restoring both that Auth payload and a separate Auth dump causes duplicate-key failure;
- CLI table exclusion did not remove the managed Auth blocks as expected, so the final path used a deterministic COPY-block filter and explicit validation before any staging write.

## Independent post-restore verification

The dedicated read-only comparison workflow was rerun after the successful restore.

Run `32669477774`, rerun job `97268700919` — **PASS**.

Observed parity:

| Check | Production | Staging |
| --- | ---: | ---: |
| `public.contents` | 31 | 31 |
| `public.observatory_indicators` | 4 | 4 |
| `public.languages` | 30 | 30 |
| `public.accounts` | 1 | 1 |
| `public.profiles` | 1 | 1 |
| `auth.users` | 1 | 1 |
| `auth.identities` | 1 | 1 |
| migration rows | 209 | 209 |
| max migration | `20260820160000` | `20260820160000` |

Additional independent checks:

- connection identities: **PASS**;
- critical RLS on `accounts`, `account_role_assignments`, `editorial_inbox_items`, `editorial_submissions`: **PASS**;
- application Auth hook `on_auth_user_created` → `public.handle_new_user()`: **PASS**;
- orphaned `accounts` references to Auth users: **0**;
- orphaned `profiles` references to Auth users: **0**.

Final marker:

`PRODUCTION_TO_STAGING_READONLY_VERIFY = PASS`

## Direct Supabase control-plane verification

After the GitHub Actions postflight, an independent read-only verification was repeated directly through the Supabase management connection against both hosted projects.

Exact migration-ledger parity:

- Production count: `209`
- staging count: `209`
- Production/staging max version: `20260820160000`
- Production/staging ledger signature: `9ef2974e95d55ecd2e9487b8cc9deb8b`

Key data-set signatures were identical on both projects:

| Dataset | Signature |
| --- | --- |
| `public.contents` | `2c251fb262445e82fa4204b7fa232799` |
| `public.observatory_indicators` | `43b7b92c51f4a71a3db3ac89956726cc` |
| `public.languages` | `44cc0fa80a23b95b08513035c990b88e` |
| `public.accounts` | `36ee7c5d29f74943997b57b1d0369397` |
| `public.profiles` | `be8ffbd3139a5ff1e6954f67e28d2ef9` |

Structural/security signatures were also identical:

| Surface | Signature |
| --- | --- |
| public columns | `a15d5f5a70fdb6b9f3d2818e85cad709` |
| public RLS policies | `3e49def2d68367ce2a2421f5f438ccc4` |
| public functions | `0a27068e457126f4b333a11bbee2180a` |
| table RLS flags | `83488dd644dc06fa3d23bf0d29221c1c` |
| public table grants | `beefc525170964518a539ba2a6e59f97` |
| public routine grants | `0701953c81dd7d76ea5e2685e6a851c6` |

The Supabase Security Advisor baseline is identical on Production and staging. Both currently report the same five warnings: the intentional public contribution `SECURITY DEFINER` RPC, the two authenticated self-service account RPCs plus the authenticated contribution RPC, and leaked-password protection disabled. No staging-only security warning was introduced by the restore.

`auth.mfa_factors = 0` remains true on both hosted projects; this is expected at this gate and does not close the separate privileged Production MFA requirement.

## Repository / Production safety outcome

- PR #11 was closed **without merge** after the drill.
- The destructive restore workflow was removed from the isolated operational branch after completion.
- `main` was not modified.
- No Production schema/data migration was applied.
- No Production deploy was performed.
- The release candidate still requires all other runbook gates and explicit authorization before any Production migration or deployment.

`PRODUCTION_SOURCE_RESTORE_DRILL = PASS`
