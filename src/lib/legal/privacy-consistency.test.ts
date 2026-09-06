import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(path, "utf8");
}

test("mandatory proposal acknowledgement is not presented as optional GDPR consent", () => {
  const italian = source("src/app/contribuisci/page.tsx");
  assert.match(italian, /name="consent_contact"[^>]*required/);
  assert.match(italian, /Prendo atto che i recapiti indicati saranno trattati/);
  assert.match(italian, /href="\/privacy"/);
  assert.doesNotMatch(
    italian,
    /Autorizzo la redazione a utilizzare i miei recapiti per contattarmi/,
  );

  const localized = source("src/app/[locale]/contribuisci/page.tsx");
  assert.match(localized, /name="consent_contact"[^>]*required/);
  assert.match(localized, /href="\/privacy"/);
  assert.match(localized, /privacy:\s*"Privacy Policy"/);
  assert.doesNotMatch(localized, /I authorize the editorial team to contact me/);
});

test("privacy notice explains data provision, acknowledgement and aggregate analytics", () => {
  const privacy = source("src/app/privacy/page.tsx");
  assert.match(privacy, /8\. Conferimento dei dati/);
  assert.match(privacy, /presa d&apos;atto obbligatoria/);
  assert.match(privacy, /non costituisce consenso a finalità ulteriori/);
  assert.match(privacy, /11\. Misurazione aggregata del sito/);
  assert.match(privacy, /senza conservare nell&apos;archivio analytics IP, user-agent, identificatori cookie, account o eventi grezzi/);
});

test("cookie notice stays aligned with first-party no-cookie analytics implementation", () => {
  const cookie = source("src/app/cookie/page.tsx");
  const analytics = source("src/components/analytics/PrivacyFriendlyAnalytics.tsx");
  const migration = source("supabase/migrations/20260822210500_go_live_audit_analytics.sql");

  assert.match(cookie, /3\. Misurazione aggregata di prima parte/);
  assert.match(cookie, /Global Privacy Control/);
  assert.match(cookie, /Do Not Track/);
  assert.match(analytics, /credentials: "omit"/);
  assert.match(analytics, /globalPrivacyControl/);
  assert.match(analytics, /doNotTrack/);
  assert.match(migration, /No IP address, user-agent, cookie identifier, account id or raw event stream is/);
});
