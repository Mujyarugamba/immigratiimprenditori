import type { PublicIndicatorDetail } from "@/lib/data/public/observatory";
import { absoluteUrl } from "@/lib/i18n/seo";

function temporalCoverage(indicator: PublicIndicatorDetail) {
  if (indicator.values.length === 0) return undefined;
  const starts = indicator.values.map((value) => value.period_start).filter(Boolean).sort();
  const ends = indicator.values.map((value) => value.period_end).filter(Boolean).sort();
  if (starts.length === 0 || ends.length === 0) return undefined;
  return `${starts[0]}/${ends[ends.length - 1]}`;
}

function spatialCoverage(indicator: PublicIndicatorDetail) {
  const places = new Map<string, { "@type": "Place"; name: string; identifier?: string }>();
  for (const value of indicator.values) {
    const name = value.territory_label?.trim();
    if (!name) continue;
    const key = value.territory_code?.trim() || name;
    if (!places.has(key)) {
      places.set(key, {
        "@type": "Place",
        name,
        identifier: value.territory_code?.trim() || undefined,
      });
    }
  }
  const result = [...places.values()];
  return result.length > 0 ? result : undefined;
}

export function observatoryDatasetStructuredData(indicator: PublicIndicatorDetail) {
  const filter = `indicatore=${encodeURIComponent(indicator.slug)}`;
  const site = absoluteUrl("/");

  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: indicator.title,
    description: indicator.description,
    url: absoluteUrl(`/osservatorio/${indicator.slug}`),
    identifier: indicator.code,
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "Immigrati Imprenditori — Centro Studi AIPEL",
      url: site,
    },
    publisher: {
      "@type": "Organization",
      name: "Immigrati Imprenditori — Centro Studi AIPEL",
      url: site,
    },
    includedInDataCatalog: {
      "@type": "DataCatalog",
      name: "Immigrati Imprenditori — Open Data",
      url: absoluteUrl("/open-data"),
    },
    variableMeasured: {
      "@type": "PropertyValue",
      name: indicator.title,
      propertyID: indicator.code,
      unitText: indicator.unit_code,
      description: indicator.value_nature,
    },
    measurementTechnique: indicator.methodology_summary,
    temporalCoverage: temporalCoverage(indicator),
    spatialCoverage: spatialCoverage(indicator),
    distribution: [
      {
        "@type": "DataDownload",
        name: "JSON",
        encodingFormat: "application/json",
        contentUrl: absoluteUrl(`/api/open-data/indicators?${filter}`),
      },
      {
        "@type": "DataDownload",
        name: "CSV",
        encodingFormat: "text/csv",
        contentUrl: absoluteUrl(`/api/open-data/indicators.csv?${filter}`),
      },
      {
        "@type": "DataDownload",
        name: "XLSX",
        encodingFormat: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        contentUrl: absoluteUrl(`/api/open-data/indicators.xlsx?${filter}`),
      },
    ],
  };
}
