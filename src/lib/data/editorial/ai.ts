import { createClient } from "@/lib/supabase/server";

export type EditorialAiRun = {
  id: string;
  task_kind: string;
  entity_kind: string | null;
  entity_id: string | null;
  provider: string;
  model: string;
  prompt_version: string;
  status: string;
  output_payload: Record<string, unknown>;
  reviewed_at: string | null;
  created_at: string;
};

export type EditorialAiOverview = {
  available: boolean;
  runs: EditorialAiRun[];
  generated: number;
  reviewed: number;
  accepted: number;
  rejected: number;
  failed: number;
};

export async function getEditorialAiOverview(): Promise<EditorialAiOverview> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("editorial_ai_runs")
      .select(
        "id, task_kind, entity_kind, entity_id, provider, model, prompt_version, status, output_payload, reviewed_at, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      return {
        available: false,
        runs: [],
        generated: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0,
        failed: 0,
      };
    }

    const runs = (data ?? []) as EditorialAiRun[];
    const count = (status: string) => runs.filter((run) => run.status === status).length;

    return {
      available: true,
      runs,
      generated: count("generated"),
      reviewed: count("reviewed"),
      accepted: count("accepted"),
      rejected: count("rejected"),
      failed: count("failed"),
    };
  } catch {
    return {
      available: false,
      runs: [],
      generated: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
      failed: 0,
    };
  }
}
