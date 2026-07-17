import type { EnterpriseItem } from "@/types/home";

export const demoEnterprises: EnterpriseItem[] = [
  {
    id: "ent-1",
    isDemo: true,
    name: "Impresa Demo Aurora",
    sector: "Ristorazione e food service",
    territory: "Milano e provincia",
    languages: ["Italiano", "Cinese", "Inglese"],
    description:
      "Profilo dimostrativo di un’impresa attiva nella ristorazione con attenzione a filiera e qualità.",
    offers: "Fornitura catering per eventi aziendali e menù personalizzati.",
    seeks:
      "Collaborazioni con produttori locali e supporto export di specialità.",
    href: "/imprese",
  },
  {
    id: "ent-2",
    isDemo: true,
    name: "Impresa Demo Horizon",
    sector: "Edilizia e impianti",
    territory: "Torino",
    languages: ["Italiano", "Rumeno", "Francese"],
    description:
      "Scheda di esempio per un’impresa edile specializzata in riqualificazione energetica.",
    offers: "Lavori di manutenzione, ristrutturazione e consulenza tecnica.",
    seeks: "Partner commerciali e professionisti per gare e progetti pubblici.",
    href: "/imprese",
  },
  {
    id: "ent-3",
    isDemo: true,
    name: "Impresa Demo Nexus",
    sector: "Servizi digitali",
    territory: "Roma",
    languages: ["Italiano", "Inglese", "Portoghese"],
    description:
      "Contenuto dimostrativo di un’impresa che sviluppa soluzioni digitali per PMI.",
    offers: "Siti web, e-commerce e accompagnamento alla digitalizzazione.",
    seeks: "Clienti nel terziario e collaborazioni con formatori e consulenti.",
    href: "/imprese",
  },
];
