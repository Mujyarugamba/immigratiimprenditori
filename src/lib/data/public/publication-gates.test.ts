import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

function readSibling(name: string) {
  return readFileSync(fileURLToPath(new URL(name, import.meta.url)), "utf8");
}

const REQUIRED_CONTENT_GATES = [
  '.eq("editorial_status", "ready")',
  '.eq("publication_status", "published")',
  '.eq("visibility_status", "public")',
  '.is("archived_at", null)',
] as const;

test("public content service keeps explicit publication gates", () => {
  const source = readSibling("./contents.ts");
  for (const gate of REQUIRED_CONTENT_GATES) {
    assert.ok(source.includes(gate), `contents.ts must include ${gate}`);
  }
});

test("public event service keeps explicit publication gates", () => {
  const source = readSibling("./events.ts");
  for (const gate of REQUIRED_CONTENT_GATES) {
    assert.ok(source.includes(gate), `events.ts must include ${gate}`);
  }
});

test("public collections and search exclude archived records", () => {
  for (const name of ["./collections.ts", "./search.ts"]) {
    const source = readSibling(name);
    assert.ok(source.includes('.is("archived_at", null)'), `${name} must exclude archived records`);
  }
});
