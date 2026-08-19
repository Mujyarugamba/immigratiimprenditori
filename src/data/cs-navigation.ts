import { centroStudiConfig } from "@immigrati/product-config";

/**
 * Public navigation during the editorial evolution of the Centro Studi.
 * Only implemented routes are exposed here; the target information architecture
 * is documented in docs/editorial/INFORMATION-ARCHITECTURE.md.
 */
export const csPrimaryNav = [
  { label: "Osservatorio", href: "/osservatorio" },
  { label: "Storie e interviste", href: "/storie" },
  { label: "Contenuti", href: "/contenuti" },
  { label: "Eventi", href: "/eventi" },
  { label: "Cultura", href: "/cultura" },
  { label: "Dati e fonti", href: "/dati-e-fonti" },
  { label: "Contribuisci", href: "/contribuisci" },
] as const;

export const csSiteName = centroStudiConfig.name;
export const csSiteDescription = centroStudiConfig.description;
