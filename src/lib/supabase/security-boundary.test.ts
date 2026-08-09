import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("service-role boundary", () => {
  it("14. browser client module does not import admin/service role", () => {
    const clientSrc = readFileSync(join(here, "client.ts"), "utf8");
    assert.doesNotMatch(clientSrc, /admin|SERVICE_ROLE|service_role/i);
  });

  it("admin module documents server-only usage", () => {
    const adminSrc = readFileSync(join(here, "admin.ts"), "utf8");
    assert.match(adminSrc, /Server-only|server-only/i);
    assert.match(adminSrc, /getServiceRoleKey/);
  });

  it("auth actions do not expose service role to client imports path", () => {
    const actions = readFileSync(
      join(here, "..", "auth", "actions.ts"),
      "utf8",
    );
    assert.doesNotMatch(actions, /createAdminClient|SERVICE_ROLE/);
    assert.match(actions, /ensureAccountProvisioned/);
  });

  it("P5 editorial actions use session client only", () => {
    const editorial = readFileSync(
      join(here, "..", "editorial", "actions.ts"),
      "utf8",
    );
    assert.doesNotMatch(editorial, /createAdminClient|SERVICE_ROLE|service_role/);
    assert.match(editorial, /isEditor/);
  });

  it("P5 admin actions use session RPC path only", () => {
    const adminActions = readFileSync(
      join(here, "..", "admin", "actions.ts"),
      "utf8",
    );
    assert.doesNotMatch(
      adminActions,
      /createAdminClient|SERVICE_ROLE|service_role/,
    );
    assert.match(adminActions, /requireApplicationAdmin|assignRole/);
    assert.match(adminActions, /self-elevate|auto-promozione/i);
  });

  it("P5 editorial data modules do not import admin client", () => {
    for (const file of ["contents.ts", "observatory.ts", "organizations.ts"]) {
      const src = readFileSync(
        join(here, "..", "data", "editorial", file),
        "utf8",
      );
      assert.doesNotMatch(src, /createAdminClient|SERVICE_ROLE/);
      assert.match(src, /createClient/);
    }
  });

  it("P6 proxy convention replaces deprecated middleware entrypoint", () => {
    const proxySrc = readFileSync(join(here, "..", "..", "proxy.ts"), "utf8");
    assert.match(proxySrc, /export async function proxy/);
    assert.doesNotMatch(proxySrc, /SERVICE_ROLE|createAdminClient/);
  });

  it("public data modules never import admin client", () => {
    const publicDir = join(here, "..", "data", "public");
    const files = [
      "businesses.ts",
      "contents.ts",
      "culture.ts",
      "observatory.ts",
      "organizations.ts",
    ];
    for (const file of files) {
      const src = readFileSync(join(publicDir, file), "utf8");
      assert.doesNotMatch(src, /createAdminClient|SERVICE_ROLE/);
    }
  });
});
