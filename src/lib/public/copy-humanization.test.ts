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

/** User-facing “new / waiting platform” patterns — not legitimate grammar of “quando”. */
const FORBIDDEN_NEW_SITE =
  /Non ci sono ancora|Quando saranno disponibili|Quando ci saranno|Quando qualcuno|Quando i professionisti|Quando le imprese|Quando le persone|li troverai qui|le troverai qui|lo troverai qui|compariranno qui|presto troverai|prossimamente|in fase di sviluppo|stiamo preparando|stiamo lavorando|man mano che diventano disponibili|da mostrare|si presenteranno nella rete/i;

describe("P7.6 established platform voice", () => {
  const surfaces = [
    "page.tsx",
    "persone/page.tsx",
    "imprese/page.tsx",
    "professionisti/page.tsx",
    "opportunita/page.tsx",
    "collaborazioni/page.tsx",
    "servizi/page.tsx",
    "mercati/page.tsx",
    "eventi/page.tsx",
    "cultura/page.tsx",
    "organizzazioni/page.tsx",
    "contenuti/page.tsx",
    "osservatorio/page.tsx",
    "chi-siamo/page.tsx",
    "pubblica/page.tsx",
    "accedi/page.tsx",
    "registrati/page.tsx",
    "app/page.tsx",
    "app/profilo/page.tsx",
    "app/imprese/page.tsx",
  ];

  it("public and private surfaces avoid waiting / new-site empty copy", () => {
    for (const rel of surfaces) {
      const src = readApp(rel);
      assert.doesNotMatch(
        src,
        FORBIDDEN_NEW_SITE,
        `forbidden new-site voice in ${rel}`,
      );
    }
    assert.doesNotMatch(readSrc("components/layout/Footer.tsx"), FORBIDDEN_NEW_SITE);
    assert.doesNotMatch(readSrc("components/home/FinalCta.tsx"), FORBIDDEN_NEW_SITE);
    assert.doesNotMatch(readSrc("data/sections.ts"), FORBIDDEN_NEW_SITE);
    assert.doesNotMatch(readSrc("data/ecosystems.ts"), FORBIDDEN_NEW_SITE);
    assert.doesNotMatch(readSrc("components/ui/EmptyState.tsx"), FORBIDDEN_NEW_SITE);
  });

  it("home empty states speak in the present", () => {
    const home = readApp("page.tsx");
    assert.match(home, /Nessun professionista disponibile\./);
    assert.match(home, /Nessuna impresa disponibile\./);
    assert.match(home, /Nessuna opportunità disponibile\./);
    assert.match(home, /Nessun mercato disponibile\./);
    assert.match(home, /Nessun servizio disponibile\./);
    assert.match(home, /Nessun evento in programma\./);
    assert.match(
      home,
      /operano, sviluppano relazioni e crescono/,
    );
    assert.match(
      home,
      /Eventi e storie per conoscersi, scoprire esperienze e creare nuove connessioni/,
    );
    assert.doesNotMatch(home, /emptyDescription=/);
  });

  it("final CTA invites concrete action today", () => {
    const cta = readSrc("components/home/FinalCta.tsx");
    assert.match(cta, /Entra nella rete e fatti conoscere/);
    assert.doesNotMatch(cta, /pubblica la tua presenza/i);
  });

  it("footer has no progressive-population disclaimer", () => {
    const footer = readSrc("components/layout/Footer.tsx");
    assert.doesNotMatch(footer, /man mano|diventano disponibili|fase di/i);
    assert.match(footer, /mainNav/);
    assert.match(footer, /Scrivici/);
    assert.ok(moreNav.some((n) => n.label === "Osservatorio"));
    assert.ok(moreNav.some((n) => n.label === "Chi siamo"));
  });
});

/** Meta-architecture / taxonomy explanations that must not leak into UI copy. */
const FORBIDDEN_META =
  /Immigrati Imprenditori resta|già presenti nella rete|I servizi linguistici restano|Cultura collega ciò che già esiste|Osservatorio\s*·\s*Chi siamo|classificazione strutturata|una sola volta|elenchi isolati|record reali|Nessun dato dimostrativo|in fase di sviluppo/i;

describe("P7.7 final human UX editorial polish", () => {
  it("cultura hub shows product, not architecture or taxonomy rules", () => {
    const page = readApp("cultura/page.tsx");
    assert.doesNotMatch(page, FORBIDDEN_META);
    assert.doesNotMatch(page, /PLATFORM_IDENTITY|pubblic[oi] con competenze|Imprese pubbliche|elenco dedicato|oppure collegati a un evento/i);
    assert.match(page, /Cultura, incontri, relazioni/);
    assert.match(page, /Professionisti con competenze culturali/);
    assert.match(page, /Imprese attive nelle industrie culturali/);
    assert.match(page, /Trova chi offre servizi culturali/);
    assert.match(page, /Notizie, guide, esperienze e racconti/);
    assert.match(page, /Presenta ciò che fai/);
    assert.doesNotMatch(page, /Nella rete/);
  });

  it("footer has no isolated Osservatorio · Chi siamo bar", () => {
    const footer = readSrc("components/layout/Footer.tsx");
    assert.doesNotMatch(footer, /Osservatorio\s*·\s*Chi siamo/);
    assert.doesNotMatch(footer, /\{\s*" · "\s*\}/);
    assert.doesNotMatch(footer, /href="\/osservatorio"/);
    assert.doesNotMatch(footer, /href="\/chi-siamo"/);
    assert.match(footer, /mainNav/);
    assert.match(footer, /Scrivici/);
    assert.match(footer, /©/);
    assert.ok(moreNav.some((n) => n.href === "/osservatorio"));
    assert.ok(moreNav.some((n) => n.href === "/chi-siamo"));
  });

  it("home CTA avoids mechanical access wording", () => {
    const cta = readSrc("components/home/FinalCta.tsx");
    assert.match(cta, /Accedi per pubblicare/);
    assert.doesNotMatch(cta, /Pubblichi dopo l'accesso|la rete resta aperta/i);
  });

  it("key surfaces avoid known meta-copy regressions", () => {
    for (const rel of [
      "page.tsx",
      "persone/page.tsx",
      "cultura/page.tsx",
      "pubblica/page.tsx",
      "servizi/page.tsx",
      "opportunita/page.tsx",
      "collaborazioni/page.tsx",
      "chi-siamo/page.tsx",
    ]) {
      assert.doesNotMatch(readApp(rel), FORBIDDEN_META, rel);
    }
    assert.doesNotMatch(readSrc("components/layout/Footer.tsx"), FORBIDDEN_META);
    assert.doesNotMatch(readSrc("components/home/TransversalStrip.tsx"), FORBIDDEN_META);
  });

  it("signup Privacy link has no legal overexplanation", () => {
    const auth = readSrc("components/auth/AuthForm.tsx");
    assert.match(auth, /Privacy Policy/);
    assert.doesNotMatch(auth, /solo informativa|non è un consenso/i);
    assert.match(auth, /Accetto i/);
    assert.match(auth, /Termini/);
  });

  it("self-delete user copy stays short and non-technical", () => {
    const copy = readSrc("lib/access/self-delete.ts");
    const userBlock = copy.slice(copy.indexOf("SELF_DELETE_USER_COPY"));
    assert.doesNotMatch(
      userBlock,
      /tombstone|soft-close|Auth ban|retention archive|subject_ref|RPC/i,
    );
    assert.match(userBlock, /Chiude l’account|Cancella account/);
  });

  it("public headers avoid under-construction eyebrow", () => {
    const intro = readSrc("components/ui/SectionIntro.tsx");
    assert.doesNotMatch(intro, /Sezione in preparazione|in costruzione/i);
  });

  it("user pages avoid primary technical acronyms in copy", () => {
    for (const rel of [
      "registrati/page.tsx",
      "accedi/page.tsx",
      "app/page.tsx",
      "app/profilo/page.tsx",
      "cultura/page.tsx",
      "osservatorio/page.tsx",
    ]) {
      assert.doesNotMatch(
        readApp(rel),
        /\bUUID\b|\bRPC\b|\bRLS\b|\bCTX\b|\bACT\b|source of truth|SQLSTATE/i,
        rel,
      );
    }
    assert.doesNotMatch(
      readSrc("components/auth/AuthForm.tsx"),
      /\bUUID\b|\bRPC\b|\bRLS\b/,
    );
  });
});
