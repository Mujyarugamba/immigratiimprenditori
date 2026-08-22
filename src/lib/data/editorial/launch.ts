import { createClient } from "@/lib/supabase/server";
import {
  evaluateNumberZeroReadiness,
  type NumberZeroReadiness,
  type NumberZeroSnapshot,
} from "@/lib/editorial/launch-readiness";

const STORY_VOICE_TYPES = [
  "business_story",
  "interview",
  "personal_story",
  "testimony",
] as const;

export type NumberZeroDashboard = {
  available: boolean;
  snapshot: NumberZeroSnapshot;
  readiness: NumberZeroReadiness;
  reportTitles: string[];
  storyVoiceTitles: string[];
  eventTitles: string[];
  internationalTerritories: string[];
  errors: string[];
};

function emptySnapshot(): NumberZeroSnapshot {
  return {
    lombardyDataValues: 0,
    italyDataValues: 0,
    internationalComparisonTerritories: 0,
    selectedReports: 0,
    publishedStoriesVoices: 0,
    publishedEvents: 0,
    interviewCandidatesInResearch: 0,
  };
}

export async function getNumberZeroDashboard(): Promise<NumberZeroDashboard> {
  const supabase = await createClient();
  const errors: string[] = [];

  const [indicatorsResult, reportsResult, storiesResult, eventsResult, interviewResult] =
    await Promise.all([
      supabase
        .from("observatory_indicators")
        .select("id")
        .eq("publication_status", "published")
        .in("operational_status", ["active", "deprecated"]),
      supabase
        .from("contents")
        .select("id, title", { count: "exact" })
        .eq("editorial_status", "ready")
        .eq("publication_status", "published")
        .eq("visibility_status", "public")
        .is("archived_at", null)
        .eq("type_code", "research_report"),
      supabase
        .from("contents")
        .select("id, title", { count: "exact" })
        .eq("editorial_status", "ready")
        .eq("publication_status", "published")
        .eq("visibility_status", "public")
        .is("archived_at", null)
        .in("type_code", [...STORY_VOICE_TYPES]),
      supabase
        .from("events")
        .select("id, title", { count: "exact" })
        .eq("editorial_status", "ready")
        .eq("publication_status", "published")
        .eq("visibility_status", "public")
        .is("archived_at", null),
      supabase
        .from("editorial_inbox_items")
        .select("id", { count: "exact", head: true })
        .eq("item_kind", "interview_proposal")
        .eq("status", "needs_research"),
    ]);

  if (indicatorsResult.error) errors.push(`indicatori: ${indicatorsResult.error.message}`);
  if (reportsResult.error) errors.push(`rapporti: ${reportsResult.error.message}`);
  if (storiesResult.error) errors.push(`storie: ${storiesResult.error.message}`);
  if (eventsResult.error) errors.push(`eventi: ${eventsResult.error.message}`);
  if (interviewResult.error) errors.push(`pipeline interviste: ${interviewResult.error.message}`);

  const indicatorIds = (indicatorsResult.data ?? []).map((row) => row.id as string);
  let values: Array<{ indicator_id: string; territory_code: string | null }> = [];

  if (indicatorIds.length > 0) {
    const valuesResult = await supabase
      .from("observatory_indicator_values")
      .select("indicator_id, territory_code")
      .in("indicator_id", indicatorIds)
      .eq("status", "final")
      .is("withdrawn_at", null);

    if (valuesResult.error) {
      errors.push(`valori osservatorio: ${valuesResult.error.message}`);
    } else {
      values = (valuesResult.data ?? []) as Array<{
        indicator_id: string;
        territory_code: string | null;
      }>;
    }
  }

  const internationalTerritories = Array.from(
    new Set(
      values
        .map((value) => value.territory_code)
        .filter(
          (code): code is string =>
            Boolean(code) && code !== "IT" && !code.startsWith("IT-"),
        ),
    ),
  ).sort();

  const snapshot: NumberZeroSnapshot = {
    lombardyDataValues: values.filter((value) => value.territory_code === "IT-25").length,
    italyDataValues: values.filter((value) => value.territory_code === "IT").length,
    internationalComparisonTerritories: internationalTerritories.length,
    selectedReports: reportsResult.count ?? 0,
    publishedStoriesVoices: storiesResult.count ?? 0,
    publishedEvents: eventsResult.count ?? 0,
    interviewCandidatesInResearch: interviewResult.count ?? 0,
  };

  const coreAvailable =
    !indicatorsResult.error &&
    !reportsResult.error &&
    !storiesResult.error &&
    !eventsResult.error &&
    !errors.some((error) => error.startsWith("valori osservatorio:"));

  return {
    available: coreAvailable,
    snapshot,
    readiness: evaluateNumberZeroReadiness(snapshot),
    reportTitles: (reportsResult.data ?? []).map((row) => row.title as string),
    storyVoiceTitles: (storiesResult.data ?? []).map((row) => row.title as string),
    eventTitles: (eventsResult.data ?? []).map((row) => row.title as string),
    internationalTerritories,
    errors,
  };
}
