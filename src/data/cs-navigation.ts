import { centroStudiConfig } from "@immigrati/product-config";

/**
 * Transitory CS public navigation.
 * Product name/description come from product-config (code-level brand).
 * Final domain/DNS remains BRAND_DOMAIN_CUTOVER = PENDING.
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
