import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  labelAccountStatus,
  labelPersonAssociation,
  labelProfileReady,
} from "./user-labels";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "../../app/app");

function readAppPage(...parts: string[]) {
  return readFileSync(join(appRoot, ...parts), "utf8");
}

describe("P7.1 user-facing labels", () => {
  it("maps account statuses to Italian labels", () => {
    assert.equal(labelAccountStatus("active"), "Attivo");
    assert.equal(labelAccountStatus("registered"), "Registrato");
    assert.equal(labelProfileReady(true), "Completo");
    assert.equal(labelProfileReady(false), "Da completare");
    assert.equal(labelPersonAssociation("declared", true), "Collegata");
  });

  it("dashboard and profilo pages omit technical validation copy", () => {
    const dashboard = readAppPage("page.tsx");
    const profilo = readAppPage("profilo", "page.tsx");
    const onboarding = readAppPage("onboarding", "page.tsx");
    const bundle = `${dashboard}\n${profilo}\n${onboarding}`;

    for (const forbidden of [
      "P3",
      "(CTX)",
      "(ACT)",
      "access_current_person_id",
      "access_link_person",
      "handle_new_user",
      "Identity + Business",
      "Persona id",
      "column grant",
      "A4.2",
    ]) {
      assert.equal(
        bundle.includes(forbidden),
        false,
        `unexpected technical string: ${forbidden}`,
      );
    }

    assert.match(dashboard, /Panoramica del tuo spazio personale/);
    assert.match(dashboard, /Imprese collegate/);
    assert.match(dashboard, /Imprese che puoi gestire/);
    assert.match(onboarding, /Completa il profilo/);
  });
});
