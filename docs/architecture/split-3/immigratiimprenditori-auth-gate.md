# SPLIT-3 — ImmigratiImprenditori Auth / editorial gate

Checkpoint: 2026-08-18.

## Purpose

ImmigratiImprenditori must have an Auth identity independent from PonteImprese. The existing hosted Supabase `auth` schema must not be copied directly.

The executable Centro Studi baseline already contains the minimum local identity contract used by the application:

- `public.profiles`
- `public.accounts`
- `public.account_role_assignments`
- `access_current_account_id()`
- `access_current_person_id()`
- `access_is_active_account()`
- `access_has_active_application_role()`
- `access_is_editor()`
- `access_is_application_admin()`

## Current hosted-source facts

Read-only inspection on 2026-08-18 shows:

- Auth users: 1
- profiles: 1
- accounts: 1
- account role assignments: 0
- the account is active with a declared person association
- all 18 content rows have `owner_person_id IS NULL`
- all currently populated content is editorial-owned
- checked content/event link tables and event operational tables are empty

Therefore there is no populated Centro Studi person-owned content graph that requires preservation of the historical Auth UUID.

## Auth recreation rule

Use a supported Supabase Auth create/invite/reset flow in the final ImmigratiImprenditori project.

Never migrate through SQL:

- password hashes
- refresh/access tokens
- sessions
- MFA secrets
- raw Auth internals

The new Auth user may receive a new UUID because no populated Centro Studi content row depends on the historical person UUID.

## Local identity bootstrap

After the Auth user exists, the Auth gate must create/attach the local compatibility rows using the new Auth UUID:

1. create `public.profiles.id = auth.users.id`;
2. create one `public.accounts` row with `auth_user_id = auth.users.id` and `person_id = auth.users.id`;
3. set a valid active/declared or active/verified association according to the chosen controlled bootstrap path;
4. assign the editorial role explicitly through `public.account_role_assignments` only after deciding the intended initial role.

The hosted source currently has zero role assignments, so the split must not silently invent a historical role. The final editorial role (`redattore` and/or `amministratore_applicativo`) is a cutover decision and must be recorded explicitly.

## Editorial validation

The Auth/editorial gate passes only when the separated project proves all of the following with a real disposable/test Auth identity:

- authenticated session resolves the expected local account/person;
- public users can read only published/public content;
- the chosen editorial role can perform the intended editorial writes;
- an authenticated user without the editorial role cannot perform editor/admin writes;
- the role check depends only on the local Immigrati tables, never on PonteImprese;
- opaque cross-product UUID fields do not require a Ponte database join or foreign key.

## Production cutover

At production cutover:

1. create/invite/reset the editorial user in the final Immigrati Auth project;
2. bootstrap the local profile/account;
3. explicitly assign the approved editorial role;
4. test login and editorial RLS end-to-end;
5. leave the historical hosted Auth data untouched until the overall cutover is accepted.

`IMMIGRATI_AUTH_EDITORIAL_GATE = PASS` only after this end-to-end test succeeds.
