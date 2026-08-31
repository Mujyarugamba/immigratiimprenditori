const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function spreadsheetSafeText(value: string): string {
  return FORMULA_PREFIX.test(value) ? `'${value}` : value;
}

export function csvCell(value: unknown): string {
  if (value == null) return "";
  const raw = typeof value === "string" ? spreadsheetSafeText(value) : String(value);
  return `"${raw.replaceAll('"', '""')}"`;
}
