import { centroStudiConfig } from "@immigrati/product-config";

/**
 * Transitory CS public navigation (S2-GATE-BRAND still open).
 * Hrefs are in-app routes from CS-APP; no unapproved final domain.
 */
export const csPrimaryNav = [
  { label: "Eventi", href: "/eventi" },
  { label: "Cultura", href: "/cultura" },
  { label: "Notizie e guide", href: "/contenuti" },
  { label: "Osservatorio", href: "/osservatorio" },
  { label: "Dati e fonti", href: "/dati-e-fonti" },
] as const;

export const csSiteName = centroStudiConfig.name;
export const csSiteDescription = centroStudiConfig.description;
