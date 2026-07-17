import type { SectionContent } from "@/types/section";

export const sections = {
  imprese: {
    slug: "imprese",
    title: "Imprese",
    description:
      "Uno spazio dedicato alle imprese di origine immigrata attive in Italia: profili, settori e percorsi imprenditoriali.",
    emptyTitle: "Elenco imprese in preparazione",
    emptyDescription:
      "Stiamo impostando la struttura della sezione. Non pubblichiamo ancora schede o elenchi di aziende.",
  },
  collaborazioni: {
    slug: "collaborazioni",
    title: "Collaborazioni",
    description:
      "Un punto di incontro per richieste di collaborazione tra imprese, professionisti e realtà del territorio.",
    emptyTitle: "Collaborazioni in preparazione",
    emptyDescription:
      "La sezione ospiterà richieste e proposte reali. Al momento non sono disponibili contenuti.",
  },
  opportunita: {
    slug: "opportunita",
    title: "Opportunità",
    description:
      "Bandi, progetti e occasioni utili per chi fa impresa o vuole sviluppare nuove iniziative.",
    emptyTitle: "Opportunità in preparazione",
    emptyDescription:
      "Le opportunità verranno pubblicate quando i contenuti saranno verificati e pronti.",
  },
  professionisti: {
    slug: "professionisti",
    title: "Professionisti",
    description:
      "Professionisti e competenze a supporto di imprese, reti e percorsi di sviluppo.",
    emptyTitle: "Elenco professionisti in preparazione",
    emptyDescription:
      "Stiamo definendo la struttura della sezione. Non ci sono ancora profili pubblicati.",
  },
  "lingue-e-mercati": {
    slug: "lingue-e-mercati",
    title: "Lingue e mercati",
    description:
      "Competenze linguistiche e aperture verso mercati internazionali collegate alle imprese e alle reti.",
    emptyTitle: "Lingue e mercati in preparazione",
    emptyDescription:
      "I contenuti di questa sezione saranno aggiunti in seguito, senza elenchi o dati inventati.",
  },
  eventi: {
    slug: "eventi",
    title: "Eventi",
    description:
      "Incontri, workshop e appuntamenti rilevanti per la comunità imprenditoriale.",
    emptyTitle: "Calendario eventi in preparazione",
    emptyDescription:
      "Non pubblichiamo ancora date o eventi. Il calendario sarà aggiornato quando disponibile.",
  },
  "notizie-e-guide": {
    slug: "notizie-e-guide",
    title: "Notizie e guide",
    description:
      "Aggiornamenti, approfondimenti e materiali utili per orientarsi nel percorso imprenditoriale.",
    emptyTitle: "Notizie e guide in preparazione",
    emptyDescription:
      "Articoli e guide verranno pubblicati progressivamente. Nessun contenuto fittizio in questa fase.",
  },
  osservatorio: {
    slug: "osservatorio",
    title: "Osservatorio",
    description:
      "Uno spazio per letture, analisi e materiali di contesto sull’imprenditoria di origine immigrata.",
    emptyTitle: "Osservatorio in preparazione",
    emptyDescription:
      "Analisi e materiali saranno pubblicati quando pronti. Nessuna statistica inventata.",
  },
  "chi-siamo": {
    slug: "chi-siamo",
    title: "Chi siamo",
    description:
      "La missione della piattaforma e il percorso con cui stiamo costruendo Immigrati Imprenditori.",
    emptyTitle: "Presentazione in preparazione",
    emptyDescription:
      "I contenuti istituzionali saranno completati nelle prossime fasi di sviluppo.",
  },
  contatti: {
    slug: "contatti",
    title: "Contatti",
    description:
      "Canali e modalità per entrare in contatto con la piattaforma.",
    emptyTitle: "Modulo contatti in preparazione",
    emptyDescription:
      "Il form e i recapiti ufficiali saranno attivati in una fase successiva.",
  },
  pubblica: {
    slug: "pubblica",
    title: "Pubblica",
    description:
      "Uno spazio per pubblicare richieste, segnalazioni e contenuti utili alla community.",
    emptyTitle: "Area pubblicazione in preparazione",
    emptyDescription:
      "Le funzioni di pubblicazione saranno rese disponibili dopo le fasi di progettazione e autenticazione.",
  },
} as const satisfies Record<string, SectionContent>;

export type SectionKey = keyof typeof sections;
