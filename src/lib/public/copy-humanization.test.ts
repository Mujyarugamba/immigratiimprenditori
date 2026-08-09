import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { moreNav, primaryNav } from "@/data/navigation";
import {
  PLATFORM_IDENTITY,
  PLATFORM_VALUE_PROPOSITION,
  ecosystems,
  transversalLayers,
} from "@/data/ecosystems";

const here = join(import.meta.dirname);

function readApp(rel: string): string {
  return readFileSync(join(here, "../../app", rel), "utf8");
}

/** Patterns that must not appear as user-facing copy in key UI files. */
const FORBIDDEN_UI =
  /\b(aggregate root|CTX\s*≠\s*ACT|modello dati|classificazione strutturata|fatti pubblici|workspace\b|Auth,\s*Account e Persona|SQLSTATE|Supabase|Postgres|RLS\b|RPC\b|\bUUID\b|Hybrid C|lifecycle state|row status)\b/i;

describe("P7.4 frontend copy humanization", () => {
  it("preserves platform identity and five ecosystems", () => {
    assert.equal(
      PLATFORM_IDENTITY,
      "Persone. Imprese. Opportunità. Mercati internazionali.",
    );
    assert.equal(ecosystems.length, 5);
    assert.ok(transversalLayers.some((l) => l.id === "cultura"));
    assert.ok(transversalLayers.some((l) => l.id === "osservatorio"));
    assert.match(PLATFORM_VALUE_PROPOSITION, /rete/i);
    assert.doesNotMatch(PLATFORM_VALUE_PROPOSITION, /aggregate|duplicare i fatti/i);
  });

  it("navigation uses natural labels", () => {
    assert.ok(moreNav.some((n) => n.label === "Notizie e guide"));
    assert.ok(!primaryNav.some((n) => /Contenuti/i.test(n.label)));
    assert.deepEqual(
      primaryNav.map((n) => n.label),
      ["Persone", "Imprese", "Opportunità", "Mercati", "Servizi"],
    );
  });

  it("cultura hub avoids architecture jargon", () => {
    const page = readApp("cultura/page.tsx");
    assert.doesNotMatch(page, FORBIDDEN_UI);
    assert.doesNotMatch(page, /aggrega fatti|domini della rete|cultural_creative\./i);
    assert.match(page, /Cultura, incontri, relazioni/);
    assert.match(page, /industrie creative/);
  });

  it("home and pubblica avoid architecture jargon", () => {
    assert.doesNotMatch(readApp("page.tsx"), FORBIDDEN_UI);
    assert.doesNotMatch(readApp("pubblica/page.tsx"), FORBIDDEN_UI);
    assert.doesNotMatch(readApp("pubblica/page.tsx"), /nodi|CTX|workspace/i);
  });

  it("opportunità / collaborazioni / servizi distinguish without AR jargon", () => {
    assert.doesNotMatch(readApp("opportunita/page.tsx"), /aggregate/i);
    assert.doesNotMatch(readApp("collaborazioni/page.tsx"), /aggregate/i);
    assert.match(readApp("opportunita/page.tsx"), /occasioni/i);
    assert.match(readApp("collaborazioni/page.tsx"), /collaborazione/i);
    assert.match(readApp("servizi/page.tsx"), /Offro o cerco un servizio/);
  });

  it("auth copy is actionable", () => {
    assert.doesNotMatch(readApp("accedi/page.tsx"), /Auth,\s*Account/i);
    assert.doesNotMatch(readApp("registrati/page.tsx"), /Account applicativo|Persona/i);
    assert.match(readApp("accedi/page.tsx"), /area riservata/i);
    assert.match(readApp("registrati/page.tsx"), /profilo/i);
  });

  it("persone hub uses profilo language", () => {
    const page = readApp("persone/page.tsx");
    assert.doesNotMatch(page, FORBIDDEN_UI);
    assert.match(page, /Persone nella rete|profilo/i);
    assert.doesNotMatch(page, /ecosistema Persone/);
  });

  it("shared forbidden / not-found avoid DB jargon", () => {
    const states = readFileSync(
      join(here, "../../components/ui/states.tsx"),
      "utf8",
    );
    assert.doesNotMatch(states, /database|RLS|SQL/i);
    assert.match(states, /Accesso negato/);
    const notFound = readApp("not-found.tsx");
    assert.match(notFound, /non (è più )?disponibile|non esiste/i);
  });

  it("dashboard and app nav use human labels", () => {
    const dash = readApp("app/page.tsx");
    assert.doesNotMatch(dash, /\bCTX\b|\bACT\b|membership|grant\b/i);
    assert.match(dash, /Imprese collegate|Imprese che puoi gestire/);
    const nav = readFileSync(
      join(here, "../../components/app/AppNav.tsx"),
      "utf8",
    );
    assert.match(nav, /Il mio profilo|Le mie imprese|Dashboard/);
    assert.doesNotMatch(nav, /\(CTX\)|\(ACT\)/);
  });
});
