import type { SectionContent } from "@/types/section";

export const sections = {
  imprese: {
    slug: "imprese",
    title: "Imprese",
    description:
      "Imprese della rete: settori, territori e percorsi imprenditoriali.",
    emptyTitle: "Non ci sono ancora imprese da mostrare",
    emptyDescription:
      "Quando le imprese si presenteranno nella rete, le troverai qui.",
  },
  collaborazioni: {
    slug: "collaborazioni",
    title: "Collaborazioni",
    description:
      "Persone e organizzazioni che cercano o offrono una collaborazione.",
    emptyTitle: "Non ci sono collaborazioni pubblicate in questo momento",
    emptyDescription:
      "Quando ci saranno proposte di collaborazione, le troverai qui.",
  },
  opportunita: {
    slug: "opportunita",
    title: "Opportunità",
    description:
      "Bandi, progetti e occasioni utili per chi fa impresa o vuole sviluppare nuove iniziative.",
    emptyTitle: "Non ci sono opportunità disponibili in questo momento",
    emptyDescription:
      "Quando ci saranno occasioni da condividere, le troverai qui.",
  },
  professionisti: {
    slug: "professionisti",
    title: "Professionisti",
    description:
      "Professionisti e competenze a supporto di imprese, reti e percorsi di sviluppo.",
    emptyTitle: "Non ci sono ancora professionisti da mostrare",
    emptyDescription:
      "Quando i professionisti si presenteranno nella rete, li troverai qui.",
  },
  "lingue-e-mercati": {
    slug: "lingue-e-mercati",
    title: "Mercati internazionali",
    description:
      "Paesi e aree internazionali dove imprese e professionisti della rete operano e crescono.",
    emptyTitle: "Non ci sono ancora mercati da mostrare",
    emptyDescription:
      "Quando saranno disponibili paesi e aree internazionali, li troverai qui.",
  },
  eventi: {
    slug: "eventi",
    title: "Eventi",
    description:
      "Incontri, workshop e appuntamenti rilevanti per la comunità imprenditoriale.",
    emptyTitle: "Non ci sono eventi in programma",
    emptyDescription:
      "Quando ci saranno appuntamenti da condividere, li troverai qui.",
  },
  "notizie-e-guide": {
    slug: "notizie-e-guide",
    title: "Notizie e guide",
    description:
      "Aggiornamenti, approfondimenti e materiali utili per orientarsi nel percorso imprenditoriale.",
    emptyTitle: "Non ci sono ancora notizie o guide da mostrare",
    emptyDescription:
      "Quando ci saranno storie e guide da leggere, le troverai qui.",
  },
  osservatorio: {
    slug: "osservatorio",
    title: "Osservatorio",
    description:
      "Indicatori e dati per leggere l’imprenditoria di origine immigrata. Gli indicatori vengono pubblicati man mano che diventano disponibili.",
    emptyTitle: "Non ci sono ancora indicatori da mostrare",
    emptyDescription:
      "Gli indicatori dell’Osservatorio compariranno qui quando saranno disponibili.",
  },
  "chi-siamo": {
    slug: "chi-siamo",
    title: "Chi siamo",
    description:
      "Chi c’è dietro Immigrati Imprenditori e perché esiste questa rete.",
    emptyTitle: "Chi siamo",
    emptyDescription:
      "Una rete dedicata agli imprenditori di origine immigrata che operano in Italia.",
  },
  contatti: {
    slug: "contatti",
    title: "Contatti",
    description: "Come entrare in contatto con Immigrati Imprenditori.",
    emptyTitle: "Contatti",
    emptyDescription: "Scrivici: ti risponderemo appena possibile.",
  },
  pubblica: {
    slug: "pubblica",
    title: "Pubblica",
    description:
      "Percorsi per pubblicare profilo, impresa, opportunità, servizi e mercati nella rete.",
    emptyTitle: "Pubblicazione",
    emptyDescription:
      "Usa i percorsi disponibili per entrare nella rete e pubblicare la tua presenza.",
  },
} as const satisfies Record<string, SectionContent>;

export type SectionKey = keyof typeof sections;
