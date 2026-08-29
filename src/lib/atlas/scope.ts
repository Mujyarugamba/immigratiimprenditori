export const ATLAS_CORE_COUNTRIES = [
  { code: "IT", iso3: "ITA", slug: "italia", name: "Italia" },
  { code: "DE", iso3: "DEU", slug: "germania", name: "Germania" },
  { code: "FR", iso3: "FRA", slug: "francia", name: "Francia" },
  { code: "ES", iso3: "ESP", slug: "spagna", name: "Spagna" },
  { code: "GB", iso3: "GBR", slug: "regno-unito", name: "Regno Unito" },
  { code: "NL", iso3: "NLD", slug: "paesi-bassi", name: "Paesi Bassi" },
  { code: "US", iso3: "USA", slug: "stati-uniti", name: "Stati Uniti" },
  { code: "CA", iso3: "CAN", slug: "canada", name: "Canada" },
  { code: "MA", iso3: "MAR", slug: "marocco", name: "Marocco" },
  { code: "RO", iso3: "ROU", slug: "romania", name: "Romania" },
  { code: "CN", iso3: "CHN", slug: "cina", name: "Cina" },
  { code: "IN", iso3: "IND", slug: "india", name: "India" },
] as const;

export const ATLAS_EXPANSION_COUNTRIES = [
  { code: "BE", iso3: "BEL", slug: "belgio", name: "Belgio" },
  { code: "PT", iso3: "PRT", slug: "portogallo", name: "Portogallo" },
  { code: "AL", iso3: "ALB", slug: "albania", name: "Albania" },
  { code: "TN", iso3: "TUN", slug: "tunisia", name: "Tunisia" },
  { code: "SN", iso3: "SEN", slug: "senegal", name: "Senegal" },
  { code: "BD", iso3: "BGD", slug: "bangladesh", name: "Bangladesh" },
  { code: "TR", iso3: "TUR", slug: "turchia", name: "Turchia" },
  { code: "UA", iso3: "UKR", slug: "ucraina", name: "Ucraina" },
] as const;

export const ATLAS_COUNTRIES = [
  ...ATLAS_CORE_COUNTRIES,
  ...ATLAS_EXPANSION_COUNTRIES,
] as const;

export type AtlasCountry = (typeof ATLAS_COUNTRIES)[number];

export const ITALIAN_REGIONS = [
  "Abruzzo",
  "Basilicata",
  "Calabria",
  "Campania",
  "Emilia-Romagna",
  "Friuli-Venezia Giulia",
  "Lazio",
  "Liguria",
  "Lombardia",
  "Marche",
  "Molise",
  "Piemonte",
  "Puglia",
  "Sardegna",
  "Sicilia",
  "Toscana",
  "Trentino-Alto Adige/Südtirol",
  "Umbria",
  "Valle d'Aosta/Vallée d'Aoste",
  "Veneto",
] as const;

export const ITALIAN_LOCAL_PRIORITY = [
  "Milano",
  "Roma",
  "Torino",
  "Brescia",
  "Bergamo",
  "Bologna",
  "Firenze",
  "Napoli",
  "Verona",
  "Genova",
] as const;

export const FOREIGN_SUBNATIONAL_PRIORITY = [
  { countryCode: "FR", name: "Île-de-France", anchorCity: "Parigi" },
  { countryCode: "DE", name: "Baviera", anchorCity: "Monaco di Baviera" },
  { countryCode: "GB", name: "Greater London", anchorCity: "Londra" },
  { countryCode: "ES", name: "Catalogna", anchorCity: "Barcellona" },
] as const;

export const ATLAS_SCOPE_VERSION = "2026-08-22-v1";

export function isAtlasCountry(code: string) {
  const normalized = code.toUpperCase();
  return ATLAS_COUNTRIES.some(
    (country) => country.code === normalized || country.iso3 === normalized,
  );
}

export function getAtlasCountryBySlug(slug: string): AtlasCountry | undefined {
  return ATLAS_COUNTRIES.find((country) => country.slug === slug);
}

export function getAtlasCountryByCode(code: string): AtlasCountry | undefined {
  const normalized = code.toUpperCase();
  return ATLAS_COUNTRIES.find(
    (country) => country.code === normalized || country.iso3 === normalized,
  );
}

/**
 * Publication rule: being in this registry makes a geography eligible for the
 * first Atlas, not automatically public. A public page requires real data,
 * research, sources or stories. No empty country/territory pages.
 */
export const ATLAS_PUBLICATION_RULE =
  "eligible-only-with-substantive-evidence" as const;
