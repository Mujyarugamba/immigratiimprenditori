import type { SectionContent } from "@/types/section";

/** CS-owned public section copy used by core routes. PI commercial sections omitted. */
export const sections: Record<string, SectionContent> = {
  eventi: {
    slug: "eventi",
    title: "Eventi",
    description: "Incontri, convegni e appuntamenti pertinenti all’imprenditoria migrante.",
    emptyTitle: "Nessun evento disponibile.",
  },
  "notizie-e-guide": {
    slug: "notizie-e-guide",
    title: "Analisi e ricerche",
    description:
      "Rapporti, ricerche, approfondimenti e contenuti documentati sull’imprenditoria migrante.",
    emptyTitle: "Nessuna analisi o ricerca disponibile.",
  },
  osservatorio: {
    slug: "osservatorio",
    title: "Osservatorio",
    description:
      "Ricerche, dati, indicatori e serie storiche per leggere l’imprenditoria migrante con fonti e metodologia esplicite.",
    emptyTitle: "Nessun indicatore disponibile.",
  },
};
