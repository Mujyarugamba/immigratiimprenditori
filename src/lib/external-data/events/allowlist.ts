/**
 * D1-D.6 — Closed allowlist of Eventi acquisition sources.
 * Exact hostnames + path prefixes only. No wildcards / no implicit subdomains.
 * Metadata/link only. Auto-publish forbidden. No import in this GO.
 */

import type { LicenseClass } from "@/lib/external-data/types";

export type EventsAcquisitionMode = "METADATA_LINK_ONLY";

/**
 * Stable source codes for the Eventi pilot allowlist.
 * Distinct from Contenuti codes even when publishers overlap.
 */
export type EventsSourceCode =
  | "pim-ricerca-eventi"
  | "minlavoro-eventi"
  | "unioncamere-agenda"
  | "emn-home-affairs-events";

export type EventsHostPathRule = {
  hostname: string;
  /** Path must match at least one prefix (lowercase, leading slash). */
  pathPrefixes: readonly string[];
  /** Exact pathnames rejected even if a prefix would match. */
  pathExclusions?: readonly string[];
};

export type EventsSourceAllowlistEntry = {
  sourceCode: EventsSourceCode;
  name: string;
  responsiblePublisher: string;
  mainUrl: string;
  /** Exact hostnames (lowercase). No wildcards / no arbitrary subdomains. */
  allowedHostnames: readonly string[];
  hostPathRules: readonly EventsHostPathRule[];
  isActive: boolean;
  acquisitionMode: EventsAcquisitionMode;
  licenseClass: LicenseClass;
  licenseNote: string;
  attribution: string;
  language: string;
  /** Relevance / structural exclusions (editorial filter, not host wildcards). */
  exclusions: readonly string[];
  /** Final redirect must remain on this entry's host+path rules. */
  allowedRedirectPolicy: "same_source_allowlist";
  /** Polite acquisition guidance (no network I/O in this contract). */
  rateLimitNote: string;
  /** Lower number = preferred primary when cross-source duplicates merge. */
  crossSourcePriority: number;
  notes: string;
};

export const EVENTI_ACQUISITION = {
  domain: "eventi" as const,
  acquisitionMode: "METADATA_LINK_ONLY" as const,
  autoPublish: false as const,
  /**
   * Pilot quantities proposed for a later import GO — not acquired in D1-D.6.
   * Caps are ceilings; shortages must not be auto-compensated without human auth.
   */
  pilotCaps: {
    "pim-ricerca-eventi": 6,
    "minlavoro-eventi": 4,
    "unioncamere-agenda": 3,
    "emn-home-affairs-events": 3,
    total: 16,
  } as const,
  /** Existing event_types codes (seed catalog). */
  allowedTypeCodes: [
    "networking",
    "conference",
    "fair",
    "mission",
    "visit",
    "institutional",
    "course",
    "award",
    "cultural",
    "other",
  ] as const,
  /** Existing delivery_mode values on events / event_editions. */
  allowedDeliveryModes: ["in_presence", "online", "hybrid"] as const,
  ingestDefaults: {
    ownedByEditorial: true as const,
    editorialStatus: "draft" as const,
    publicationStatus: "unpublished" as const,
    visibilityStatus: "private" as const,
  },
} as const;

export const EVENTS_SOURCE_ALLOWLIST: readonly EventsSourceAllowlistEntry[] = [
  {
    sourceCode: "pim-ricerca-eventi",
    name: "Portale Integrazione Migranti — Ricerca eventi",
    responsiblePublisher:
      "Ministero del Lavoro e delle Politiche Sociali (Portale Integrazione Migranti)",
    mainUrl: "https://integrazionemigranti.gov.it/it-it/Ricerca-eventi",
    allowedHostnames: [
      "integrazionemigranti.gov.it",
      "www.integrazionemigranti.gov.it",
    ],
    hostPathRules: [
      {
        hostname: "integrazionemigranti.gov.it",
        pathPrefixes: ["/it-it/ricerca-eventi/dettaglio-evento/id/"],
      },
      {
        hostname: "www.integrazionemigranti.gov.it",
        pathPrefixes: ["/it-it/ricerca-eventi/dettaglio-evento/id/"],
      },
    ],
    isActive: true,
    acquisitionMode: "METADATA_LINK_ONLY",
    licenseClass: "CURATED_ONLY",
    licenseNote:
      "Public institutional portal — METADATA/LINK only; no page body/HTML/PDF/image storage.",
    attribution: "Fonte: Portale Integrazione Migranti (MLPS)",
    language: "it",
    exclusions: [
      "Non-detail listing pages (/Ricerca-eventi without Dettaglio-evento)",
      "Events outside entrepreneurship/work/training/economic inclusion (editorial relevance filter)",
      "Social mirrors; Eventbrite/Zoom/Forms as primary identity",
      "PDF attachments and embedded images",
    ],
    allowedRedirectPolicy: "same_source_allowlist",
    rateLimitNote: "≤1 req/s; prefer detail URLs already selected by curation; no bulk scrape.",
    crossSourcePriority: 1,
    notes:
      "Stable numeric external id in path /Dettaglio-evento/id/{n}. Title/date/venue available on detail cards. HTTPS.",
  },
  {
    sourceCode: "minlavoro-eventi",
    name: "Ministero del Lavoro — sezione Eventi",
    responsiblePublisher: "Ministero del Lavoro e delle Politiche Sociali",
    mainUrl: "https://www.lavoro.gov.it/eventi/Pagine/notizie",
    allowedHostnames: ["lavoro.gov.it", "www.lavoro.gov.it"],
    hostPathRules: [
      {
        hostname: "lavoro.gov.it",
        pathPrefixes: ["/eventi/pagine/"],
        pathExclusions: ["/eventi/pagine/notizie"],
      },
      {
        hostname: "www.lavoro.gov.it",
        pathPrefixes: ["/eventi/pagine/"],
        pathExclusions: ["/eventi/pagine/notizie"],
      },
    ],
    isActive: true,
    acquisitionMode: "METADATA_LINK_ONLY",
    licenseClass: "CURATED_ONLY",
    licenseNote:
      "Ministerial institutional pages — METADATA/LINK only; no full body/HTML storage.",
    attribution: "Fonte: Ministero del Lavoro e delle Politiche Sociali",
    language: "it",
    exclusions: [
      "Listing hub /eventi/Pagine/notizie (not an event card)",
      "Paths outside /eventi/pagine/{slug}",
      "Generic ministry news outside the Eventi section",
      "Third-party fair/Eventbrite/Zoom primary identity",
    ],
    allowedRedirectPolicy: "same_source_allowlist",
    rateLimitNote: "≤1 req/s; SharePoint paths case-insensitive; no site-wide crawl.",
    crossSourcePriority: 2,
    notes:
      "Detail cards under /eventi/pagine/{slug} (verified). Listing /eventi redirects to /eventi/Pagine/notizie. Path /eventi/pagine/ alone is 404; use slug cards.",
  },
  {
    sourceCode: "unioncamere-agenda",
    name: "Unioncamere — Agenda eventi",
    responsiblePublisher: "Unioncamere",
    mainUrl: "https://www.unioncamere.gov.it/",
    allowedHostnames: ["unioncamere.gov.it", "www.unioncamere.gov.it"],
    hostPathRules: [
      {
        hostname: "unioncamere.gov.it",
        pathPrefixes: ["/agenda/"],
      },
      {
        hostname: "www.unioncamere.gov.it",
        pathPrefixes: ["/agenda/"],
      },
    ],
    isActive: true,
    acquisitionMode: "METADATA_LINK_ONLY",
    licenseClass: "CURATED_ONLY",
    licenseNote:
      "Institutional agenda nodes (type evento) — METADATA/LINK only; no PDF/body storage.",
    attribution: "Fonte: Unioncamere",
    language: "it",
    exclusions: [
      "Agenda index /agenda (404 listing; acquire only /agenda/{slug} cards)",
      "Press releases under /comunicazione/",
      "Events unrelated to migrant entrepreneurship / self-employment / financial inclusion / Futurae",
      "Single CCIAA sites (not authorized)",
      "PDF allegati as primary identity",
    ],
    allowedRedirectPolicy: "same_source_allowlist",
    rateLimitNote: "≤1 req/s; curated slug selection only; relevance filter mandatory.",
    crossSourcePriority: 3,
    notes:
      "Drupal node--type-evento at /agenda/{slug} verified. Listing index unavailable (404). Relevance-gated.",
  },
  {
    sourceCode: "emn-home-affairs-events",
    name: "European Commission / EMN — Home Affairs events",
    responsiblePublisher:
      "European Commission — Directorate-General for Migration and Home Affairs (EMN network pages)",
    mainUrl: "https://home-affairs.ec.europa.eu/whats-new/events_en",
    allowedHostnames: ["home-affairs.ec.europa.eu"],
    hostPathRules: [
      {
        hostname: "home-affairs.ec.europa.eu",
        pathPrefixes: ["/whats-new/events"],
      },
    ],
    isActive: true,
    acquisitionMode: "METADATA_LINK_ONLY",
    licenseClass: "CURATED_ONLY",
    licenseNote:
      "EU institutional events — METADATA/LINK only; no full page/HTML storage; other DG/national hosts out.",
    attribution: "Fonte: European Migration Network / European Commission (Home Affairs)",
    language: "en",
    exclusions: [
      "Non-event Home Affairs policy pages",
      "Events not EMN / not relevant to economic migration, work, professional mobility, entrepreneurship, socioeconomic integration",
      "Other national EMN hosts (not listed)",
      "Social / Eventbrite / Zoom as primary identity",
    ],
    allowedRedirectPolicy: "same_source_allowlist",
    rateLimitNote: "≤1 req/2s; respect EC rate limits (429 observed on some language redirects).",
    crossSourcePriority: 4,
    notes:
      "Detail slugs under /whats-new/events/{slug}_{lang}. Listing /whats-new/events_en verified. Filter by EMN relevance editorially.",
  },
];

const BY_CODE = new Map(
  EVENTS_SOURCE_ALLOWLIST.map((e) => [e.sourceCode, e] as const),
);

export function getEventsSource(
  sourceCode: string,
): EventsSourceAllowlistEntry | undefined {
  return BY_CODE.get(sourceCode as EventsSourceCode);
}

export function assertKnownEventsSource(
  sourceCode: string,
): EventsSourceAllowlistEntry {
  const entry = getEventsSource(sourceCode);
  if (!entry) {
    throw new Error(
      `unknown or unauthorized events source code: ${sourceCode.trim() || "(empty)"}`,
    );
  }
  if (!entry.isActive) {
    throw new Error(`inactive events source code: ${entry.sourceCode}`);
  }
  return entry;
}

export function listActiveEventsSourceCodes(): EventsSourceCode[] {
  return EVENTS_SOURCE_ALLOWLIST.filter((e) => e.isActive).map(
    (e) => e.sourceCode,
  );
}

export function listEventsSourceCodes(): string[] {
  return listActiveEventsSourceCodes();
}

export function isEventsSourceCode(value: string): value is EventsSourceCode {
  return getEventsSource(value) != null;
}
