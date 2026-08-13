import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checksumSha256 } from "@/lib/external-data/checksum";
import {
  EVENTI_ACQUISITION,
  EVENTS_SOURCE_ALLOWLIST,
  assertKnownEventsSource,
  listActiveEventsSourceCodes,
} from "@/lib/external-data/events/allowlist";
import {
  assertEventsRedirectAllowed,
  assertEventsUrlAllowed,
  assertMetadataOnlyEventPayload,
  dedupeEventsCandidates,
  eventsCrossSourceFingerprint,
  eventsFingerprint,
  eventsNaturalKey,
  eventsPublishAuthorization,
  extractEventsExternalId,
  mergeCrossSourceEvents,
  normalizeEventsAcquisition,
  normalizeEventsUrl,
  planEventsRefresh,
  type EventsAcquisitionCandidate,
  type NormalizedExternalEvent,
} from "@/lib/external-data/events/acquisition";

function baseCandidate(
  overrides: Partial<EventsAcquisitionCandidate> = {},
): EventsAcquisitionCandidate {
  return {
    sourceCode: "pim-ricerca-eventi",
    eventUrl:
      "https://www.integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524?utm_source=x",
    originalTitle: "Workshop imprese migranti",
    organizerLabel: "Portale Integrazione Migranti",
    startsAt: "2026-09-01T09:00:00+02:00",
    endsAt: "2026-09-01T13:00:00+02:00",
    timezone: "Europe/Rome",
    deliveryMode: "in_presence",
    venueLabel: "Sala A",
    addressText: "Via Roma 1",
    cityText: "Milano",
    countryRef: "IT",
    titleIt: "Workshop per imprese migranti",
    platformSummaryIt: "Sintesi editoriale piattaforma originale.",
    descriptionStub: "Descrizione editoriale minima senza corpo fonte.",
    typeCode: "conference",
    categoryLabels: ["entrepreneurship", "training"],
    territoryLabel: "Lombardia",
    ...overrides,
  };
}

describe("D1-D.6 Eventi allowlist", () => {
  it("ships exactly four active official source codes", () => {
    const codes = listActiveEventsSourceCodes().sort();
    assert.deepEqual(codes, [
      "emn-home-affairs-events",
      "minlavoro-eventi",
      "pim-ricerca-eventi",
      "unioncamere-agenda",
    ]);
    assert.equal(EVENTS_SOURCE_ALLOWLIST.length, 4);
    for (const code of codes) {
      assert.equal(assertKnownEventsSource(code).isActive, true);
      assert.equal(
        assertKnownEventsSource(code).acquisitionMode,
        "METADATA_LINK_ONLY",
      );
    }
  });

  it("rejects unknown source codes", () => {
    assert.throws(() => assertKnownEventsSource("random-blog"), /unauthorized/);
    assert.throws(() => assertKnownEventsSource("ismu-eventi"), /unauthorized/);
    assert.throws(
      () => assertKnownEventsSource("eventbrite-com"),
      /unauthorized/,
    );
  });

  it("records pilot caps without importing", () => {
    assert.equal(EVENTI_ACQUISITION.pilotCaps.total, 16);
    assert.equal(EVENTI_ACQUISITION.pilotCaps["pim-ricerca-eventi"], 6);
    assert.equal(EVENTI_ACQUISITION.autoPublish, false);
  });
});

describe("D1-D.6 URL security + host/path allowlist", () => {
  it("accepts conforming hosts and paths for each source", () => {
    assert.equal(
      assertEventsUrlAllowed(
        "pim-ricerca-eventi",
        "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524",
      ).ok,
      true,
    );
    assert.equal(
      assertEventsUrlAllowed(
        "minlavoro-eventi",
        "https://www.lavoro.gov.it/eventi/pagine/stati-generali-dell-immigrazione-2025",
      ).hostname,
      "lavoro.gov.it",
    );
    assert.equal(
      assertEventsUrlAllowed(
        "unioncamere-agenda",
        "https://www.unioncamere.gov.it/agenda/inclusione-economico-finanziaria-dei-migranti-dati-sfide-e-prospettive",
      ).ok,
      true,
    );
    assert.equal(
      assertEventsUrlAllowed(
        "emn-home-affairs-events",
        "https://home-affairs.ec.europa.eu/whats-new/events/emn-italy-national-conference-civic-and-language-training-third-country-nationals-italy-2026-11-11_en",
      ).ok,
      true,
    );
  });

  it("rejects nonconforming paths and listing hubs", () => {
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "pim-ricerca-eventi",
          "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi",
        ),
      /path not allowed/,
    );
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "minlavoro-eventi",
          "https://www.lavoro.gov.it/eventi/pagine/notizie",
        ),
      /path not allowed/,
    );
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "minlavoro-eventi",
          "https://www.lavoro.gov.it/temi-e-priorita/immigrazione",
        ),
      /path not allowed/,
    );
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "unioncamere-agenda",
          "https://www.unioncamere.gov.it/comunicazione/comunicati-stampa/x",
        ),
      /path not allowed/,
    );
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "emn-home-affairs-events",
          "https://home-affairs.ec.europa.eu/policies/migration_en",
        ),
      /path not allowed/,
    );
  });

  it("rejects unauthorized subdomains and lookalike hosts", () => {
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "pim-ricerca-eventi",
          "https://cdn.integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/1",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "minlavoro-eventi",
          "https://lavoro.gov.it.evil.example/eventi/pagine/x",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "unioncamere-agenda",
          "https://www.milomb.camcom.it/agenda/x",
        ),
      /host not in allowlist/,
    );
    assert.throws(
      () =>
        assertEventsUrlAllowed(
          "emn-home-affairs-events",
          "https://emnitalyncp.it/whats-new/events/x",
        ),
      /host not in allowlist/,
    );
  });

  it("rejects redirects off allowlist", () => {
    assert.throws(
      () =>
        assertEventsRedirectAllowed(
          "pim-ricerca-eventi",
          "https://eventbrite.com/e/123",
        ),
      /host not in allowlist/,
    );
    assert.equal(
      assertEventsRedirectAllowed(
        "pim-ricerca-eventi",
        "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524",
      ).ok,
      true,
    );
  });

  it("requires https, rejects credentials and literal IPs", () => {
    assert.equal(
      normalizeEventsUrl("http://integrazionemigranti.gov.it/x").ok,
      false,
    );
    assert.equal(
      normalizeEventsUrl(
        "https://user:pass@integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/1",
      ).ok,
      false,
    );
    assert.equal(normalizeEventsUrl("https://192.168.1.10/x").ok, false);
    assert.equal(normalizeEventsUrl("https://[::1]/x").ok, false);
  });

  it("canonicalizes URL and strips tracking + fragment", () => {
    const r = normalizeEventsUrl(
      "https://WWW.Integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524/?utm_source=x&utm_campaign=y#frag",
    );
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(
      r.canonicalUrl,
      "https://www.integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524",
    );
  });
});

describe("D1-D.6 identity / external id / fingerprint", () => {
  it("extracts stable external ids from conforming paths", () => {
    assert.equal(
      extractEventsExternalId(
        "pim-ricerca-eventi",
        "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524",
      ),
      "524",
    );
    assert.equal(
      extractEventsExternalId(
        "minlavoro-eventi",
        "https://lavoro.gov.it/eventi/pagine/stati-generali-dell-immigrazione-2025",
      ),
      "stati-generali-dell-immigrazione-2025",
    );
    assert.equal(
      extractEventsExternalId(
        "unioncamere-agenda",
        "https://unioncamere.gov.it/agenda/inclusione-economico-finanziaria-dei-migranti-dati-sfide-e-prospettive",
      ),
      "inclusione-economico-finanziaria-dei-migranti-dati-sfide-e-prospettive",
    );
  });

  it("applies identity precedence external_id > url > fingerprint", () => {
    const fp = eventsFingerprint({
      sourceCode: "pim-ricerca-eventi",
      originalTitle: "T",
      startsAt: "2026-01-01T10:00:00Z",
      deliveryMode: "online",
      venueOrOnline: "online",
    });
    assert.equal(
      eventsNaturalKey({
        sourceCode: "pim-ricerca-eventi",
        externalId: "42",
        canonicalUrl:
          "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/42",
        fingerprint: fp,
      }).identityMethod,
      "external_id",
    );
    assert.equal(
      eventsNaturalKey({
        sourceCode: "pim-ricerca-eventi",
        canonicalUrl:
          "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/42",
        fingerprint: fp,
      }).identityMethod,
      "canonical_url",
    );
    assert.equal(
      eventsNaturalKey({
        sourceCode: "pim-ricerca-eventi",
        fingerprint: fp,
      }).identityMethod,
      "fingerprint",
    );
  });
});

describe("D1-D.6 temporal / delivery / normalize", () => {
  it("normalizes allowlisted candidate and forbids auto-publish", () => {
    const n = normalizeEventsAcquisition(baseCandidate());
    assert.equal(n.ownedByEditorial, true);
    assert.equal(n.editorialStatus, "draft");
    assert.equal(n.publicationStatus, "unpublished");
    assert.equal(n.visibilityStatus, "private");
    assert.equal(n.autoPublish, false);
    assert.equal(n.identityMethod, "external_id");
    assert.equal(n.provenance.externalId, "524");
    assert.equal(n.provenance.allDay, false);
    assert.equal(n.provenance.timezone, "Europe/Rome");
    assert.equal(eventsPublishAuthorization().importerMayPublish, false);
  });

  it("allows date-only starts as all-day without inventing clock time", () => {
    const n = normalizeEventsAcquisition(
      baseCandidate({
        startsAt: "2026-09-01",
        endsAt: "2026-09-01",
        allDay: true,
      }),
    );
    assert.equal(n.provenance.allDay, true);
    assert.equal(n.provenance.startsAt, "2026-09-01");
  });

  it("rejects end before start and missing timezone", () => {
    assert.throws(
      () =>
        normalizeEventsAcquisition(
          baseCandidate({
            startsAt: "2026-09-02T10:00:00+02:00",
            endsAt: "2026-09-01T10:00:00+02:00",
          }),
        ),
      /endsAt must not be before/,
    );
    assert.throws(
      () =>
        normalizeEventsAcquisition(
          baseCandidate({ timezone: "" }),
        ),
      /timezone is required/,
    );
  });

  it("validates attendance / delivery_mode coherence", () => {
    assert.throws(
      () =>
        normalizeEventsAcquisition(
          baseCandidate({
            deliveryMode: "online",
            onlineReference: null,
            venueLabel: null,
            cityText: null,
            countryRef: null,
            addressText: null,
          }),
        ),
      /online_reference/,
    );
    const online = normalizeEventsAcquisition(
      baseCandidate({
        deliveryMode: "online",
        onlineReference: "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524",
        venueLabel: null,
        addressText: null,
        cityText: null,
        countryRef: null,
      }),
    );
    assert.equal(online.provenance.deliveryMode, "online");
  });

  it("rejects full body / HTML / unauthorized images", () => {
    assert.throws(
      () => assertMetadataOnlyEventPayload({ sourceFullHtml: "<html/>" }),
      /HTML/,
    );
    assert.throws(
      () =>
        normalizeEventsAcquisition(
          baseCandidate({ sourceAttachmentBase64: "AAA" }),
        ),
      /attachments/,
    );
    assert.throws(
      () =>
        normalizeEventsAcquisition(
          baseCandidate({ unauthorizedImageUrl: "https://cdn.example/x.jpg" }),
        ),
      /unauthorized images/,
    );
  });

  it("rejects registrationUrl off allowlist", () => {
    assert.throws(
      () =>
        normalizeEventsAcquisition(
          baseCandidate({
            registrationUrl: "https://zoom.us/j/123456",
          }),
        ),
      /registrationUrl/,
    );
  });
});

describe("D1-D.6 dedupe / cross-source / refresh / idempotency", () => {
  it("dedupes by natural key, canonical url and fingerprint", () => {
    const a = normalizeEventsAcquisition(baseCandidate());
    const b = normalizeEventsAcquisition(
      baseCandidate({
        eventUrl:
          "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/524",
      }),
    );
    // www→apex + same extracted id → same natural key
    assert.equal(a.naturalKey, b.naturalKey);
    const { accepted, rejected } = dedupeEventsCandidates([a, b]);
    assert.equal(accepted.length, 1);
    assert.equal(rejected.length, 1);
  });

  it("merges cross-source duplicates into one primary + linked provenances", () => {
    const pim = normalizeEventsAcquisition(baseCandidate());
    const mlps = normalizeEventsAcquisition(
      baseCandidate({
        sourceCode: "minlavoro-eventi",
        eventUrl:
          "https://www.lavoro.gov.it/eventi/pagine/workshop-imprese-migranti",
        externalId: "workshop-imprese-migranti",
        organizerLabel: "Portale Integrazione Migranti",
        startsAt: "2026-09-01T09:00:00+02:00",
        originalTitle: "Workshop imprese migranti",
        venueLabel: "Sala A",
      }),
    );
    assert.equal(
      pim.crossSourceFingerprint,
      eventsCrossSourceFingerprint({
        originalTitle: "Workshop imprese migranti",
        startsAt: "2026-09-01T09:00:00+02:00",
        organizerLabel: "Portale Integrazione Migranti",
        venueOrOnline: "Sala A",
      }),
    );
    assert.equal(pim.crossSourceFingerprint, mlps.crossSourceFingerprint);
    const { groups, rejected } = mergeCrossSourceEvents([pim, mlps]);
    assert.equal(groups.length, 1);
    assert.equal(groups[0]!.primary.provenance.sourceCode, "pim-ricerca-eventi");
    assert.equal(groups[0]!.linkedProvenances.length, 1);
    assert.equal(
      groups[0]!.linkedProvenances[0]!.sourceCode,
      "minlavoro-eventi",
    );
    assert.equal(rejected.length, 1);
  });

  it("refresh preserves editorial decisions and human title/summary", () => {
    const incoming = normalizeEventsAcquisition(baseCandidate());
    const existing = {
      naturalKey: incoming.naturalKey,
      checksumSha256: "old",
      editorialStatus: "ready" as const,
      publicationStatus: "published" as const,
      visibilityStatus: "public" as const,
      title: "Titolo editato in redazione",
      summary: "Sintesi editata",
      typeCode: "conference",
      sourceTitleSha256: checksumSha256("altro"),
      sourceSummarySha256: checksumSha256("altro-summary"),
    };
    const plan = planEventsRefresh(incoming, existing, {
      occurrenceHint: "venue_changed",
    });
    assert.equal(plan.action, "UPDATE");
    assert.equal(plan.autoPublish, false);
    assert.equal(plan.preserved.editorialStatus, "ready");
    assert.equal(plan.preserved.publicationStatus, "published");
    assert.equal(plan.preserved.title, "Titolo editato in redazione");
    assert.equal(plan.preserved.summary, "Sintesi editata");
    assert.equal(plan.refreshable.occurrenceHint, "venue_changed");
    assert.equal(plan.titleFromSource, false);
    assert.equal(plan.summaryFromSource, false);
  });

  it("idempotent UNCHANGED when checksum matches", () => {
    const incoming = normalizeEventsAcquisition(baseCandidate());
    const plan = planEventsRefresh(incoming, {
      naturalKey: incoming.naturalKey,
      checksumSha256: incoming.checksumSha256,
      editorialStatus: "draft",
      publicationStatus: "unpublished",
      visibilityStatus: "private",
      title: incoming.editorial.titleIt,
      summary: incoming.editorial.platformSummaryIt,
      typeCode: incoming.editorial.typeCode,
      sourceTitleSha256: checksumSha256(incoming.editorial.titleIt),
      sourceSummarySha256: checksumSha256(
        incoming.editorial.platformSummaryIt,
      ),
    });
    assert.equal(plan.action, "UNCHANGED");
    assert.equal(plan.autoPublish, false);
  });

  it("CREATE plan when no existing row and auto-publish impossible", () => {
    const incoming = normalizeEventsAcquisition(baseCandidate());
    const plan = planEventsRefresh(incoming, null);
    assert.equal(plan.action, "CREATE");
    assert.equal(plan.preserved.publicationStatus, "unpublished");
    assert.equal(plan.autoPublish, false);
  });
});

describe("D1-D.6 type helpers", () => {
  it("keeps NormalizedExternalEvent autoPublish literal false", () => {
    const sample: Pick<NormalizedExternalEvent, "autoPublish"> = {
      autoPublish: false,
    };
    assert.equal(sample.autoPublish, false);
  });
});
