import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const vercelConfig = JSON.parse(
  readFileSync(new URL("../../../vercel.json", import.meta.url), "utf8"),
) as {
  git?: {
    deploymentEnabled?: Record<string, boolean> | boolean;
  };
};

test("Vercel skips work branches without disabling main or production", () => {
  const deploymentEnabled = vercelConfig.git?.deploymentEnabled;
  assert.equal(typeof deploymentEnabled, "object");
  assert.ok(deploymentEnabled && typeof deploymentEnabled === "object");

  assert.equal(deploymentEnabled["feature/*"], false);
  assert.equal(deploymentEnabled["work/*"], false);
  assert.equal(Object.hasOwn(deploymentEnabled, "main"), false);
  assert.equal(Object.hasOwn(deploymentEnabled, "production"), false);
});
