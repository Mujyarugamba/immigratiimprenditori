/**
 * D1-D.2 — Authoritative Contenuti acquisition contract (metadata/link only).
 * Reuses existing contents enums/catalogs; CASE A (no new tables).
 */

import { checksumSha256 } from "@/lib/external-data/checksum";
import {
  assertKnownContentsSource,
  CONTENUTI_ACQUISITION,
  getContentsSource,
  type ContentsDocumentKind,
  type ContentsSourceAllowlistEntry,
  type ContentsSourceCode,
} from "@/lib/external-data/contents/allowlist";

/** Tracking / analytics query params stripped during canonicalization. */
const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "gclsrc",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "igshid",
  "yclid",
  "_ga",
  "ref",
  "ref_src",
]);

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^\[?[0-9a-f:]+\]?$/i;

export type ContentsIdentityMethod =
  | "external_id"
  | "canonical_url"
  | "fingerprint";

export type ContentsContentProvenance = {
  sourceCode: ContentsSourceCode;
  canonicalUrl: string;
  externalId: string | null;
  originalTitle: string;
  publisherOrAuthor: string | null;
  publishedOn: string | null;
  updatedOn: string | null;
  language: string;
  documentType: ContentsDocumentKind;
  retrievedAt: string;
  requiredAttribution: string;
};

export type ContentsEditorialMetadata = {
  /** Italian title for the platform (may start from original title). */
  titleIt: string;
  /**
   * Original Italian summary written for the platform.
   * Must NOT be a verbatim copy of a protected source abstract.
   */
  platformSummaryIt: string;
  typeCode: (typeof CONTENUTI_ACQUISITION.allowedTypeCodes)[number];
  primaryCategoryCode:
    | (typeof CONTENUTI_ACQUISITION.allowedCategoryCodes)[number]
    | null;
  territoryLabel: string | null;
  /** Cover/image only when reuse is explicitly allowed. */
  coverUrl: string | null;
  imageReuseExplicitlyAllowed: boolean;
  sourceLink: string;
};

export type ContentsIdentity = {
  naturalKey: string;
  externalId: string | null;
  canonicalUrl: string;
  fingerprint: string;
  identityMethod: ContentsIdentityMethod;
};

export type ContentsStoragePolicy = {
  storeFullPage: false;
  storeFullPdf: false;
  storeFullArticleCopy: false;
  storeProtectedAbstractCopy: false;
  storeSourceBody: false;
};

/** Normalized acquisition record — ready for a later D1-D.3 importer. */
export type NormalizedExternalContent = {
  naturalKey: string;
  identityMethod: ContentsIdentityMethod;
  fingerprint: string;
  provenance: ContentsContentProvenance;
  editorial: ContentsEditorialMetadata;
  ownedByEditorial: true;
  editorialStatus: "draft";
  publicationStatus: "unpublished";
  visibilityStatus: "private";
  autoPublish: false;
  acquisitionMode: "METADATA_LINK_ONLY";
  storagePolicy: ContentsStoragePolicy;
  /**
   * Minimal non-blank body stub satisfying contents.body NOT NULL.
   * Never the source article/report text.
   */
  bodyStub: string;
  bodyFormat: "markdown";
  sourceUrl: string;
  sourceLabel: string;
  checksumSha256: string;
};

export type ContentsAcquisitionCandidate = {
  sourceCode: string;
  contentUrl: string;
  externalId?: string | null;
  originalTitle: string;
  publisherOrAuthor?: string | null;
  publishedOn?: string | null;
  updatedOn?: string | null;
  language?: string;
  documentType: ContentsDocumentKind;
  retrievedAt?: string;
  titleIt: string;
  platformSummaryIt: string;
  typeCode: (typeof CONTENUTI_ACQUISITION.allowedTypeCodes)[number];
  primaryCategoryCode?:
    | (typeof CONTENUTI_ACQUISITION.allowedCategoryCodes)[number]
    | null;
  territoryLabel?: string | null;
  coverUrl?: string | null;
  imageReuseExplicitlyAllowed?: boolean;
  /** Forbidden if present — contract rejects full-source storage. */
  sourceFullText?: string | null;
  sourcePdfBase64?: string | null;
  sourceProtectedAbstract?: string | null;
};

export type ExistingContentsFingerprint = {
  naturalKey: string;
  checksumSha256: string;
  /** Editorial axes — preserved on refresh. */
  editorialStatus: "draft" | "ready";
  publicationStatus: "unpublished" | "published" | "withdrawn";
  visibilityStatus: "private" | "public";
  title: string;
  abstract: string | null;
  primaryCategoryCode: string | null;
  /** SHA of last source-controlled title (empty if unknown/human-only). */
  sourceTitleSha256: string;
  /** SHA of last source-controlled platform summary. */
  sourceSummarySha256: string;
};

export type ContentsRefreshPlan = {
  action: "CREATE" | "UPDATE" | "UNCHANGED";
  naturalKey: string;
  /** Fields safe to refresh from source metadata. */
  refreshable: {
    sourceUrl: string;
    sourceLabel: string;
    checksumSha256: string;
    provenanceRetrievedAt: string;
    provenanceUpdatedOn: string | null;
  };
  /** Editorial fields that must not be clobbered when human-edited. */
  preserved: {
    editorialStatus: ExistingContentsFingerprint["editorialStatus"];
    publicationStatus: ExistingContentsFingerprint["publicationStatus"];
    visibilityStatus: ExistingContentsFingerprint["visibilityStatus"];
    title: string;
    abstract: string | null;
    primaryCategoryCode: string | null;
  };
  titleFromSource: boolean;
  summaryFromSource: boolean;
  autoPublish: false;
};

export type UrlSecurityOk = {
  ok: true;
  canonicalUrl: string;
  hostname: string;
  pathname: string;
};

export type UrlSecurityErr = {
  ok: false;
  reason: string;
};

export type UrlSecurityResult = UrlSecurityOk | UrlSecurityErr;

function isLiteralIpHost(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "");
  if (IPV4_RE.test(h)) return true;
  if (h.includes(":") && IPV6_RE.test(h)) return true;
  return false;
}

function hostnameMatchesAllowlist(
  hostname: string,
  allowed: readonly string[],
): boolean {
  const host = hostname.toLowerCase();
  return allowed.some((a) => a.toLowerCase() === host);
}

/**
 * Prefer apex over www when both are explicitly allowlisted,
 * so https://www.example.org/x and https://example.org/x are equivalent.
 */
function canonicalHostname(
  hostname: string,
  allowed: readonly string[],
): string {
  const host = hostname.toLowerCase();
  const allowedSet = new Set(allowed.map((a) => a.toLowerCase()));
  if (host.startsWith("www.")) {
    const apex = host.slice(4);
    if (allowedSet.has(apex)) return apex;
  }
  return host;
}

function pathAllowed(
  entry: ContentsSourceAllowlistEntry,
  hostname: string,
  pathname: string,
): boolean {
  const host = hostname.toLowerCase();
  const rules = entry.hostPathRules.filter(
    (r) => r.hostname.toLowerCase() === host,
  );
  if (rules.length === 0) return true;
  const path = pathname.toLowerCase() || "/";
  return rules.some((rule) =>
    rule.pathPrefixes.some((prefix) => {
      const p = prefix.toLowerCase().replace(/\/+$/, "") || "/";
      return path === p || path.startsWith(`${p}/`) || path.startsWith(p);
    }),
  );
}

/**
 * Normalize URL: https only, lowercase host, strip fragment + tracking,
 * collapse default ports, trim trailing slash (except root).
 */
export function normalizeContentsUrl(raw: string): UrlSecurityResult {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "empty url" };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: "malformed url" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "https required" };
  }
  if (parsed.username || parsed.password) {
    return { ok: false, reason: "embedded credentials rejected" };
  }
  const hostname = parsed.hostname.toLowerCase();
  if (!hostname) {
    return { ok: false, reason: "missing hostname" };
  }
  if (isLiteralIpHost(hostname)) {
    return { ok: false, reason: "literal ip rejected" };
  }
  // Reject userinfo-style leftovers and spaces.
  if (hostname.includes(" ") || hostname.includes("@")) {
    return { ok: false, reason: "invalid hostname" };
  }

  const clean = new URL(parsed.toString());
  clean.hash = "";
  clean.username = "";
  clean.password = "";
  clean.hostname = hostname;
  if (clean.port === "443") clean.port = "";

  const kept = new URLSearchParams();
  for (const [key, value] of clean.searchParams.entries()) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) continue;
    kept.append(key, value);
  }
  const qs = kept.toString();
  clean.search = qs ? `?${qs}` : "";

  let pathname = clean.pathname || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "");
  }
  clean.pathname = pathname;

  return {
    ok: true,
    canonicalUrl: clean.toString(),
    hostname,
    pathname: clean.pathname,
  };
}

/** Validate URL against a known source allowlist entry (host + path rules). */
export function assertContentsUrlAllowed(
  sourceCode: string,
  rawUrl: string,
): UrlSecurityOk {
  const entry = assertKnownContentsSource(sourceCode);
  const normalized = normalizeContentsUrl(rawUrl);
  if (!normalized.ok) {
    throw new Error(`url rejected: ${normalized.reason}`);
  }
  if (
    !hostnameMatchesAllowlist(normalized.hostname, entry.allowedHostnames)
  ) {
    throw new Error(
      `host not in allowlist for ${entry.sourceCode}: ${normalized.hostname}`,
    );
  }
  if (!pathAllowed(entry, normalized.hostname, normalized.pathname)) {
    throw new Error(
      `path not allowed for ${entry.sourceCode} on ${normalized.hostname}: ${normalized.pathname}`,
    );
  }
  const canonHost = canonicalHostname(
    normalized.hostname,
    entry.allowedHostnames,
  );
  if (canonHost !== normalized.hostname) {
    const rewritten = new URL(normalized.canonicalUrl);
    rewritten.hostname = canonHost;
    return {
      ok: true,
      canonicalUrl: rewritten.toString(),
      hostname: canonHost,
      pathname: normalized.pathname,
    };
  }
  return {
    ok: true,
    canonicalUrl: normalized.canonicalUrl,
    hostname: normalized.hostname,
    pathname: normalized.pathname,
  };
}

/**
 * Final URL after redirects must still be on the same source allowlist.
 * Callers supply the final location (no network I/O in this contract).
 */
export function assertContentsRedirectAllowed(
  sourceCode: string,
  finalUrl: string,
): UrlSecurityOk {
  return assertContentsUrlAllowed(sourceCode, finalUrl);
}

export function contentsFingerprint(input: {
  sourceCode: string;
  originalTitle: string;
  publishedOn?: string | null;
  publisherOrAuthor?: string | null;
  documentType: string;
}): string {
  return checksumSha256({
    sourceCode: input.sourceCode.trim(),
    originalTitle: input.originalTitle.trim().toLowerCase(),
    publishedOn: input.publishedOn?.trim() || null,
    publisherOrAuthor: input.publisherOrAuthor?.trim().toLowerCase() || null,
    documentType: input.documentType,
  });
}

/**
 * Identity precedence: external id > canonical URL > fingerprint.
 * Natural key is deterministic and stable across refresh.
 */
export function contentsNaturalKey(input: {
  sourceCode: ContentsSourceCode;
  externalId?: string | null;
  canonicalUrl?: string | null;
  fingerprint: string;
}): ContentsIdentity {
  const externalId = input.externalId?.trim() || null;
  if (externalId) {
    return {
      naturalKey: `${input.sourceCode}:id:${externalId}`,
      externalId,
      canonicalUrl: input.canonicalUrl?.trim() || "",
      fingerprint: input.fingerprint,
      identityMethod: "external_id",
    };
  }
  const url = input.canonicalUrl?.trim() || "";
  if (url) {
    return {
      naturalKey: `${input.sourceCode}:url:${url}`,
      externalId: null,
      canonicalUrl: url,
      fingerprint: input.fingerprint,
      identityMethod: "canonical_url",
    };
  }
  return {
    naturalKey: `${input.sourceCode}:fp:${input.fingerprint}`,
    externalId: null,
    canonicalUrl: "",
    fingerprint: input.fingerprint,
    identityMethod: "fingerprint",
  };
}

export function assertMetadataOnlyPayload(candidate: {
  sourceFullText?: string | null;
  sourcePdfBase64?: string | null;
  sourceProtectedAbstract?: string | null;
}): void {
  if (candidate.sourceFullText && candidate.sourceFullText.trim()) {
    throw new Error("full source body is not storable");
  }
  if (candidate.sourcePdfBase64 && candidate.sourcePdfBase64.trim()) {
    throw new Error("full PDF storage is forbidden");
  }
  if (
    candidate.sourceProtectedAbstract &&
    candidate.sourceProtectedAbstract.trim()
  ) {
    throw new Error("protected source abstract copy is forbidden");
  }
}

function assertTypeAndCategory(candidate: ContentsAcquisitionCandidate): void {
  if (
    !(CONTENUTI_ACQUISITION.allowedTypeCodes as readonly string[]).includes(
      candidate.typeCode,
    )
  ) {
    throw new Error(`type_code not in contents catalog: ${candidate.typeCode}`);
  }
  const cat = candidate.primaryCategoryCode ?? null;
  if (
    cat &&
    !(CONTENUTI_ACQUISITION.allowedCategoryCodes as readonly string[]).includes(
      cat,
    )
  ) {
    throw new Error(`primary_category_code not in catalog: ${cat}`);
  }
}

function assertDocumentKindAllowed(
  entry: ContentsSourceAllowlistEntry,
  documentType: ContentsDocumentKind,
): void {
  if (!entry.allowedDocumentKinds.includes(documentType)) {
    throw new Error(
      `document type ${documentType} not allowed for ${entry.sourceCode}`,
    );
  }
}

function buildBodyStub(input: {
  titleIt: string;
  attribution: string;
  sourceLink: string;
}): string {
  return [
    `Scheda di acquisizione metadata/link.`,
    ``,
    `Titolo: ${input.titleIt.trim()}`,
    ``,
    `${input.attribution}`,
    ``,
    `Link alla fonte: ${input.sourceLink}`,
    ``,
    `Il testo completo resta presso la fonte; questa scheda non conserva il corpo originale.`,
  ].join("\n");
}

/**
 * Normalize a curated acquisition candidate into the authoritative contract shape.
 * Does not write to DB. Never sets published/public. autoPublish is always false.
 */
export function normalizeContentsAcquisition(
  candidate: ContentsAcquisitionCandidate,
): NormalizedExternalContent {
  assertMetadataOnlyPayload(candidate);
  const entry = assertKnownContentsSource(candidate.sourceCode);
  assertDocumentKindAllowed(entry, candidate.documentType);
  assertTypeAndCategory(candidate);

  const titleIt = candidate.titleIt.trim();
  const summary = candidate.platformSummaryIt.trim();
  if (!titleIt) throw new Error("titleIt required");
  if (!summary) throw new Error("platformSummaryIt required");
  if (!candidate.originalTitle.trim()) {
    throw new Error("originalTitle required");
  }

  const urlOk = assertContentsUrlAllowed(
    entry.sourceCode,
    candidate.contentUrl,
  );

  const imageAllowed = candidate.imageReuseExplicitlyAllowed === true;
  let coverUrl: string | null = null;
  if (candidate.coverUrl?.trim()) {
    if (!imageAllowed) {
      throw new Error("cover/image excluded unless reuse explicitly allowed");
    }
    const coverOk = normalizeContentsUrl(candidate.coverUrl);
    if (!coverOk.ok) {
      throw new Error(`cover url rejected: ${coverOk.reason}`);
    }
    if (
      !hostnameMatchesAllowlist(coverOk.hostname, entry.allowedHostnames)
    ) {
      throw new Error("cover host not in source allowlist");
    }
    coverUrl = coverOk.canonicalUrl;
  }

  const fingerprint = contentsFingerprint({
    sourceCode: entry.sourceCode,
    originalTitle: candidate.originalTitle,
    publishedOn: candidate.publishedOn,
    publisherOrAuthor: candidate.publisherOrAuthor,
    documentType: candidate.documentType,
  });

  const identity = contentsNaturalKey({
    sourceCode: entry.sourceCode,
    externalId: candidate.externalId,
    canonicalUrl: urlOk.canonicalUrl,
    fingerprint,
  });

  const retrievedAt =
    candidate.retrievedAt?.trim() || new Date().toISOString();
  const attribution = entry.attribution;
  const bodyStub = buildBodyStub({
    titleIt,
    attribution,
    sourceLink: urlOk.canonicalUrl,
  });

  const provenance: ContentsContentProvenance = {
    sourceCode: entry.sourceCode,
    canonicalUrl: urlOk.canonicalUrl,
    externalId: identity.externalId,
    originalTitle: candidate.originalTitle.trim(),
    publisherOrAuthor: candidate.publisherOrAuthor?.trim() || null,
    publishedOn: candidate.publishedOn?.trim() || null,
    updatedOn: candidate.updatedOn?.trim() || null,
    language: (candidate.language ?? "it").trim() || "it",
    documentType: candidate.documentType,
    retrievedAt,
    requiredAttribution: attribution,
  };

  const editorial: ContentsEditorialMetadata = {
    titleIt,
    platformSummaryIt: summary,
    typeCode: candidate.typeCode,
    primaryCategoryCode: candidate.primaryCategoryCode ?? null,
    territoryLabel: candidate.territoryLabel?.trim() || null,
    coverUrl,
    imageReuseExplicitlyAllowed: imageAllowed,
    sourceLink: urlOk.canonicalUrl,
  };

  const checksum = checksumSha256({
    naturalKey: identity.naturalKey,
    provenance: {
      sourceCode: provenance.sourceCode,
      canonicalUrl: provenance.canonicalUrl,
      externalId: provenance.externalId,
      originalTitle: provenance.originalTitle,
      publisherOrAuthor: provenance.publisherOrAuthor,
      publishedOn: provenance.publishedOn,
      updatedOn: provenance.updatedOn,
      language: provenance.language,
      documentType: provenance.documentType,
    },
    editorial: {
      titleIt: editorial.titleIt,
      platformSummaryIt: editorial.platformSummaryIt,
      typeCode: editorial.typeCode,
      primaryCategoryCode: editorial.primaryCategoryCode,
      territoryLabel: editorial.territoryLabel,
      coverUrl: editorial.coverUrl,
    },
  });

  return {
    naturalKey: identity.naturalKey,
    identityMethod: identity.identityMethod,
    fingerprint: identity.fingerprint,
    provenance,
    editorial,
    ownedByEditorial: true,
    editorialStatus: CONTENUTI_ACQUISITION.ingestDefaults.editorialStatus,
    publicationStatus: CONTENUTI_ACQUISITION.ingestDefaults.publicationStatus,
    visibilityStatus: CONTENUTI_ACQUISITION.ingestDefaults.visibilityStatus,
    autoPublish: false,
    acquisitionMode: "METADATA_LINK_ONLY",
    storagePolicy: {
      storeFullPage: false,
      storeFullPdf: false,
      storeFullArticleCopy: false,
      storeProtectedAbstractCopy: false,
      storeSourceBody: false,
    },
    bodyStub,
    bodyFormat: "markdown",
    sourceUrl: urlOk.canonicalUrl,
    sourceLabel: attribution,
    checksumSha256: checksum,
  };
}

function shaText(value: string): string {
  return checksumSha256(value);
}

/**
 * Refresh plan: provenance/source link may update; editorial decisions,
 * human-edited title/summary, and categories are preserved.
 * Auto-publish is impossible (always false; never upgrades publication axes).
 */
export function planContentsRefresh(input: {
  incoming: NormalizedExternalContent;
  existing?: ExistingContentsFingerprint | null;
}): ContentsRefreshPlan {
  const { incoming, existing } = input;
  if (!existing) {
    return {
      action: "CREATE",
      naturalKey: incoming.naturalKey,
      refreshable: {
        sourceUrl: incoming.sourceUrl,
        sourceLabel: incoming.sourceLabel,
        checksumSha256: incoming.checksumSha256,
        provenanceRetrievedAt: incoming.provenance.retrievedAt,
        provenanceUpdatedOn: incoming.provenance.updatedOn,
      },
      preserved: {
        editorialStatus: incoming.editorialStatus,
        publicationStatus: incoming.publicationStatus,
        visibilityStatus: incoming.visibilityStatus,
        title: incoming.editorial.titleIt,
        abstract: incoming.editorial.platformSummaryIt,
        primaryCategoryCode: incoming.editorial.primaryCategoryCode,
      },
      titleFromSource: true,
      summaryFromSource: true,
      autoPublish: false,
    };
  }

  if (existing.naturalKey !== incoming.naturalKey) {
    throw new Error(
      `natural key mismatch on refresh: ${existing.naturalKey} vs ${incoming.naturalKey}`,
    );
  }

  const titleStillSourceControlled =
    existing.sourceTitleSha256 === "" ||
    existing.sourceTitleSha256 === shaText(existing.title);
  const summaryStillSourceControlled =
    existing.sourceSummarySha256 === "" ||
    (existing.abstract != null &&
      existing.sourceSummarySha256 === shaText(existing.abstract));

  const nextTitle = titleStillSourceControlled
    ? incoming.editorial.titleIt
    : existing.title;
  const nextAbstract = summaryStillSourceControlled
    ? incoming.editorial.platformSummaryIt
    : existing.abstract;
  const nextCategory = existing.primaryCategoryCode;

  const unchanged = existing.checksumSha256 === incoming.checksumSha256;

  return {
    action: unchanged ? "UNCHANGED" : "UPDATE",
    naturalKey: incoming.naturalKey,
    refreshable: {
      sourceUrl: incoming.sourceUrl,
      sourceLabel: incoming.sourceLabel,
      checksumSha256: incoming.checksumSha256,
      provenanceRetrievedAt: incoming.provenance.retrievedAt,
      provenanceUpdatedOn: incoming.provenance.updatedOn,
    },
    preserved: {
      // Never downgrade/upgrade publish decision via importer.
      editorialStatus: existing.editorialStatus,
      publicationStatus: existing.publicationStatus,
      visibilityStatus: existing.visibilityStatus,
      title: nextTitle,
      abstract: nextAbstract,
      primaryCategoryCode: nextCategory,
    },
    titleFromSource: titleStillSourceControlled,
    summaryFromSource: summaryStillSourceControlled,
    autoPublish: false,
  };
}

/** Resolve duplicate among candidates by identity precedence. */
export function dedupeContentsCandidates(
  records: readonly NormalizedExternalContent[],
): {
  unique: NormalizedExternalContent[];
  rejectedDuplicates: { naturalKey: string; reason: string }[];
} {
  const byKey = new Map<string, NormalizedExternalContent>();
  const byUrl = new Map<string, string>();
  const rejectedDuplicates: { naturalKey: string; reason: string }[] = [];

  for (const rec of records) {
    const url = rec.provenance.canonicalUrl;
    const priorKeyForUrl = byUrl.get(url);
    if (priorKeyForUrl && priorKeyForUrl !== rec.naturalKey) {
      rejectedDuplicates.push({
        naturalKey: rec.naturalKey,
        reason: `equivalent canonical url already mapped to ${priorKeyForUrl}`,
      });
      continue;
    }
    if (byKey.has(rec.naturalKey)) {
      rejectedDuplicates.push({
        naturalKey: rec.naturalKey,
        reason: "duplicate natural key",
      });
      continue;
    }
    byKey.set(rec.naturalKey, rec);
    byUrl.set(url, rec.naturalKey);
  }

  return { unique: [...byKey.values()], rejectedDuplicates };
}

/** Contract-level: acquisition cannot publish; admin≠editor at RLS. */
export function contentsPublishAuthorization(input: {
  isEditor: boolean;
  isApplicationAdmin: boolean;
  viaImporterAutoPublish: boolean;
}): { allowed: boolean; reason: string } {
  if (input.viaImporterAutoPublish) {
    return {
      allowed: false,
      reason: "auto-publish forbidden by Contenuti acquisition contract",
    };
  }
  // DB policy contents_update_editorial requires access_is_editor().
  if (!input.isEditor) {
    return {
      allowed: false,
      reason:
        "publish requires access_is_editor(); application admin without editorial role cannot publish",
    };
  }
  return { allowed: true, reason: "editor via existing publish workflow" };
}

export function isContentsSourceCode(value: string): value is ContentsSourceCode {
  return getContentsSource(value) != null;
}
