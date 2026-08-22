import { ATLAS_COUNTRIES } from "@/lib/atlas/scope";
import { ATLAS_COUNTRY_CENTRES, type AtlasCoordinate } from "@/lib/atlas/map";

export const ITALIAN_REGION_CENTRES: Record<string, AtlasCoordinate> = {
  "IT-65": { lon: 13.8, lat: 42.2 },
  "IT-77": { lon: 16.1, lat: 40.5 },
  "IT-78": { lon: 16.35, lat: 38.9 },
  "IT-72": { lon: 14.9, lat: 40.9 },
  "IT-45": { lon: 11.0, lat: 44.5 },
  "IT-36": { lon: 13.0, lat: 46.1 },
  "IT-62": { lon: 12.7, lat: 41.9 },
  "IT-42": { lon: 8.8, lat: 44.3 },
  "IT-25": { lon: 9.9, lat: 45.6 },
  "IT-57": { lon: 13.15, lat: 43.4 },
  "IT-67": { lon: 14.7, lat: 41.7 },
  "IT-21": { lon: 7.9, lat: 45.05 },
  "IT-75": { lon: 16.6, lat: 41.0 },
  "IT-88": { lon: 9.0, lat: 40.0 },
  "IT-82": { lon: 14.0, lat: 37.6 },
  "IT-52": { lon: 11.0, lat: 43.4 },
  "IT-32": { lon: 11.2, lat: 46.4 },
  "IT-55": { lon: 12.5, lat: 42.95 },
  "IT-23": { lon: 7.3, lat: 45.75 },
  "IT-34": { lon: 11.9, lat: 45.65 },
};

export function coordinateForTerritoryCode(code: string | null | undefined): AtlasCoordinate | null {
  const normalized = code?.toUpperCase();
  if (!normalized) return null;
  if (ITALIAN_REGION_CENTRES[normalized]) return ITALIAN_REGION_CENTRES[normalized];
  const country = ATLAS_COUNTRIES.find(
    (candidate) => candidate.code === normalized || candidate.iso3 === normalized,
  );
  return country ? ATLAS_COUNTRY_CENTRES[country.code] : null;
}

export function isItalianRegionCode(code: string | null | undefined) {
  return Boolean(code && ITALIAN_REGION_CENTRES[code.toUpperCase()]);
}
