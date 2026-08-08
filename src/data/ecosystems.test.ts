import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { moreNav, primaryNav } from "@/data/navigation";
import {
  PLATFORM_IDENTITY,
  dbDomainToEcosystem,
  ecosystems,
  transversalLayers,
} from "@/data/ecosystems";

describe("P4.5 ecosystem IA", () => {
  it("platform identity puts markets in the hero line", () => {
    assert.match(PLATFORM_IDENTITY, /Persone/);
    assert.match(PLATFORM_IDENTITY, /Imprese/);
    assert.match(PLATFORM_IDENTITY, /Opportunità/);
    assert.match(PLATFORM_IDENTITY, /Mercati internazionali/);
    assert.doesNotMatch(PLATFORM_IDENTITY, /Osservatorio/i);
  });

  it("defines exactly five primary ecosystems", () => {
    assert.equal(ecosystems.length, 5);
    assert.deepEqual(
      ecosystems.map((e) => e.id),
      ["persone", "imprese", "opportunita", "mercati", "servizi"],
    );
  });

  it("primary nav follows ecosystems, not domain inventory", () => {
    assert.deepEqual(
      primaryNav.map((n) => n.href),
      ["/persone", "/imprese", "/opportunita", "/mercati", "/servizi"],
    );
  });

  it("keeps P4 routes reachable via primary or esplora nav", () => {
    const hrefs = new Set([...primaryNav, ...moreNav].map((n) => n.href));
    for (const href of [
      "/persone",
      "/imprese",
      "/professionisti",
      "/opportunita",
      "/collaborazioni",
      "/servizi",
      "/eventi",
      "/mercati",
      "/organizzazioni",
      "/osservatorio",
      "/contenuti",
    ]) {
      assert.ok(hrefs.has(href), `missing nav href ${href}`);
    }
  });

  it("maps DB domains to ecosystems without inventing new ARs", () => {
    assert.equal(dbDomainToEcosystem.businesses, "imprese");
    assert.equal(dbDomainToEcosystem.professional_profiles, "persone");
    assert.equal(dbDomainToEcosystem.opportunities, "opportunita");
    assert.equal(dbDomainToEcosystem.collaborations, "opportunita");
    assert.equal(dbDomainToEcosystem.service_offers, "servizi");
    assert.equal(dbDomainToEcosystem.service_requests, "servizi");
    assert.equal(dbDomainToEcosystem.events, "trasversale");
    assert.equal(dbDomainToEcosystem.observatory_indicators, "trasversale");
  });

  it("treats osservatorio as transversal, not platform identity", () => {
    assert.ok(transversalLayers.some((l) => l.id === "osservatorio"));
    assert.ok(!ecosystems.some((e) => e.id === ("osservatorio" as never)));
  });

  it("persone ecosystem documents professionisti without replacing persone", () => {
    const persone = ecosystems.find((e) => e.id === "persone");
    assert.ok(persone);
    assert.ok(persone!.routes.includes("/professionisti"));
    assert.ok(persone!.routes.includes("/persone"));
  });
});
