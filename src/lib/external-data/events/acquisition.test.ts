import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checksumSha256 } from "@/lib/external-data/checksum";
import {
  __registerEventsSourceForTests,
  assertKnownEventsSource,
  EVENTI_ACQUISITION,
  listEventsSourceCodes,
  type EventsSourceCode,
} from "@/lib/external-data/events/allowlist";
import {
  assertMetadataOnlyEventPayload,
  dedupeEventsCandidates,
  eventsFingerprint,
  eventsNaturalKey,
  eventsPublishAuthorization,
  normalizeEventsAcquisition,
  normalizeEventsUrl,
  planEventsRefresh,
  type NormalizedExternalEvent,
} from "@/lib/external-data/events/acquisition";

const TEST_SOURCE = {
  sourceCode: "test-events" as EventsSourceCode,
  displayName: "Test Events Source",
  allowedHostnames: ["events.example.org", "www.events.example.org"],
  hostPathRules: [
    { hostname: "events.example.org", pathPrefixes: ["/e/"] },
    { hostname: "www.events.example.org", pathPrefixes: ["/e/"] },
  ],
  requiredAttribution: "Test Events Source",
  licenseNote: "test only",
};

function baseCandidate(
  overrides: Partial<Parameters<typeof normalizeEventsAcquisition>[0]> = {},
) {
  return {
    sourceCode: "test-events",
    eventUrl: "https://events.example.org/e/abc?utm_source=x",
    externalId: "abc-1",
    originalTitle: "Workshop imprese migranti",
    organizerLabel: "Camera di commercio test",
    startsAt: "2026-09-01T09:00:00+02:00",
    endsAt: "2026-09-01T13:00:00+02:00",
    timezone: "Europe/Rome",
    deliveryMode: "in_presence" as const,
    venueLabel: "Sala A",
    cityText: "Milano",
    countryRef: "IT",
    titleIt: "Workshop per imprese migranti",
    platformSummaryIt: "Sintesi editoriale piattaforma.",
    descriptionStub: "Descrizione editoriale minima senza corpo fonte.",
    typeCode: "conference" as const,
    ...overrides,
  };
}

describe("events allowlist (D1-D.5)", () => {
  it("ships empty and rejects unknown sources", () => {
    assert.deepEqual(listEventsSourceCodes(), []);
    assert.throws(() => assertKnownEventsSource("anything"), /unauthorized/);
  });
});

describe("events URL + identity", () => {
  it("canonicalizes https URL and strips tracking", () => {
    const r = normalizeEventsUrl(
      "https://Events.Example.org/e/abc/?utm_source=x#frag",
    );
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.canonicalUrl, "https://events.example.org/e/abc");
  });

  it("rejects http and full-body payloads", () => {
    assert.equal(normalizeEventsUrl("http://events.example.org/e/1").ok, false);
    assert.throws(
      () => assertMetadataOnlyEventPayload({ sourceFullHtml: "<html/>" }),
      /HTML/,
    );
  });

  it("applies identity precedence external_id > url > fingerprint", () => {
    const fp = eventsFingerprint({
      sourceCode: "test-events",
      originalTitle: "T",
      startsAt: "2026-01-01T10:00:00Z",
      deliveryMode: "online",
    });
    assert.equal(
      eventsNaturalKey({
        sourceCode: "test-events",
        externalId: "42",
        canonicalUrl: "https://events.example.org/e/42",
        fingerprint: fp,
      }).identityMethod,
      "external_id",
    );
    assert.equal(
      eventsNaturalKey({
        sourceCode: "test-events",
        canonicalUrl: "https://events.example.org/e/42",
        fingerprint: fp,
      }).identityMethod,
      "canonical_url",
    );
    assert.equal(
      eventsNaturalKey({
        sourceCode: "test-events",
        fingerprint: fp,
      }).identityMethod,
      "fingerprint",
    );
  });
});

describe("events normalize + refresh", () => {
  it("normalizes against temporary allowlist and forbids auto-publish", () => {
    const unregister = __registerEventsSourceForTests(TEST_SOURCE);
    try {
      const n = normalizeEventsAcquisition(baseCandidate());
      assert.equal(n.ownedByEditorial, true);
      assert.equal(n.editorialStatus, "draft");
      assert.equal(n.publicationStatus, "unpublished");
      assert.equal(n.visibilityStatus, "private");
      assert.equal(n.autoPublish, false);
      assert.equal(n.identityMethod, "external_id");
      assert.equal(
        n.provenance.canonicalUrl,
        "https://events.example.org/e/abc",
      );
      assert.equal(eventsPublishAuthorization().importerMayPublish, false);
      assert.equal(EVENTI_ACQUISITION.autoPublish, false);
    } finally {
      unregister();
    }
  });

  it("dedupes by natural key and canonical url", () => {
    const unregister = __registerEventsSourceForTests(TEST_SOURCE);
    try {
      const a = normalizeEventsAcquisition(baseCandidate());
      const b = normalizeEventsAcquisition(
        baseCandidate({ externalId: "other", eventUrl: a.sourceUrl }),
      );
      const { accepted, rejected } = dedupeEventsCandidates([a, a, b]);
      assert.equal(accepted.length, 1);
      assert.equal(rejected.length, 2);
    } finally {
      unregister();
    }
  });

  it("refresh preserves editorial decisions and human title", () => {
    const unregister = __registerEventsSourceForTests(TEST_SOURCE);
    try {
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
      const plan = planEventsRefresh(incoming, existing);
      assert.equal(plan.action, "UPDATE");
      assert.equal(plan.autoPublish, false);
      assert.equal(plan.preserved.editorialStatus, "ready");
      assert.equal(plan.preserved.publicationStatus, "published");
      assert.equal(plan.preserved.title, "Titolo editato in redazione");
      assert.equal(plan.preserved.summary, "Sintesi editata");
      assert.equal(plan.titleFromSource, false);
      assert.equal(plan.summaryFromSource, false);
    } finally {
      unregister();
    }
  });

  it("CREATE plan when no existing row", () => {
    const unregister = __registerEventsSourceForTests(TEST_SOURCE);
    try {
      const incoming = normalizeEventsAcquisition(baseCandidate());
      const plan = planEventsRefresh(incoming, null);
      assert.equal(plan.action, "CREATE");
      assert.equal(plan.preserved.publicationStatus, "unpublished");
    } finally {
      unregister();
    }
  });

  it("rejects unknown source without registering allowlist", () => {
    assert.throws(
      () => normalizeEventsAcquisition(baseCandidate()),
      /unauthorized/,
    );
  });
});

describe("events type helpers", () => {
  it("keeps NormalizedExternalEvent autoPublish literal false", () => {
    const sample: Pick<NormalizedExternalEvent, "autoPublish"> = {
      autoPublish: false,
    };
    assert.equal(sample.autoPublish, false);
  });
});
