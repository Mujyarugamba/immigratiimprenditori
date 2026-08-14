import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  PRODUCTION_PROJECT_REF,
  parseGuardedCommand,
} from "./production-write-guard.mjs";

const options = {
  operation: "test write",
  modes: ["verify", "publish"],
  writeModes: ["publish"],
};

function refused(argv) {
  assert.throws(() => parseGuardedCommand(argv, options), /REFUSED:/);
}

test("no arguments cannot write", () => refused([]));
test("help is side-effect free", () => {
  assert.deepEqual(parseGuardedCommand(["--help"], options), {
    help: true,
    authorizedWrite: false,
    mode: null,
    projectRef: null,
    flags: {},
  });
});
test("apply alone is refused", () => refused(["--mode", "publish", "--apply"]));
test("yes alone is refused", () => refused(["--mode", "publish", "--yes"]));
test("project ref alone is refused", () =>
  refused(["--mode", "publish", "--project-ref", PRODUCTION_PROJECT_REF]));
test("apply and yes without project ref are refused", () =>
  refused(["--mode", "publish", "--apply", "--yes"]));
test("wrong project ref is refused", () =>
  refused(["--mode", "publish", "--apply", "--yes", "--project-ref", "wrong"]));
test("unknown argument is refused", () => refused(["--unknown"]));
test("duplicate arguments are refused", () =>
  refused(["--mode", "publish", "--mode", "publish"]));
test("complete authorization reaches only a stubbed downstream", () => {
  let downstreamCalls = 0;
  const parsed = parseGuardedCommand(
    ["--mode", "publish", "--apply", "--yes", "--project-ref", PRODUCTION_PROJECT_REF],
    options,
  );
  if (parsed.authorizedWrite) downstreamCalls += 1;
  assert.equal(downstreamCalls, 1);
});
test("service-role loader is not reached before authorization", () => {
  let serviceRoleRequests = 0;
  for (const argv of [[], ["--mode", "publish", "--apply"], ["--mode", "publish", "--yes"]]) {
    try {
      const parsed = parseGuardedCommand(argv, options);
      if (parsed.authorizedWrite) serviceRoleRequests += 1;
    } catch {}
  }
  assert.equal(serviceRoleRequests, 0);
});
test("verify mode remains read-only", () => {
  const parsed = parseGuardedCommand(["--mode", "verify"], options);
  assert.equal(parsed.authorizedWrite, false);
});
test("every Production-capable script guards before credentials or downstream", () => {
  const scripts = [
    "artifacts/ingestion/d1b2-prod-ingest.mjs",
    "artifacts/ingestion/d1b3-importer-regression.mjs",
    "artifacts/ingestion/d1b3-editorial-publish.mjs",
    "artifacts/ingestion/d1b4-resolve-questionable.mjs",
    "artifacts/ingestion/d1c3-prod-ingest.mjs",
    "artifacts/ingestion/d1c4-prod-editorial.mjs",
    "scripts/external-data/prod-ingest-contenuti.mjs",
    "scripts/external-data/d1d4-editorial-publish.mjs",
    "scripts/external-data/ingest-worldbank-indicators.ts",
    "scripts/external-data/ingest-contenuti-pilot.ts",
    "scripts/external-data/ingest-eurostat-lfsa-esgan.ts",
    "scripts/external-data/ingest-incentivi-gov-opendata.ts",
  ];
  for (const path of scripts) {
    const source = readFileSync(path, "utf8");
    const guardIndex = source.indexOf("parseGuardedCommand(process.argv.slice(2)");
    assert.ok(guardIndex >= 0, `${path} must use the shared guard`);
    const serviceRoleCall = source.indexOf("loadServiceRole();");
    if (serviceRoleCall >= 0) {
      assert.ok(guardIndex < serviceRoleCall, `${path} must guard before service-role access`);
    }
    const downstreamApply = source.indexOf('"--apply"');
    if (downstreamApply >= 0) {
      assert.ok(guardIndex < downstreamApply, `${path} must guard before downstream --apply`);
    }
  }
});

test("legacy production bypass flags are rejected", () => {
  refused(["--mode", "publish", "--allow-production"]);
});

test("extra operational flags are explicit, unique, and cannot authorize writes", () => {
  const extended = { ...options, extraBooleanFlags: ["--skip-check"] };
  assert.equal(parseGuardedCommand(["--mode", "verify", "--skip-check"], extended).flags["--skip-check"], true);
  assert.throws(() => parseGuardedCommand(["--mode", "verify", "--skip-check", "--skip-check"], extended), /duplicate/);
  assert.throws(() => parseGuardedCommand(["--mode", "publish", "--skip-check"], extended), /requires --apply --yes/);
});
