# Organizzazioni — Validation Report (M8.2)

## 1. Esito

**`ACCETTATA`**

Chiusura tecnica del ciclo 1 del dominio **Organizzazioni**: schema validato staticamente e in runtime locale, pubblicato sul database remoto, senza drift di migration history.

**CICLO 1 ORGANIZZAZIONI VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**

---

## 2. Perimetro validato

| Artefatto | Path |
|---|---|
| Logical | `docs/architecture/logical/organizzazioni.md` |
| Physical | `docs/architecture/physical/domain-mapping/organizzazioni.md` |
| Migration Plan | `docs/architecture/migrations/organizzazioni-migration-plan.md` |
| M1.1 | `supabase/migrations/20260808090000_create_organization_types.sql` |
| M1.2 | `supabase/migrations/20260808100000_create_organization_activity_scopes.sql` |
| M2.1 | `supabase/migrations/20260808110000_create_organizations.sql` |
| M3.1 | `supabase/migrations/20260808120000_create_organization_officials.sql` |
| M8.2 | questo documento |

M4–M7: **assenti**. M8.1: **SKIP** (nessun seed dimostrativo AR/ufficiali).

---

## 3. Migration

| Unità | Timestamp | Tabella | Stato locale | Stato remoto |
|---|---|---|---|---|
| M1.1 | `20260808090000` | `organization_types` | Applicata | Applicata |
| M1.2 | `20260808100000` | `organization_activity_scopes` | Applicata | Applicata |
| M2.1 | `20260808110000` | `organizations` | Applicata | Applicata |
| M3.1 | `20260808120000` | `organization_officials` | Applicata | Applicata |

Head locale = head remoto = **`20260808120000`**. Pending = **0**.

---

## 4. Validazione statica

Verificata conformità Logical ↔ Physical ↔ Migration Plan ↔ SQL:

* una tabella per migration (4/4);
* ordine aciclico M1.1 → M1.2 → M2.1 → M3.1;
* nessuna modifica a migration di domini precedenti;
* assenza di M4–M7 e di M8.1;
* pattern RLS/REVOKE/trigger allineati ai domini già pubblicati (Contenuti/Eventi).

---

## 5. Correzione XOR (pre-apply)

Difformità rilevata in review indipendente e corretta **prima** dell’apply locale:

| Fonte | Semantica soggetto ufficiale |
|---|---|
| Logical §§17–18 | Persona **oppure** etichetta (XOR stretto) |
| Physical/SQL precedenti (non pubblicati) | «almeno uno» (persona e/o etichetta) |

**Contratto finale riallineato:**

* CHECK XOR stretto: esattamente una tra `person_id` e `display_label` (etichetta non blank);
* FK `organization_officials.person_id` → `profiles(id)` **ON DELETE RESTRICT** (SET NULL incoerente con XOR).

Non è una difformità residua.

---

## 6. Apply locale

| Voce | Valore |
|---|---|
| Comando | `supabase migration up --local` |
| Exit code | `0` |
| Migration applicate | 4/4 nell’ordine M1.1–M3.1 |
| Head locale | `20260808120000` |

---

## 7. Validazione runtime

Test eseguiti in transazione con `ROLLBACK` (nessuna fixture residua). Superati:

* ownership Persona / Impresa / Redazione accettate;
* combinazioni ownership vietate rifiutate;
* lifecycle e publication gates;
* slug formato/unicità;
* sede unica su colonne AR (assenza multi-sede);
* link Impresa 0..1 (null, valorizzato; stessa Impresa su più Org ammessa dal Physical);
* XOR ufficiali (accetta/rifiuta secondo contratto);
* UNIQUE primary e person+role;
* CASCADE Organizzazione → ufficiali;
* RESTRICT cancellazione Persona referenziata;
* trigger `updated_at` (confermati; falso negativo iniziale su ufficiali dovuto a `now()` costante in transazione);
* cataloghi blank/PK/sort e pulizia post-ROLLBACK.

---

## 8. Cataloghi e conteggi (locale e remoto)

| Tabella | Conteggio verificato |
|---|---|
| `organization_types` | **11/11** (seed normativo) |
| `organization_activity_scopes` | **0** |
| `organizations` | **0** |
| `organization_officials` | **0** |

---

## 9. Sicurezza

Verificato locale e remoto:

* RLS abilitata sulle quattro tabelle;
* FORCE RLS disattivato;
* zero policy;
* nessun privilegio a `PUBLIC`, `anon`, `authenticated`;
* nessuna FK da `organizations` verso `auth.users`.

---

## 10. Dry-run remoto

| Voce | Valore |
|---|---|
| Comando | `supabase db push --linked --dry-run` |
| Exit code | `0` |
| Migration proposte | esattamente le 4 Organizzazioni, ordine corretto |
| Migration inattese | nessuna |

---

## 11. Apply remoto

| Voce | Valore |
|---|---|
| Comando | `supabase db push --linked` |
| Exit code | `0` |
| Conferma interattiva | `Y` |
| Ordine | M1.1 → M1.2 → M2.1 → M3.1 |
| Head remoto finale | `20260808120000` |
| Pending | `0` |

---

## 12. Verifica remota minima

Eseguita via `supabase db query --linked` (sola lettura):

* quattro tabelle presenti;
* seed/contatori come §8;
* RLS on / FORCE off; 0 policy; 0 grant a PUBLIC/anon/authenticated;
* quattro trigger `*_set_updated_at`;
* CHECK `organizations_ownership_ternary_check` presente;
* CHECK `organization_officials_subject_xor_check` presente;
* FK ufficiali: `organization_id` CASCADE; `person_id` RESTRICT;
* `organization_seats` assente;
* `organization_memberships` assente.

---

## 13. Warning (non bloccanti)

| Warning | Classificazione |
|---|---|
| Rumore PowerShell `NativeCommandError` su log informativi CLI | Non bloccante |
| Warning cache `pg-delta` post-apply remoto (cert ENOENT) | Non bloccante; apply già completato con exit 0 |
| Directory temporanea `supabase/.temp/pgdelta` | Rimossa; assente a chiusura |
| Impatto sulle migration | Nessuno |

---

## 14. Hash SQL finali

| Migration | SHA-256 |
|---|---|
| M1.1 | `13209973fc059af49086223f102c58fdcbb11c8dfa84f836b957092701c0d2f6` |
| M1.2 | `a3f8ca2764a0ec443740397fce66936b9eddbc6bae89eadf4602d35b7c3381b9` |
| M2.1 | `934a571333a54724f5db83f21d05b21b1f382dc4c83166644c283e46072303df` |
| M3.1 | `47df8311c04b884ac9fa77ee71b89c8f402adc823590f209f6bd71f9d81e2b70` |

---

## 15. Confini confermati

Assenti dal ciclo 1: membership; Org–Org; multi-sede; CRM; HR; Identità & Accessi; Storage; documenti strutturali; media library; FEV; workflow; FK retroattive verso Eventi/Servizi/Contenuti/Opportunità/Mercati Internazionali.

---

## 16. Decisione

**CICLO 1 ORGANIZZAZIONI VALIDATO LOCALMENTE E PUBBLICATO SUL DATABASE REMOTO**
