# Retention schedule (internal) — L1.3

**Status:** internal operational schedule · **not** a public legal page  
**Authority:** Privacy Policy §10–§11 (purpose-bound retention; A/B/C account deletion; minimized separate archive)  
**Classes:** `LAW-MANDATED` · `POLICY-DEFINED` · `CASE-SPECIFIC`  
**Non-claims:** no invented universal periods (10y / 5y / 90d) unless a concrete law or case requires them.

M2 table: `public.legal_retention_records` — **not a backup**, not a full-account copy.

---

## How to read this schedule

| Column | Meaning |
|---|---|
| Category | Operational / legal data class |
| Purpose | Why data exists |
| Trigger | When the clock / lifecycle starts |
| Criterion | How long / until when (qualitative unless law-specific) |
| Class | LAW-MANDATED / POLICY-DEFINED / CASE-SPECIFIC |
| End | Delete or irreversible anonymization |
| Archive? | May enter M2 minimized archive? |

---

## Categories

| Category | Purpose | Trigger | Criterion | Class | End | Archive? |
|---|---|---|---|---|---|---|
| Account credentials / Auth | Login & contract | Signup | While relationship usable; after close only residual process | POLICY-DEFINED | Auth disable/delete; wipe ops | No full copy |
| Account applicative (`accounts`) | Access identity | Provision | Soft-close primary (`closed`); hard DELETE exceptional after archive/dispose of RESTRICT deps | POLICY-DEFINED | Soft close → later hard DELETE if designed in M3 | No |
| Persona presentation | Network presence | Profile publish/edit | While account active & public choices | POLICY-DEFINED | Soft-unpublish / wipe on account deletion | **No** automatic |
| Contact channels | Network contact | Upsert share flags | Until user clears or account deletion | POLICY-DEFINED | Delete rows | **No** |
| Terms acceptance (`terms_acceptances`) | Contract / dispute proof | Signup acceptance | While Account exists; if hard-delete & proof still needed → copy minimal proof into M2 then remove operational row | POLICY-DEFINED / CASE-SPECIFIC | Retention review → dispose | **Yes**, only `terms_acceptance_proof` when reason concrete |
| Memberships / ACT grants | Relations / security | Join / grant | While active; revoke usable ACT on close | POLICY-DEFINED | Revoke / conclude | No entity dump |
| UGC / contents / events / opportunities | Publication | Publish | While published; after withdraw only if concrete dispute/legal need | CASE-SPECIFIC | Withdraw; selective marker only | **No** automatic body archive |
| Businesses / organizations | Autonomous entities | Create | Own lifecycle (not Account-owned dump) | POLICY-DEFINED | M4 reassignment; not M2 | **No** |
| Security / abuse signals | Security / LI | Incident | Proportionate internal window | POLICY-DEFINED / CASE-SPECIFIC | Rotate / dispose | Marker only (`security_incident_marker` / `abuse_investigation_marker`) |
| Dispute / legal claim | Defense / claim | Case open | Until case ends + review | CASE-SPECIFIC | Dispose when reason ends | Marker + `case_reference` |
| Legal obligation subset | Statutory duty | Obligation attaches | Period required by the specific norm (verify case-by-case; **do not invent**) | LAW-MANDATED | End of statutory period | Only fields required by that duty |
| M2 archive rows themselves | Legal/defense residual | Insert when reason present | `retain_until` **or** `retention_indefinite_review` + admin note + review | matches reason | `legal_retention_dispose_record` | N/A (is the archive) |
| Provider backups | DR | Backup job | Provider rotation (numeric cycle **EXTERNAL / unverified** in repo) | POLICY-DEFINED (technical) | Rotation; re-apply deletions post-DR | Not M2 |

---

## M2 reason_code → schedule mapping

| `reason_code` | Typical `retention_class` | Typical `retained_data_kind` |
|---|---|---|
| `legal_obligation` | `law_mandated` (when a specific norm applies) | marker or terms proof if required |
| `dispute` | `case_specific` | `dispute_marker` |
| `security` | `policy_defined` | `security_incident_marker` |
| `abuse_investigation` | `case_specific` | `abuse_investigation_marker` |
| `legal_claim` | `case_specific` | `legal_claim_marker` |
| `transaction_evidence` | `policy_defined` | `terms_acceptance_proof` (e.g. ToS acceptance) |

No `other` / `misc` / `general`.

---

## Terms acceptance ↔ M2 / M3

1. **While Account lives (incl. soft `closed`):** operational proof stays in `terms_acceptances` (M1, FK `ON DELETE RESTRICT`).
2. **M3 self-delete (phase 1):** soft-close Account; **does not** auto-insert M2; **does not** hard-delete Account; Terms rows remain until a later hard-delete disposal path.
3. **If later hard Account DELETE and proof is still required:** server/service inserts minimized `terms_acceptance_proof` into `legal_retention_records` (`subject_ref` = HMAC opaque from `LEGAL_SUBJECT_HMAC_SECRET` + proof_* + `retain_until` or indefinite-review), then removes the operational `terms_acceptances` row, then hard-deletes Account (`source_account_id` SET NULL).
4. **If no concrete reason remains:** do **not** archive; delete operational proof with the account wipe path.
5. **Final disposal:** `legal_retention_dispose_record` clears proof/marker fields and marks `disposed` — not silent forever retention.
6. **Orphan managers:** businesses/orgs retention is **not** M2 — see M4 reassignment (not archive).

---

## Review obligation

Any row with `retention_indefinite_review = true` requires documented admin review; it is an exception, not the default.

---

*End retention schedule*
