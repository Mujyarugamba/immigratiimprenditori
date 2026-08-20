import { centroStudiConfig } from "@immigrati/product-config";

/** Canonical public navigation for the Observatory and Study Centre. */
export const csPrimaryNav = [
  { label: "Osservatorio", href: "/osservatorio" },
  { label: "Storie e interviste", href: "/storie" },
  { label: "Rapporti e ricerche", href: "/rapporti" },
  { label: "Territori e rotte", href: "/territori" },
  { label: "Eventi", href: "/eventi" },
  { label: "Politiche e normative", href: "/politiche" },
  { label: "Fonti e metodologia", href: "/fonti" },
] as const;

export const csSiteName = centroStudiConfig.name;
export const csSiteDescription = centroStudiConfig.description;
