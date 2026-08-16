import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTENUTI_ACQUISITION,
  CONTENUTI_SOURCE_ALLOWLIST,
  assertKnownContentsSource,
  listActiveContentsSourceCodes,
} from "@/lib/external-data/contents/allowlist";
import {
  assertContentsRedirectAllowed,
  assertContentsUrlAllowed,
  assertMetadataOnlyPayload,
  contentsFingerprint,
  contentsNaturalKey,
  contentsPublishAuthorization,
  dedupeContentsCandidates,
  normalizeContentsAcquisition,
  normalizeContentsUrl,
  planContentsRefresh,
  type ContentsAcquisitionCandidate,
  type NormalizedExternalContent,
} from "@/lib/external-data/contents/acquisition";

function baseCandidate(
  overrides: Partial<ContentsAcquisitionCandidate> &
    Pick<ContentsAcquisitionCandidate, "sourceCode" | "contentUrl">,
): ContentsAcquisitionCandidate {
  return {
    originalTitle: "Rapporto sulle migrazioni",
    documentType: "report",
    titleIt: "Rapporto sulle migrazioni",
    platformSummaryIt:
      "Sintesi originale della redazione per la piattaforma, non copia della fonte.",
    typeCode: "insight",
    primaryCategoryCode: "entrepreneurship",
    retrievedAt: "2026-08-13T12:00:00.000Z",
    ...overrides,
  };
}

describe("D1-D.2 Contenuti allowlist", () => {
  it("accepts exactly four active source codes", () => {
    const codes = listActiveContentsSourceCodes();
    assert.deepEqual(codes.sort(), [
      "emn-european-migration-network",
      "futurae-mlps-unioncamere",
      "ismu-rapporti",
      "minlavoro-stranieri-lavoro",
    ]);
    assert.equal(CONTENUTI_SOURCE_ALLOWLIST.length, 4);
    for (const code of codes) {
      assert.equal(assertKnownContentsSource(code).isActive, true);
    }
  });

  it("rejects unknown source codes", () => {
    assert.throws(() => assertKnownContentsSource("random-blog"), /unknown/);
    assert.throws(
      () => assertKnownContentsSource("unioncamere-opengov"),
      /unknown/,
    );
  });

  it("records pilot caps for later D1-D.3 without importing", () => {
    assert.equal(CONTENUTI_ACQUISITION.pilotCaps.total, 20);
    assert.equal(CONTENUTI_ACQUISITION.pilotCaps["ismu-rapporti"], 8);
    assert.equal(CONTENUTI_ACQUISITION.autoPublish, false);
  });
});

describe("D1-D.2 URL security + host allowlist", () => {
  it("accepts authorized hosts for each source", () => {
    assert.equal(
      assertContentsUrlAllowed(
        "ismu-rapporti",
        "https://www.ismu.org/rapporto-migrazioni-2024/",
      ).hostname,
      "ismu.org",
    );
    assert.equal(
      assertContentsUrlAllowed(
        "minlavoro-stranieri-lavoro",
        "https://www.lavoro.gov.it/temi-e-priorita/immigrazione/rapporto",
      ).hostname,
      "lavoro.gov.it",
    );
    assert.equal(
      assertContentsUrlAllowed(
        "emn-european-migration-network",
        "https://www.emnitalyncp.it/pubblicazioni/studio",
      ).hostname,
      "emnitalyncp.it",
    );
    assert.equal(
      assertContentsUrlAllowed(
        "emn-european-migration-network",
        "https://home-affairs.ec.europa.eu/networks/european-migration-network-emn_en",
      ).ok,
      true,
    );
    assert.equal(
      assertContentsUrlAllowed(
        "futurae-mlps-unioncamere",
        "https://www.unioncamere.gov.it/sistema-camerale/attivita/osservatorio-imprese-straniere",
      ).ok,
      true,
    );
  });

  it("rejects similar/malicious hosts and non-explicit subdomains", () => {
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "ismu-rapporti",
          "https://ismu.org.evil.com/rapporto",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "ismu-rapporti",
          "https://evil-ismu.org/rapporto",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "ismu-rapporti",
          "https://cdn.ismu.org/rapporto",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "minlavoro-stranieri-lavoro",
          "https://lavoro.gov.it.attacker.example/x",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "emn-european-migration-network",
          "https://emnitaly.example/report",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "emn-european-migration-network",
          "https://www.bamf.de/emn-report",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "futurae-mlps-unioncamere",
          "https://www.milomb.camcom.it/futurae",
        ),
      /host not in allowlist/,
    );
  });

  it("rejects non-EMN paths on home-affairs.ec.europa.eu", () => {
    assert.throws(
      () =>
        assertContentsUrlAllowed(
          "emn-european-migration-network",
          "https://home-affairs.ec.europa.eu/policies/migration_en",
        ),
      /path not allowed/,
    );
  });

  it("rejects redirects off allowlist", () => {
    assert.throws(
      () =>
        assertContentsRedirectAllowed(
          "ismu-rapporti",
          "https://news.example.com/mirror",
        ),
      /host not in allowlist/,
    );
    assert.equal(
      assertContentsRedirectAllowed(
        "ismu-rapporti",
        "https://ismu.org/final-report",
      ).ok,
      true,
    );
  });

  it("requires https, rejects credentials and literal IPs", () => {
    assert.equal(
      normalizeContentsUrl("http://www.ismu.org/x").ok,
      false,
    );
    assert.equal(
      normalizeContentsUrl("https://user:pass@www.ismu.org/x").ok,
      false,
    );
    assert.equal(normalizeContentsUrl("https://192.168.1.10/x").ok, false);
    assert.equal(normalizeContentsUrl("https://[::1]/x").ok, false);
  });

  it("normalizes scheme/host/slash/fragment and strips tracking params", () => {
    const out = normalizeContentsUrl(
      "https://WWW.Ismu.Org/rapporto/2024/?utm_source=tw&utm_campaign=x&id=9#section",
    );
    assert.equal(out.ok, true);
    if (!out.ok) return;
    assert.equal(
      out.canonicalUrl,
      "https://www.ismu.org/rapporto/2024?id=9",
    );
    assert.equal(out.hostname, "www.ismu.org");
  });
});

describe("D1-D.2 identity / dedupe / idempotency", () => {
  it("dedupes by external id with precedence over URL", () => {
    const a = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "ismu-rapporti",
        contentUrl: "https://www.ismu.org/a",
        externalId: "ISMU-2024-1",
      }),
    );
    const b = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "ismu-rapporti",
        contentUrl: "https://www.ismu.org/b-different",
        externalId: "ISMU-2024-1",
        titleIt: "Altro titolo piattaforma",
      }),
    );
    assert.equal(a.identityMethod, "external_id");
    assert.equal(a.naturalKey, b.naturalKey);
    assert.equal(a.naturalKey, "ismu-rapporti:id:ISMU-2024-1");
  });

  it("dedupes by canonical URL when external id absent", () => {
    const a = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "minlavoro-stranieri-lavoro",
        contentUrl:
          "https://www.lavoro.gov.it/report/?utm_source=newsletter#top",
      }),
    );
    const b = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "minlavoro-stranieri-lavoro",
        contentUrl: "https://www.lavoro.gov.it/report",
        titleIt: "Titolo diverso",
        platformSummaryIt: "Altra sintesi originale redazione.",
      }),
    );
    assert.equal(a.identityMethod, "canonical_url");
    assert.equal(a.naturalKey, b.naturalKey);
    assert.equal(a.sourceUrl, b.sourceUrl);
  });

  it("falls back to deterministic fingerprint", () => {
    const fp = contentsFingerprint({
      sourceCode: "emn-european-migration-network",
      originalTitle: "EMN Study",
      publishedOn: "2024-01-01",
      publisherOrAuthor: "EMN",
      documentType: "study",
    });
    const id = contentsNaturalKey({
      sourceCode: "emn-european-migration-network",
      fingerprint: fp,
    });
    assert.equal(id.identityMethod, "fingerprint");
    assert.equal(id.naturalKey, `emn-european-migration-network:fp:${fp}`);
    assert.equal(
      contentsFingerprint({
        sourceCode: "emn-european-migration-network",
        originalTitle: "EMN Study",
        publishedOn: "2024-01-01",
        publisherOrAuthor: "EMN",
        documentType: "study",
      }),
      fp,
    );
  });

  it("rejects duplicate equivalent URLs in a batch", () => {
    const a = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "ismu-rapporti",
        contentUrl: "https://ismu.org/same",
        externalId: "A1",
      }),
    );
    const b = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "ismu-rapporti",
        contentUrl: "https://www.ismu.org/same/",
        externalId: "B2",
      }),
    );
    // Different external ids but equivalent canonical URL → second rejected.
    assert.notEqual(a.naturalKey, b.naturalKey);
    assert.equal(a.sourceUrl, b.sourceUrl);
    const { unique, rejectedDuplicates } = dedupeContentsCandidates([a, b]);
    assert.equal(unique.length, 1);
    assert.equal(rejectedDuplicates.length, 1);
  });

  it("refresh is idempotent when checksum unchanged", () => {
    const incoming = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "ismu-rapporti",
        contentUrl: "https://www.ismu.org/r1",
        externalId: "R1",
      }),
    );
    const plan = planContentsRefresh({
      incoming,
      existing: {
        naturalKey: incoming.naturalKey,
        checksumSha256: incoming.checksumSha256,
        editorialStatus: "ready",
        publicationStatus: "published",
        visibilityStatus: "public",
        title: incoming.editorial.titleIt,
        abstract: incoming.editorial.platformSummaryIt,
        primaryCategoryCode: "entrepreneurship",
        sourceTitleSha256: "",
        sourceSummarySha256: "",
      },
    });
    assert.equal(plan.action, "UNCHANGED");
    assert.equal(plan.preserved.publicationStatus, "published");
    assert.equal(plan.autoPublish, false);
  });
});

describe("D1-D.2 editorial + copyright + auto-publish", () => {
  it("preserves editorial edits on refresh", () => {
    const incoming = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "futurae-mlps-unioncamere",
        contentUrl:
          "https://www.integrazionemigranti.gov.it/futurae/rapporto-2024",
        documentType: "project_page",
        typeCode: "institutional_page",
        titleIt: "Titolo fonte aggiornato",
        platformSummaryIt: "Sintesi fonte aggiornata.",
      }),
    );
    const editedTitle = "Titolo riscritto dalla redazione";
    const editedSummary = "Sintesi riscritta dalla redazione.";
    const plan = planContentsRefresh({
      incoming,
      existing: {
        naturalKey: incoming.naturalKey,
        checksumSha256: "old-checksum",
        editorialStatus: "ready",
        publicationStatus: "published",
        visibilityStatus: "public",
        title: editedTitle,
        abstract: editedSummary,
        primaryCategoryCode: "culture",
        sourceTitleSha256: "not-matching-source-sha",
        sourceSummarySha256: "not-matching-summary-sha",
      },
    });
    assert.equal(plan.action, "UPDATE");
    assert.equal(plan.preserved.title, editedTitle);
    assert.equal(plan.preserved.abstract, editedSummary);
    assert.equal(plan.preserved.primaryCategoryCode, "culture");
    assert.equal(plan.preserved.publicationStatus, "published");
    assert.equal(plan.preserved.editorialStatus, "ready");
    assert.equal(plan.titleFromSource, false);
    assert.equal(plan.summaryFromSource, false);
    assert.equal(plan.autoPublish, false);
  });

  it("makes auto-publish impossible at contract level", () => {
    const row = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "ismu-rapporti",
        contentUrl: "https://www.ismu.org/x",
      }),
    );
    assert.equal(row.autoPublish, false);
    assert.equal(row.editorialStatus, "draft");
    assert.equal(row.publicationStatus, "unpublished");
    assert.equal(row.visibilityStatus, "private");
    assert.equal(row.ownedByEditorial, true);
    assert.equal(CONTENUTI_ACQUISITION.autoPublish, false);
    assert.equal(
      contentsPublishAuthorization({
        isEditor: false,
        isApplicationAdmin: true,
        viaImporterAutoPublish: false,
      }).allowed,
      false,
    );
    assert.equal(
      contentsPublishAuthorization({
        isEditor: true,
        isApplicationAdmin: false,
        viaImporterAutoPublish: true,
      }).allowed,
      false,
    );
    assert.equal(
      contentsPublishAuthorization({
        isEditor: true,
        isApplicationAdmin: false,
        viaImporterAutoPublish: false,
      }).allowed,
      true,
    );
  });

  it("forbids storing full source body / PDF / protected abstract", () => {
    assert.throws(
      () => assertMetadataOnlyPayload({ sourceFullText: "articolo intero" }),
      /full source body/,
    );
    assert.throws(
      () => assertMetadataOnlyPayload({ sourcePdfBase64: "JVBERi0x" }),
      /PDF/,
    );
    assert.throws(
      () =>
        assertMetadataOnlyPayload({
          sourceProtectedAbstract: "abstract protetto della fonte",
        }),
      /protected source abstract/,
    );
    assert.throws(
      () =>
        normalizeContentsAcquisition(
          baseCandidate({
            sourceCode: "ismu-rapporti",
            contentUrl: "https://www.ismu.org/y",
            sourceFullText: "corpo intero",
          }),
        ),
      /full source body/,
    );
  });

  it("maps to existing catalogs and never invents publish states", () => {
    const row: NormalizedExternalContent = normalizeContentsAcquisition(
      baseCandidate({
        sourceCode: "emn-european-migration-network",
        contentUrl: "https://emnitalyncp.it/reports/emn-2024",
        documentType: "study",
        typeCode: "guide",
        primaryCategoryCode: "regulation_compliance",
      }),
    );
    assert.ok(
      (CONTENUTI_ACQUISITION.allowedTypeCodes as readonly string[]).includes(
        row.editorial.typeCode,
      ),
    );
    assert.ok(row.bodyStub.includes("non conserva il corpo originale"));
    assert.equal(row.storagePolicy.storeSourceBody, false);
    assert.equal(row.acquisitionMode, "METADATA_LINK_ONLY");
  });
});
