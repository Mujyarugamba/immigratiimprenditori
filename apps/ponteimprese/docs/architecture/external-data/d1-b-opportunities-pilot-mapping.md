# D1-B — Opportunities pilot mapping (Incentivi.gov)

**Date:** 2026-08-13
**Source:** `incentivi-gov-opendata`
**Pilot max:** 20
**AUTO-PUBLISH:** NO

---

## 1. Source fields → internal

| Solr / open-data field | Internal target | Required |
|---|---|---|
| `zs_nid` | natural key `incentivi-gov:{nid}` → `opportunity_sources.external_identifier` | YES |
| `zs_title` | `opportunities.title` | YES |
| `zs_body` (stripped, ≤400) | `opportunities.summary` | preferred |
| `zs_field_subject_grant` | `opportunity_sources.authority` | preferred |
| `zs_field_link` else portal `zs_url` | `opportunity_sources.url` (official CTA) | YES |
| `zs_url` | provenance source page URL (absolute) | YES |
| `zs_field_open_date` | `opportunity_time_windows.opens_at` (`kind=access`) | optional |
| `zs_field_close_date` | `opportunity_time_windows.closes_at` | optional (else open_ended) |
| `zm_field_regions_value[]` | `opportunity_market_references.territory_label` | when present |
| `zm_field_scopes_value[]` | review hint only (catalog map if reliable) | optional |
| `ds_last_update` | sidecar / source `version` note | optional |

Not mapped in pilot (avoid invention): structured beneficiaries, funding amounts, full HTML body → `description`.

---

## 2. Lifecycle defaults (every pilot row)

| Axis | Value |
|---|---|
| `origin` | `external` |
| `editorial_status` | `in_review` |
| `publication_status` | `unpublished` |
| `visibility_level` | `private` |
| `substantial_status` | `announced` (or `closed` if deadline already past) |
| `representation_status` | `censused` |
| Fonte `status` | `active` |
| Fonte `is_primary` | `true` |
| Fonte `information_relation` | `primary` |
| Fonte `consulted_at` | ingest `retrieved_at` |

---

## 3. Pilot selection rules

Accept when **all** hold:

1. Valid nid + title + resolvable official URL
2. Theme match on scopes/title: imprenditoria, investimenti, digitalizzazione, internazionalizzazione, formazione/competenze, cultura/creative (regex in module)
3. Geography: empty regions **or** includes Lombardia / nazionale / Italia / tutte le regioni
4. Temporal: **active/recent only** for pilot v1 (`open_or_ongoing` or `scheduled`; exclude `expired`)
5. Count ≤ 20 after filters

Reject (not write): outside theme/geo, expired (pilot v1), duplicates in batch, pilot_max exceeded, malformed dates/ids.

Expired handling remains defined for later refresh/history waves; expired rows must never render as open in UI.

---

## 4. Category mapping policy

| Source scope (examples) | Action |
|---|---|
| Digitalizzazione, Innovazione e ricerca, Internazionalizzazione, Formazione | Keep as review labels; map to existing `opportunity_activity_scopes` **only** if code match is explicit in a later allowlist |
| Ambiguous / multi-scope | leave unclassified; `REVIEW_REQUIRED` |
| New improvised categories | **forbidden** |

---

## 5. Geography mapping

| Source region | Pilot handling |
|---|---|
| Lombardia | `territory_label = "Lombardia"` |
| Full regional list / nazionale | store distinct labels present; editorial may collapse to “Italia / nazionale” |
| Single other region only | reject unless theme strongly national |

---

## 6. Sample live rows (fetch 2026-08-13, illustrative)

From a 40-doc Solr sample, pilot filter yielded theme/geo matches including:

| nid | Title (truncated) | Scopes | Close | Temporal |
|---|---|---|---|---|
| 1426 | Promozione ecoefficienza sale teatrali/cinema… | Digitalizzazione | 2026-12-31 | open_or_ongoing |
| 143 | Credito d’imposta R&S, innovazione… | Innovazione / Digitalizzazione | (open-ended) | open_or_ongoing |

Full pilot set is produced by dry-run (`rows=200`, max 20) — see validation report / sidecar.

---

## 7. Distinguishing origin in review

| Kind | Signals |
|---|---|
| External ingested | `origin=external`, `editorial_status=in_review`, `publication_status=unpublished`, Fonte `incentivi-gov:*` |
| Manual user-created | party_references present; often `origin=internal` or manual external without ingest key |
| Already published | `publication_status=published` + `visibility_level=public` |

Public UI must not expose raw Solr field names or checksums.
