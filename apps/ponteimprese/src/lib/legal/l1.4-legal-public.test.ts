import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ponteImpreseAppRoot,
  ponteImpreseLegalDocsDir,
  ponteImpreseMigrationsDir,
} from "@/lib/app-paths";
import {
  assertNoInternalLegalMarkers,
  loadPublicLegalMarkdown,
} from "@/lib/legal/load-public-document";
import {
  LEGAL_PUBLIC_VERSIONS,
  LEGAL_ROUTES,
  TERMS_OF_USE_VERSION,
} from "@/lib/legal/versions";
import { PUBLIC_PERSON_SELECT } from "@/lib/data/public/people";
import { PROFILE_SELF_EDITABLE_FIELDS } from "@/types/business";
import { SELF_DELETE_USER_COPY } from "@/lib/access/self-delete";

const AIPEL = {
  name: "Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia",
  cf: "97342380157",
  piva: "04222160964",
  email: "info@immigratiimprenditori.it",
  sede: "Viale Molise n. 54",
};

describe("L1.4 legal public surfaces", () => {
  it("public legal markdown has no internal review markers", () => {
    for (const id of ["privacy", "cookie", "termini", "datiEFonti"] as const) {
      const md = loadPublicLegalMarkdown(id);
      assert.ok(md.length > 200, id);
      assert.equal(assertNoInternalLegalMarkers(md), true, id);
      assert.equal(/\[TASK TECNICO/i.test(md), false, id);
      assert.equal(/\[VERIFICA TECNICA/i.test(md), false, id);
      assert.equal(/DOCUMENTO DA REVISIONARE/i.test(md), false, id);
      assert.equal(/DOCUMENTO DA VERIFICARE/i.test(md), false, id);
      assert.equal(/Decision Table/i.test(md), false, id);
      assert.equal(/Revisione Claude/i.test(md), false, id);
      assert.equal(/\*\*Stato:\*\*/i.test(md), false, id);
      assert.match(md, new RegExp(AIPEL.cf));
      assert.match(md, new RegExp(AIPEL.piva));
      assert.match(md, /info@immigratiimprenditori\.it/);
      assert.match(md, /AIPEL/);
      assert.match(md, /Viale Molise n\.\s*54/);
    }
  });

  it("source markdown files themselves are publication-clean", () => {
    for (const file of [
      "privacy-policy.md",
      "cookie-policy.md",
      "termini-duso.md",
      "informativa-disclaimer-dati-fonti-esterne.md",
    ]) {
      const raw = readFileSync(join(ponteImpreseLegalDocsDir(), file), "utf8");
      assert.equal(/\[TASK TECNICO/i.test(raw), false, file);
      assert.equal(/\[VERIFICA TECNICA RICHIESTA/i.test(raw), false, file);
      assert.equal(/DOCUMENTO DA REVISIONARE/i.test(raw), false, file);
      assert.equal(/Revisione Claude/i.test(raw), false, file);
      assert.equal(/\*\*Stato:\*\*.*bozza/i.test(raw), false, file);
    }
  });

  it("privacy and terms describe self-delete as available and preserve aggregates", () => {
    const privacy = loadPublicLegalMarkdown("privacy");
    const termini = loadPublicLegalMarkdown("termini");
    for (const md of [privacy, termini]) {
      assert.match(md, /area riservata/i);
      assert.match(md, /non.*automatica cancellazione di imprese/i);
      assert.match(md, /Nessun nuovo gestore viene assegnato automaticamente/i);
      assert.equal(/non è ancora (disponibile|implementata)/i.test(md), false);
      assert.equal(/funzione tecnica self-service sarà implementata/i.test(md), false);
    }
    assert.match(privacy, /18 anni/);
    assert.match(termini, /18 anni/);
  });

  it("termini include Italian law, forum rules, and signup Terms acceptance model", () => {
    const md = loadPublicLegalMarkdown("termini");
    assert.match(md, /legge italiana/i);
    assert.match(md, /Foro di Milano/);
    assert.match(md, /consumatore/i);
    assert.match(md, /casella di spunta obbligatoria/i);
    assert.match(md, /non.*è richiesta come consenso/i);
  });

  it("cookie policy confirms Case A and ii_selected_business_id", () => {
    const md = loadPublicLegalMarkdown("cookie");
    assert.match(md, /Case A/);
    assert.match(md, /ii_selected_business_id/);
    assert.match(md, /HttpOnly/);
    assert.match(md, /non.*mostra un banner di consenso/i);
    assert.equal(/Google Analytics/i.test(md), true);
  });

  it("external data notice is structural and does not claim incomplete import", () => {
    const md = loadPublicLegalMarkdown("datiEFonti");
    assert.match(md, /fonti pubbliche esterne/i);
    assert.match(md, /prevale sempre quest.ultima/i);
    assert.equal(/import operativo non è ancora eseguito/i.test(md), false);
  });

  it("legal routes and public versions are aligned", () => {
    assert.equal(LEGAL_ROUTES.privacy, "/privacy");
    assert.equal(LEGAL_ROUTES.cookie, "/cookie");
    assert.equal(LEGAL_ROUTES.termini, "/termini");
    assert.equal(LEGAL_ROUTES.datiEFonti, "/dati-e-fonti");
    assert.equal(TERMS_OF_USE_VERSION, "2026-08-12");
    assert.equal(LEGAL_PUBLIC_VERSIONS.termini, TERMS_OF_USE_VERSION);
  });

  it("self-delete UX copy links Privacy and avoids internal jargon", () => {
    assert.equal(SELF_DELETE_USER_COPY.privacyHref, "/privacy");
    assert.match(SELF_DELETE_USER_COPY.title, /Cancella account/i);
    assert.equal(/HMAC|reassignment|tombstone|soft.?delete|ACT\b/i.test(
      Object.values(SELF_DELETE_USER_COPY).join(" "),
    ), false);
  });

  it("terms acceptance migration remains present and scoped", () => {
    const sql = readFileSync(
      join(ponteImpreseMigrationsDir(), "20260815100000_create_terms_acceptances.sql"),
      "utf8",
    );
    assert.match(sql, /create table public\.terms_acceptances/);
    assert.match(sql, /document_kind = 'terms_of_use'/);
    assert.match(sql, /access_current_account_id/);
    assert.match(sql, /on delete restrict/i);
    assert.equal(/privacy_accepted/i.test(sql), false);
  });

  it("L1.1b contact contract still holds (auth email ≠ contact)", () => {
    assert.equal(
      (PROFILE_SELF_EDITABLE_FIELDS as readonly string[]).includes("phone"),
      false,
    );
    assert.equal(PUBLIC_PERSON_SELECT.includes("phone"), false);
    assert.equal(PUBLIC_PERSON_SELECT.includes("contact_email"), false);
  });

  it("footer exposes four legal links", () => {
    const footer = readFileSync(
      join(ponteImpreseAppRoot(), "src/components/layout/Footer.tsx"),
      "utf8",
    );
    assert.match(footer, /href="\/privacy"/);
    assert.match(footer, /href="\/cookie"/);
    assert.match(footer, /href="\/termini"/);
    assert.match(footer, /href="\/dati-e-fonti"/);
    assert.doesNotMatch(footer, /Osservatorio\s*·\s*Chi siamo/);
  });

  it("no analytics packages in package.json dependencies", () => {
    const pkg = JSON.parse(
      readFileSync(join(ponteImpreseAppRoot(), "package.json"), "utf8"),
    );
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };
    for (const name of Object.keys(deps)) {
      assert.equal(
        /analytics|gtag|gtm|hotjar|clarity|posthog|plausible|speed-insights/i.test(
          name,
        ),
        false,
        name,
      );
    }
  });
});
