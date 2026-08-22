export const ATLAS_CORE_COUNTRIES = [
  { code: "IT", slug: "italia", name: "Italia" },
  { code: "DE", slug: "germania", name: "Germania" },
  { code: "FR", slug: "francia", name: "Francia" },
  { code: "ES", slug: "spagna", name: "Spagna" },
  { code: "GB", slug: "regno-unito", name: "Regno Unito" },
  { code: "NL", slug: "paesi-bassi", name: "Paesi Bassi" },
  { code: "US", slug: "stati-uniti", name: "Stati Uniti" },
  { code: "CA", slug: "canada", name: "Canada" },
  { code: "MA", slug: "marocco", name: "Marocco" },
  { code: "RO", slug: "romania", name: "Romania" },
  { code: "CN", slug: "cina", name: "Cina" },
  { code: "IN", slug: "india", name: "India" },
] as const;

export const ATLAS_EXPANSION_COUNTRIES = [
  { code: "BE", slug: "belgio", name: "Belgio" },
  { code: "PT", slug: "portogallo", name: "Portogallo" },
  { code: "AL", slug: "albania", name: "Albania" },
  { code: "TN", slug: "tunisia", name: "Tunisia" },
  { code: "SN", slug: "senegal", name: "Senegal" },
  { code: "BD", slug: "bangladesh", name: "Bangladesh" },
  { code: "TR", slug: "turchia", name: "Turchia" },
  { code: "UA", slug: "ucraina", name: "Ucraina" },
] as const;

export const ATLAS_COUNTRIES = [
  ...ATLAS_CORE_COUNTRIES,
  ...ATLAS_EXPANSION_COUNTRIES,
] as const;

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
  return ATLAS_COUNTRIES.some((country) => country.code === code.toUpperCase());
}

/**
 * Publication rule: being in this registry makes a geography eligible for the
 * first Atlas, not automatically public. A public page requires real data,
 * research, sources or stories. No empty country/territory pages.
 */
export const ATLAS_PUBLICATION_RULE =
  "eligible-only-with-substantive-evidence" as const;
