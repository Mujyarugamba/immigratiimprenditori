import type { NavItem } from "@/types/navigation";

export const primaryNav: NavItem[] = [
  { label: "Imprese", href: "/imprese" },
  { label: "Collaborazioni", href: "/collaborazioni" },
  { label: "Opportunità", href: "/opportunita" },
  { label: "Professionisti", href: "/professionisti" },
  { label: "Lingue e mercati", href: "/lingue-e-mercati" },
  { label: "Eventi", href: "/eventi" },
  { label: "Osservatorio", href: "/osservatorio" },
];

export const moreNav: NavItem[] = [
  { label: "Notizie e guide", href: "/notizie-e-guide" },
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
