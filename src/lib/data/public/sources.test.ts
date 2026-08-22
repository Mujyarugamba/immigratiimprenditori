import assert from "node:assert/strict";
import test from "node:test";
import { summarizePublicSourceUsage } from "./sources";

test("source registry summarizes only linked public source usage", () => {
  const indicators = [
    { id: "i-1", title: "Imprese a titolarità straniera", periodicity: "annual" },
    { id: "i-2", title: "Lavoro autonomo per luogo di nascita", periodicity: "quarterly" },
  ];

  const values = [
    {
      source_id: "source-a",
      indicator_id: "i-1",
      period_start: "2024-01-01",
      period_end: "2024-12-31",
      territory_label: "Lombardia",
      quality_code: "official",
      methodology_note: "Valore di fonte camerale.",
    },
    {
      source_id: "source-a",
      indicator_id: "i-2",
      period_start: "2025-01-01",
      period_end: "2025-03-31",
      territory_label: "Italia",
      quality_code: "derived",
      methodology_note: "Serie armonizzata dal Centro Studi.",
    },
    {
      source_id: "source-b",
      indicator_id: "i-1",
      period_start: "2023-01-01",
      period_end: "2023-12-31",
      territory_label: "Piemonte",
      quality_code: "official",
      methodology_note: null,
    },
  ];

  const summary = summarizePublicSourceUsage("source-a", values, indicators);

  assert.equal(summary.publishedValueCount, 2);
  assert.deepEqual(summary.indicatorTitles, [
    "Imprese a titolarità straniera",
    "Lavoro autonomo per luogo di nascita",
  ]);
  assert.deepEqual(summary.periodicities, ["annual", "quarterly"]);
  assert.deepEqual(summary.coverageLabels, ["Italia", "Lombardia"]);
  assert.equal(summary.periodStart, "2024-01-01");
  assert.equal(summary.periodEnd, "2025-03-31");
  assert.deepEqual(summary.qualityCodes, ["derived", "official"]);
  assert.deepEqual(summary.valueMethodologyNotes, [
    "Serie armonizzata dal Centro Studi.",
    "Valore di fonte camerale.",
  ]);
});

test("source registry returns an explicit empty summary when no values are linked", () => {
  const summary = summarizePublicSourceUsage("missing", [], []);

  assert.deepEqual(summary, {
    publishedValueCount: 0,
    indicatorTitles: [],
    periodicities: [],
    coverageLabels: [],
    periodStart: null,
    periodEnd: null,
    qualityCodes: [],
    valueMethodologyNotes: [],
  });
});
