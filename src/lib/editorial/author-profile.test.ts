import assert from "node:assert/strict";
import test from "node:test";
import { validateAuthorProfileDraft } from "./author-profile";

test("public author profiles require substantive evidence fields", () => {
  const result = validateAuthorProfileDraft({
    slug: "maria-rossi",
    displayName: "Maria Rossi",
    profileKind: "person",
    bio: "",
    affiliation: "",
    orcid: "",
    websiteUrl: "",
    isPublic: true,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.fieldErrors.bio, "La biografia è necessaria per un profilo pubblico.");
  assert.match(result.fieldErrors.affiliation, /affiliazione o sito web/i);
});

test("person profile accepts a valid ORCID and normalized website", () => {
  const result = validateAuthorProfileDraft({
    slug: "maria-rossi",
    displayName: "Maria Rossi",
    profileKind: "person",
    bio: "Ricercatrice con profilo pubblico verificato.",
    affiliation: "Centro di ricerca",
    orcid: "0000-0002-1825-0097",
    websiteUrl: "https://example.org/profile",
    isPublic: true,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.value.website_url, "https://example.org/profile");
  assert.equal(result.value.orcid, "0000-0002-1825-0097");
});

test("organization profile rejects ORCID", () => {
  const result = validateAuthorProfileDraft({
    slug: "centro-studi",
    displayName: "Centro Studi",
    profileKind: "organization",
    bio: "Profilo istituzionale.",
    affiliation: "",
    orcid: "0000-0002-1825-0097",
    websiteUrl: "https://example.org",
    isPublic: false,
  });

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.fieldErrors.orcid, /solo per persone/i);
});
