/** Stable logical keys for idempotent observation upserts (P-D). */

export function yearBounds(year: number): { start: string; end: string } {
  if (!Number.isInteger(year) || year < 1990 || year > 2100) {
    throw new Error(`invalid year: ${year}`);
  }
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

export function eurostatLfsaEsganKey(parts: {
  unit: string;
  wstatus: string;
  citizen: string;
  sex: string;
  age: string;
  geo: string;
  year: number;
}): string {
  return [
    "eurostat:lfsa_esgan",
    parts.unit,
    parts.wstatus,
    parts.citizen,
    parts.sex,
    parts.age,
    parts.geo,
    String(parts.year),
  ].join("|");
}

export function unioncamereStockKey(parts: {
  indicatorCode: string;
  territoryCode: string;
  year: number;
}): string {
  return `${parts.indicatorCode}|${parts.territoryCode}|${parts.year}`;
}
