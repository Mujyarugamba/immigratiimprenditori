import { searchPublicSite, type SearchResult } from "@/lib/data/public/search";

export type ResearchContextItem = SearchResult & {
  citationLabel: string;
};

const KIND_LABEL: Record<SearchResult["kind"], string> = {
  content: "Contenuto",
  indicator: "Indicatore",
  event: "Evento",
  country: "Paese",
  territory: "Territorio",
  sector: "Settore",
  route: "Rotta",
  author: "Autore",
  source: "Fonte",
};

export async function buildResearchContext(
  query: string,
  limit = 12,
): Promise<ResearchContextItem[]> {
  const results = await searchPublicSite(query);
  return results.slice(0, Math.max(1, Math.min(limit, 20))).map((result, index) => ({
    ...result,
    citationLabel: `[${index + 1}] ${KIND_LABEL[result.kind]} — ${result.title}`,
  }));
}
