import { ATLAS_COUNTRIES } from "@/lib/atlas/scope";
import { getExplorerSnapshot } from "@/lib/data/public/explore";
import { listAtlasCountrySummaries } from "@/lib/data/public/atlas";
import { listPublishedRouteSummaries } from "@/lib/data/public/routes";

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
  const [explorer, countrySummaries, routeSummaries] = await Promise.all([
    getExplorerSnapshot(),
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
    explorer.indicators.map((item) => [item.id, item]),
  );
  const sectorById = new Map(explorer.sectors.map((item) => [item.id, item]));

  for (const value of explorer.values) {
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
      const key = `${indicatorNodeId}|observed_in|${countryNodeId}`;
      edges.set(key, {
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
        const key = `${indicatorNodeId}|classified_in|${sectorNodeId}`;
        edges.set(key, {
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
      const key = `${countryNodeId}|${predicate}|${routeNodeId}`;
      edges.set(key, { from: countryNodeId, predicate, to: routeNodeId });
    }
  }

  return {
    nodes: Array.from(nodes.values()).sort((a, b) =>
      a.label.localeCompare(b.label, "it"),
    ),
    edges: Array.from(edges.values()),
  };
}

export async function getPublicKnowledgeNeighborhood(
  kind: string,
  key: string,
): Promise<KnowledgeNeighborhood | null> {
  if (!(["country", "indicator", "sector", "route"] as string[]).includes(kind)) {
    return null;
  }

  const graph = await getPublicKnowledgeSnapshot();
  const id = `${kind}:${key}`;
  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) return null;

  const nodeMap = new Map(graph.nodes.map((candidate) => [candidate.id, candidate]));
  const connections: KnowledgeConnection[] = [];

  for (const edge of graph.edges) {
    if (edge.from === id) {
      const related = nodeMap.get(edge.to);
      if (related) {
        connections.push({
          direction: "outgoing",
          predicate: edge.predicate,
          node: related,
        });
      }
    }
    if (edge.to === id) {
      const related = nodeMap.get(edge.from);
      if (related) {
        connections.push({
          direction: "incoming",
          predicate: edge.predicate,
          node: related,
        });
      }
    }
  }

  connections.sort(
    (a, b) =>
      a.predicate.localeCompare(b.predicate, "it") ||
      a.node.label.localeCompare(b.node.label, "it"),
  );

  return { node, key, connections };
}
