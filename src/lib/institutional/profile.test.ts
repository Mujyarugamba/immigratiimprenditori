import assert from "node:assert/strict";
import test from "node:test";
import {
  hasCompleteInstitutionalDisclosure,
  INSTITUTIONAL_PROFILE,
} from "@/lib/institutional/profile";

test("institutional disclosure stays incomplete while verified administrative fields are missing", () => {
  assert.equal(hasCompleteInstitutionalDisclosure(), false);
  assert.equal(INSTITUTIONAL_PROFILE.promoterLegalName, null);
  assert.equal(INSTITUTIONAL_PROFILE.registeredOffice, null);
});

test("institutional disclosure passes only with legal name, office and administrative disclosure", () => {
  assert.equal(
    hasCompleteInstitutionalDisclosure({
      projectName: "Immigrati Imprenditori",
      promoterShortName: "AIPEL",
      promoterLegalName: "Verified legal name",
      president: "Verified president",
      editorialDirector: "Verified editorial director",
      registeredOffice: "Verified registered office",
      administrativeDisclosure: "Verified administrative disclosure",
      contactEmail: "info@example.test",
    }),
    true,
  );
});
