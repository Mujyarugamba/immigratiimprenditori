# D1-B.4 — Resolve remaining QUESTIONABLE opportunities

**Date:** 2026-08-13  
**Mode:** accelerata controllata  
**Baseline git (pre):** `7254fe5` on `main` (ahead/behind `0/0`)  
**Final git:** `ff097e3` on `main` (ahead/behind `0/0` after push)  
**AUTO-PUBLISH:** **NO**  
**Scheduler / email / D1-C:** **NOT STARTED**  
**Scope:** only the 7 QUESTIONABLE from D1-B.3 (`132, 156, 170, 1843, 1856, 187, 2309`)

---

## 1. Decision

`D1-B OPPORTUNITIES PILOT CHIUSO — TUTTE LE 20 OPPORTUNITÀ INCENTIVI.GOV CLASSIFICATE — QUESTIONABLE RISOLTI — SOLO OPPORTUNITÀ VERIFICATE PUBBLICATE — REJECT GESTITI SENZA HARD DELETE — PROVENANCE / SCADENZE / STATO EDITORIALE PRESERVATI — D1-B END-TO-END COMPLETAMENTE VALIDATO — PRONTO PER SUCCESSIVO DOMINIO DI POPOLAMENTO`

**STOP.** No new imports; no scheduler; no email; no D1-C; no Unioncamere; no pilot expansion.

---

## 2. Pre-gate

| Check | Result |
|---|---|
| Branch / HEAD | `main` / `7254fe5` |
| origin ahead/behind | `0/0` |
| Local + remote DB head | `20260820120000` |
| Pending | **0** |
| Production baseline | **12** published / **7** review-only QUESTIONABLE / **1** rejected (`225`) |
| Dirt preserved | yes (no `git add .`) |

---

## 3. Inventory (7 QUESTIONABLE)

| Key | Title | D1-B.3 reason axis |
|---|---|---|
| `132` | Contratti di sviluppo — Bus elettrici (PNRR) | status / incompleteness |
| `156` | Mobilità sostenibile — filiera autobus elettrici | status / duplication-overlap |
| `170` | Contratti di sviluppo — automotive | status / URL (rinvio) |
| `1843` | Piano Operativo Fondo Contributi Interessi | audience niche |
| `1856` | Fondo di garanzia impiantistica sportiva | audience niche / URL |
| `187` | Agevolazioni fiscali assunzione detenuti/internati | audience niche |
| `2309` | Bando Rinnova Veicoli 2024-2025 — Unioncamere Lombardia | deadline / exhausted window |

---

## 4. Source verification

Primary sources: Incentivi.gov catalog pages + MIMIT / Unioncamere Lombardia / ICSC / Ministero della Giustizia. No blogs as definitive.

| Key | Finding |
|---|---|
| `2309` | Official UCL page: linee 2024 e 2025 **esaurite**; sportello chiuso (DD 117/2024, 67/2025) |
| `170` | MIMIT DD **5 agosto 2026**: chiusura temporanea sportello automotive dal **6/8/2026**; catalog URL = solo rinvio 2022 |
| `132` | Official landing = avviso apertura **2022**; misura PNRR rimodulata; no confirmed current intake on linked page |
| `156` | Official landing = apertura sportello **2022**; stesso investimento di `132`; no confirmed current window |
| `1843` | Regolamenti Fondi Speciali ICSC HTTP 200; close date DB **2027-06-30** |
| `1856` | Correct landing `…/fondi-speciali-sport-fondo-di-garanzia/` (catalog URL redirected to cultural compartment); close **2027-06-30** |
| `187` | Incentivi.gov **Attivo**; scheda Giustizia aggiornata; old catalog URL unreliable |

---

## 5. Classification (resolution)

| Grade | Count | Keys |
|---|---|---|
| **READY → published** | **3** | 1843, 1856, 187 |
| **REJECT** | **4** | 132, 156, 170, 2309 |
| **Still QUESTIONABLE** | **0** | — |

### REJECT rationale (canonical lifecycle, no hard-delete)

- `2309` — sportello chiuso per esaurimento risorse (authority page).
- `170` — sportello automotive temporaneamente chiuso (MIMIT DD 5/8/2026).
- `132` / `156` — landing ufficiali solo aperture 2022; intake corrente non dimostrabile; rischio pubblicazione fuorviante.

### READY rationale

- `1843` / `1856` — strumenti ICSC verificati, scadenza 2027, nicchia accettabile (coerente con `1857` già pubblicato).
- `187` — misura strutturale attiva (legge Smuraglia); scheda ufficiale Giustizia utilizzabile.

Prior REJECT `225` **unchanged**. Prior 12 published **unchanged**.

---

## 6. Editorial + URL hygiene

| Axis | Action |
|---|---|
| SOURCE-CONTROLLED | title, substantial_status, time windows, provenance (`source_summary_sha`) preserved |
| EDITORIAL-CONTROLLED | human short summary + purpose on READY; description null |
| URL fix (supported) | `1843` → https regolamenti; `1856` → fondo garanzia sport; `187` → scheda Giustizia credito d’imposta |

---

## 7. Controlled publication

| Step | Result |
|---|---|
| First publish | `incentivi-gov:1843` |
| Immediate anon smoke | title/summary/issuer/territory/deadline/URL visible |
| Remaining READY | `1856`, `187` |
| Final published | **15** |
| Review-only QUESTIONABLE | **0** |
| Rejected excluded | **5** (225 + 132 + 156 + 170 + 2309) |
| Auto-publish | **false** |

Sidecars: `artifacts/ingestion/d1b4-*.json`, `artifacts/ingestion/d1b4-resolve-questionable.mjs`

---

## 8. Importer regression

| Check | Result |
|---|---|
| Careful apply | inserted **0**, updated **0**, unchanged **20**, duplicates **0**, dbWrites **0** |
| Published stay published | **15** |
| Rejected stay rejected | **5** |
| Editorial summaries preserved | **YES** |
| Forced published→review-only | **NO** |

---

## 9. Tests

Editorial/data-only Production changes; **no app source changes**. Full suite skipped (not required). Runtime/data checks: anon visibility **15**; rejected not public; importer regression PASS.

---

## 10. Final totals (20 Incentivi.gov pilot)

| State | Count |
|---|---|
| Published (READY) | **15** |
| Review-only QUESTIONABLE | **0** |
| Rejected | **5** |
| Hard-deleted | **0** |

---

## 11. Git

| Item | Result |
|---|---|
| Selective stage | YES (docs only; no `git add .`) |
| Content commit | `ff097e3` |
| Hash-note commit | `d77313d` |
| Push | YES → `origin/main` |
| Dirt preserved | `.gitignore`, legal drafts, `artifacts/`, unrelated reports |

Production editorial state is data-only on linked Supabase (not in git).
