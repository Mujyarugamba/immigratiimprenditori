/**
 * D1-D.2 — Closed allowlist of Contenuti acquisition sources.
 * Exact hostnames only (plus explicit www equivalents). No wildcards.
 */

import type { LicenseClass } from "@/lib/external-data/types";

/** Acquisition mode for D1-D Contenuti: metadata + official link only. */
export type ContentsAcquisitionMode = "METADATA_LINK_ONLY";

/**
 * Stable source codes for the Contenuti pilot allowlist.
 * Align with external-data-source-registry where possible; Futurae is a
 * project label (MLPS + Unioncamere), not an autonomous juridical publisher.
 */
export type ContentsSourceCode =
  | "ismu-rapporti"
  | "minlavoro-stranieri-lavoro"
  | "emn-european-migration-network"
  | "futurae-mlps-unioncamere";

export type ContentsDocumentKind =
  | "publication"
  | "report"
  | "research"
  | "study"
  | "statistics"
  | "news"
  | "document"
  | "project_page";

/** Path constraints for hosts that must not open the whole site. */
export type ContentsHostPathRule = {
  hostname: string;
  /** Path must match at least one prefix (lowercase, leading slash). */
  pathPrefixes: readonly string[];
};

export type ContentsSourceAllowlistEntry = {
  sourceCode: ContentsSourceCode;
  name: string;
  responsiblePublisher: string;
  projectOrSeries: string | null;
  mainUrl: string;
  /** Exact hostnames (lowercase). No wildcards / no arbitrary subdomains. */
  allowedHostnames: readonly string[];
  /** Extra path rules for shared institutional hosts. */
  hostPathRules: readonly ContentsHostPathRule[];
  isActive: boolean;
  acquisitionMode: ContentsAcquisitionMode;
  licenseClass: LicenseClass;
  licenseNote: string;
  attribution: string;
  allowedDocumentKinds: readonly ContentsDocumentKind[];
  /** Registry cross-ref when the Contenuti code differs / specializes. */
  registryCrossRef: string;
  notes: string;
};

export const CONTENUTI_ACQUISITION = {
  domain: "contenuti" as const,
  acquisitionMode: "METADATA_LINK_ONLY" as const,
  autoPublish: false as const,
  /** Pilot quantities for D1-D.3 — not acquired in D1-D.2. */
  pilotCaps: {
    "ismu-rapporti": 8,
    "minlavoro-stranieri-lavoro": 5,
    "emn-european-migration-network": 4,
    "futurae-mlps-unioncamere": 3,
    total: 20,
  } as const,
  /** Existing content_types codes usable by the pilot. */
  allowedTypeCodes: [
    "news",
    "guide",
    "insight",
    "institutional_page",
  ] as const,
  /** Existing content_categories codes usable by the pilot. */
  allowedCategoryCodes: [
    "internationalization",
    "entrepreneurship",
    "regulation_compliance",
    "markets",
    "services_guidance",
    "events_community",
    "stories",
    "culture",
    "other",
  ] as const,
  /** Canonical AR defaults on future ingest (existing enums only). */
  ingestDefaults: {
    ownedByEditorial: true as const,
    editorialStatus: "draft" as const,
    publicationStatus: "unpublished" as const,
    visibilityStatus: "private" as const,
    bodyFormat: "markdown" as const,
  },
} as const;

export const CONTENUTI_SOURCE_ALLOWLIST: readonly ContentsSourceAllowlistEntry[] =
  [
    {
      sourceCode: "ismu-rapporti",
      name: "Fondazione ISMU ETS — rapporti e ricerche",
      responsiblePublisher: "Fondazione ISMU ETS",
      projectOrSeries: "Rapporti / pubblicazioni / ricerche sulle migrazioni",
      mainUrl: "https://www.ismu.org/",
      allowedHostnames: ["ismu.org", "www.ismu.org"],
      hostPathRules: [],
      isActive: true,
      acquisitionMode: "METADATA_LINK_ONLY",
      licenseClass: "CURATED_ONLY",
      licenseNote:
        "Copyright ISMU — LINKABLE / METADATA only; no full-text or PDF storage.",
      attribution: "Fonte: Fondazione ISMU ETS",
      allowedDocumentKinds: ["publication", "report", "research", "study"],
      registryCrossRef: "ismu-rapporti",
      notes: "Publications/reports/research only; not a primary stats producer.",
    },
    {
      sourceCode: "minlavoro-stranieri-lavoro",
      name: "Ministero del Lavoro e delle Politiche Sociali",
      responsiblePublisher: "Ministero del Lavoro e delle Politiche Sociali",
      projectOrSeries:
        "Rapporti / studi / statistiche / notizie / documenti istituzionali",
      mainUrl: "https://www.lavoro.gov.it/",
      allowedHostnames: ["lavoro.gov.it", "www.lavoro.gov.it"],
      hostPathRules: [],
      isActive: true,
      acquisitionMode: "METADATA_LINK_ONLY",
      licenseClass: "CURATED_ONLY",
      licenseNote:
        "Copyright ministeriale — METADATA/LINKABLE; no full report copy.",
      attribution: "Fonte: Ministero del Lavoro e delle Politiche Sociali",
      allowedDocumentKinds: [
        "report",
        "study",
        "statistics",
        "news",
        "document",
      ],
      registryCrossRef: "minlavoro-stranieri-lavoro",
      notes: "MLPS institutional host only; co-promoter of Futurae.",
    },
    {
      sourceCode: "emn-european-migration-network",
      name: "European Migration Network (EMN) / Italian NCP",
      responsiblePublisher: "EMN / Italian National Contact Point / Commissione UE",
      projectOrSeries: "EMN reports / studies",
      mainUrl:
        "https://home-affairs.ec.europa.eu/networks/european-migration-network-emn_en",
      allowedHostnames: [
        "emnitalyncp.it",
        "www.emnitalyncp.it",
        "home-affairs.ec.europa.eu",
      ],
      hostPathRules: [
        {
          hostname: "home-affairs.ec.europa.eu",
          pathPrefixes: [
            "/networks/european-migration-network",
            "/networks/european-migration-network-emn",
            "/pages/european-migration-network",
          ],
        },
      ],
      isActive: true,
      acquisitionMode: "METADATA_LINK_ONLY",
      licenseClass: "CURATED_ONLY",
      licenseNote:
        "EU / EMN copyright — LINKABLE / METADATA; no other national EMN hosts.",
      attribution: "Fonte: European Migration Network (EMN)",
      allowedDocumentKinds: ["report", "study", "publication", "document"],
      registryCrossRef: "emn-european-migration-network",
      notes:
        "Italian NCP + EC EMN pages only. Other national EMN hosts are rejected.",
    },
    {
      sourceCode: "futurae-mlps-unioncamere",
      name: "Progetto Futurae (MLPS – Unioncamere)",
      responsiblePublisher:
        "Ministero del Lavoro e delle Politiche Sociali + Unioncamere (progetto Futurae)",
      projectOrSeries: "Futurae / Osservatorio imprese straniere (narrative reports)",
      mainUrl:
        "https://www.unioncamere.gov.it/sistema-camerale/attivita/osservatorio-imprese-straniere",
      allowedHostnames: [
        "unioncamere.gov.it",
        "www.unioncamere.gov.it",
        "integrazionemigranti.gov.it",
        "www.integrazionemigranti.gov.it",
      ],
      hostPathRules: [
        {
          hostname: "unioncamere.gov.it",
          pathPrefixes: [
            "/sistema-camerale/attivita/osservatorio-imprese-straniere",
            "/futurae",
            "/osservatorio-imprese-straniere",
          ],
        },
        {
          hostname: "www.unioncamere.gov.it",
          pathPrefixes: [
            "/sistema-camerale/attivita/osservatorio-imprese-straniere",
            "/futurae",
            "/osservatorio-imprese-straniere",
          ],
        },
        {
          hostname: "integrazionemigranti.gov.it",
          pathPrefixes: ["/futurae", "/progetti/futurae", "/temi/futurae"],
        },
        {
          hostname: "www.integrazionemigranti.gov.it",
          pathPrefixes: ["/futurae", "/progetti/futurae", "/temi/futurae"],
        },
      ],
      isActive: true,
      acquisitionMode: "METADATA_LINK_ONLY",
      licenseClass: "CURATED_ONLY",
      licenseNote:
        "Public project reports — METADATA/LINK only; Futurae is not a juridical publisher; no CCIAA sites.",
      attribution: "Fonte: Progetto Futurae (MLPS – Unioncamere)",
      allowedDocumentKinds: ["report", "publication", "project_page", "document"],
      registryCrossRef: "unioncamere-futurae-osservatorio",
      notes:
        "Project/series under MLPS+Unioncamere. No autonomous publisher; no CCIAA auto-hosts.",
    },
  ];

const BY_CODE = new Map(
  CONTENUTI_SOURCE_ALLOWLIST.map((e) => [e.sourceCode, e] as const),
);

export function getContentsSource(
  sourceCode: string,
): ContentsSourceAllowlistEntry | undefined {
  return BY_CODE.get(sourceCode as ContentsSourceCode);
}

export function assertKnownContentsSource(
  sourceCode: string,
): ContentsSourceAllowlistEntry {
  const entry = getContentsSource(sourceCode);
  if (!entry) {
    throw new Error(`unknown contents source code: ${sourceCode}`);
  }
  if (!entry.isActive) {
    throw new Error(`inactive contents source code: ${sourceCode}`);
  }
  return entry;
}

export function listActiveContentsSourceCodes(): ContentsSourceCode[] {
  return CONTENUTI_SOURCE_ALLOWLIST.filter((e) => e.isActive).map(
    (e) => e.sourceCode,
  );
}
