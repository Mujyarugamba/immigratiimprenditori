import { createClient } from "@/lib/supabase/server";
import { getExplorerSnapshot } from "@/lib/data/public/explore";

export type TimelineEntry = {
  id: string;
  kind: "data" | "research" | "story" | "event";
  date: string;
  title: string;
  description: string | null;
  href: string;
  context: string | null;
};

const STORY_TYPES = new Set([
  "interview",
  "business_story",
  "testimony",
  "personal_story",
  "video",
  "podcast",
]);

export async function listPublicTimelineEntries(limit = 120): Promise<TimelineEntry[]> {
  const supabase = await createClient();
  const [snapshot, contentsResult, eventsResult] = await Promise.all([
    getExplorerSnapshot(),
    supabase
      .from("contents")
      .select("id, slug, title, abstract, type_code, published_at")
      .eq("editorial_status", "ready")
      .eq("publication_status", "published")
      .eq("visibility_status", "public")
      .is("archived_at", null)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(80),
    supabase
      .from("events")
      .select("id, title, summary, event_editions(id, starts_at, occurrence_status)")
      .eq("editorial_status", "ready")
      .eq("publication_status", "published")
      .eq("visibility_status", "public")
      .is("archived_at", null)
      .limit(80),
  ]);

  if (contentsResult.error) throw new Error(contentsResult.error.message);
  if (eventsResult.error) throw new Error(eventsResult.error.message);

  const contentEntries: TimelineEntry[] = (contentsResult.data ?? []).map((item) => ({
    id: `content-${item.id}`,
    kind: STORY_TYPES.has(item.type_code) ? "story" : "research",
    date: item.published_at as string,
    title: item.title,
    description: item.abstract,
    href: `/contenuti/${item.slug}`,
    context: STORY_TYPES.has(item.type_code) ? "Storie e voci" : "Analisi e ricerca",
  }));

  const eventEntries: TimelineEntry[] = [];
  for (const event of eventsResult.data ?? []) {
    const editions = Array.isArray(event.event_editions) ? event.event_editions : [];
    for (const edition of editions) {
      if (!edition.starts_at || edition.occurrence_status === "cancelled") continue;
      eventEntries.push({
        id: `event-${event.id}-${edition.id}`,
        kind: "event",
        date: edition.starts_at,
        title: event.title,
        description: event.summary,
        href: `/eventi/${event.id}`,
        context: "Evento",
      });
    }
  }

  const dataEntries: TimelineEntry[] = snapshot.indicators.flatMap((indicator) => {
    const values = snapshot.values
      .filter((value) => value.indicator_id === indicator.id)
      .sort((a, b) => new Date(b.period_end).getTime() - new Date(a.period_end).getTime());
    if (values.length === 0) return [];
    const latestPeriod = values[0].period_end;
    const samePeriod = values.filter((value) => value.period_end === latestPeriod);
    const territories = Array.from(
      new Set(samePeriod.map((value) => value.territory_label).filter(Boolean)),
    );
    return [{
      id: `data-${indicator.id}-${latestPeriod}`,
      kind: "data" as const,
      date: latestPeriod,
      title: indicator.title,
      description: indicator.description,
      href: `/osservatorio/${indicator.slug}`,
      context: territories.length > 0
        ? territories.slice(0, 3).join(" · ") + (territories.length > 3 ? " · …" : "")
        : "Osservatorio",
    }];
  });

  return [...dataEntries, ...contentEntries, ...eventEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.title.localeCompare(b.title, "it"))
    .slice(0, limit);
}
