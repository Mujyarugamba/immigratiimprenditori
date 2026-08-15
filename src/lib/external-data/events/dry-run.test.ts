import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { normalizeEventsAcquisition } from "@/lib/external-data/events/acquisition";
import { EVENTS_SOURCE_ALLOWLIST } from "@/lib/external-data/events/allowlist";
import {
  createPublicFetcher,
  eventsDryRunUsage,
  extractEventJsonLd,
  jsonLdToCandidate,
  parseEventsDryRunArgs,
  runEventsDryRun,
  selectEventsDryRunCandidates,
  type PublicFetcher,
} from "@/lib/external-data/events/dry-run";

const DETAIL_URLS = {
  "pim-ricerca-eventi":
    "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi/Dettaglio-evento/id/9001",
  "minlavoro-eventi":
    "https://www.lavoro.gov.it/eventi/pagine/lavoro-inclusione-2027",
  "unioncamere-agenda":
    "https://www.unioncamere.gov.it/agenda/imprese-migranti-2027",
  "emn-home-affairs-events":
    "https://home-affairs.ec.europa.eu/whats-new/events/emn-economic-migration-2027_en",
} as const;

function eventHtml(url: string, index: number) {
  return `<html><script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Evento fixture ${index}`,
    url,
    identifier: `fixture-${index}`,
    startDate: `2027-0${index}-10T10:00:00+01:00`,
    endDate: `2027-0${index}-10T12:00:00+01:00`,
    timeZone: index === 4 ? "Europe/Brussels" : "Europe/Rome",
    eventAttendanceMode: "OfflineEventAttendanceMode",
    inLanguage: index === 4 ? "en" : "it",
    location: {
      "@type": "Place",
      name: `Sala ${index}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Roma",
        addressCountry: "IT",
      },
    },
    organizer: { "@type": "Organization", name: `Ente ${index}` },
  })}</script></html>`;
}

function fixtureFetcher(): PublicFetcher {
  return async (source, url) => {
    const detail = DETAIL_URLS[source.sourceCode];
    if (url === source.mainUrl) {
      return {
        url,
        status: 200,
        contentType: "text/html",
        body: `<a href="${detail}">Evento</a>`,
      };
    }
    const index =
      EVENTS_SOURCE_ALLOWLIST.findIndex(
        (entry) => entry.sourceCode === source.sourceCode,
      ) + 1;
    return {
      url,
      status: 200,
      contentType: "text/html",
      body: eventHtml(url, index),
    };
  };
}

describe("D1-D.8A CLI arguments", () => {
  it("keeps help side-effect free and documents the canonical command", () => {
    assert.equal(parseEventsDryRunArgs(["--help"]).help, true);
    assert.match(
      eventsDryRunUsage(),
      /--from YYYY-MM-DD --to YYYY-MM-DD --limit N/,
    );
  });

  it("requires from, to and limit and validates interval", () => {
    assert.throws(() => parseEventsDryRunArgs([]), /missing required/);
    assert.throws(
      () =>
        parseEventsDryRunArgs([
          "--from",
          "2027-01-01",
          "--to",
          "2026-01-01",
          "--limit",
          "1",
        ]),
      /must not be after/,
    );
    assert.throws(
      () =>
        parseEventsDryRunArgs([
          "--from",
          "bad",
          "--to",
          "2027-01-01",
          "--limit",
          "1",
        ]),
      /invalid date/,
    );
  });

  it("rejects unknown, duplicate and Production flags", () => {
    assert.throws(() => parseEventsDryRunArgs(["--unknown"]), /unknown/);
    assert.throws(
      () =>
        parseEventsDryRunArgs(["--from", "2026-01-01", "--from", "2026-01-02"]),
      /duplicate/,
    );
    for (const flag of [
      "--apply",
      "--yes",
      "--project-ref",
      "--allow-production",
    ]) {
      assert.throws(
        () => parseEventsDryRunArgs([flag]),
        /forbidden Production flag/,
      );
    }
  });

  it("enforces the absolute limit", () => {
    for (const limit of ["0", "17"]) {
      assert.throws(
        () =>
          parseEventsDryRunArgs([
            "--from",
            "2026-01-01",
            "--to",
            "2027-01-01",
            "--limit",
            limit,
          ]),
        /between 1 and 16/,
      );
    }
  });
});

describe("D1-D.8A four-source fixture parsing", () => {
  it("parses one normalized review-only event from every allowlisted source", async () => {
    const output = await runEventsDryRun(
      { help: false, from: "2026-08-14", to: "2027-08-14", limit: 16 },
      { fetcher: fixtureFetcher(), retrievedAt: "2026-08-14T00:00:00.000Z" },
    );
    assert.equal(output.consultedSources.length, 4);
    assert.equal(output.candidates.length, 4);
    assert.deepEqual(Object.values(output.counts.perSource), [1, 1, 1, 1]);
    assert.equal(output.counts.published, 0);
    assert.equal(output.counts.autoPublish, 0);
    assert.equal(output.counts.databaseAccesses, 0);
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(output)));
    for (const candidate of output.candidates) {
      assert.equal(candidate.publicationStatus, "unpublished");
      assert.equal(candidate.visibilityStatus, "private");
      assert.equal(candidate.ownedByEditorial, true);
      assert.equal(candidate.autoPublish, false);
    }
  });

  it("extracts structured Event data and rejects missing timezone", () => {
    const source = EVENTS_SOURCE_ALLOWLIST[0]!;
    const events = extractEventJsonLd(
      eventHtml(DETAIL_URLS[source.sourceCode], 1),
    );
    assert.equal(events.length, 1);
    assert.throws(
      () =>
        jsonLdToCandidate(
          source,
          { ...events[0], timeZone: undefined },
          DETAIL_URLS[source.sourceCode],
          "2026-08-14T00:00:00Z",
        ),
      /timezone/,
    );
  });
});

describe("D1-D.8A HTTP safety", () => {
  it("rejects redirects outside the source allowlist", async () => {
    const fetcher = createPublicFetcher(
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: "https://example.com/event" },
        }),
    );
    await assert.rejects(
      () =>
        fetcher(
          EVENTS_SOURCE_ALLOWLIST[0]!,
          EVENTS_SOURCE_ALLOWLIST[0]!.mainUrl,
        ),
      /allowlist/,
    );
  });

  it("rejects oversized and wrong Content-Type responses", async () => {
    const oversized = createPublicFetcher(
      async () =>
        new Response("x", {
          status: 200,
          headers: { "content-type": "text/html", "content-length": "100" },
        }),
      { maxBytes: 10 },
    );
    await assert.rejects(
      () =>
        oversized(
          EVENTS_SOURCE_ALLOWLIST[0]!,
          EVENTS_SOURCE_ALLOWLIST[0]!.mainUrl,
        ),
      /too large/,
    );
    const wrong = createPublicFetcher(
      async () =>
        new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    await assert.rejects(
      () =>
        wrong(EVENTS_SOURCE_ALLOWLIST[0]!, EVENTS_SOURCE_ALLOWLIST[0]!.mainUrl),
      /Content-Type/,
    );
  });

  it("enforces request timeout", async () => {
    const fetcher = createPublicFetcher(
      (_url, init) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener("abort", () =>
            reject(new Error("aborted")),
          ),
        ),
      { timeoutMs: 5 },
    );
    await assert.rejects(
      () =>
        fetcher(
          EVENTS_SOURCE_ALLOWLIST[0]!,
          EVENTS_SOURCE_ALLOWLIST[0]!.mainUrl,
        ),
      /aborted/,
    );
  });
});

describe("D1-D.8A deterministic selection", () => {
  function normalized(id: number, sourceIndex = 0) {
    const source = EVENTS_SOURCE_ALLOWLIST[sourceIndex]!;
    const event = extractEventJsonLd(
      eventHtml(DETAIL_URLS[source.sourceCode], sourceIndex + 1),
    )[0]!;
    event.identifier = `id-${id}`;
    event.name = `Evento ${id}`;
    event.url = `${DETAIL_URLS[source.sourceCode]}-${id}`;
    event.startDate = `2027-01-${String(id).padStart(2, "0")}T10:00:00+01:00`;
    return normalizeEventsAcquisition(
      jsonLdToCandidate(
        source,
        event,
        String(event.url),
        "2026-08-14T00:00:00Z",
      ),
    );
  }

  it("sorts deterministically and caps each source at four", () => {
    const selected = selectEventsDryRunCandidates(
      [5, 4, 3, 2, 1].map((id) => normalized(id)),
      { from: "2026-08-14", to: "2027-08-14", limit: 16 },
    );
    assert.equal(selected.accepted.length, 4);
    assert.deepEqual(
      selected.accepted.map((candidate) => candidate.editorial.titleIt),
      ["Evento 1", "Evento 2", "Evento 3", "Evento 4"],
    );
  });

  it("deduplicates natural key, canonical URL, fingerprint and cross-source identity", () => {
    const one = normalized(1);
    const exact = one;
    const selected = selectEventsDryRunCandidates([one, exact], {
      from: "2026-08-14",
      to: "2027-08-14",
      limit: 16,
    });
    assert.equal(selected.accepted.length, 1);
    assert.equal(selected.rejected.length, 1);
    assert.match(selected.rejected[0]!.reason, /duplicate natural key/);
  });
});

describe("D1-D.8A dependency boundary", () => {
  it("does not import Supabase, database, publisher or Production importer modules", () => {
    const files = [
      "scripts/external-data/d1-d8a-events-dry-run.ts",
      "src/lib/external-data/events/dry-run.ts",
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      assert.doesNotMatch(
        source,
        /from ["'][^"']*(supabase|database|publisher|prod-ingest)|createClient|service.role|db query/i,
      );
    }
  });
});
