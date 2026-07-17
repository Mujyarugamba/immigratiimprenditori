import type { NewsItem } from "@/types/home";

export const demoNews: NewsItem[] = [
  {
    id: "news-1",
    isDemo: true,
    type: "Notizie",
    title: "Rassegna: bandi e agevolazioni della settimana",
    description:
      "Contenuto dimostrativo su come verranno raccolte le notizie utili alle imprese.",
    publishedAt: "12/07/2026",
    href: "/notizie-e-guide",
  },
  {
    id: "news-2",
    isDemo: true,
    type: "Normative",
    title: "Scheda su adempimenti per nuove attività",
    description:
      "Contenuto di esempio dedicato a orientamento normativo per chi avvia o sviluppa un’impresa.",
    publishedAt: "10/07/2026",
    href: "/notizie-e-guide",
  },
  {
    id: "news-3",
    isDemo: true,
    type: "Guide pratiche",
    title: "Guida alla pubblicazione di una richiesta",
    description:
      "Guida dimostrativa su come formulare in modo chiaro una richiesta di collaborazione.",
    publishedAt: "08/07/2026",
    href: "/notizie-e-guide",
  },
  {
    id: "news-4",
    isDemo: true,
    type: "Approfondimenti",
    title: "Approfondimento su reti d’impresa",
    description:
      "Testo di esempio per mostrare lo spazio riservato ad analisi e letture di contesto.",
    publishedAt: "06/07/2026",
    href: "/notizie-e-guide",
  },
];
