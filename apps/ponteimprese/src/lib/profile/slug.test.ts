import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  PERSON_PUBLIC_PATH_PREFIX,
  isValidProfileSlug,
  suggestProfileSlugFromDisplayName,
} from "./slug";
import { mapPostgresError, toUserMessage } from "@/lib/errors/app-error";

const here = dirname(fileURLToPath(import.meta.url));

describe("P7.2 profile public address", () => {
  it("UI form does not expose label Slug", () => {
    const form = readFileSync(
      join(here, "../../components/app/ProfileEditForm.tsx"),
      "utf8",
    );
    assert.match(form, /Indirizzo del profilo/);
    assert.match(form, /È l'indirizzo della tua pagina pubblica/);
    assert.match(form, /PERSON_PUBLIC_PATH_PREFIX|\/persone\//);
    assert.equal(form.includes('label="Slug"'), false);
    assert.equal(form.includes("Identificativo pubblico univoco"), false);
    assert.match(form, /name="slug"/);
  });

  it("suggests slug only when current slug is empty", () => {
    assert.equal(
      suggestProfileSlugFromDisplayName("Augustin Mujyarugamba", null),
      "augustin-mujyarugamba",
    );
    assert.equal(
      suggestProfileSlugFromDisplayName("Augustin Mujyarugamba", ""),
      "augustin-mujyarugamba",
    );
    assert.equal(
      suggestProfileSlugFromDisplayName(
        "Augustin Mujyarugamba",
        "augustin-esistente",
      ),
      null,
    );
  });

  it("existing slug is preserved against display name changes", () => {
    const existing = "mio-profilo";
    assert.equal(
      suggestProfileSlugFromDisplayName("Nuovo Nome", existing),
      null,
    );
  });

  it("validates profile slug format used by the form action", () => {
    assert.equal(isValidProfileSlug("augustin-mujyarugamba"), true);
    assert.equal(isValidProfileSlug("Bad Slug"), false);
    assert.equal(PERSON_PUBLIC_PATH_PREFIX, "/persone/");
  });

  it("duplicate slug error does not expose DB details", () => {
    const err = mapPostgresError({
      code: "23505",
      message: 'duplicate key value violates unique constraint "profiles_slug_key"',
      details: "Key (slug)=(ada)= already exists.",
    });
    const message = toUserMessage(err);
    assert.equal(err.code, "conflict");
    assert.match(message, /indirizzo è già utilizzato/i);
    assert.doesNotMatch(message, /profiles_slug_key|23505|SQLSTATE/i);
  });

  it("public /persone/[slug] route exists for P7.2 address preview", () => {
    const route = join(here, "../../app/persone/[slug]/page.tsx");
    assert.equal(existsSync(route), true);
    assert.equal(existsSync(join(here, "../../app/persone/page.tsx")), true);
  });
});
