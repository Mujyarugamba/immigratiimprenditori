/**
 * PI-local display metadata for World Bank M1 support resources.
 * Avoids importing the Centro Studi World Bank acquisition pipeline.
 */

const NATURAL_KEY_RE = /natural_key=(worldbank:[^\s|]+)/i;

export function parseNaturalKey(
  contactNote: string | null | undefined,
): string | null {
  if (!contactNote) return null;
  const m = NATURAL_KEY_RE.exec(contactNote);
  return m?.[1] ?? null;
}

export type WbIndicatorCode =
  | "SP.POP.TOTL"
  | "NY.GDP.MKTP.CD"
  | "NY.GDP.MKTP.KD.ZG"
  | "NY.GDP.PCAP.CD"
  | "NE.TRD.GNFS.ZS";

type WbIndicatorDisplay = {
  platformLabel: string;
  unit: string;
  definition: string;
};

export const WB_INDICATOR_CATALOG: Record<WbIndicatorCode, WbIndicatorDisplay> =
  {
    "SP.POP.TOTL": {
      platformLabel: "Popolazione totale",
      unit: "persons",
      definition:
        "Total population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.",
    },
    "NY.GDP.MKTP.CD": {
      platformLabel: "PIL (US$ correnti)",
      unit: "current US$",
      definition:
        "GDP at purchaser's prices in current U.S. dollars. Not constant, not PPP.",
    },
    "NY.GDP.MKTP.KD.ZG": {
      platformLabel: "Crescita PIL (variazione % annua)",
      unit: "percent (annual growth)",
      definition:
        "Annual percentage growth rate of GDP at market prices based on constant local currency.",
    },
    "NY.GDP.PCAP.CD": {
      platformLabel: "PIL pro capite (US$ correnti)",
      unit: "current US$ per person",
      definition:
        "GDP divided by midyear population, current U.S. dollars. Not PPP.",
    },
    "NE.TRD.GNFS.ZS": {
      platformLabel: "Commercio (% del PIL)",
      unit: "percent of GDP",
      definition:
        "Sum of exports and imports of goods and services as a share of GDP.",
    },
  };
