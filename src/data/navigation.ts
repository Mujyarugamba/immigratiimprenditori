import type { NavItem } from "@/types/navigation";

/**
 * P4.5 primary nav = five ecosystems (not table inventory).
 * Professionisti reachable under Persone hub + Esplora.
 */
export const primaryNav: NavItem[] = [
  { label: "Persone", href: "/persone" },
  { label: "Imprese", href: "/imprese" },
  { label: "Opportunità", href: "/opportunita" },
  { label: "Mercati", href: "/mercati" },
  { label: "Servizi", href: "/servizi" },
];

/** Secondary: collaborations + transversal layers + site pages. */
export const moreNav: NavItem[] = [
  { label: "Collaborazioni", href: "/collaborazioni" },
  { label: "Professionisti", href: "/professionisti" },
  { label: "Eventi", href: "/eventi" },
  { label: "Notizie e guide", href: "/contenuti" },
  { label: "Osservatorio", href: "/osservatorio" },
  { label: "Organizzazioni", href: "/organizzazioni" },
  { label: "Chi siamo", href: "/chi-siamo" },
];

export const mainNav: NavItem[] = [...primaryNav, ...moreNav];

export const footerNav: NavItem[] = [
  ...mainNav,
  { label: "Contatti", href: "/contatti" },
  { label: "Pubblica", href: "/pubblica" },
];

export const publishCta: NavItem = {
  label: "Pubblica",
  href: "/pubblica",
};

export const loginCta: NavItem = {
  label: "Accedi",
  href: "/accedi",
};

export const signupCta: NavItem = {
  label: "Registrati",
  href: "/registrati",
};

export const appAreaCta: NavItem = {
  label: "Area riservata",
  href: "/app",
};
