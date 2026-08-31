import { ATLAS_COUNTRIES, getAtlasCountryByCode } from "@/lib/atlas/scope";
import {
  getAtlasCountryDetail,
  listAtlasCountrySummaries,
} from "@/lib/data/public/atlas";
import {
  getExplorerCatalog,
  getExplorerDimensionValues,
  getScopedExplorerEvidence,
} from "@/lib/data/public/explore";
import {
  getRouteDetail,
  listPublishedRouteSummaries,
} from "@/lib/data/public/routes";
import { createPublicReadClient } from "@/lib/supabase/public-read";

export type KnowledgeNodeKind = "country" | "indicator" | "sector" | "route";

export type KnowledgeNode = {
  id: string;
  kind: KnowledgeNodeKind;
  label: string;
  href: string;
};

export type KnowledgePredicate =
  | "observed_in"
  | "classified_in"
  | "origin_of"
  | "destination_of";

export type KnowledgeEdge = {
  from: string;
  predicate: KnowledgePredicate;
  to: string;
};

export type KnowledgeSnapshot = {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
};

export type KnowledgeConnection = {
  direction: "outgoing" | "incoming";
  predicate: KnowledgePredicate;
  node: KnowledgeNode;
};

export type KnowledgeNeighborhood = {
  node: KnowledgeNode;
  key: string;
  connections: KnowledgeConnection[];
};

function countryForTerritory(code: string | null) {
  const normalized = code?.toUpperCase();
  if (!normalized) return undefined;
  return ATLAS_COUNTRIES.find(
    (country) => country.code === normalized || country.iso3 === normalized,
  );
}

export function knowledgeNodeKey(node: KnowledgeNode) {
  const prefix = `${node.kind}:`;
  return node.id.startsWith(prefix) ? node.id.slice(prefix.length) : node.id;
}

export function knowledgeNodeRelationalHref(node: KnowledgeNode) {
  return `/relazioni/${node.kind}/${encodeURIComponent(knowledgeNodeKey(node))}`;
}

export async function getPublicKnowledgeSnapshot(): Promise<KnowledgeSnapshot> {
  const [catalog, dimensions, countrySummaries, routeSummaries] = await Promise.all([
    getExplorerCatalog(),
    getExplorerDimensionValues(),
    listAtlasCountrySummaries(),
    listPublishedRouteSummaries().catch(() => []),
  ]);

  const nodes = new Map<string, KnowledgeNode>();
  const edges = new Map<string, KnowledgeEdge>();
  const publicCountries = new Set(
    countrySummaries
      .filter((item) => item.hasEvidence)
      .map((item) => item.country.code),
  );

  for (const summary of countrySummaries) {
    if (!summary.hasEvidence) continue;
    nodes.set(`country:${summary.country.code}`, {
      id: `country:${summary.country.code}`,
      kind: "country",
      label: summary.country.name,
      href: `/atlante/${summary.country.slug}`,
    });
  }

  const indicatorById = new Map(
    catalog.indicators.map((item) => [item.id, item]),
  );
  const sectorById = new Map(catalog.sectors.map((item) => [item.id, item]));

  for (const value of dimensions) {
    const indicator = indicatorById.get(value.indicator_id);
    if (!indicator) continue;
    const indicatorNodeId = `indicator:${indicator.id}`;
    nodes.set(indicatorNodeId, {
      id: indicatorNodeId,
      kind: "indicator",
      label: indicator.title,
      href: `/osservatorio/${indicator.slug}`,
    });

    const country = countryForTerritory(value.territory_code);
    if (country && publicCountries.has(country.code)) {
      const countryNodeId = `country:${country.code}`;
      const edgeKey = `${indicatorNodeId}|observed_in|${countryNodeId}`;
      edges.set(edgeKey, {
        from: indicatorNodeId,
        predicate: "observed_in",
        to: countryNodeId,
      });
    }

    if (value.business_sector_id != null) {
      const sector = sectorById.get(value.business_sector_id);
      if (sector) {
        const sectorNodeId = `sector:${sector.id}`;
        nodes.set(sectorNodeId, {
          id: sectorNodeId,
          kind: "sector",
          label: sector.name,
          href: `/settori/${sector.slug}`,
        });
        const edgeKey = `${indicatorNodeId}|classified_in|${sectorNodeId}`;
        edges.set(edgeKey, {
          from: indicatorNodeId,
          predicate: "classified_in",
          to: sectorNodeId,
        });
      }
    }
  }

  for (const summary of routeSummaries) {
    if (!summary.hasEvidence) continue;
    const routeNodeId = `route:${summary.route.id}`;
    nodes.set(routeNodeId, {
      id: routeNodeId,
      kind: "route",
      label: `${summary.route.origin.name} → ${summary.route.destination.name}`,
      href: `/atlante/rotte/${summary.route.slug}`,
    });
    for (const [predicate, country] of [
      ["origin_of", summary.route.origin],
      ["destination_of", summary.route.destination],
    ] as const) {
      const countryNodeId = `country:${country.code}`;
      if (!nodes.has(countryNodeId)) {
        nodes.set(countryNodeId, {
          id: countryNodeId,
          kind: "country",
          label: country.name,
          href: `/atlante/${country.slug}`,
        });
      }
      const edgeKey = `${countryNodeId}|${predicate}|${routeNodeId}`;
      edges.set(edgeKey, { from: countryNodeId, predicate, to: routeNodeId });
    }
  }

  return {
    nodes: Array.from(nodes.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "it"),
    ),
    edges: Array.from(edges.values()),
  };
}

function sortedNeighborhood(
  node: KnowledgeNode,
  key: string,
  connections: KnowledgeConnection[],
): KnowledgeNeighborhood {
  const unique = new Map<string, KnowledgeConnection>();
  for (const connection of connections) {
    unique.set(
      `${connection.direction}|${connection.predicate}|${connection.node.id}`,
      connection,
    );
  }
  const sorted = Array.from(unique.values()).sort(
    (a, b) =>
      a.predicate.localeCompare(b.predicate, "it") ||
      a.node.label.localeCompare(b.node.label, "it"),
  );
  return { node, key, connections: sorted };
}

async function indicatorNeighborhood(key: string): Promise<KnowledgeNeighborhood | null> {
  const evidence = await getScopedExplorerEvidence({ indicatorId: key });
  const indicator = evidence.indicators.find((candidate) => candidate.id === key);
  if (!indicator || evidence.values.length === 0) return null;

  const node: KnowledgeNode = {
    id: `indicator:${indicator.id}`,
    kind: "indicator",
    label: indicator.title,
    href: `/osservatorio/${indicator.slug}`,
  };
  const catalog = await getExplorerCatalog();
  const sectorById = new Map(catalog.sectors.map((sector) => [sector.id, sector]));
  const connections: KnowledgeConnection[] = [];

  for (const value of evidence.values) {
    const country = countryForTerritory(value.territory_code);
    if (country) {
      connections.push({
        direction: "outgoing",
        predicate: "observed_in",
        node: {
          id: `country:${country.code}`,
          kind: "country",
          label: country.name,
          href: `/atlante/${country.slug}`,
        },
      });
    }
    if (value.business_sector_id != null) {
      const sector = sectorById.get(value.business_sector_id);
      if (sector) {
        connections.push({
          direction: "outgoing",
          predicate: "classified_in",
          node: {
            id: `sector:${sector.id}`,
            kind: "sector",
            label: sector.name,
            href: `/settori/${sector.slug}`,
          },
        });
      }
    }
  }

  return sortedNeighborhood(node, key, connections);
}

async function sectorNeighborhood(key: string): Promise<KnowledgeNeighborhood | null> {
  const sectorId = Number(key);
  if (!Number.isInteger(sectorId)) return null;
  const [catalog, evidence] = await Promise.all([
    getExplorerCatalog(),
    getScopedExplorerEvidence({ sectorId }),
  ]);
  const sector = catalog.sectors.find((candidate) => candidate.id === sectorId);
  if (!sector || evidence.values.length === 0) return null;

  const node: KnowledgeNode = {
    id: `sector:${sector.id}`,
    kind: "sector",
    label: sector.name,
    href: `/settori/${sector.slug}`,
  };
  const indicatorById = new Map(evidence.indicators.map((indicator) => [indicator.id, indicator]));
  const connections: KnowledgeConnection[] = [];
  for (const value of evidence.values) {
    const indicator = indicatorById.get(value.indicator_id);
    if (!indicator) continue;
    connections.push({
      direction: "incoming",
      predicate: "classified_in",
      node: {
        id: `indicator:${indicator.id}`,
        kind: "indicator",
        label: indicator.title,
        href: `/osservatorio/${indicator.slug}`,
      },
    });
  }
  return sortedNeighborhood(node, key, connections);
}

async function countryNeighborhood(key: string): Promise<KnowledgeNeighborhood | null> {
  const country = countryForTerritory(key);
  if (!country) return null;
  const [detail, routeSummaries] = await Promise.all([
    getAtlasCountryDetail(country),
    listPublishedRouteSummaries().catch(() => []),
  ]);
  const relatedRoutes = routeSummaries.filter(
    (summary) =>
      summary.route.origin.code === country.code ||
      summary.route.destination.code === country.code,
  );
  if (!detail.hasEvidence && relatedRoutes.length === 0) return null;

  const node: KnowledgeNode = {
    id: `country:${country.code}`,
    kind: "country",
    label: country.name,
    href: `/atlante/${country.slug}`,
  };
  const connections: KnowledgeConnection[] = [];
  for (const evidence of detail.indicators) {
    connections.push({
      direction: "incoming",
      predicate: "observed_in",
      node: {
        id: `indicator:${evidence.indicator.id}`,
        kind: "indicator",
        label: evidence.indicator.title,
        href: `/osservatorio/${evidence.indicator.slug}`,
      },
    });
  }
  for (const summary of relatedRoutes) {
    const predicate: KnowledgePredicate =
      summary.route.origin.code === country.code ? "origin_of" : "destination_of";
    connections.push({
      direction: "outgoing",
      predicate,
      node: {
        id: `route:${summary.route.id}`,
        kind: "route",
        label: `${summary.route.origin.name} → ${summary.route.destination.name}`,
        href: `/atlante/rotte/${summary.route.slug}`,
      },
    });
  }
  return sortedNeighborhood(node, key, connections);
}

async function routeNeighborhood(key: string): Promise<KnowledgeNeighborhood | null> {
  const supabase = createPublicReadClient();
  const { data, error } = await supabase
    .from("migration_routes")
    .select("id, origin_country_code, destination_country_code, slug")
    .eq("id", key)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const origin = getAtlasCountryByCode(data.origin_country_code);
  const destination = getAtlasCountryByCode(data.destination_country_code);
  if (!origin || !destination) return null;
  const detail = await getRouteDetail(data.slug);
  if (!detail?.hasEvidence) return null;

  const node: KnowledgeNode = {
    id: `route:${data.id}`,
    kind: "route",
    label: `${origin.name} → ${destination.name}`,
    href: `/atlante/rotte/${data.slug}`,
  };
  return sortedNeighborhood(node, key, [
    {
      direction: "incoming",
      predicate: "origin_of",
      node: {
        id: `country:${origin.code}`,
        kind: "country",
        label: origin.name,
        href: `/atlante/${origin.slug}`,
      },
    },
    {
      direction: "incoming",
      predicate: "destination_of",
      node: {
        id: `country:${destination.code}`,
        kind: "country",
        label: destination.name,
        href: `/atlante/${destination.slug}`,
      },
    },
  ]);
}

export async function getPublicKnowledgeNeighborhood(
  kind: string,
  key: string,
): Promise<KnowledgeNeighborhood | null> {
  if (!(["country", "indicator", "sector", "route"] as string[]).includes(kind)) {
    return null;
  }
  if (kind === "indicator") return indicatorNeighborhood(key);
  if (kind === "sector") return sectorNeighborhood(key);
  if (kind === "country") return countryNeighborhood(key);
  return routeNeighborhood(key);
}
