# Legal Drafting Factual Brief — L1.1 / L1.1b / L1.2 decisions

**Purpose:** Fatti tecnici + decisioni del Gestore già chiuse, per mantenere allineati i testi di policy.
**Non contiene:** parere di conformità assoluta.

**Baseline tecnica:** L1.1 audit + L1.1b contact model.
**Decisioni Gestore:** 11 agosto 2026 (recepite in Privacy / Cookie / Termini / Disclaimer / Legal Review Report).

Site https://www.immigratiimprenditori.it · Stack Next.js + Vercel + Supabase Auth + PostgreSQL.

---

## 1. Controller / Gestore — CHIUSO

- **Denominazione:** Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia
- **Sigla:** AIPEL
- **Forma:** Associazione
- **Sede:** Viale Molise n. 54, Milano
- **C.F.:** 97342380157
- **P.IVA:** 04222160964
- **Contatto privacy / diritti:** info@immigratiimprenditori.it (nessuna privacy@ separata)
- **Contatto generale:** info@immigratiimprenditori.it

---

## 2. What the site does today

- Public directory/network: Persone, Imprese, Professionisti, Opportunità, Collaborazioni, Servizi, Eventi, Organizzazioni, Contenuti (Notizie e guide), Mercati, Osservatorio, Cultura (hub/filter), Chi siamo, Contatti.
- Authenticated workspace: profile, onboarding, imprese create/edit, redazione (contenuti/org/osservatorio), amministrazione account.
- **No** payment, **no** newsletter product, **no** in-app chat, **no** file upload UI, **no** analytics SDK, **no** cookie banner.
- Routes `/privacy` `/cookie` `/termini`: **not yet in app** (testi in `docs/architecture/legal/`).

---

## 3. Registration & auth

- Email + password only (no OAuth in app).
- Signup fields: optional display name metadata (`full_name`), email, password (≥8).
- **No** Privacy/Terms checkbox or links on signup form today.
- Session via Supabase Auth + `@supabase/ssr` cookies.
- **Minimum age (policy decision):** 18 — CHIUSO.
- Self-service account deletion UI: **NOT IMPLEMENTED** (policy model adopted; technical task open).

---

## 4. Persona / public profile & contacts (L1.1b)

- Public discovery fields when `is_public`.
- Professional contacts in `person_contact_channels` with share flags default false; network-only via RPC.
- Auth email never auto-used as contact email.
- No internal messaging.

---

## 5. Legal bases — CHIUSO

Vedi tabella in Privacy Policy §5 (contratto / LI / obbligo legale; cookie tecnici; no consenso universale).

---

## 6. Retention & deletion — CHIUSO (principio)

- Retention per finalità; no durata universale arbitraria.
- Account deletion model A/B/C + minimizzazione + backup tecnico; distinto da art. 17 GDPR.
- Self-service: da implementare; richieste via info@ nel frattempo.

---

## 7. Cookies — CHIUSO (Case A)

- Auth session + `ii_selected_business_id` (90 giorni).
- No analytics/advertising/CMP.
- No formal consent banner for current technical state.

---

## 8. Processors — VERIFICA NECESSARIA

- Vercel, Supabase — DPA/region/transfers **EXTERNAL CONTRACT REVIEW**.

---

## 9. External data (D1)

- Contracts documented; **no import executed** yet.
- Disclaimer document: `informativa-disclaimer-dati-fonti-esterne.md`.

---

## 10. Explicit non-facts

- Do **not** claim Google Analytics, Meta Pixel, or cookie “accept all” banner.
- Do **not** invent retention periods (10y etc.).
- Do **not** claim self-delete button exists today.
- Do **not** claim file uploads exist.
- Do **not** claim external datasets are already in the DB.
- Do **not** claim absolute legal compliance.

---

## 11. Policy document set

| Doc | Path |
|---|---|
| Legal Review Report | `l1.2-legal-review-report.md` |
| Privacy Policy | `privacy-policy.md` |
| Cookie Policy | `cookie-policy.md` |
| Termini d’uso | `termini-duso.md` |
| Disclaimer fonti | `informativa-disclaimer-dati-fonti-esterne.md` |

---

*End factual brief*
