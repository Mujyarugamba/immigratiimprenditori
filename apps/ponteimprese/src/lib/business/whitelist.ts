import {
  BUSINESS_ACT_EDITABLE_FIELDS,
  type BusinessActUpdate,
} from "@/types/business";

export function pickBusinessActUpdate(
  input: Record<string, unknown>,
): BusinessActUpdate {
  const out: BusinessActUpdate = {};
  for (const key of BUSINESS_ACT_EDITABLE_FIELDS) {
    if (!(key in input)) continue;
    const value = input[key];
    if (key === "is_archived") {
      out.is_archived = value === true || value === "true" || value === "on";
      continue;
    }
    if (key === "founding_year") {
      if (value === "" || value == null) {
        out.founding_year = null;
      } else {
        const n = Number(value);
        if (!Number.isNaN(n)) out.founding_year = n;
      }
      continue;
    }
    if (value === undefined) continue;
    if (value === null || value === "") {
      if (key === "legal_name" || key === "public_name") continue;
      (out as Record<string, unknown>)[key] = null;
      continue;
    }
    (out as Record<string, unknown>)[key] = String(value);
  }
  return out;
}
