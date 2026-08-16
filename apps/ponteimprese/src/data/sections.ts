import type { SectionContent } from "@/types/section";

export const sections = {
  imprese: {
    slug: "imprese",
    title: "Imprese",
    description:
      "Scopri imprese, attività, settori, territori e relazioni.",
    emptyTitle: "Nessuna impresa disponibile.",
  },
  collaborazioni: {
    slug: "collaborazioni",
    title: "Collaborazioni",
    description:
      "Persone e organizzazioni che cercano o offrono una collaborazione.",
    emptyTitle: "Nessuna collaborazione disponibile.",
  },
  opportunita: {
    slug: "opportunita",
    title: "Opportunità",
    description:
      "Trova opportunità professionali e imprenditoriali.",
    emptyTitle: "Nessuna opportunità disponibile.",
  },
  professionisti: {
    slug: "professionisti",
    title: "Professionisti",
    description:
      "Trova professionisti, competenze ed esperienze a supporto di imprese e percorsi di sviluppo.",
    emptyTitle: "Nessun professionista disponibile.",
  },
  "lingue-e-mercati": {
    slug: "lingue-e-mercati",
    title: "Mercati internazionali",
    description:
      "Esplora paesi e mercati in cui imprese e professionisti della rete operano, sviluppano relazioni e crescono.",
    emptyTitle: "Nessun mercato disponibile.",
  },
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
      "Pubblica profilo, impresa, opportunità, servizi e mercati.",
    emptyTitle: "Pubblicazione",
    emptyDescription:
      "Scegli cosa pubblicare e completa l’azione dall’area riservata.",
  },
} as const satisfies Record<string, SectionContent>;

export type SectionKey = keyof typeof sections;
