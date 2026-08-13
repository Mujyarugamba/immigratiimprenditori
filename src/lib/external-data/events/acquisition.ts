/**
 * D1-D.5 — Authoritative Eventi acquisition contract (metadata/link only).
 * No real import in this GO. Allowlist is empty until a separate sources GO.
 */

import { checksumSha256 } from "@/lib/external-data/checksum";
import {
  assertKnownEventsSource,
  EVENTI_ACQUISITION,
  type EventsSourceAllowlistEntry,
  type EventsSourceCode,
} from "@/lib/external-data/events/allowlist";

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

export type EventsIdentityMethod =
  | "external_id"
  | "canonical_url"
  | "fingerprint";

export type EventsProvenance = {
  sourceCode: EventsSourceCode;
  canonicalUrl: string;
  externalId: string | null;
  originalTitle: string;
  organizerLabel: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
  deliveryMode: (typeof EVENTI_ACQUISITION.allowedDeliveryModes)[number];
  venueLabel: string | null;
  cityText: string | null;
  countryRef: string | null;
  onlineReference: string | null;
  language: string;
  retrievedAt: string;
  sourceUpdatedAt: string | null;
  requiredAttribution: string;
};

export type EventsEditorialMetadata = {
  titleIt: string;
  platformSummaryIt: string;
  descriptionStub: string;
  typeCode: (typeof EVENTI_ACQUISITION.allowedTypeCodes)[number];
  territoryLabel: string | null;
  sourceLink: string;
};

export type EventsIdentity = {
  naturalKey: string;
  externalId: string | null;
  canonicalUrl: string;
  fingerprint: string;
  identityMethod: EventsIdentityMethod;
};

export type EventsStoragePolicy = {
  storeFullPage: false;
  storeFullHtml: false;
  storeAttachments: false;
  storeUnauthorizedImages: false;
};

export type NormalizedExternalEvent = {
  naturalKey: string;
  identityMethod: EventsIdentityMethod;
  fingerprint: string;
  provenance: EventsProvenance;
  editorial: EventsEditorialMetadata;
  ownedByEditorial: true;
  editorialStatus: "draft";
  publicationStatus: "unpublished";
  visibilityStatus: "private";
  autoPublish: false;
  acquisitionMode: "METADATA_LINK_ONLY";
  storagePolicy: EventsStoragePolicy;
  sourceUrl: string;
  sourceLabel: string;
  checksumSha256: string;
};

export type EventsAcquisitionCandidate = {
  sourceCode: string;
  eventUrl: string;
  externalId?: string | null;
  originalTitle: string;
  organizerLabel?: string | null;
  startsAt: string;
  endsAt?: string | null;
  timezone: string;
  deliveryMode: (typeof EVENTI_ACQUISITION.allowedDeliveryModes)[number];
  venueLabel?: string | null;
  cityText?: string | null;
  countryRef?: string | null;
  onlineReference?: string | null;
  language?: string;
  retrievedAt?: string;
  sourceUpdatedAt?: string | null;
  titleIt: string;
  platformSummaryIt: string;
  descriptionStub: string;
  typeCode: (typeof EVENTI_ACQUISITION.allowedTypeCodes)[number];
  territoryLabel?: string | null;
  sourceFullHtml?: string | null;
  sourceAttachmentBase64?: string | null;
  unauthorizedImageUrl?: string | null;
};

export type ExistingEventsFingerprint = {
  naturalKey: string;
  checksumSha256: string;
  editorialStatus: "draft" | "ready";
  publicationStatus: "unpublished" | "published" | "withdrawn";
  visibilityStatus: "private" | "public";
  title: string;
  summary: string | null;
  typeCode: string;
  sourceTitleSha256: string;
  sourceSummarySha256: string;
};

export type EventsRefreshPlan = {
  action: "CREATE" | "UPDATE" | "UNCHANGED";
  naturalKey: string;
  refreshable: {
    sourceUrl: string;
    sourceLabel: string;
    checksumSha256: string;
    acquiredAt: string;
    sourceUpdatedAt: string | null;
    canonicalUrl: string;
    acquisitionFingerprint: string;
  };
  preserved: {
    editorialStatus: ExistingEventsFingerprint["editorialStatus"];
    publicationStatus: ExistingEventsFingerprint["publicationStatus"];
    visibilityStatus: ExistingEventsFingerprint["visibilityStatus"];
    title: string;
    summary: string | null;
    typeCode: string;
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

export type UrlSecurityErr = { ok: false; reason: string };
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
  entry: EventsSourceAllowlistEntry,
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

export function normalizeEventsUrl(raw: string): UrlSecurityResult {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return { ok: false, reason: "empty url" };
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
  if (!hostname) return { ok: false, reason: "missing hostname" };
  if (isLiteralIpHost(hostname)) {
    return { ok: false, reason: "literal ip rejected" };
  }
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
  clean.search = kept.toString() ? `?${kept.toString()}` : "";

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

export function assertEventsUrlAllowed(
  sourceCode: string,
  rawUrl: string,
): UrlSecurityOk {
  const entry = assertKnownEventsSource(sourceCode);
  const normalized = normalizeEventsUrl(rawUrl);
  if (!normalized.ok) {
    throw new Error(`url rejected: ${normalized.reason}`);
  }
  if (!hostnameMatchesAllowlist(normalized.hostname, entry.allowedHostnames)) {
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

export function eventsFingerprint(input: {
  sourceCode: string;
  originalTitle: string;
  startsAt: string;
  organizerLabel?: string | null;
  deliveryMode: string;
}): string {
  return checksumSha256({
    sourceCode: input.sourceCode.trim(),
    originalTitle: input.originalTitle.trim().toLowerCase(),
    startsAt: input.startsAt.trim(),
    organizerLabel: input.organizerLabel?.trim().toLowerCase() || null,
    deliveryMode: input.deliveryMode,
  });
}

/** Identity precedence: external id > canonical URL > fingerprint. */
export function eventsNaturalKey(input: {
  sourceCode: string;
  externalId?: string | null;
  canonicalUrl?: string | null;
  fingerprint: string;
}): EventsIdentity {
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

export function assertMetadataOnlyEventPayload(candidate: {
  sourceFullHtml?: string | null;
  sourceAttachmentBase64?: string | null;
  unauthorizedImageUrl?: string | null;
}): void {
  if (candidate.sourceFullHtml?.trim()) {
    throw new Error("full source HTML is not storable");
  }
  if (candidate.sourceAttachmentBase64?.trim()) {
    throw new Error("attachments are not storable");
  }
  if (candidate.unauthorizedImageUrl?.trim()) {
    throw new Error("unauthorized images are not storable");
  }
}

function assertDeliveryCoherence(candidate: EventsAcquisitionCandidate): void {
  const mode = candidate.deliveryMode;
  if (!EVENTI_ACQUISITION.allowedDeliveryModes.includes(mode)) {
    throw new Error(`invalid delivery_mode: ${mode}`);
  }
  if (mode === "in_presence") {
    const hasPlace =
      Boolean(candidate.venueLabel?.trim()) ||
      Boolean(candidate.cityText?.trim()) ||
      Boolean(candidate.countryRef?.trim());
    if (!hasPlace) {
      throw new Error("in_presence requires venue/city/country declaration");
    }
  }
  if (mode === "online" && !candidate.onlineReference?.trim()) {
    throw new Error("online requires online_reference");
  }
  if (mode === "hybrid") {
    const hasPlace =
      Boolean(candidate.venueLabel?.trim()) ||
      Boolean(candidate.cityText?.trim()) ||
      Boolean(candidate.countryRef?.trim()) ||
      Boolean(candidate.onlineReference?.trim());
    if (!hasPlace) {
      throw new Error("hybrid requires venue or online_reference");
    }
  }
}

export function eventsPublishAuthorization(): {
  importerMayPublish: false;
  requiresEditorialDecision: true;
} {
  return { importerMayPublish: false, requiresEditorialDecision: true };
}

/**
 * Normalize a candidate. Requires a known allowlisted source — with the
 * empty D1-D.5 allowlist this always rejects until a sources GO lands.
 */
export function normalizeEventsAcquisition(
  candidate: EventsAcquisitionCandidate,
): NormalizedExternalEvent {
  assertMetadataOnlyEventPayload(candidate);
  const entry = assertKnownEventsSource(candidate.sourceCode);
  if (!EVENTI_ACQUISITION.allowedTypeCodes.includes(candidate.typeCode)) {
    throw new Error(`invalid type_code: ${candidate.typeCode}`);
  }
  assertDeliveryCoherence(candidate);

  const titleIt = candidate.titleIt.trim();
  const platformSummaryIt = candidate.platformSummaryIt.trim();
  const descriptionStub = candidate.descriptionStub.trim();
  if (!titleIt || !platformSummaryIt || !descriptionStub) {
    throw new Error("title, summary and description stub are required");
  }
  if (!candidate.startsAt?.trim()) {
    throw new Error("startsAt is required");
  }
  if (!candidate.timezone?.trim()) {
    throw new Error("timezone is required");
  }

  const urlOk = assertEventsUrlAllowed(candidate.sourceCode, candidate.eventUrl);
  const fingerprint = eventsFingerprint({
    sourceCode: entry.sourceCode,
    originalTitle: candidate.originalTitle,
    startsAt: candidate.startsAt,
    organizerLabel: candidate.organizerLabel,
    deliveryMode: candidate.deliveryMode,
  });
  const identity = eventsNaturalKey({
    sourceCode: entry.sourceCode,
    externalId: candidate.externalId,
    canonicalUrl: urlOk.canonicalUrl,
    fingerprint,
  });

  const retrievedAt =
    candidate.retrievedAt?.trim() || new Date().toISOString();
  const sourceLabel = entry.requiredAttribution;

  const normalized: NormalizedExternalEvent = {
    naturalKey: identity.naturalKey,
    identityMethod: identity.identityMethod,
    fingerprint: identity.fingerprint,
    provenance: {
      sourceCode: entry.sourceCode,
      canonicalUrl: urlOk.canonicalUrl,
      externalId: identity.externalId,
      originalTitle: candidate.originalTitle.trim(),
      organizerLabel: candidate.organizerLabel?.trim() || null,
      startsAt: candidate.startsAt.trim(),
      endsAt: candidate.endsAt?.trim() || null,
      timezone: candidate.timezone.trim(),
      deliveryMode: candidate.deliveryMode,
      venueLabel: candidate.venueLabel?.trim() || null,
      cityText: candidate.cityText?.trim() || null,
      countryRef: candidate.countryRef?.trim() || null,
      onlineReference: candidate.onlineReference?.trim() || null,
      language: (candidate.language ?? "it").trim() || "it",
      retrievedAt,
      sourceUpdatedAt: candidate.sourceUpdatedAt?.trim() || null,
      requiredAttribution: sourceLabel,
    },
    editorial: {
      titleIt,
      platformSummaryIt,
      descriptionStub,
      typeCode: candidate.typeCode,
      territoryLabel: candidate.territoryLabel?.trim() || null,
      sourceLink: urlOk.canonicalUrl,
    },
    ownedByEditorial: true,
    editorialStatus: "draft",
    publicationStatus: "unpublished",
    visibilityStatus: "private",
    autoPublish: false,
    acquisitionMode: "METADATA_LINK_ONLY",
    storagePolicy: {
      storeFullPage: false,
      storeFullHtml: false,
      storeAttachments: false,
      storeUnauthorizedImages: false,
    },
    sourceUrl: urlOk.canonicalUrl,
    sourceLabel,
    checksumSha256: checksumSha256({
      naturalKey: identity.naturalKey,
      fingerprint: identity.fingerprint,
      startsAt: candidate.startsAt.trim(),
      titleIt,
      platformSummaryIt,
      typeCode: candidate.typeCode,
    }),
  };

  if (normalized.autoPublish !== false) {
    throw new Error("auto-publish is forbidden");
  }
  return normalized;
}

export function dedupeEventsCandidates(
  candidates: NormalizedExternalEvent[],
): {
  accepted: NormalizedExternalEvent[];
  rejected: { naturalKey: string; reason: string }[];
} {
  const seenKeys = new Set<string>();
  const seenUrls = new Set<string>();
  const accepted: NormalizedExternalEvent[] = [];
  const rejected: { naturalKey: string; reason: string }[] = [];

  for (const c of candidates) {
    if (seenKeys.has(c.naturalKey)) {
      rejected.push({
        naturalKey: c.naturalKey,
        reason: "duplicate natural key",
      });
      continue;
    }
    const url = c.provenance.canonicalUrl;
    if (url && seenUrls.has(url)) {
      rejected.push({
        naturalKey: c.naturalKey,
        reason: "duplicate canonical url",
      });
      continue;
    }
    seenKeys.add(c.naturalKey);
    if (url) seenUrls.add(url);
    accepted.push(c);
  }
  return { accepted, rejected };
}

export function planEventsRefresh(
  incoming: NormalizedExternalEvent,
  existing: ExistingEventsFingerprint | null,
): EventsRefreshPlan {
  if (incoming.autoPublish !== false) {
    throw new Error("auto-publish is forbidden on refresh");
  }
  if (!existing) {
    return {
      action: "CREATE",
      naturalKey: incoming.naturalKey,
      refreshable: {
        sourceUrl: incoming.sourceUrl,
        sourceLabel: incoming.sourceLabel,
        checksumSha256: incoming.checksumSha256,
        acquiredAt: incoming.provenance.retrievedAt,
        sourceUpdatedAt: incoming.provenance.sourceUpdatedAt,
        canonicalUrl: incoming.provenance.canonicalUrl,
        acquisitionFingerprint: incoming.fingerprint,
      },
      preserved: {
        editorialStatus: "draft",
        publicationStatus: "unpublished",
        visibilityStatus: "private",
        title: incoming.editorial.titleIt,
        summary: incoming.editorial.platformSummaryIt,
        typeCode: incoming.editorial.typeCode,
      },
      titleFromSource: true,
      summaryFromSource: true,
      autoPublish: false,
    };
  }

  const titleFromSource =
    !existing.sourceTitleSha256 ||
    checksumSha256(existing.title) === existing.sourceTitleSha256;
  const summaryFromSource =
    !existing.sourceSummarySha256 ||
    checksumSha256(existing.summary ?? "") === existing.sourceSummarySha256;

  const unchanged =
    existing.checksumSha256 === incoming.checksumSha256 &&
    existing.naturalKey === incoming.naturalKey;

  return {
    action: unchanged ? "UNCHANGED" : "UPDATE",
    naturalKey: incoming.naturalKey,
    refreshable: {
      sourceUrl: incoming.sourceUrl,
      sourceLabel: incoming.sourceLabel,
      checksumSha256: incoming.checksumSha256,
      acquiredAt: incoming.provenance.retrievedAt,
      sourceUpdatedAt: incoming.provenance.sourceUpdatedAt,
      canonicalUrl: incoming.provenance.canonicalUrl,
      acquisitionFingerprint: incoming.fingerprint,
    },
    preserved: {
      editorialStatus: existing.editorialStatus,
      publicationStatus: existing.publicationStatus,
      visibilityStatus: existing.visibilityStatus,
      title: titleFromSource
        ? incoming.editorial.titleIt
        : existing.title,
      summary: summaryFromSource
        ? incoming.editorial.platformSummaryIt
        : existing.summary,
      typeCode: existing.typeCode,
    },
    titleFromSource,
    summaryFromSource,
    autoPublish: false,
  };
}

