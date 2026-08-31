import assert from "node:assert/strict";
import test from "node:test";
import { csvCell, spreadsheetSafeText } from "./csv";

test("spreadsheet text neutralizes formula prefixes", () => {
  for (const value of ["=1+1", "+SUM(A1:A2)", "-cmd", "@IMPORT", "\tformula", "\rformula"]) {
    assert.equal(spreadsheetSafeText(value), `'${value}`);
  }
  assert.equal(spreadsheetSafeText("2026-08-31"), "2026-08-31");
});

test("csv cell escapes quotes while keeping numeric negatives numeric", () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell(-12.5), '"-12.5"');
  assert.equal(csvCell(null), "");
});
