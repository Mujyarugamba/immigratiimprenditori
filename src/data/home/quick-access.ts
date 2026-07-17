import type { QuickAccessItem } from "@/types/home";

export const quickAccessItems: QuickAccessItem[] = [
  {
    id: "imprese",
    label: "Cerca imprese",
    href: "/imprese",
    description: "Profili e settori delle imprese registrate.",
  },
  {
    id: "opportunita",
    label: "Trova opportunità",
    href: "/opportunita",
    description: "Bandi, fiere, formazione e occasioni utili.",
  },
  {
    id: "collaborazioni",
    label: "Cerca collaborazioni",
    href: "/collaborazioni",
    description: "Richieste e proposte tra imprese e professionisti.",
  },
  {
    id: "professionisti",
    label: "Trova professionisti",
    href: "/professionisti",
    description: "Competenze a supporto della crescita aziendale.",
  },
  {
    id: "interprete",
    label: "Trova un interprete",
    href: "/lingue-e-mercati",
    description: "Supporto linguistico per mercati e relazioni.",
  },
  {
    id: "eventi",
    label: "Scopri eventi",
    href: "/eventi",
    description: "Networking, workshop, fiere e incontri B2B.",
  },
  {
    id: "racconta",
    label: "Racconta la tua impresa",
    href: "/pubblica",
    description: "Presenta attività, offerte e necessità.",
  },
];
