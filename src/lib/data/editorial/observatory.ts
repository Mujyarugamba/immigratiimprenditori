import { mapPostgresError, type AppError } from "@/lib/errors/app-error";
import { createClient } from "@/lib/supabase/server";

const NATURE_UNITS: Record<string, readonly string[]> = {
  count: ["units"],
  percentage: ["percent"],
  currency: ["eur", "eur_thousands"],
  ratio: ["ratio"],
  index: ["index_points"],
};

export function isNatureUnitCoherent(
  valueNature: string,
  unitCode: string,
): boolean {
  const allowed = NATURE_UNITS[valueNature];
  return Boolean(allowed?.includes(unitCode));
}

export function natureUnitError(): AppError {
  return {
    code: "validation",
    message:
      "Natura e unità non coerenti (es. count↔units, percentage↔percent).",
    fieldErrors: { unit_code: "Non coerente con la natura selezionata" },
  };
}

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

export type ObservatoryIndicator = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  purpose_text: string;
  methodology_summary: string;
  value_nature: string;
  unit_code: string;
  periodicity: string;
  operational_status: string;
  publication_status: string;
  published_at: string | null;
  withdrawn_at: string | null;
  updated_at: string;
};

const INDICATOR_SELECT =
  "id, code, slug, title, description, purpose_text, methodology_summary, value_nature, unit_code, periodicity, operational_status, publication_status, published_at, withdrawn_at, updated_at";

export async function listObservatoryIndicators(): Promise<
  ObservatoryIndicator[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("observatory_indicators")
    .select(INDICATOR_SELECT)
    .order("updated_at", { ascending: false })
    .limit(100);
  return (data ?? []) as ObservatoryIndicator[];
}

export async function getObservatoryIndicatorById(
  id: string,
): Promise<ObservatoryIndicator | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("observatory_indicators")
    .select(INDICATOR_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as ObservatoryIndicator | null) ?? null;
}

export type IndicatorInput = {
  code: string;
  slug: string;
  title: string;
  description: string;
  purpose_text: string;
  methodology_summary: string;
  value_nature: string;
  unit_code: string;
  periodicity: string;
  operational_status?: string;
};

export async function createObservatoryIndicator(
  input: IndicatorInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  if (!isNatureUnitCoherent(input.value_nature, input.unit_code)) {
    return { ok: false, error: natureUnitError() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("observatory_indicators")
    .insert({
      code: input.code.trim(),
      slug: input.slug.trim(),
      title: input.title.trim(),
      description: input.description.trim(),
      purpose_text: input.purpose_text.trim(),
      methodology_summary: input.methodology_summary.trim(),
      value_nature: input.value_nature,
      unit_code: input.unit_code,
      periodicity: input.periodicity,
      operational_status: input.operational_status ?? "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true, id: data.id as string };
}

export async function updateObservatoryIndicator(
  id: string,
  patch: Partial<IndicatorInput>,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  if (
    patch.value_nature &&
    patch.unit_code &&
    !isNatureUnitCoherent(patch.value_nature, patch.unit_code)
  ) {
    return { ok: false, error: natureUnitError() };
  }

  const supabase = await createClient();
  if (patch.value_nature || patch.unit_code) {
    const current = await getObservatoryIndicatorById(id);
    if (current) {
      const nature = patch.value_nature ?? current.value_nature;
      const unit = patch.unit_code ?? current.unit_code;
      if (!isNatureUnitCoherent(nature, unit)) {
        return { ok: false, error: natureUnitError() };
      }
    }
  }

  const allowed: Record<string, unknown> = {};
  for (const key of [
    "code",
    "slug",
    "title",
    "description",
    "purpose_text",
    "methodology_summary",
    "value_nature",
    "unit_code",
    "periodicity",
    "operational_status",
  ] as const) {
    if (key in patch && patch[key] !== undefined) {
      const val = patch[key];
      allowed[key] = typeof val === "string" ? val.trim() : val;
    }
  }

  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: { code: "validation", message: "Nessun campo da aggiornare." },
    };
  }

  const { error } = await supabase
    .from("observatory_indicators")
    .update(allowed)
    .eq("id", id);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

export async function publishObservatoryIndicator(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const current = await getObservatoryIndicatorById(id);
  if (!current) {
    return {
      ok: false,
      error: { code: "not_found", message: "Indicatore non trovato." },
    };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    publication_status: "published",
    published_at: now,
    withdrawn_at: null,
  };
  if (current.operational_status === "draft") {
    patch.operational_status = "active";
  }

  const { error } = await supabase
    .from("observatory_indicators")
    .update(patch)
    .eq("id", id);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

export async function withdrawObservatoryIndicator(
  id: string,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("observatory_indicators")
    .update({
      publication_status: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Statistical sources
// ---------------------------------------------------------------------------

export type ObservatorySource = {
  id: string;
  name: string;
  producer_name: string;
  publication_title: string;
  url: string | null;
  external_identifier: string | null;
  edition_label: string | null;
  source_published_on: string | null;
  license_note: string | null;
  methodology_note: string | null;
  lifecycle_status: string;
  updated_at: string;
};

const SOURCE_SELECT =
  "id, name, producer_name, publication_title, url, external_identifier, edition_label, source_published_on, license_note, methodology_note, lifecycle_status, updated_at";

export async function listObservatorySources(): Promise<ObservatorySource[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("observatory_statistical_sources")
    .select(SOURCE_SELECT)
    .order("updated_at", { ascending: false })
    .limit(100);
  return (data ?? []) as ObservatorySource[];
}

export async function getObservatorySourceById(
  id: string,
): Promise<ObservatorySource | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("observatory_statistical_sources")
    .select(SOURCE_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data as ObservatorySource | null) ?? null;
}

export type SourceInput = {
  name: string;
  producer_name: string;
  publication_title: string;
  url?: string | null;
  external_identifier?: string | null;
  edition_label?: string | null;
  source_published_on?: string | null;
  license_note?: string | null;
  methodology_note?: string | null;
  lifecycle_status?: string;
};

export async function createObservatorySource(
  input: SourceInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("observatory_statistical_sources")
    .insert({
      name: input.name.trim(),
      producer_name: input.producer_name.trim(),
      publication_title: input.publication_title.trim(),
      url: input.url?.trim() || null,
      external_identifier: input.external_identifier?.trim() || null,
      edition_label: input.edition_label?.trim() || null,
      source_published_on: input.source_published_on || null,
      license_note: input.license_note?.trim() || null,
      methodology_note: input.methodology_note?.trim() || null,
      lifecycle_status: input.lifecycle_status ?? "active",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true, id: data.id as string };
}

export async function updateObservatorySource(
  id: string,
  patch: Partial<SourceInput>,
): Promise<{ ok: true } | { ok: false; error: AppError }> {
  const allowed: Record<string, unknown> = {};
  for (const key of [
    "name",
    "producer_name",
    "publication_title",
    "url",
    "external_identifier",
    "edition_label",
    "source_published_on",
    "license_note",
    "methodology_note",
    "lifecycle_status",
  ] as const) {
    if (key in patch) {
      const val = patch[key];
      if (typeof val === "string") {
        allowed[key] = val.trim() || null;
      } else {
        allowed[key] = val ?? null;
      }
    }
  }

  if (Object.keys(allowed).length === 0) {
    return {
      ok: false,
      error: { code: "validation", message: "Nessun campo da aggiornare." },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("observatory_statistical_sources")
    .update(allowed)
    .eq("id", id);

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Indicator values
// ---------------------------------------------------------------------------

export type ObservatoryIndicatorValue = {
  id: string;
  indicator_id: string;
  source_id: string;
  numeric_value: number;
  period_start: string;
  period_end: string;
  status: string;
  quality_code: string;
  territory_level: string | null;
  territory_label: string | null;
  published_at: string | null;
  withdrawn_at: string | null;
  supersedes_value_id: string | null;
  updated_at: string;
};

const VALUE_SELECT =
  "id, indicator_id, source_id, numeric_value, period_start, period_end, status, quality_code, territory_level, territory_label, published_at, withdrawn_at, supersedes_value_id, updated_at";

export async function listObservatoryIndicatorValues(
  indicatorId?: string,
): Promise<ObservatoryIndicatorValue[]> {
  const supabase = await createClient();
  let query = supabase
    .from("observatory_indicator_values")
    .select(VALUE_SELECT)
    .order("period_start", { ascending: false });

  if (indicatorId) {
    query = query.eq("indicator_id", indicatorId);
  }

  const { data } = await query.limit(100);
  return (data ?? []) as ObservatoryIndicatorValue[];
}

export type ValueInput = {
  indicator_id: string;
  source_id: string;
  numeric_value: number;
  period_start: string;
  period_end: string;
  quality_code: string;
  status?: string;
  territory_level?: string | null;
  territory_label?: string | null;
};

export async function createObservatoryIndicatorValue(
  input: ValueInput,
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const status = input.status ?? "provisional";
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("observatory_indicator_values")
    .insert({
      indicator_id: input.indicator_id,
      source_id: input.source_id,
      numeric_value: input.numeric_value,
      period_start: input.period_start,
      period_end: input.period_end,
      quality_code: input.quality_code,
      status,
      territory_level: input.territory_level || null,
      territory_label: input.territory_label?.trim() || null,
      published_at: now,
      revised_at: status === "revised" ? now : null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: mapPostgresError(error) };
  }
  return { ok: true, id: data.id as string };
}

export async function reviseObservatoryIndicatorValue(
  oldId: string,
  newPayload: ValueInput & { status: "revised" | "final" },
): Promise<{ ok: true; id: string } | { ok: false; error: AppError }> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Partial unique index on non-withdrawn logical keys requires withdrawing
  // the predecessor before inserting the successor (same period/dimensions).
  const { error: updateError } = await supabase
    .from("observatory_indicator_values")
    .update({
      status: "withdrawn",
      withdrawn_at: now,
    })
    .eq("id", oldId);

  if (updateError) {
    return { ok: false, error: mapPostgresError(updateError) };
  }

  const { data: newRow, error: insertError } = await supabase
    .from("observatory_indicator_values")
    .insert({
      indicator_id: newPayload.indicator_id,
      source_id: newPayload.source_id,
      numeric_value: newPayload.numeric_value,
      period_start: newPayload.period_start,
      period_end: newPayload.period_end,
      quality_code: newPayload.quality_code,
      status: newPayload.status,
      territory_level: newPayload.territory_level || null,
      territory_label: newPayload.territory_label?.trim() || null,
      supersedes_value_id: oldId,
      published_at: now,
      revised_at: newPayload.status === "revised" ? now : null,
    })
    .select("id")
    .single();

  if (insertError) {
    return { ok: false, error: mapPostgresError(insertError) };
  }

  return { ok: true, id: newRow.id as string };
}
