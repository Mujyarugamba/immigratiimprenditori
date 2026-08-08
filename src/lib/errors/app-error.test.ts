import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapPostgresError, toUserMessage } from "./app-error";

describe("mapPostgresError", () => {
  it("maps SQLSTATE to AppError codes", () => {
    assert.equal(mapPostgresError({ code: "42501" }).code, "forbidden");
    assert.equal(mapPostgresError({ code: "23505" }).code, "conflict");
    assert.equal(mapPostgresError({ code: "55000" }).code, "account_state");
    assert.equal(mapPostgresError({ code: "P0002" }).code, "not_found");
  });

  it("never returns raw postgres text as user message for unknown", () => {
    const err = mapPostgresError({
      code: "XX000",
      message: "relation \"secret\" does not exist",
    });
    assert.equal(err.code, "unexpected");
    assert.doesNotMatch(toUserMessage(err), /secret/);
  });
});
