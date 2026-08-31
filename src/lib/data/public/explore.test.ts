import assert from "node:assert/strict";
import test from "node:test";
import { collectExplorerPages } from "./explore";

test("Explorer pagination collects beyond 2000 rows", async () => {
  const source = Array.from({ length: 2505 }, (_, index) => index);
  const ranges: Array<[number, number]> = [];
  const rows = await collectExplorerPages(async (from, to) => {
    ranges.push([from, to]);
    return source.slice(from, to + 1);
  });
  assert.equal(rows.length, 2505);
  assert.deepEqual(ranges, [[0, 999], [1000, 1999], [2000, 2999]]);
});

test("Explorer pagination checks one empty page for exact multiples", async () => {
  const source = Array.from({ length: 2000 }, (_, index) => index);
  const ranges: Array<[number, number]> = [];
  const rows = await collectExplorerPages(async (from, to) => {
    ranges.push([from, to]);
    return source.slice(from, to + 1);
  });
  assert.equal(rows.length, 2000);
  assert.deepEqual(ranges, [[0, 999], [1000, 1999], [2000, 2999]]);
});

test("Explorer pagination bounds page size", async () => {
  await assert.rejects(() => collectExplorerPages(async () => [], 1001));
});
