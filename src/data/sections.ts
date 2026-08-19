import type { SectionContent } from "@/types/section";

/** CS-owned public section copy used by core routes. PI commercial sections omitted. */
export const sections: Record<string, SectionContent> = {
  eventi: {
    slug: "eventi",
    title: "Eventi",
    description:
      "Convegni, ricerche, forum e iniziative economiche pertinenti all’imprenditoria migrante, in Italia e nel mondo.",
    emptyTitle: "Nessun evento in programma.",
  },
  "notizie-e-guide": {
    slug: "notizie-e-guide",
    title: "Contenuti",
    description:
      "Notizie selezionate, analisi e materiali documentati sull’imprenditoria migrante e sulle relazioni economiche generate dalle migrazioni.",
    emptyTitle: "Nessun contenuto disponibile.",
  },
  osservatorio: {
    slug: "osservatorio",
    title: "Osservatorio",
    description:
      "Indicatori, serie statistiche e confronti per leggere l’imprenditoria migrante nelle diverse rotte origine → destinazione.",
    emptyTitle: "Nessun indicatore disponibile.",
  },
};
