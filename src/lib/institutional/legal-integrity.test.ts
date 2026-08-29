import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();

function source(relativePath: string) {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

const privacy = source("src/app/privacy/page.tsx");
const cookie = source("src/app/cookie/page.tsx");
const terms = source("src/app/termini/page.tsx");
const contribution = source("src/app/contribuisci/page.tsx");
const editorialPolicy = source("src/app/politica-editoriale/page.tsx");

const legalIdentityMarkers = [
  "Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia (AIPEL)",
  "Viale Molise n. 54, 20137 Milano (MI)",
  "97342380157",
  "04222160964",
] as const;

test("public legal surfaces retain the verified AIPEL identity", () => {
  for (const marker of legalIdentityMarkers) {
    assert.match(privacy, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(cookie, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(terms, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("proposal intake treats required contact processing as notice acknowledgement, not general consent", () => {
  assert.match(contribution, /Prendo atto che i recapiti indicati saranno trattati/);
  assert.match(contribution, /Privacy Policy/);
  assert.match(contribution, /Obbligatorio per inviare la proposta/);
  assert.match(contribution, /Facoltativo/);
  assert.doesNotMatch(
    contribution,
    /Autorizzo la redazione a utilizzare i miei recapiti per contattarmi in relazione a questa proposta/,
  );
});

test("age and jurisdiction decisions remain explicit", () => {
  assert.match(contribution, /compiuto 18 anni/);
  assert.match(privacy, /compiuto <strong[^>]*>18 anni<\/strong>/);
  assert.match(terms, /compiuto <strong[^>]*>18 anni<\/strong>/);
  assert.match(terms, /legge italiana/);
  assert.match(terms, /Foro di Milano/);
  assert.match(terms, /foro del consumatore/);
});

test("privacy notice keeps infrastructure and transfer disclosures scoped correctly", () => {
  assert.match(privacy, /eu-west-3 \(Parigi\)/);
  assert.match(privacy, /regione primaria del progetto Supabase determina la localizzazione dei dati primari/);
  assert.match(privacy, /sub-responsabili[\s\S]{0,220}possono comportare trattamenti fuori dallo Spazio Economico Europeo/);
  assert.match(privacy, /non costituisce consenso a finalità ulteriori/);
});

test("AI translation legal disclosures remain explicit and conservative", () => {
  assert.match(privacy, /OpenAI/);
  assert.match(privacy, /contenuti editoriali già pubblicati/);
  assert.match(privacy, /store: false/);
  assert.match(privacy, /non viene descritta da AIPEL come un regime di Zero Data Retention/);
  assert.match(privacy, /non sono necessariamente sottoposte a revisione umana preventiva/);
  assert.match(privacy, /resta accessibile e prevale in caso di dubbio o divergenza/);

  assert.match(editorialPolicy, /traduzioni automatiche generate mediante intelligenza artificiale/);
  assert.match(editorialPolicy, /possono contenere errori/);
  assert.match(editorialPolicy, /non implicano necessariamente una revisione umana preventiva/);
  assert.match(editorialPolicy, /prevale sempre la versione nella lingua originale/);
});