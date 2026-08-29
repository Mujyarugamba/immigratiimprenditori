import type { AtlasCountry } from "@/lib/atlas/scope";

export type AtlasCoordinate = {
  lon: number;
  lat: number;
};

/**
 * Representative country centres used only for the Atlas route overview.
 * They are cartographic anchors, not statistical centroids and are never used
 * as data values. The public map labels itself as a schematic route map.
 */
export const ATLAS_COUNTRY_CENTRES: Record<AtlasCountry["code"], AtlasCoordinate> = {
  IT: { lon: 12.5, lat: 42.8 },
  DE: { lon: 10.4, lat: 51.1 },
  FR: { lon: 2.2, lat: 46.2 },
  ES: { lon: -3.7, lat: 40.4 },
  GB: { lon: -3.4, lat: 55.4 },
  NL: { lon: 5.3, lat: 52.2 },
  US: { lon: -98.6, lat: 39.8 },
  CA: { lon: -106.3, lat: 56.1 },
  MA: { lon: -7.1, lat: 31.8 },
  RO: { lon: 24.9, lat: 45.9 },
  CN: { lon: 104.2, lat: 35.9 },
  IN: { lon: 78.9, lat: 20.6 },
  BE: { lon: 4.7, lat: 50.5 },
  PT: { lon: -8.0, lat: 39.5 },
  AL: { lon: 20.2, lat: 41.2 },
  TN: { lon: 9.5, lat: 33.9 },
  SN: { lon: -14.5, lat: 14.5 },
  BD: { lon: 90.4, lat: 23.7 },
  TR: { lon: 35.2, lat: 39.0 },
  UA: { lon: 31.2, lat: 48.4 },
};

export const ATLAS_MAP_WIDTH = 960;
export const ATLAS_MAP_HEIGHT = 480;

export function projectAtlasCoordinate({ lon, lat }: AtlasCoordinate) {
  return {
    x: ((lon + 180) / 360) * ATLAS_MAP_WIDTH,
    y: ((90 - lat) / 180) * ATLAS_MAP_HEIGHT,
  };
}

export function routeCurvePath(origin: AtlasCoordinate, destination: AtlasCoordinate) {
  const a = projectAtlasCoordinate(origin);
  const b = projectAtlasCoordinate(destination);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const distance = Math.hypot(b.x - a.x, b.y - a.y);
  const lift = Math.min(75, Math.max(16, distance * 0.12));
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${(my - lift).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}
