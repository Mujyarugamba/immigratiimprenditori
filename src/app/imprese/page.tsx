import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicBusinesses } from "@/lib/data/public/businesses";
import { param } from "@/lib/data/public/paging";
import {
  label,
  ORGANIZATION_FORMS,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const section = sections.imprese;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ImpresePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    forma: param(params, "forma"),
  };

  let result;
  try {
    result = await listPublicBusinesses(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare le imprese"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/imprese"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title={section.title}
      description={section.description}
      basePath="/imprese"
      filters={[
        textFilter("q", "Cerca", "Nome, denominazione o sintesi…"),
        selectFilter("forma", "Forma organizzativa", ORGANIZATION_FORMS),
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/imprese/${item.id}`,
        title: item.public_name,
        description: item.summary,
        meta: [
          item.organization_form
            ? label(ORGANIZATION_FORMS, item.organization_form)
            : null,
          item.founding_year ? `Avvio ${item.founding_year}` : null,
        ].filter(Boolean) as string[],
      })}
      emptyTitle="Nessuna impresa trovata"
      emptyDescription="Non ci sono imprese pubblicate che corrispondono ai filtri selezionati."
    />
  );
}
