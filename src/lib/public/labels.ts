import type { FilterField } from "@/components/public/PublicFilters";

export function label(
  map: Record<string, string>,
  code: string | null | undefined,
): string {
  if (!code) return "";
  return map[code] ?? code.replaceAll("_", " ");
}

export function selectOptions(
  map: Record<string, string>,
): { value: string; label: string }[] {
  return Object.entries(map).map(([value, labelText]) => ({
    value,
    label: labelText,
  }));
}

export function formatItalianDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatItalianDateTime(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ORGANIZATION_FORMS: Record<string, string> = {
  sole_proprietorship: "Ditta individuale",
  company: "Società",
  cooperative: "Cooperativa",
  startup: "Startup",
  organized_professional_activity: "Attività professionale organizzata",
  social_enterprise: "Impresa sociale",
  economic_entity: "Entità economica",
  commercial_or_craft_activity: "Attività commerciale o artigianale",
};

export const MEMBERSHIP_ROLE_LABELS: Record<string, string> = {
  owner: "Titolare",
  partner: "Socio",
  administrator: "Amministratore",
  collaborator: "Collaboratore",
};

export const PRACTICE_MODES: Record<string, string> = {
  individual: "Esercizio individuale",
  individual_firm: "Studio individuale",
  associated_firm: "Studio associato",
  professional_company: "Società tra professionisti",
  consulting_company: "Società di consulenza",
  business_collaboration: "Collaborazione con Impresa",
  specialist_employee: "Dipendente con funzioni specialistiche",
  professional_network: "Rete professionale",
  external_professional: "Professionista esterno",
  occasional: "Attività occasionale",
  international_cross_border: "Attività internazionale o transfrontaliera",
};

export const OPPORTUNITY_ORIGINS: Record<string, string> = {
  external: "Esterna",
  internal: "Interna",
};

export const OPPORTUNITY_STATUSES: Record<string, string> = {
  announced: "Annunciata",
  suspended: "Sospesa",
  closed: "Chiusa",
  revoked: "Revocata",
  cancelled: "Annullata",
};

export const COLLABORATION_FORMS: Record<string, string> = {
  ricerca: "Ricerca",
  offerta: "Offerta",
  partnership: "Partnership",
  progetto: "Progetto",
  disponibilita_aperta: "Disponibilità aperta",
};

export const COLLABORATION_STATUSES: Record<string, string> = {
  open: "Aperta",
  closed: "Chiusa",
  cancelled: "Annullata",
};

export const SERVICE_CATEGORIES: Record<string, string> = {
  linguistic: "Servizi linguistici e interculturali",
  training: "Servizi formativi",
  professional_generic: "Servizi professionali generici",
  financial: "Servizi finanziari",
  real_estate: "Servizi immobiliari",
  cultural_creative: "Servizi culturali e creativi",
  support_other: "Supporto / altro",
};

export const SERVICE_DELIVERY_MODES: Record<string, string> = {
  in_person: "In presenza",
  remote: "Da remoto",
  hybrid: "Ibrido",
  unspecified: "Non specificato",
};

export const EVENT_DELIVERY_MODES: Record<string, string> = {
  in_presence: "In presenza",
  online: "Online",
  hybrid: "Ibrido",
};

export const EVENT_TYPES: Record<string, string> = {
  networking: "Networking / incontro",
  conference: "Convegno / conferenza / webinar / workshop",
  fair: "Fiera / esposizione",
  mission: "Missione imprenditoriale",
  visit: "Visita aziendale",
  institutional: "Istituzionale / associativo",
  course: "Corso / attività formativa",
  award: "Premiazione",
  cultural: "Culturale / sociale",
  other: "Altro",
};

export const EVENT_AUDIENCE: Record<string, string> = {
  persons: "Persone",
  businesses: "Imprese",
  both: "Persone e imprese",
};

export const EVENT_ECONOMIC: Record<string, string> = {
  free: "Gratuito",
  paid: "A pagamento",
  unspecified: "Non specificato",
};

export const EDITION_STATUSES: Record<string, string> = {
  scheduled: "Programmata",
  ongoing: "In corso",
  concluded: "Conclusa",
  postponed: "Posticipata",
  cancelled: "Annullata",
};

export const MARKET_KINDS: Record<string, string> = {
  country: "Paese",
  country_group: "Gruppo di paesi",
  transnational_region: "Regione transnazionale",
  economic_union: "Unione economica",
  linguistic_area: "Area linguistica",
  commercial_area: "Area commerciale",
  economic_corridor: "Corridoio economico",
  sectoral_international: "Settore internazionale",
};

export const MARKET_STATUSES: Record<string, string> = {
  proposed: "Proposto",
  active: "Attivo",
  featured: "In evidenza",
  maintenance: "In manutenzione",
  unmonitored: "Non monitorato",
};

export const ORGANIZATION_TYPES: Record<string, string> = {
  association: "Associazione",
  foundation: "Fondazione",
  public_body: "Ente / organismo pubblico",
  chamber_of_commerce: "Camera di commercio",
  embassy_consulate: "Ambasciata / Consolato",
  professional_order: "Ordine / Collegio professionale",
  university: "Università / ente di formazione",
  ngo: "ONG / ente non profit",
  institutional_network: "Rete / consorzio istituzionale",
  organized_community: "Comunità organizzata",
  other: "Altro",
};

export const OFFICIAL_ROLES: Record<string, string> = {
  legal_representative: "Rappresentante legale",
  president: "Presidente",
  director: "Direttore",
  secretary: "Segretario",
  spokesperson: "Portavoce",
  board_member: "Membro del consiglio",
  public_contact: "Referente pubblico",
  operational_contact: "Referente operativo",
  other: "Altro",
};

export const CONTENT_TYPES: Record<string, string> = {
  news: "Notizia",
  guide: "Guida",
  insight: "Approfondimento",
  interview: "Intervista",
  business_story: "Storia di Impresa",
  event_presentation: "Presentazione Evento",
  opportunity_presentation: "Presentazione Opportunità",
  service_presentation: "Presentazione Servizio",
  market_content: "Contenuto su Mercato",
  institutional_page: "Pagina informativa",
  personal_story: "Storia personale",
};

export const AVAILABILITY_STATUSES: Record<string, string> = {
  available: "Disponibile",
  limited: "Disponibilità limitata",
  unavailable: "Non disponibile",
  future: "Disponibile in futuro",
  case_by_case: "Da valutare caso per caso",
  temporarily_unavailable: "Temporaneamente non disponibile",
};

export const SERVICE_OFFER_AVAILABILITY: Record<string, string> = {
  available: "Disponibile",
  paused: "In pausa",
  unavailable: "Non disponibile",
};

export const SERVICE_REQUEST_STATUS: Record<string, string> = {
  open: "Aperta",
  in_evaluation: "In valutazione",
  concluded: "Conclusa",
  expired: "Scaduta",
};

export const BUSINESS_STATUSES: Record<string, string> = {
  active: "Attiva",
  ceased: "Cessata",
};

export const ACTIVITY_SCOPE_LABELS: Record<string, string> = {
  culture: "Cultura",
  heritage: "Patrimonio",
  creative_industries: "Industrie creative",
};

export const MEMBERSHIP_RELATION_LABELS: Record<string, string> = {
  active: "Attivo",
  ended: "Concluso",
  suspended: "Sospeso",
};

export const GRANT_STATUS_LABELS: Record<string, string> = {
  granted: "Gestione attiva",
  revoked: "Gestione revocata",
  none: "Solo collegamento",
};

export const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  public: "Pubblica",
  unpublished: "Non pubblicata",
  withdrawn: "Ritirata",
};

export const EDITORIAL_STATUS_LABELS: Record<string, string> = {
  draft: "Bozza",
  ready: "Pronto",
  published: "Pubblicato",
  withdrawn: "Ritirato",
};

export function textFilter(name: string, label: string, placeholder?: string): FilterField {
  return { kind: "text", name, label, placeholder };
}

export function selectFilter(
  name: string,
  label: string,
  map: Record<string, string>,
): FilterField {
  return { kind: "select", name, label, options: selectOptions(map) };
}
