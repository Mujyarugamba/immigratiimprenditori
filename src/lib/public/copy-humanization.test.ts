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

function readSrc(rel: string): string {
  return readFileSync(join(here, "../..", rel), "utf8");
}

/** Patterns that must not appear as user-facing copy in key UI files. */
const FORBIDDEN_UI =
  /\b(aggregate root|CTX\s*≠\s*ACT|modello dati|classificazione strutturata|fatti pubblici|workspace\b|Auth,\s*Account e Persona|SQLSTATE|Supabase|Postgres|RLS\b|RPC\b|\bUUID\b|Hybrid C|lifecycle state|row status)\b/i;

const FORBIDDEN_DEMO =
  /record reali|Nessun dato dimostrativo|dato dimostrativo|dati dimostrativi|fase di sviluppo|Contenuto provvisorio|senza elenchi isolati|esiste una sola volta|sono ingressi|relazioni reali/i;

describe("P7.4 / P7.5 frontend copy humanization", () => {
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
    assert.doesNotMatch(page, FORBIDDEN_DEMO);
    assert.doesNotMatch(page, /aggrega fatti|domini della rete|cultural_creative\./i);
    assert.match(page, /Cultura, incontri, relazioni/);
    assert.match(page, /industrie creative/);
  });

  it("home and pubblica avoid architecture and demo jargon", () => {
    const home = readApp("page.tsx");
    const pubblica = readApp("pubblica/page.tsx");
    const grid = readSrc("components/home/EcosystemGrid.tsx");
    const homeEmpty = readSrc("components/home/HomeDomainSection.tsx");
    assert.doesNotMatch(home, FORBIDDEN_UI);
    assert.doesNotMatch(home, FORBIDDEN_DEMO);
    assert.doesNotMatch(pubblica, FORBIDDEN_UI);
    assert.doesNotMatch(pubblica, /nodi|CTX|workspace/i);
    assert.doesNotMatch(grid, FORBIDDEN_DEMO);
    assert.match(grid, /relazioni che li collegano/);
    assert.doesNotMatch(homeEmpty, FORBIDDEN_DEMO);
    assert.doesNotMatch(home, /professionisti pubblici|schede pubbliche/i);
  });

  it("footer is not a development disclaimer", () => {
    const footer = readSrc("components/layout/Footer.tsx");
    assert.doesNotMatch(footer, FORBIDDEN_DEMO);
    assert.doesNotMatch(footer, /href="\/contatti"[^>]*>\s*Contatti\s*</);
    assert.match(footer, /Scrivici/);
    assert.match(footer, /info@/);
  });

  it("home search does not overpromise", () => {
    const search = readSrc("components/home/HomeSearch.tsx");
    assert.match(search, /Ricerca imprese|Cerca un/);
    assert.doesNotMatch(search, /interpreti|collaborazioni|opportunità/i);
    assert.match(search, /\/imprese/);
  });

  it("opportunità / collaborazioni / servizi distinguish without AR jargon", () => {
    assert.doesNotMatch(readApp("opportunita/page.tsx"), /aggregate/i);
    assert.doesNotMatch(readApp("collaborazioni/page.tsx"), /aggregate/i);
    assert.match(readApp("opportunita/page.tsx"), /occasioni|Bandi/i);
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
    const states = readSrc("components/ui/states.tsx");
    assert.doesNotMatch(states, /database|RLS|SQL/i);
    assert.match(states, /Accesso negato/);
    const notFound = readApp("not-found.tsx");
    assert.match(notFound, /non (è più )?disponibile|non esiste/i);
    const empty = readSrc("components/ui/EmptyState.tsx");
    assert.doesNotMatch(empty, FORBIDDEN_DEMO);
  });

  it("dashboard and app nav use human labels", () => {
    const dash = readApp("app/page.tsx");
    assert.doesNotMatch(dash, /\bCTX\b|\bACT\b|membership|grant\b/i);
    assert.match(dash, /Imprese collegate|Imprese che puoi gestire/);
    const nav = readSrc("components/app/AppNav.tsx");
    assert.match(nav, /Il mio profilo|Le mie imprese|Dashboard/);
    assert.doesNotMatch(nav, /\(CTX\)|\(ACT\)/);
  });

  it("osservatorio public UI uses Italian labels for units and periodicity", () => {
    const list = readApp("osservatorio/page.tsx");
    const detail = readApp("osservatorio/[slug]/page.tsx");
    assert.match(list, /OBSERVATORY_PERIODICITY_LABELS|OBSERVATORY_UNIT_LABELS/);
    assert.doesNotMatch(detail, /indicator\.code/);
    assert.match(detail, /OBSERVATORY_UNIT_LABELS/);
  });
});
