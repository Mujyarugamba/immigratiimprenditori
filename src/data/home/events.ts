import type { EventItem } from "@/types/home";

export const demoEvents: EventItem[] = [
  {
    id: "evt-1",
    isDemo: true,
    type: "Networking",
    title: "Incontro di networking tra imprese",
    territory: "Milano",
    dateLabel: "Data dimostrativa: settembre 2026",
    description:
      "Evento di esempio per presentare occasioni di relazione tra imprese e professionisti.",
    href: "/eventi",
  },
  {
    id: "evt-2",
    isDemo: true,
    type: "Convegni",
    title: "Convegno su internazionalizzazione",
    territory: "Roma",
    dateLabel: "Data dimostrativa: ottobre 2026",
    description:
      "Scheda dimostrativa di un convegno dedicato a mercati e reti d’impresa.",
    href: "/eventi",
  },
  {
    id: "evt-3",
    isDemo: true,
    type: "Workshop",
    title: "Workshop su accesso al credito",
    territory: "Bologna",
    dateLabel: "Data dimostrativa: novembre 2026",
    description:
      "Contenuto di esempio per un laboratorio pratico rivolto alle PMI.",
    href: "/eventi",
  },
  {
    id: "evt-4",
    isDemo: true,
    type: "Fiere",
    title: "Spazio collettivo in fiera di settore",
    territory: "Verona",
    dateLabel: "Data dimostrativa: 2026",
    description:
      "Scheda dimostrativa di partecipazione collettiva a una fiera professionale.",
    href: "/eventi",
  },
  {
    id: "evt-5",
    isDemo: true,
    type: "Webinar",
    title: "Webinar su normative e adempimenti",
    territory: "Online",
    dateLabel: "Data dimostrativa: da definire",
    description:
      "Evento online di esempio dedicato a aggiornamenti utili alle imprese.",
    href: "/eventi",
  },
  {
    id: "evt-6",
    isDemo: true,
    type: "Incontri B2B",
    title: "Sessioni B2B con buyer selezionati",
    territory: "Napoli",
    dateLabel: "Data dimostrativa: da programmare",
    description:
      "Contenuto dimostrativo di incontri one-to-one tra domanda e offerta.",
    href: "/eventi",
  },
];
