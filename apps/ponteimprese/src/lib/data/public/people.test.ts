import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  PUBLIC_PERSON_EXCLUDED_FIELDS,
  PUBLIC_PERSON_VISIBILITY_GATE,
  formatPersonTerritory,
  personMetadataDescription,
  type PublicPerson,
} from "./people";
import { PERSON_PUBLIC_PATH_PREFIX } from "@/lib/profile/slug";

const here = dirname(fileURLToPath(import.meta.url));

function samplePerson(overrides: Partial<PublicPerson> = {}): PublicPerson {
  return {
    id: "person-1",
    slug: "augustin-mujyarugamba",
    display_name: "Augustin Mujyarugamba",
    bio: "Imprenditore e mediatore culturale.",
    city: "Milano",
    province: "MI",
    region: "Lombardia",
    country: "Italia",
    website: "https://example.com",
    avatar_url: null,
    organization_name: null,
    role_description: null,
    ...overrides,
  };
}

describe("P7.3 public person profile", () => {
  it("documents profiles public visibility gate", () => {
    assert.deepEqual(PUBLIC_PERSON_VISIBILITY_GATE, {
      is_public: true,
      is_active: true,
      deleted_at: null,
    });
  });

  it("public select omits private/sensitive fields", () => {
    const source = readFileSync(join(here, "people.ts"), "utf8");
    const selectMatch = source.match(
      /PUBLIC_PERSON_SELECT\s*=\s*\n?\s*"([^"]+)"/,
    );
    assert.ok(selectMatch);
    const select = selectMatch![1];
    for (const field of PUBLIC_PERSON_EXCLUDED_FIELDS) {
      assert.equal(
        select.includes(field),
        false,
        `public select must not include ${field}`,
      );
    }
    assert.match(select, /display_name/);
    assert.match(select, /slug/);
    assert.match(select, /bio/);
    assert.equal(select.includes("phone"), false);
    assert.equal(select.includes("email"), false);
  });

  it("P7.2 path prefix matches real route", () => {
    assert.equal(PERSON_PUBLIC_PATH_PREFIX, "/persone/");
    assert.equal(
      existsSync(join(here, "../../../app/persone/[slug]/page.tsx")),
      true,
    );
  });

  it("metadata uses public bio only — never phone/email", () => {
    const person = samplePerson({
      bio: "Bio pubblica sicura",
    });
    const description = personMetadataDescription(person);
    assert.match(description, /Bio pubblica/);
    assert.doesNotMatch(description, /phone|email|@|uuid/i);
    assert.equal(
      "phone" in person && Boolean((person as { phone?: string }).phone),
      false,
    );
  });

  it("formats territory without inventing fields", () => {
    assert.equal(
      formatPersonTerritory(samplePerson()),
      "Milano, MI, Lombardia, Italia",
    );
    assert.equal(
      formatPersonTerritory(
        samplePerson({
          city: null,
          province: null,
          region: null,
          country: null,
        }),
      ),
      null,
    );
  });

  it("page uses notFound for missing/private and avoids private copy", () => {
    const page = readFileSync(
      join(here, "../../../app/persone/[slug]/page.tsx"),
      "utf8",
    );
    assert.match(page, /notFound\(\)/);
    assert.match(page, /getPublicPersonBySlug/);
    assert.doesNotMatch(page, /\bphone\b|\bemail\b|\bCTX\b|\bACT\b|\bRLS\b|\bUUID\b/i);
    assert.match(page, /Competenze e attività professionali/);
    assert.match(page, /Imprese collegate/);
  });

  it("query enforces is_public in app layer (owner defense-in-depth)", () => {
    const source = readFileSync(join(here, "people.ts"), "utf8");
    assert.match(source, /\.eq\("is_public",\s*true\)/);
    assert.match(source, /\.eq\("is_active",\s*true\)/);
    assert.equal(source.includes("createAdminClient"), false);
    assert.equal(source.includes("SERVICE_ROLE"), false);
    assert.equal(source.includes("getServiceRoleKey"), false);
  });
});
