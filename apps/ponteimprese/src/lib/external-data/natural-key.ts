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

/** D1-C Mercati M1 — World Bank indicator observation natural key. */
export function worldbankIndicatorKey(parts: {
  indicatorCode: string;
  countryIso2: string;
  year: number;
}): string {
  const code = parts.indicatorCode.trim();
  const iso2 = parts.countryIso2.trim().toUpperCase();
  if (!code) throw new Error("worldbank indicatorCode required");
  if (!/^[A-Z]{2}$/.test(iso2)) {
    throw new Error(`worldbank countryIso2 must be ISO2: ${parts.countryIso2}`);
  }
  if (!Number.isInteger(parts.year) || parts.year < 1990 || parts.year > 2100) {
    throw new Error(`invalid year: ${parts.year}`);
  }
  return `worldbank:${code}:${iso2}:${parts.year}`;
}
