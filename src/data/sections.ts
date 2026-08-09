import type { SectionContent } from "@/types/section";

export const sections = {
  imprese: {
    slug: "imprese",
    title: "Imprese",
    description:
      "Imprese nella rete: schede pubbliche, settori e percorsi imprenditoriali.",
    emptyTitle: "Nessuna impresa pubblicata per ora",
    emptyDescription:
      "Quando le imprese renderanno pubblica la propria scheda, compariranno qui.",
  },
  collaborazioni: {
    slug: "collaborazioni",
    title: "Collaborazioni",
    description:
      "Persone e organizzazioni che cercano o offrono una collaborazione.",
    emptyTitle: "Nessuna collaborazione pubblicata",
    emptyDescription:
      "Quando verranno pubblicate proposte di collaborazione, le troverai qui.",
  },
  opportunita: {
    slug: "opportunita",
    title: "Opportunità",
    description:
      "Bandi, progetti e occasioni utili per chi fa impresa o vuole sviluppare nuove iniziative.",
    emptyTitle: "Nessuna opportunità aperta in questo momento",
    emptyDescription:
      "Le opportunità pubbliche compariranno qui quando saranno disponibili.",
  },
  professionisti: {
    slug: "professionisti",
    title: "Professionisti",
    description:
      "Professionisti e competenze a supporto di imprese, reti e percorsi di sviluppo.",
    emptyTitle: "Nessun professionista pubblicato",
    emptyDescription:
      "Quando i professionisti pubblicheranno il profilo, li troverai qui.",
  },
  "lingue-e-mercati": {
    slug: "lingue-e-mercati",
    title: "Mercati internazionali",
    description:
      "Paesi e aree internazionali collegati a imprese, attività e relazioni della rete.",
    emptyTitle: "Nessun mercato pubblicato",
    emptyDescription:
      "I mercati internazionali pubblici compariranno qui quando saranno disponibili.",
  },
  eventi: {
    slug: "eventi",
    title: "Eventi",
    description:
      "Incontri, workshop e appuntamenti rilevanti per la comunità imprenditoriale.",
    emptyTitle: "Nessun evento in programma",
    emptyDescription:
      "Quando verranno pubblicati eventi pubblici, li troverai qui.",
  },
  "notizie-e-guide": {
    slug: "notizie-e-guide",
    title: "Notizie e guide",
    description:
      "Aggiornamenti, approfondimenti e materiali utili per orientarsi nel percorso imprenditoriale.",
    emptyTitle: "Nessuna notizia o guida pubblicata",
    emptyDescription:
      "Storie e guide pubbliche compariranno qui quando saranno disponibili.",
  },
  osservatorio: {
    slug: "osservatorio",
    title: "Osservatorio",
    description:
      "Indicatori e dati pubblicati per leggere l’imprenditoria di origine immigrata.",
    emptyTitle: "Nessun indicatore pubblicato",
    emptyDescription:
      "Gli indicatori dell’Osservatorio compariranno qui quando saranno disponibili.",
  },
  "chi-siamo": {
    slug: "chi-siamo",
    title: "Chi siamo",
    description:
      "La missione della piattaforma e il percorso con cui stiamo costruendo Immigrati Imprenditori.",
    emptyTitle: "Presentazione in aggiornamento",
    emptyDescription:
      "I contenuti di questa pagina saranno completati a breve.",
  },
  contatti: {
    slug: "contatti",
    title: "Contatti",
    description:
      "Canali e modalità per entrare in contatto con la piattaforma.",
    emptyTitle: "Contatti in aggiornamento",
    emptyDescription:
      "I recapiti e il modulo di contatto saranno disponibili a breve.",
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
