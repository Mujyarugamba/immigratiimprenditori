/**
 * Product / UX information architecture.
 * Does not alter DB bounded contexts; maps public routes into five ecosystems.
 */

export type EcosystemId =
  | "persone"
  | "imprese"
  | "opportunita"
  | "mercati"
  | "servizi";

export type EcosystemDef = {
  id: EcosystemId;
  label: string;
  href: string;
  tagline: string;
  description: string;
  /** Primary public routes belonging to this ecosystem */
  routes: string[];
  ctas: { label: string; href: string }[];
};

export const PLATFORM_IDENTITY =
  "Persone. Imprese. Opportunità. Mercati internazionali.";

export const PLATFORM_VALUE_PROPOSITION =
  "Una rete dove persone, imprese, opportunità, collaborazioni, servizi e mercati internazionali si incontrano.";

export const ecosystems: EcosystemDef[] = [
  {
    id: "persone",
    label: "Persone",
    href: "/persone",
    tagline: "Profili, competenze, professionisti",
    description:
      "Esplora profili e professionisti. Dopo l’accesso puoi completare il tuo profilo.",
    routes: ["/persone", "/professionisti"],
    ctas: [
      { label: "Esplora i professionisti", href: "/professionisti" },
      { label: "Crea il tuo profilo", href: "/registrati" },
    ],
  },
  {
    id: "imprese",
    label: "Imprese",
    href: "/imprese",
    tagline: "Imprese e relazioni",
    description:
      "Scopri imprese, settori, territori, servizi, mercati e collaborazioni.",
    routes: ["/imprese"],
    ctas: [
      { label: "Scopri le imprese", href: "/imprese" },
      { label: "Collega la tua impresa", href: "/app/imprese" },
    ],
  },
  {
    id: "opportunita",
    label: "Opportunità e collaborazioni",
    href: "/opportunita",
    tagline: "Trovare, proporre, collaborare",
    description:
      "Trova occasioni da cogliere oppure proposte di collaborazione.",
    routes: ["/opportunita", "/collaborazioni"],
    ctas: [
      { label: "Trova opportunità", href: "/opportunita" },
      { label: "Cerca collaborazioni", href: "/collaborazioni" },
    ],
  },
  {
    id: "mercati",
    label: "Mercati internazionali",
    href: "/mercati",
    tagline: "Paesi, interessi, relazioni estere",
    description:
      "Esplora paesi e mercati in cui imprese e professionisti della rete operano, sviluppano relazioni e crescono.",
    routes: ["/mercati"],
    ctas: [
      { label: "Esplora i mercati", href: "/mercati" },
      { label: "Indica i tuoi mercati", href: "/app" },
    ],
  },
  {
    id: "servizi",
    label: "Servizi per lavorare e crescere",
    href: "/servizi",
    tagline: "Offerte e richieste",
    description:
      "Offri un servizio o cercane uno: scegli tra offerte e richieste.",
    routes: ["/servizi"],
    ctas: [
      { label: "Offerte di servizio", href: "/servizi?tipo=offerta" },
      { label: "Richieste di servizio", href: "/servizi?tipo=richiesta" },
    ],
  },
];

/** Cross-cutting layers — enrich the network, do not define identity. */
export const transversalLayers = [
  {
    id: "eventi",
    label: "Eventi",
    href: "/eventi",
    description: "Incontri, workshop e appuntamenti.",
  },
  {
    id: "cultura",
    label: "Cultura",
    href: "/cultura",
    description:
      "Incontri culturali, persone e opportunità creative.",
  },
  {
    id: "contenuti",
    label: "Notizie e guide",
    href: "/contenuti",
    description: "Storie, notizie e guide utili.",
  },
  {
    id: "osservatorio",
    label: "Osservatorio",
    href: "/osservatorio",
    description: "Indicatori e dati sull’imprenditoria di origine immigrata.",
  },
  {
    id: "organizzazioni",
    label: "Organizzazioni",
    href: "/organizzazioni",
    description: "Associazioni, enti e organizzazioni.",
  },
] as const;

/** DB domain → UX ecosystem mapping (authoritative for IA). */
export const dbDomainToEcosystem: Record<string, EcosystemId | "trasversale"> = {
  profiles: "persone",
  professional_profiles: "persone",
  businesses: "imprese",
  opportunities: "opportunita",
  collaborations: "opportunita",
  international_markets: "mercati",
  international_market_presences: "mercati",
  service_offers: "servizi",
  service_requests: "servizi",
  events: "trasversale",
  contents: "trasversale",
  observatory_indicators: "trasversale",
  organizations: "trasversale",
};
