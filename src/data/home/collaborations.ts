import type { CollaborationRequest } from "@/types/home";

export const demoCollaborations: CollaborationRequest[] = [
  {
    id: "collab-1",
    isDemo: true,
    type: "Fornitura",
    title: "Ricerca fornitore di packaging alimentare",
    sector: "Agroalimentare",
    territory: "Lombardia",
    languages: ["Italiano", "Spagnolo"],
    description:
      "Richiesta dimostrativa di collaborazione per imballaggi sostenibili destinati a una rete di distribuzione locale.",
    publishedAt: "Pubblicata il 10/07/2026",
    href: "/collaborazioni",
  },
  {
    id: "collab-2",
    isDemo: true,
    type: "Partnership commerciale",
    title: "Partner per esportazione verso il Maghreb",
    sector: "Manifatturiero",
    territory: "Emilia-Romagna",
    languages: ["Italiano", "Francese", "Arabo"],
    description:
      "Contenuto di esempio per illustrare una ricerca di partner con conoscenza dei mercati del Nord Africa.",
    publishedAt: "Pubblicata il 08/07/2026",
    href: "/collaborazioni",
  },
  {
    id: "collab-3",
    isDemo: true,
    type: "Servizi professionali",
    title: "Supporto per apertura sede secondaria",
    sector: "Servizi alle imprese",
    territory: "Lazio",
    languages: ["Italiano", "Inglese"],
    description:
      "Scheda dimostrativa di una richiesta di consulenza per organizzazione societaria e adempimenti locali.",
    publishedAt: "Scadenza indicativa: 30/08/2026",
    href: "/collaborazioni",
  },
];
