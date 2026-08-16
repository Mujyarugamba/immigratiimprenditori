type NavigationItem = {
  label: string;
  href: string;
};

type ProductConfig = {
  product: "ponteimprese";
  name: string;
  description: string;
  plannedDomain: string;
  brand: {
    primary: string;
    accent: string;
    surface: string;
  };
  navigation: readonly NavigationItem[];
};

export const ponteImpreseConfig = {
  product: "ponteimprese",
  name: "PonteImprese",
  description: "Piattaforma B2B per l'ecosistema imprenditoriale.",
  plannedDomain: "ponteimprese.com",
  brand: {
    primary: "#0c3d5b",
    accent: "#d06a32",
    surface: "#f4f7f9",
  },
  navigation: [
    { label: "Piattaforma", href: "#contenuto" },
    { label: "Accesso", href: "#contenuto" },
  ],
} as const satisfies ProductConfig;
