/**
 * D1-B.3 — live source verification for the 20 pilot natural keys.
 * Fetches Incentivi.gov Solr + HEAD/GET official URLs. No DB writes.
 *
 *   node artifacts/ingestion/d1b3-verify-sources.mjs
 */
import { writeFileSync, readFileSync } from "node:fs";

const KEYS = [
  "1007", "118", "132", "1426", "143", "1468", "148", "1523", "156", "170",
  "181", "1843", "1856", "1857", "187", "2195", "225", "2309", "2350", "2512",
];

const inventory = JSON.parse(
  readFileSync("artifacts/ingestion/d1b3-inventory-out.json", "utf8"),
);
const byExt = new Map(inventory.rows.map((r) => [r.externalId, r]));

async function fetchSolr() {
  const fq = `zs_nid:(${KEYS.join(" OR ")})`;
  const url =
    "https://www.incentivi.gov.it/solr/coredrupal/select?" +
    new URLSearchParams({
      q: "*:*",
      wt: "json",
      rows: "50",
      fq,
      fl: "zs_nid,zs_title,zs_url,zs_field_link,zs_field_open_date,zs_field_close_date,zs_field_subject_grant,zm_field_regions_value,zm_field_scopes_value,ds_last_update,zs_body",
    }).toString();
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "immigrati-imprenditori-d1b3/1.0" },
  });
  if (!res.ok) throw new Error(`solr ${res.status}`);
  return res.json();
}

async function probeUrl(url) {
  if (!url) return { ok: false, status: null, finalUrl: null, error: "missing" };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "immigrati-imprenditori-d1b3/1.0" },
    });
    if (res.status === 405 || res.status === 403 || res.status === 404) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent": "immigrati-imprenditori-d1b3/1.0",
          Accept: "text/html,application/pdf,*/*",
        },
      });
      // drain a bit then abort body
      await res.arrayBuffer().catch(() => {});
    }
    clearTimeout(t);
    return {
      ok: res.status >= 200 && res.status < 400,
      status: res.status,
      finalUrl: res.url,
      error: null,
    };
  } catch (e) {
    return { ok: false, status: null, finalUrl: null, error: String(e?.message || e) };
  }
}

const solr = await fetchSolr();
const docs = solr?.response?.docs ?? [];
const byNid = new Map(docs.map((d) => [String(d.zs_nid), d]));

const results = [];
for (const nid of KEYS) {
  const ext = `incentivi-gov:${nid}`;
  const inv = byExt.get(ext);
  const doc = byNid.get(nid);
  const officialUrl = inv?.officialUrl || null;
  const portalUrl = doc?.zs_url
    ? doc.zs_url.startsWith("http")
      ? doc.zs_url
      : `https://www.incentivi.gov.it${doc.zs_url}`
    : null;
  const probe = await probeUrl(officialUrl);
  const portalProbe = portalUrl ? await probeUrl(portalUrl) : null;
  results.push({
    externalId: ext,
    id: inv?.id,
    dbTitle: inv?.title,
    sourceTitle: doc?.zs_title ?? null,
    inSolr: Boolean(doc),
    issuer: inv?.issuer,
    subjectGrant: doc?.zs_field_subject_grant ?? null,
    openDate: doc?.zs_field_open_date ?? inv?.opensAt ?? null,
    closeDate: doc?.zs_field_close_date ?? inv?.closesAt ?? null,
    lastUpdate: doc?.ds_last_update ?? null,
    regions: doc?.zm_field_regions_value ?? null,
    scopes: doc?.zm_field_scopes_value ?? null,
    officialUrl,
    officialProbe: probe,
    portalUrl,
    portalProbe,
    temporalDb: inv?.temporal,
    openEndedDb: inv?.openEnded,
    bodySnippet: String(doc?.zs_body || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 280),
  });
}

writeFileSync(
  "artifacts/ingestion/d1b3-source-verify-out.json",
  JSON.stringify({ fetchedSolr: docs.length, results }, null, 2),
  "utf8",
);

console.log(
  JSON.stringify(
    {
      fetchedSolr: docs.length,
      missingFromSolr: results.filter((r) => !r.inSolr).map((r) => r.externalId),
      urlFailures: results
        .filter((r) => !r.officialProbe.ok)
        .map((r) => ({
          id: r.externalId,
          status: r.officialProbe.status,
          error: r.officialProbe.error,
          url: r.officialUrl,
        })),
      summary: results.map((r) => ({
        id: r.externalId,
        inSolr: r.inSolr,
        urlOk: r.officialProbe.ok,
        urlStatus: r.officialProbe.status,
        close: r.closeDate,
        title: (r.sourceTitle || r.dbTitle || "").slice(0, 80),
        subject: r.subjectGrant,
      })),
    },
    null,
    2,
  ),
);
