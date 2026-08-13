/**
 * D1-D.5 — Eventi acquisition allowlist scaffold.
 * Empty by design: real sources require a separate human GO.
 */

export const EVENTI_ACQUISITION = {
  acquisitionMode: "METADATA_LINK_ONLY" as const,
  autoPublish: false as const,
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
  allowedDeliveryModes: ["in_presence", "online", "hybrid"] as const,
} as const;

export type EventsSourceCode = string & { readonly __brand: "EventsSourceCode" };

export type EventsSourceAllowlistEntry = {
  sourceCode: EventsSourceCode;
  displayName: string;
  allowedHostnames: readonly string[];
  hostPathRules: readonly {
    hostname: string;
    pathPrefixes: readonly string[];
  }[];
  requiredAttribution: string;
  licenseNote: string;
};

/** Closed allowlist — intentionally empty until a dedicated sources GO. */
const EVENTS_SOURCE_ALLOWLIST_MUTABLE: EventsSourceAllowlistEntry[] = [];

export const EVENTS_SOURCE_ALLOWLIST: readonly EventsSourceAllowlistEntry[] =
  EVENTS_SOURCE_ALLOWLIST_MUTABLE;

export function getEventsSource(
  sourceCode: string,
): EventsSourceAllowlistEntry | null {
  const code = sourceCode.trim();
  return (
    EVENTS_SOURCE_ALLOWLIST_MUTABLE.find((e) => e.sourceCode === code) ?? null
  );
}

/** Test-only: temporarily register a source. Production allowlist stays empty. */
export function __registerEventsSourceForTests(
  entry: EventsSourceAllowlistEntry,
): () => void {
  EVENTS_SOURCE_ALLOWLIST_MUTABLE.push(entry);
  return () => {
    const idx = EVENTS_SOURCE_ALLOWLIST_MUTABLE.findIndex(
      (e) => e.sourceCode === entry.sourceCode,
    );
    if (idx >= 0) EVENTS_SOURCE_ALLOWLIST_MUTABLE.splice(idx, 1);
  };
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
  return entry;
}

export function listEventsSourceCodes(): string[] {
  return EVENTS_SOURCE_ALLOWLIST.map((e) => e.sourceCode);
}
