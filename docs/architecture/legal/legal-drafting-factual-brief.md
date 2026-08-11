# Legal Drafting Factual Brief — L1.1 (+ L1.1b)

**Purpose:** Allow L1.2 drafters to write Privacy / Cookie / Terms / External Data disclaimer **without reading the full repository**.
**Contains:** technical facts + open decisions.
**Does not contain:** legal bases, final policy text, invented controllers.

**Baseline:** L1.1 audit + **L1.1b Contact & Visibility Model** (see `l1.1b-contact-visibility-model.md`).
Site https://www.immigratiimprenditori.it · Stack Next.js + Vercel + Supabase Auth + PostgreSQL.

---

## 1. Controller

- **Known:** product name Immigrati Imprenditori; domain immigratiimprenditori.it; contact email info@immigratiimprenditori.it (mailto).
- **Missing:** legal entity, address, CF/PIVA, PEC, representative, privacy@, DPO.
→ Must be supplied by client before publishing Privacy Policy.

---

## 2. What the site does today

- Public directory/network: Persone, Imprese, Professionisti, Opportunità, Collaborazioni, Servizi, Eventi, Organizzazioni, Contenuti (Notizie e guide), Mercati, Osservatorio, Cultura (hub/filter), Chi siamo, Contatti.
- Authenticated workspace: profile, onboarding, imprese create/edit, redazione (contenuti/org/osservatorio), amministrazione account.
- **No** payment, **no** newsletter product, **no** in-app chat, **no** file upload UI, **no** analytics SDK, **no** cookie banner, **no** `/privacy` `/cookie` `/termini` routes.

---

## 3. Registration & auth

- Email + password only (no OAuth in app).
- Signup fields: optional display name metadata (`full_name`), email, password (≥8).
- **No** Privacy/Terms checkbox or links on signup form.
- Session via Supabase Auth + `@supabase/ssr` cookies; middleware/proxy refreshes session.
- Local config: email confirmations disabled — **production hosted setting must be verified**.
- Password reset UI in app: **not found**.
- Auth emails sent by Supabase (SMTP provider in production: verify outside repo).

---

## 4. Persona / public profile & contacts (L1.1b)

- Table `profiles`; default `is_public=false`.
- User can toggle public and edit presentation: name, slug, bio, territory, website, is_public.
- **Professional contacts** live in `person_contact_channels` (phone, `contact_email`) with explicit share-to-network checkboxes (**default off**).
- **Auth / login email** stays on `auth.users` and is **never** used as the professional contact email.
- Public page `/persone/[slug]`:
  - anonymous: discovery fields + website; if contacts are shared, CTA “Accedi per vedere i contatti” (**no values** in HTML);
  - registered active: tel/mailto for contacts the owner chose to share (RPC-masked).
- Legacy `profiles.phone` retired (forced NULL). Anon cannot SELECT `person_contact_channels`.
- **No in-app messaging / chat.**
- Sitemap lists `/persone` hub; individual slugs not listed but robots do not disallow them; metadata from public presentation fields only.
- Account close: **admin-only**; does not delete Auth/profile. No self-service erasure UI.

**L1.2 may declare:** network publicly explorable for discovery; some profile fields intended for publication; optional professional contacts shared only with registered users under user control; Auth data private; purpose = professional/entrepreneurial visibility and contact.

---

## 5. Businesses

- Authenticated users with Persona can create Impresa (unpublished by default) and managers can publish.
- Public fields: names, summary, description, founding year, statuses per public queries.
- No CF/P.IVA fields in forms.

---

## 6. Other domains

- Professionals, Opportunities, Collaborations, Services, Events, Markets: **public read** if published; **no create UI** in app today.
- Organizations & Contents & Observatory: created/published by **redattore**.
- Org public pages do not show org email/phone or official emails (UI select).
- Cultura: aggregation hub, not a separate content store.
- Report abuse: **not implemented**.

---

## 7. Cookies / trackers

- App cookie `ii_selected_business_id` (HttpOnly, Lax, Secure in prod, 90 days) — UI business switcher only.
- Auth session cookies via Supabase SSR.
- No GA/GTM/Meta/Vercel Analytics/Hotjar/etc. in codebase.
- No localStorage/sessionStorage usage in app.
- Technical cookie case: **A** (no non-necessary analytics found).
- CMP: not implemented.

---

## 8. Contact

- Contatti page and footer: `mailto:info@immigratiimprenditori.it` only — no server-side contact form.

---

## 9. Fonts

- Geist / Geist Mono via `next/font/google` in root layout (Next typically self-hosts at build).

---

## 10. Processors (runtime)

- **Vercel** — hosting Next.js.
- **Supabase** — Auth + PostgreSQL (+ Storage enabled in config but unused by app uploads).
- DPA/region/transfers: **not in repo** — contractual review required.

---

## 11. External data (D1)

- Discovery + ingestion contracts documented (D1.1/D1.2).
- **No import executed.** Future: aggregate open data, reviewed opportunities; **no** scraping of personal/business profiles into community identities.
- Needs: External Data & Sources disclaimer; Opportunity “official source prevails” disclaimer; Observatory stats ≠ personal data.

---

## 12. Documents recommended for L1.2

1. Privacy Policy
2. Cookie Policy (even if Case A)
3. Terms of Use
4. External Data & Sources Disclaimer (can be section of Terms or Privacy annex)
5. Community/Content Rules — **recommend integrated section in Terms** unless counsel prefers separate short page

---

## 13. Open decisions checklist (must fill)

See `legal-open-decisions.md` — especially titolare, retention, deletion, minors, UGC licence, governing law, signup acceptance UX.
Persona phone/contact hardening for L1.1 gap: **resolved in L1.1b** (network opt-in; not internet-public).

---

## 14. Explicit non-facts

- Do **not** claim Google Analytics, Meta Pixel, or cookie “accept all” banner.
- Do **not** invent CF/PIVA or association name.
- Do **not** invent retention periods.
- Do **not** claim users can self-delete accounts today.
- Do **not** claim file uploads exist.
- Do **not** claim external datasets are already in the DB.

---

*End factual brief*
