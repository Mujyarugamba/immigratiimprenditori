import type { SectionContent } from "@/types/section";

/** CS-owned public section copy used by core routes. PI commercial sections omitted. */
export const sections: Record<string, SectionContent> = {
  eventi: {
    slug: "eventi",
    title: "Eventi",
    description: "Scopri incontri, workshop e appuntamenti.",
    emptyTitle: "Nessun evento in programma.",
  },
  "notizie-e-guide": {
    slug: "notizie-e-guide",
    title: "Notizie e guide",
    description:
      "Aggiornamenti, approfondimenti e materiali utili per orientarsi nel percorso imprenditoriale.",
    emptyTitle: "Nessuna notizia o guida disponibile.",
  },
  osservatorio: {
    slug: "osservatorio",
    title: "Osservatorio",
    description:
      "Indicatori e dati per leggere l’imprenditoria di origine immigrata.",
    emptyTitle: "Nessun indicatore disponibile.",
  },
};
