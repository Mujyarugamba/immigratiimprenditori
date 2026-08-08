import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicIndicators } from "@/lib/data/public/observatory";
import { param } from "@/lib/data/public/paging";
import { textFilter } from "@/lib/public/labels";

const section = sections.osservatorio;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
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
      filters={[textFilter("q", "Cerca", "Titolo, codice o descrizione…")]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/osservatorio/${item.slug}`,
        title: item.title,
        description: item.description,
        meta: [item.code, item.unit_code, item.periodicity].filter(Boolean),
      })}
      emptyTitle="Nessun indicatore trovato"
      emptyDescription="Non ci sono indicatori pubblicati che corrispondono ai filtri selezionati."
    />
  );
}
