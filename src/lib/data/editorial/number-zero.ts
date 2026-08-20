import { createClient } from "@/lib/supabase/server";

export type NumberZeroStage = "missing" | "candidate" | "draft" | "ready" | "published";

export type NumberZeroSlot = {
  code: string;
  band: string;
  title: string;
  kind: "content" | "voice";
  stage: NumberZeroStage;
  href: string | null;
  detail: string;
};

type ContentPlan = {
  code: string;
  band: string;
  title: string;
  slug: string;
};

type VoicePlan = {
  code: string;
  band: string;
  title: string;
  relevanceBand: string;
};

const CONTENT_PLAN: readonly ContentPlan[] = [
  { code: "L1", band: "Lombardia", title: "135 mila imprese straniere in Lombardia", slug: "lombardia-135mila-imprese-straniere" },
  { code: "I1", band: "Italia", title: "678 mila imprese straniere", slug: "678mila-imprese-straniere-registro-imprese" },
  { code: "I2", band: "Italia", title: "Lettura critica Futurae / InfoCamere 2025", slug: "futurae-imprenditoria-straniera-2025-lettura" },
  { code: "A2", band: "Italiani all'estero", title: "Perché non esiste un solo numero", slug: "italiani-impresa-estero-perche-non-esiste-un-numero" },
  { code: "E1", band: "Europa", title: "Confronto self-employment 2022", slug: "europa-self-employment-migranti-2022" },
  { code: "E2", band: "Europa", title: "Action Plan UE: impresa, finanza e mentoring", slug: "ue-imprenditori-migranti-finanziamento-formazione-mentoring" },
  { code: "M1", band: "OECD / mondo", title: "Circa 10 milioni di self-employed immigrants", slug: "oecd-10-milioni-lavoratori-autonomi-immigrati" },
] as const;

const VOICE_PLAN: readonly VoicePlan[] = [
  { code: "L2", band: "Lombardia", title: "Voce originale dalla Lombardia", relevanceBand: "lombardy" },
  { code: "A1", band: "Italiani all'estero", title: "Voce originale italiana all'estero", relevanceBand: "italians_abroad" },
  { code: "M2", band: "Resto del mondo", title: "Voce originale dal mondo", relevanceBand: "rest_of_world" },
] as const;

function contentStage(row: {
  editorial_status: string;
  publication_status: string;
  visibility_status: string;
}): NumberZeroStage {
  if (row.publication_status === "published" && row.visibility_status === "public") return "published";
  if (row.editorial_status === "ready") return "ready";
  return "draft";
}

export async function getNumberZeroSlots(): Promise<NumberZeroSlot[]> {
  const supabase = await createClient();
  const slugs = CONTENT_PLAN.map((item) => item.slug);
  const bands = VOICE_PLAN.map((item) => item.relevanceBand);

  const [contentsResult, voicesResult] = await Promise.all([
    supabase
      .from("contents")
      .select("id, slug, editorial_status, publication_status, visibility_status")
      .in("slug", slugs),
    supabase
      .from("editorial_inbox_items")
      .select("id, title, relevance_band, status, priority, linked_content_id")
      .eq("item_kind", "interview_proposal")
      .in("relevance_band", bands)
      .order("priority", { ascending: true })
      .order("received_at", { ascending: false }),
  ]);

  if (contentsResult.error) throw new Error("Unable to load Number Zero contents");
  if (voicesResult.error) throw new Error("Unable to load Number Zero voice candidates");

  const contentBySlug = new Map((contentsResult.data ?? []).map((row) => [row.slug, row]));
  const voicesByBand = new Map<string, typeof voicesResult.data>();
  for (const row of voicesResult.data ?? []) {
    const band = row.relevance_band;
    if (!band) continue;
    const current = voicesByBand.get(band) ?? [];
    current.push(row);
    voicesByBand.set(band, current);
  }

  const contentSlots = CONTENT_PLAN.map((plan): NumberZeroSlot => {
    const row = contentBySlug.get(plan.slug);
    if (!row) return { ...plan, kind: "content", stage: "missing", href: null, detail: "Bozza non presente nella scrivania." };
    return {
      code: plan.code,
      band: plan.band,
      title: plan.title,
      kind: "content",
      stage: contentStage(row),
      href: `/app/redazione/contenuti/${row.id}`,
      detail: row.publication_status === "published" ? "Pubblicato" : row.editorial_status === "ready" ? "Pronto per revisione finale" : "Bozza privata in redazione",
    };
  });

  const voiceSlots = VOICE_PLAN.map((plan): NumberZeroSlot => {
    const rows = voicesByBand.get(plan.relevanceBand) ?? [];
    const linked = rows.find((row) => row.linked_content_id);
    const active = rows.filter((row) => !["rejected", "archived"].includes(row.status));
    const first = linked ?? active[0] ?? rows[0];
    const stage: NumberZeroStage = linked ? "draft" : active.length > 0 ? "candidate" : "missing";
    return {
      code: plan.code,
      band: plan.band,
      title: plan.title,
      kind: "voice",
      stage,
      href: first ? `/app/redazione/inbox/${first.id}` : null,
      detail: linked
        ? "Intervista collegata a un contenuto in lavorazione."
        : active.length > 0
          ? `${active.length} ${active.length === 1 ? "candidato" : "candidati"} verificati in Inbox; intervista originale da realizzare.`
          : "Nessun candidato attivo in Inbox.",
    };
  });

  const byCode = new Map([...contentSlots, ...voiceSlots].map((slot) => [slot.code, slot]));
  return ["L1", "L2", "I1", "I2", "A1", "A2", "E1", "E2", "M1", "M2"].flatMap((code) => {
    const slot = byCode.get(code);
    return slot ? [slot] : [];
  });
}
