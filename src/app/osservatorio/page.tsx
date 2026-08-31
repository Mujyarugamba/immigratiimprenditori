import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicIndicators } from "@/lib/data/public/observatory";
import { param } from "@/lib/data/public/paging";
import {
  OBSERVATORY_PERIODICITY_LABELS,
  OBSERVATORY_UNIT_LABELS,
  label,
  textFilter,
} from "@/lib/public/labels";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

const section = sections.osservatorio;
const seoTitle = "Osservatorio sull’imprenditoria migrante";

export const metadata: Metadata = {
  title: seoTitle,
  description: section.description,
  alternates: { canonical: "/osservatorio" },
  ...pageSocialMetadata({
    title: seoTitle,
    description: section.description,
    pathname: "/osservatorio",
  }),
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OsservatorioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
  };

  let result;
  try {
    result = await listPublicIndicators(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare l'osservatorio"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/osservatorio"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title={section.title}
      description={section.description}
      basePath="/osservatorio"
      filters={[textFilter("q", "Cerca", "Titolo o descrizione…")]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/osservatorio/${item.slug}`,
        title: item.title,
        description: item.description,
        meta: [
          item.periodicity
            ? label(OBSERVATORY_PERIODICITY_LABELS, item.periodicity)
            : "",
          item.unit_code
            ? label(OBSERVATORY_UNIT_LABELS, item.unit_code)
            : "",
        ].filter(Boolean),
      })}
      emptyTitle="Nessun indicatore disponibile."
      emptyDescription="Nessun indicatore corrisponde ai filtri selezionati."
    />
  );
}
