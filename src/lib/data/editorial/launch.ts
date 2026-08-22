import { createClient } from "@/lib/supabase/server";
import {
  evaluateNumberZeroReadiness,
  isItalyTerritoryCode,
  strongestInternationalComparisonTerritories,
  type NumberZeroReadiness,
  type NumberZeroSnapshot,
} from "@/lib/editorial/launch-readiness";

const STORY_VOICE_TYPES = [
  "business_story",
  "interview",
  "personal_story",
  "testimony",
] as const;

export const INTERVIEW_WORKFLOW_STATUSES = [
  "candidate",
  "contacted",
  "scheduled",
  "interviewed",
  "fact_check",
  "approved",
  "declined",
  "closed",
] as const;

export type NumberZeroDashboard = {
  available: boolean;
  snapshot: NumberZeroSnapshot;
  readiness: NumberZeroReadiness;
  reportTitles: string[];
  storyVoiceTitles: string[];
  eventTitles: string[];
  internationalTerritories: string[];
  interviewWorkflowByStatus: Record<(typeof INTERVIEW_WORKFLOW_STATUSES)[number], number>;
  errors: string[];
};

function emptyInterviewWorkflowCounts() {
  return Object.fromEntries(
    INTERVIEW_WORKFLOW_STATUSES.map((status) => [status, 0]),
  ) as Record<(typeof INTERVIEW_WORKFLOW_STATUSES)[number], number>;
}

export async function getNumberZeroDashboard(): Promise<NumberZeroDashboard> {
  const supabase = await createClient();
  const errors: string[] = [];

  const [
    indicatorsResult,
    reportsResult,
    storiesResult,
    eventsResult,
    interviewResult,
    interviewWorkflowResult,
  ] = await Promise.all([
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
    supabase
      .from("content_interview_workflow")
      .select("workflow_status"),
  ]);

  if (indicatorsResult.error) errors.push(`indicatori: ${indicatorsResult.error.message}`);
  if (reportsResult.error) errors.push(`rapporti: ${reportsResult.error.message}`);
  if (storiesResult.error) errors.push(`storie: ${storiesResult.error.message}`);
  if (eventsResult.error) errors.push(`eventi: ${eventsResult.error.message}`);
  if (interviewResult.error) errors.push(`pipeline interviste Inbox: ${interviewResult.error.message}`);
  if (interviewWorkflowResult.error) {
    errors.push(`workflow interviste: ${interviewWorkflowResult.error.message}`);
  }

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

  const internationalTerritories = strongestInternationalComparisonTerritories(values);
  const interviewWorkflowByStatus = emptyInterviewWorkflowCounts();
  for (const row of interviewWorkflowResult.data ?? []) {
    const status = row.workflow_status as (typeof INTERVIEW_WORKFLOW_STATUSES)[number];
    if (status in interviewWorkflowByStatus) {
      interviewWorkflowByStatus[status] += 1;
    }
  }

  const snapshot: NumberZeroSnapshot = {
    lombardyDataValues: values.filter((value) => value.territory_code === "IT-25").length,
    italyDataValues: values.filter((value) => isItalyTerritoryCode(value.territory_code)).length,
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
    interviewWorkflowByStatus,
    errors,
  };
}
