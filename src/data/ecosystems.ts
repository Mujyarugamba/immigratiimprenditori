/**
 * P4.5 — Product / UX information architecture.
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
  /** Primary P4 routes belonging to this ecosystem */
  routes: string[];
  ctas: { label: string; href: string }[];
};

export const PLATFORM_IDENTITY =
  "Persone. Imprese. Opportunità. Mercati internazionali.";

export const PLATFORM_VALUE_PROPOSITION =
  "Una rete economica digitale dove persone, imprese, opportunità, collaborazioni, servizi e mercati internazionali si collegano — senza duplicare i fatti.";

export const ecosystems: EcosystemDef[] = [
  {
    id: "persone",
    label: "Persone",
    href: "/persone",
    tagline: "Identità, competenze, professionisti",
    description:
      "Le persone sono il primo nodo della rete. In v1 i profili professionali pubblici sono il punto di ingresso esplorabile; il profilo personale si attiva nell’area riservata.",
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
    tagline: "Schede impresa e relazioni pubbliche",
    description:
      "Le imprese sono nodi centrali: settori, territori, servizi, mercati e collaborazioni emergono dalla stessa scheda quando sono pubblici.",
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
      "Opportunità e collaborazioni restano modelli distinti, ma formano un unico ecosistema di necessità e proposte compatibili.",
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
    tagline: "Presenze, interessi, relazioni estere",
    description:
      "Un mercato è un ingresso, non solo un elenco paesi: imprese, attività e contenuti collegati emergono dalle relazioni reali.",
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
    tagline: "Offerte e richieste, distinte",
    description:
      "Offerte e richieste di servizio convivono nello stesso ecosistema, senza fondere i due aggregate root.",
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
    description: "Incontri, edizioni e contesti della rete.",
  },
  {
    id: "cultura",
    label: "Cultura",
    href: "/cultura",
    description:
      "Incontri culturali e connessioni pubbliche nella rete — non un sesto ecosistema.",
  },
  {
    id: "contenuti",
    label: "Notizie e guide",
    href: "/contenuti",
    description: "Narrazioni e guide collegate ai fatti pubblici.",
  },
  {
    id: "osservatorio",
    label: "Osservatorio",
    href: "/osservatorio",
    description: "Indicatori e serie pubblicate — livello dati, non brand.",
  },
  {
    id: "organizzazioni",
    label: "Organizzazioni",
    href: "/organizzazioni",
    description: "Attori istituzionali e associativi pubblici.",
  },
] as const;

/** DB domain → UX ecosystem mapping (authoritative for P4.5). */
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
