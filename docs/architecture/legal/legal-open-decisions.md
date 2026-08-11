# Legal Open Decisions — L1.1 → L1.2

**These are NOT decided by the repository.**
Required human/legal inputs before or during L1.2 drafting.

---

## A. Controller identity (Titolare)

| Item | Status |
|---|---|
| Legal denomination | **MISSING — TO BE PROVIDED BY USER** |
| Legal form (associazione/ente/srl/…) | **MISSING** |
| Registered seat / address | **MISSING** |
| Codice fiscale | **MISSING** |
| Partita IVA | **MISSING** |
| PEC | **MISSING** |
| Legal representative | **MISSING** |
| Privacy contact email | **MISSING** (only `info@immigratiimprenditori.it` found as contact) |
| DPO (if any) | **MISSING / UNKNOWN** |

**KNOWN from product:** brand «Immigrati Imprenditori»; domain `immigratiimprenditori.it`; contact `info@immigratiimprenditori.it`.

---

## B. Retention & deletion

1. Retention period for Auth accounts after close
2. Whether closed accounts are anonymised / hard-deleted
3. Persona soft-delete policy and self-service
4. Retention of withdrawn editorial/UGC
5. Log retention (align with Vercel/Supabase contracts)
6. Backup retention

---

## C. Account rights UX

1. Self-service account closure?
2. Self-service data export?
3. Self-service erasure vs admin process + email request?
4. Effect of closure on public Persona / Impresa / memberships

---

## D. Minors

1. Minimum age
2. Whether under-age registration is prohibited

---

## E. UGC / IP

1. User retains ownership of UGC?
2. Licence granted to platform (display, store, moderate)?
3. Takedown / notice procedure
4. Third-party data in free-text — user warranty

---

## F. Moderation & community

1. Community/Content rules: **separate doc vs inside Terms** (recommendation topic)
2. Report abuse channel (currently **NOT FOUND** in app)
3. Suspension / ban policy
4. Editorial vs user content standards

---

## G. Communications

1. Marketing emails — allowed? opt-in? (currently **no marketing system FOUND**)
2. Transactional Auth email disclosure

---

## H. Cookies / future analytics

1. Confirm Case A stance for current launch
2. Whether functional cookie `ii_selected_business_id` needs mention-only vs consent
3. Future analytics vendor (would force Case B + CMP)
4. Google Fonts runtime verification if counsel requires

---

## I. External data & opportunities

1. External Data & Sources Disclaimer text ownership
2. Opportunity “fa fede il bando ufficiale” disclaimer
3. Observatory methodology disclaimer

---

## J. Contracts / transfers

1. Supabase DPA + region
2. Vercel DPA + region
3. Auth email SMTP provider (if not Supabase default)
4. Governing law / jurisdiction

---

## K. Signup UX legal

1. Link to Privacy / Terms on `/registrati`
2. Whether acceptance checkbox is required (legal call)
3. Separate marketing opt-in (if ever)

---

## L. Phone / contact hardening (product + privacy)

1. Column-level restriction for `profiles.phone` on public RLS (tech gap noted)
2. Whether phone should ever be public with explicit consent

---

*End open decisions*
