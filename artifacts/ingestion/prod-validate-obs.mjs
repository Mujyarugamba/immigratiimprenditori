import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing env");
  process.exit(1);
}
if (url.includes("127.0.0.1") || url.includes("localhost")) {
  console.error("Refusing local URL for production validate");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: ind, error: e1 } = await sb
  .from("observatory_indicators")
  .select(
    "id,code,slug,title,publication_status,unit_code,periodicity,methodology_summary",
  )
  .eq("code", "OBS-EU-SELF-CIT")
  .maybeSingle();
if (e1) throw e1;
if (!ind) {
  const { data: all, error: eAll } = await sb
    .from("observatory_indicators")
    .select("code,publication_status")
    .limit(20);
  console.error(
    JSON.stringify({ missingIndicator: true, sample: all, eAll }),
  );
  process.exit(1);
}

const { data: src, error: e2 } = await sb
  .from("observatory_statistical_sources")
  .select("external_identifier,license_note,lifecycle_status,name")
  .eq("external_identifier", "eurostat:lfsa_esgan")
  .maybeSingle();
if (e2) throw e2;

const { data: vals, error: e3 } = await sb
  .from("observatory_indicator_values")
  .select(
    "numeric_value,period_start,territory_code,territory_label,country_code,country_label,quality_code,status",
  )
  .eq("indicator_id", ind.id)
  .neq("status", "withdrawn")
  .order("period_start")
  .order("country_code");
if (e3) throw e3;

const keys = vals.map((v) =>
  [v.period_start, v.territory_code, v.country_code].join("|"),
);
const duplicates = keys.length !== new Set(keys).size;

console.log(
  JSON.stringify(
    {
      host: new URL(url).host,
      indicator: {
        code: ind.code,
        slug: ind.slug,
        title: ind.title,
        publication_status: ind.publication_status,
        unit_code: ind.unit_code,
        periodicity: ind.periodicity,
        methodologyMentionsCitizenship: /cittadinanza/i.test(
          ind.methodology_summary,
        ),
        methodologyMentionsThsPer: /THS_PER/.test(ind.methodology_summary),
      },
      source: {
        name: src.name,
        external_identifier: src.external_identifier,
        lifecycle_status: src.lifecycle_status,
        hasLicense: Boolean(src.license_note),
      },
      valueCount: vals.length,
      values: vals,
      duplicates,
    },
    null,
    2,
  ),
);
