import { createHash } from "node:crypto";

/** Canonical JSON (sorted keys) → SHA-256 hex. */
export function checksumSha256(value: unknown): string {
  const canonical = JSON.stringify(sortKeys(value));
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortKeys(obj[key]);
    }
    return out;
  }
  return value;
}
