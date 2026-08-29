import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function cssVar(source: string, name: string): string {
  const matches = [...source.matchAll(new RegExp(`${name}\\s*:\\s*(#[0-9a-fA-F]{6})`, "g"))];
  const value = matches.at(-1)?.[1];
  assert.ok(value, `Missing ${name}`);
  return value;
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

const globals = readFileSync(new URL("../../app/globals.css", import.meta.url), "utf8");
const accessibility = readFileSync(new URL("../../app/accessibility.css", import.meta.url), "utf8");

test("small-text accessibility tokens meet WCAG AA contrast on white", () => {
  const white = cssVar(globals, "--background");
  const subtle = cssVar(accessibility, "--color-ink-subtle");
  const accentDark = cssVar(accessibility, "--color-accent-dark");

  assert.ok(contrastRatio(subtle, white) >= 4.5, "ink-subtle must be >= 4.5:1 on white");
  assert.ok(contrastRatio(accentDark, white) >= 4.5, "accent-dark must be >= 4.5:1 on white");
});

test("focus indicator meets non-text contrast on light and dark shells", () => {
  const white = cssVar(globals, "--background");
  const navyDeep = cssVar(globals, "--navy-deep");
  const focus = cssVar(accessibility, "--gold-deep");

  assert.ok(contrastRatio(focus, white) >= 3, "focus indicator must be >= 3:1 on white");
  assert.ok(contrastRatio(focus, navyDeep) >= 3, "focus indicator must be >= 3:1 on navy");
  assert.match(
    accessibility,
    /:focus-visible\s*\{[\s\S]*?outline-color:\s*var\(--gold-deep\)/,
    "focus-visible must use the hardened token",
  );
});
