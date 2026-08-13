# D1-C — Next external-data population block determination (Mercati)

**Progetto:** Immigrati Imprenditori  
**Fase:** D1-C DETERMINATION (analysis / planning only)  
**Data:** 2026-08-13  
**Mode:** accelerata controllata  
**Autorità:** esclusivamente docs repo correnti (roadmap, registry, D1.1–D1.2, D1-A/B reports, physical/logical Mercati)  
**STOP sessione:** nessuna ingestion, nessuna migration creata, nessun write Production, nessuno scheduler, nessun D1-D, nessun commit/push

---

## 1. Esito

**D1-C = WAVE Mercati internazionali** — arricchimento selettivo via **World Bank Indicators (M1 support resources)** + **ICE link-only**.  
Schema pubblicato **sufficiente (CASE A / D1-C-A)**. Pilot progettato; **nessuna ingestion eseguita**.  
Pilot D1-C **autorizzabile previo GO umano** (separate auth, come da roadmap §5 punto 5 / stop line §7).

---

## 2. Perché D1-C ora (dopo D1-B)

| Predecessore | Stato autoritativo |
|---|---|
| D1-A Osservatorio | Eurostat `OBS-EU-SELF-CIT` Production live; Unioncamere **blocked** (Futurae+allowlist) |
| D1-B Opportunità | **CLOSED** end-to-end: 20 reviewed → 15 published / 0 review-only / 5 rejected; no auto-publish; no scheduler |
| Roadmap waves | Priorità: Osservatorio → Opportunità → **Mercati** → Cultura/Eventi/Contenuti |
| Ordine tecnico §5 | Step 5 = «D1.5 — Mercati M1 WB (D1-C; separate auth)» |

D1-C non espande Incentivi.gov e non sblocca Unioncamere.

---

## 3. Baseline (pre-gate D1-C)

### Git

| Voce | Valore |
|---|---|
| Branch | `main` |
| HEAD | `c7dc53762947e3597fc57861df139d01011c31fb` |
| `origin/main` | stesso |
| ahead/behind | `0 / 0` |
| Ultimo commit | `docs(opportunities): complete D1-B.4 git closeout table` |

### Dirt preesistente (preservata; non toccata da stage)

- `M .gitignore`
- `M docs/architecture/legal/legal-drafting-factual-brief.md`
- `?? artifacts/`
- `?? docs/architecture/application/application-v1-deployment-report.md`
- `?? docs/architecture/legal/l1.2-legal-review-report.md`

### DB

| Voce | Local | Remote |
|---|---|---|
| Head migration | `20260820120000` | `20260820120000` |
| Pending | **0** | **0** |

---

## 4. Documenti letti (repo-authoritative)

- `external-data-acquisition-roadmap.md`
- `external-data-source-registry.md` (`worldbank-indicators`, `ice-statistiche-estero`, …)
- `external-data-domain-mapping.md` §2.3 Mercati
- `external-data-provenance-contract.md`
- `d1.1-external-data-discovery-report.md` (§53 Wave D1-C)
- `d1.2-data-mapping-ingestion-contract.md` (§28–30 Markets / ICE; decisione E = M1)
- D1-A reports (`d1.3a-*`) e D1-B contracts/reports (`d1-b*`, `d1-b3*`, `d1-b4*`)
- Physical `domain-mapping/mercati-internazionali.md` §35.4–35.6
- Migrations: `20260802090000` markets, `20260802110000` support_resources, `20260812200000` access Mercati RLS
- Patterns ingest: `src/lib/external-data/**` (riuso concettuale; nessun codice D1-C qui)

**Prior D1-C decisions in repo:** nessuna determination precedente; solo roadmap/wave naming.

---

## 5. Inventory domini portale (A/B/C/D)

| Classe | Significato |
|---|---|
| **A** | Importabile in automatico da fonte esterna (con validazione tecnica) |
| **B** | Importabile con review editoriale obbligatoria prima di publish |
| **C** | Scopribile / curabile; non auto-publishable |
| **D** | Self-service / consenso / ownership soggetto richiesti |

| Dominio | Classe | Note verificate sul modello |
|---|---|---|
| Osservatorio | **A** (stats ufficiali) / SEMI su CSV eterogenei | D1-A live Eurostat; UC blocked |
| Opportunità | **B** | D1-B pattern: no auto-publish |
| **Mercati internazionali** | **B** (enrichment WB) + **C** (ICE links / curation) | D1-C target; M1 resources |
| Eventi | **C** | Wave D1-D; external_id debole |
| Contenuti | **C** | metadata+link; no full-text copy |
| Organizzazioni | **C** / defer | Wave E; no dump |
| Servizi | **C** taxonomy / **D** offerings | vedi §7 |
| Professionisti | **D** | no auto-profili |
| Imprese | **D** | no auto-network da scrape |
| Persone | **D** | no auto personal profiles |
| Collaborazioni | **D** | relazione soggetti |
| Cultura (hub) | trasversale C | non wave dati primaria D1-C |

---

## 6. Confini Persone / Imprese / Professionisti

| Dominio | Auto da web | Prospect/lead interno (futuro) |
|---|---|---|
| **Persone** | **VIETATO** — nessun profilo personale da scraping/open web | Documentato come possibile pipeline interna **senza** auto-publish community; **non implementare** in D1-C |
| **Imprese** | **VIETATO** — nessuna anagrafica rete da scrape CCIAA/web | Idem: candidate/prospect interno eventuale; **non** community business auto |
| **Professionisti** | **VIETATO** — nessun profilo professionale senza onboarding/auth | Idem; richiede ownership/account |

D1-C **non** tocca questi domini.

---

## 7. Servizi — doppia natura

| Piano | Regola |
|---|---|
| **(A) Tassonomia / catalogo** | Categorie/nature eventualmente curabili da fonti istituzionali (DEFER Wave E); non è D1-C |
| **(B) Offering concreto «X offre Y»** | **Mai** inventato né auto-published senza base/autorizzazione del soggetto offerente (classe **D**) |

---

## 8. Fonti candidate D1-C (Mercati)

### 8.1 Primaria — `worldbank-indicators` (PILOT selective)

| Campo | Valore |
|---|---|
| Owner | World Bank |
| Endpoint | `https://api.worldbank.org/v2/` (es. `/country/{iso2}/indicator/{code}?format=json`) |
| Dataset | Indicators catalog (selected codes only) |
| Coverage | Mondo / paese / anno |
| Refresh | **ANNUAL** (tipico) |
| License | **CC BY 4.0** |
| Attribution | World Bank (+ indicator name + year + retrieval date) |
| Stable ID | `indicator_code + country_iso + year` |
| Dates | year dimension in API |
| Geography | ISO2/ISO3 country → `international_market_countries.country_ref` / market `code` |
| Quality | Alto (registry 27/30); evitare overload macro |
| API/download | JSON/XML/CSV API — machine-readable |
| Schema-drift risk | Basso su codici indicatori stabili; medio su unit/metadata |
| PII | Nessuno (aggregati paese) |
| Reuse terms | CC BY 4.0 — attribution obbligatoria |
| Probe READ-ONLY (2026-08-13) | API `NY.GDP.MKTP.CD` IT → **HTTP 200**; data page → **200** |

**Indicatori candidati pilot (max 5–8; allineati D1.2 §28–29):**

| Code | Label |
|---|---|
| `SP.POP.TOTL` | Population |
| `NY.GDP.MKTP.CD` | GDP (current US$) |
| `NY.GDP.MKTP.KD.ZG` | GDP growth (annual %) |
| `NY.GDP.PCAP.CD` | GDP per capita |
| `NE.TRD.GNFS.ZS` | Trade (% of GDP) |

**Scartare in dubbio:** inflazione generica, access digitali non actionabili, dump di centinaia di serie.

### 8.2 Complementare — `ice-statistiche-estero` (LINK_ONLY)

| Campo | Valore |
|---|---|
| Owner | ICE |
| Policy D1.2/D1-C | **MANUAL / LINK_ONLY** — no AUTO scrape; no SEMI senza open dataset |
| Uso | `website_url` (+ summary originale corta) su support resource |
| Probe | `https://www.ice.it/` → **HTTP 200** (2026-08-13) |
| License | Non assumere open data; solo link |

### 8.3 Deferred (non pilot D1-C)

| Fonte | Motivo defer |
|---|---|
| ISTAT commercio estero | CANDIDATE successivo; non nel first D1-C pilot |
| OECD country indicators | CANDIDATE; T&C API |
| Eurostat trade bulk | DEFER |

---

## 9. Mapping → schema pubblicato (no campi inventati)

**Target M1 (decisione D1.2-E):** arricchire Mercati esistenti, **non** clonare World Bank, **non** usare `observatory_indicator_values` (Osservatorio ≠ scheda Mercato).

| Campo fonte WB | Destino | Classe |
|---|---|---|
| Indicator name + value + year + unit | `international_market_support_resources.summary` (testo strutturato umano; una riga-risorsa per indicatore×paese×anno **oppure** snapshot multi-indicatore per paese — scelta pilot §11) | **derived** (testuale) |
| Data page / API permalink | `website_url` | **direct** |
| «World Bank — {Indicator} ({Year})» | `name` | **derived** |
| `public_agency` o `other_support` | `resource_kind` | **direct** (vocab esistente) |
| ISO country | resolve → `market_id` via `international_markets` + `international_market_countries.country_ref` | **derived** |
| Attribution + license + retrieved_at | `contact_note` / `territorial_scope_note` + **sidecar** `artifacts/ingestion/.../manifest.json` | **direct** note + P-D |
| Numeric typed columns | — | **missing** (accettato in M1; M2 indicator attach = futuro, non ora) |
| `external_identifier` tipizzato su support_resources | — | **missing** → natural key in convention `name`/`contact_note` + sidecar |
| ICE stats cells | — | **unusable** per auto; solo URL |

### Natural key (idempotenza)

```
worldbank:{indicator_code}:{country_iso2}:{year}
```

oppure, se snapshot aggregato per paese:

```
worldbank:snapshot:{country_iso2}:{edition_year}
```

Re-run: UPDATE summary/url se checksum cambia; UNCHANGED altrimenti; **no delete-all**.

### Provenance

- **P-D** (come D1-A/B): sidecar run + attribution in note  
- Withdrawal/expiry: `substantial_status=archived` + `visibility_status=historical` (assi esistenti); non hard-delete  
- Update: refresh annuale tipico; supersede testuale nella stessa natural key

### Precondition catalogo Mercati

Il FK `market_id` è obbligatorio. Il pilot assume **Mercati paese già presenti** (code + `market_countries.country_ref` ISO) con `editorial_status` gestito dalla redazione.  
Se un paese target manca: **non inventare** il Mercato in auto — flag REVIEW / skip (GO umano su seed editoriale catalogo).

---

## 10. Schema sufficiency

| Caso | Verdetto |
|---|---|
| **CASE A — D1-C-A** | **SCELTO** — tabelle `international_markets`, `international_market_countries`, `international_market_support_resources` + assi verification/visibility **sufficienti** per pilot M1 |
| CASE B — migration dominio | **Non necessaria** per tipizzare indicatori mercato (M2 deferred esplicitamente in D1.2) |

### Privilege gap (operativo; NON creato in questa sessione)

`service_role` oggi **non** ha GRANT su tabelle Mercati (probe 2026-08-13: `42501 permission denied`).  
Per un futuro importer Node (path D1-A/B) proporre — **solo proposta, STOP prima di creare**:

> **D1-C-M1 (proposed):** `GRANT SELECT, INSERT, UPDATE` least-privilege su  
> `international_markets`, `international_market_countries`, `international_market_support_resources`  
> a `service_role`; no DELETE; no RLS change.

Alternativa senza migration: insert/update solo via sessione editor (`access_is_editor`) — oggi **manca** UI redazione Mercati/support resources → importer+grant è il path più coerente con D1-A/B **dopo GO**.

---

## 11. Publication policy D1-C

**Non** copiare meccanicamente il lifecycle Opportunity (assi diversi). Riusare il *principio* ACQUIRE ≠ PUBLISH.

```
FETCH → NORMALIZE → VALIDATE → DEDUPE → DRY-RUN
  → INGEST support_resource
       verification_status = in_review
       visibility_status   = editorial   (o private)
       substantial_status  = signaled
  → HUMAN REVIEW (editor)
  → confirmed + visibility_status=public  |  rejected
```

| Tema | Policy |
|---|---|
| Direct publish? | **NO** |
| Review-only first | **SÌ** |
| Human control | conferma accuracy, market binding, attribution, non-overload UX |
| Updates | refresh idempotente; non sovrascrivere note editoriali manuali oltre summary/url fonte |
| Removals/expiry | archive/historical; no hard-delete |
| Duplicates | natural key §9; un resource per key |
| Editorial preservation | non clobber campi non-fonte; market AR non auto-alterato salvo binding |
| Market AR publish | Mercato deve già essere `editorial_status=published` perché il public SELECT di support_resources lo richiede (RLS) |
| ICE | solo link curato; stessa gate visibility |

---

## 12. Pilot D1-C (progettato — NO import)

| Parametro | Valore |
|---|---|
| Source | World Bank Indicators API |
| Geography | **3 paesi** max (proposta: IT come contesto + 2 mercati priorità prodotto da GO; default tecnico **DE, FR** se GO non specifica — *oppure* 3 mercati già in catalogo) |
| Max records | ≤ **24** observation rows (3 paesi × ≤8 indicatori × 1 year) **oppure** ≤ **3** snapshot resources |
| Period | ultimo anno disponibile per indicatore (tipicamente Y−1 / Y−2) |
| Filters | solo allowlist 5 indicatori §8.1 |
| Expected output | dry-run report + artifact manifest; mapped rows con natural key |
| Dry-run | obbligatorio; `dbWrites=0` |
| Review gate | verification `in_review` |
| Publication gate | human → `confirmed` + `visibility_status=public` |
| ICE | 0–3 link-only resources opzionali (stesso review) |
| Out of scope | scheduler, email, D1-D, Persone/Imprese/Professionisti, expand Incentivi.gov |

---

## 13. Automation readiness (docs only)

| Voce | Design |
|---|---|
| Natural frequency | Annual (post-release WB) |
| Future polling | Manual/ops cron **dopo** GO scheduler globale; non in D1-C |
| Idempotency key | §9 natural key |
| Update detection | SHA-256 normalized summary payload (pattern D1 shared `checksum`) |
| Source disappearance | fail run; keep last published; alert |
| Retry | bounded exponential; no partial publish |
| Alert/error | run log counts + errors[] in sidecar (no secret) |

---

## 14. Cross-domain reusable components (identify only)

Da D1-A/B riusabili senza big refactor:

| Componente | Ruolo |
|---|---|
| FETCH client + allowlist URL | anti-SSRF |
| NORMALIZE + checksum SHA-256 | `src/lib/external-data/checksum.ts` |
| Natural-key helper pattern | `natural-key.ts` |
| Dry-run report shape | `types.ts` `DryRunReport` |
| Sidecar `artifacts/ingestion/<run>/manifest.json` | P-D provenance |
| VALIDATE license class | `LicenseClass` |
| ALERT via counts/errors in manifest | ops |
| Review-before-publish principle | D1-B semantics adapted to Mercati axes |

**Non** fare refactor unificato in questa fase.

---

## 15. Risks

| Rischio | Mitigazione |
|---|---|
| Overload macro senza UX | max 5–8 indicatori; copy «contesto paese», non dashboard WB |
| Confusione Osservatorio vs Mercati | numeri WB solo come support resource su scheda Mercato |
| Market catalog vuoto/incompleto | precondition; skip paesi senza market |
| service_role senza grant | proporre D1-C-M1; non creare ora |
| ICE T&C | link-only |
| Summary text drift | checksum + review |

---

## 16. Next gate

**GO umano richiesto per:**  
1) autorizzare implementazione dry-run importer D1-C;  
2) scegliere 3 paesi pilot;  
3) (se apply) autorizzare eventuale migration privilege D1-C-M1;  
4) review/publish umano.

**STOP:** non iniziare D1-D; non ingestion; non scheduler.

---

## 17. OUTPUT FINALE (67 punti)

| # | Item | Result |
|---|---|---|
| 1 | Esito determination | **PASS (docs-only)** — D1-C = Mercati M1 WB + ICE link |
| 2 | Mode | accelerata controllata · ANALYSIS/PLANNING ONLY |
| 3 | Branch | `main` |
| 4 | HEAD | `c7dc53762947e3597fc57861df139d01011c31fb` |
| 5 | origin/main | = HEAD |
| 6 | Ahead/behind | `0 / 0` |
| 7 | Dirt preesistente | Preservata (no `git add .`) |
| 8 | DB local head | `20260820120000` |
| 9 | DB remote head | `20260820120000` |
| 10 | Pending migrations | **0** |
| 11 | Docs external-data letti | roadmap, registry, mapping, provenance, D1.1–D1.2, D1-A/B |
| 12 | Docs dominio Mercati letti | physical §35, migration plan, access RLS |
| 13 | Stato D1-A | Eurostat live; UC blocked |
| 14 | Stato D1-B | CLOSED 15 pub / 5 rej / 0 review-only |
| 15 | Prior D1-C decision docs | Nessuna — prima determination |
| 16 | Inventory classe A | Osservatorio stats ufficiali (con validate) |
| 17 | Inventory classe B | Opportunità; Mercati enrichment WB |
| 18 | Inventory classe C | Eventi, Contenuti, Org, Servizi taxonomy, ICE links |
| 19 | Inventory classe D | Persone, Imprese, Professionisti, Servizi offerings |
| 20 | Osservatorio vs D1-C | Fuori scope D1-C (già A) |
| 21 | Opportunità vs D1-C | Fuori scope; no expand Incentivi.gov |
| 22 | Mercati = blocco D1-C | **SÌ** (roadmap WAVE D1-C / D1.5) |
| 23 | Eventi | D1-D — non avviato |
| 24 | Contenuti | D1-D — non avviato |
| 25 | Organizzazioni | Wave E defer |
| 26 | Servizi | Non D1-C; split taxonomy/offering confermato |
| 27 | Professionisti | Classe D — no auto |
| 28 | Imprese | Classe D — no auto |
| 29 | Persone | Classe D — no auto |
| 30 | Confine Persone | No auto personal profiles from web |
| 31 | Confine Imprese | No auto network businesses from scrape |
| 32 | Confine Professionisti | No auto profiles without onboarding/auth |
| 33 | Prospect/lead interno | Documentato come possibile futuro; **non implementato** |
| 34 | Servizi (A) vs (B) | Catalog curabile ≠ offering «X offers Y» |
| 35 | Dominio D1-C determinato | **Mercati internazionali** |
| 36 | Perché dopo D1-B | Ordine prodotto roadmap; B chiuso |
| 37 | Fonte primaria | World Bank Indicators API |
| 38 | Fonte complementare | ICE link-only |
| 39 | Fonti deferred | ISTAT trade, OECD, Eurostat trade bulk |
| 40 | Licenza WB | CC BY 4.0 |
| 41 | Attribuzione WB | Obbligatoria |
| 42 | Endpoint WB verificato | HTTP **200** (READ-ONLY probe) |
| 43 | Stable ID WB | indicator+country+year |
| 44 | Coverage/refresh WB | country/year · ANNUAL |
| 45 | PII WB | Nessuno |
| 46 | Policy ICE | LINK_ONLY / no scrape |
| 47 | Mapping direct | url, resource_kind, notes attribution |
| 48 | Mapping derived | name/summary da value+year; market_id resolve |
| 49 | Mapping missing | typed numeric cols; external_identifier column |
| 50 | Natural key | `worldbank:{code}:{iso2}:{year}` |
| 51 | Provenance | P-D sidecar (+ notes) |
| 52 | Schema sufficiency | **CASE A (D1-C-A)** |
| 53 | Migration dominio | **0 create**; privilege D1-C-M1 **proposed only** |
| 54 | Publication policy | review-only; axes verification/visibility |
| 55 | Pilot progettato | ≤3 paesi · ≤8 ind. · dry-run · dual gate |
| 56 | Automation docs | frequency/idempotency/retry/alert — no scheduler |
| 57 | Reusable FETCH→ALERT | Elenati; no big refactor |
| 58 | Docs creati/aggiornati | questo file + roadmap + source-notes |
| 59 | `git diff --check` | su file tocchi docs (vedi chiusura) |
| 60 | App/DB/code changes | **0** |
| 61 | Ingestion eseguita | **NO** |
| 62 | Commit/push | **NO** (default) |
| 63 | Dirt ancora preservata | **SÌ** |
| 64 | Bloccanti al PASS determination | **Nessuno** |
| 65 | Non-bloccanti | market catalog completeness; grant service_role; no redazione UI Mercati |
| 66 | Next gate | GO umano → dry-run importer D1-C (poi apply separato) |
| 67 | Decisione string | vedi §18 |

---

## 18. Decisione string

```
D1-C NEXT POPULATION BLOCK DETERMINATO —
DOMINIO / FONTI / LICENZE / MAPPING / PUBLICATION POLICY DEFINITI —
CONFINI PERSONE / IMPRESE / PROFESSIONISTI / SERVIZI CONFERMATI —
PILOT D1-C PROGETTATO —
SCHEMA SUFFICIENCY DETERMINATA —
NESSUNA INGESTION ESEGUITA —
D1-C PILOT AUTORIZZABILE PREVIO GO
STOP.
```

---

---

## Addendum post D1-C.2 (2026-08-13)

D1-C.2 ha eseguito apply **solo locale**: ops `GRANT` `service_role` (senza migration file) + seed drafting IT/DE/FR + 15 support resources review-only.  
Report: `d1-c2-world-bank-local-pilot-validation.md`.

## Addendum post D1-C.3 (2026-08-13)

D1-C.3 ha portato lo stesso pilot in **Production** (15 review-only; public=0; no migration; `service_role` SIU già presente).  
UI redazione Mercati ancora **GAP** (manca editor SELECT RLS). Report: `d1-c3-world-bank-production-pilot-validation.md`.  
**Next:** D1-C.4 editorial review + selective publication.

*Fine determination D1-C — analysis/planning only (+ D1-C.2 / D1-C.3 addenda).*
