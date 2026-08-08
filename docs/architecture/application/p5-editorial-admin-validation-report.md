# P5 — Editorial / Admin — Validation Report

**Status:** COMPLETED
**Date:** 2026-08-07
**DB head (local = remote):** `20260812300000`
**Pending migrations:** `0`
**Migrations created in P5:** none
**RLS / Access RPC changes:** none

---

## 1. Esito sintetico

P5 implementa workspace **Redazione** e **Amministrazione** sopra Access/RLS v1 già pubblicati.
`Adm ≠ Red` è preservato in guards, navigation, actions e smoke.
Operazioni Red via session + RLS; operazioni Adm elevate via RPC session.
Nessun service-role nelle operazioni ordinarie Red/Adm.

**Decisione:** P5 EDITORIAL/ADMIN COMPLETATO — P6 E2E/HARDENING/RELEASE AUTORIZZABILE.

---

## 2. Workspace Redazione

### Routes
- `/app/redazione` — dashboard
- `/app/redazione/contenuti` (+ `/nuovo`, `/[id]`)
- `/app/redazione/osservatorio` (+ `indicatori`, `fonti`, `valori`)
- `/app/redazione/organizzazioni` (+ `/nuovo`, `/[id]`)

### Guard
`requireEditor` → richiede `access_is_editor()` (via session `isEditor`).
Adm-only → `/app/forbidden`. Layout + actions.

### Contenuti
CRUD editoriale su `contents` con `owned_by_editorial=true`.
Lifecycle reale: `editorial_status` draft|ready; `publication_status` unpublished|published|withdrawn.
Publish: ready + published + public + `published_at`; tenta insert `content_authors` (`editorial_responsible`).
Preview in backoffice; link pubblico `/contenuti/[slug]` quando published.

### Osservatorio
- **Indicatori:** create/edit/publish/withdraw; natura↔unità coerente; publish attiva `operational_status` se draft.
- **Fonti:** entity condivisibile (`observatory_statistical_sources`); lifecycle_status; nessuna FK Org.
- **Valori:** create + revisione: withdraw precedente → insert successore con `supersedes_value_id` (ordine imposto dall’indice unico logico non-withdrawn).
- Privacy editoriale UX: aggregati; soglia 5; no microdati.

### Organizzazioni
CRUD editoriale `owned_by_editorial=true`; publish/withdraw; officials con XOR `person_id`/`display_label`.
Officials ≠ amministratori; nessuna membership Org.

---

## 3. Workspace Amministrazione

### Routes
- `/app/amministrazione` — dashboard (conteggi account/ruoli)
- `/app/amministrazione/account` (+ `/[id]`)
- `/app/amministrazione/ruoli`
- `/app/amministrazione/imprese` — bootstrap grant

### Guard
`requireApplicationAdmin` → `access_is_application_admin()`.
Red-only → forbidden. Nessun `isEditor || isAdmin`.

### Account
Lista/dettaglio via SELECT RLS. Close via `access_close_account`.
Link person Adm via `access_link_person`. Nessun secret auth esposto.

### Ruoli
Whitelist: `redattore`, `amministratore_applicativo`.
RPC only: `assign_application_role`, `revoke_application_role`.
Self-elevate bloccato in UI + action + RPC.
Primo Adm: solo service/SQL (nessuna UI pubblica).

### Business management
`access_bootstrap_business_grant` in area Adm.
Grant ordinari ACT restano su workspace Impresa (P3).

---

## 4. Navigation Adm ≠ Red

| Profilo | Vede Red | Vede Adm |
|---|---|---|
| Ordinary | no | no |
| Red-only | sì (+ sottovoci) | no |
| Adm-only | no | sì (+ sottovoci) |
| Red+Adm | sì | sì |

`navFlags.showEditor` / `showAdmin` restano flag separati.

---

## 5. Data / Actions layer

| Modulo | Ruolo |
|---|---|
| `src/lib/data/editorial/contents.ts` | Contenuti Red |
| `src/lib/data/editorial/observatory.ts` | OSS Red |
| `src/lib/data/editorial/organizations.ts` | Org Red |
| `src/lib/data/admin/accounts.ts` | Account Adm |
| `src/lib/data/admin/roles.ts` | Ruoli RPC |
| `src/lib/editorial/actions.ts` | Server actions Red |
| `src/lib/admin/actions.ts` | Server actions Adm |

---

## 6. Security

- Browser client: 0 service-role.
- Editorial/admin actions: session only (test boundary).
- Roles/account close/bootstrap: RPC, no direct DML sensibile.
- Frontend ≠ permission authority; RLS/RPC restano authoritative.
- Training quarantine non toccata.

---

## 7. Test

| Suite | Esito |
|---|---|
| `npm test` | 91 pass / 0 fail |
| `npm run test:p5-smoke` | `P5_SMOKE_PASS` + cleanup |
| `npm run test:p3-smoke` | PASS |
| `npm run test:p4-smoke` | PASS |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0 (0 errors) |
| `npm run build` | (vedi report finale esecuzione) |

Smoke P5 copre: ordinary/Red/Adm/Red+Adm, Contenuti lifecycle+public, OSS create/publish/revision, Org+official, assign/revoke, self-elevate deny, bootstrap Adm vs ordinary deny.

---

## 8. Limiti post-v1 / P6

- Nessun redesign visuale, a11y esaustiva, profiling, analytics, audit avanzato.
- Nessuna protezione DB “ultimo Adm”.
- Revisione valore non atomica (withdraw→insert); errore mid-flight lascia gap temporaneo.
- Collaborazioni editorial CRUD non estese oltre Org/Contenuti/OSS (Collab editorial rinviabile).
- E2E browser cross-device = P6.

---

## 9. DB invariato

- Locale/remoto: `20260812300000`
- Pending: `0`
- Migration create: **no**
- `pgdelta`: assente
