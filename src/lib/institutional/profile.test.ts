import assert from "node:assert/strict";
import test from "node:test";
import {
  hasCompleteInstitutionalDisclosure,
  INSTITUTIONAL_PROFILE,
} from "@/lib/institutional/profile";

test("institutional disclosure uses the verified AIPEL legal identity", () => {
  assert.equal(hasCompleteInstitutionalDisclosure(), true);
  assert.equal(
    INSTITUTIONAL_PROFILE.promoterLegalName,
    "Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia",
  );
  assert.equal(
    INSTITUTIONAL_PROFILE.registeredOffice,
    "Viale Molise n. 54, 20137 Milano (MI)",
  );
  assert.equal(
    INSTITUTIONAL_PROFILE.administrativeDisclosure,
    "Codice fiscale 97342380157 · Partita IVA 04222160964",
  );
});

test("institutional disclosure still requires legal name, office and administrative disclosure", () => {
  assert.equal(
    hasCompleteInstitutionalDisclosure({
      ...INSTITUTIONAL_PROFILE,
      registeredOffice: null,
    }),
    false,
  );
  assert.equal(
    hasCompleteInstitutionalDisclosure({
      ...INSTITUTIONAL_PROFILE,
      administrativeDisclosure: null,
    }),
    false,
  );
});
