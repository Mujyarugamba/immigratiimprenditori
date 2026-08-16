type NavigationItem = {
  label: string;
  href: string;
};

type ProductConfig = {
  product: "centro-studi";
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

export const centroStudiConfig = {
  product: "centro-studi",
  name: "Immigrati Imprenditori — Centro Studi sull'Imprenditoria Migrante",
  description: "Centro editoriale e di ricerca sull'imprenditoria migrante.",
  plannedDomain: "immigratiimprenditori.it",
  brand: {
    primary: "#5a315e",
    accent: "#b85c45",
    surface: "#fbf7f0",
  },
  navigation: [
    { label: "Centro Studi", href: "#contenuto" },
    { label: "Osservatorio", href: "#contenuto" },
  ],
} as const satisfies ProductConfig;
