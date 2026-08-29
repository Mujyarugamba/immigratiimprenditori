import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicContents } from "@/lib/data/public/contents";
import { param } from "@/lib/data/public/paging";
import {
  CONTENT_TYPES,
  formatItalianDate,
  label,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const section = sections["notizie-e-guide"];

export const metadata: Metadata = {
  title: "Analisi e ricerche",
  description: section.description,
  alternates: { canonical: "/contenuti" },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContenutiPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    tipo: param(params, "tipo"),
    in_evidenza: param(params, "in_evidenza"),
  };

  let result;
  try {
    result = await listPublicContents(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare analisi e ricerche"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/contenuti"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title="Analisi e ricerche"
      description={section.description}
      basePath="/contenuti"
      filters={[
        textFilter("q", "Cerca", "Titolo o sintesi…"),
        selectFilter("tipo", "Tipologia", CONTENT_TYPES),
        {
          kind: "select",
          name: "in_evidenza",
          label: "Evidenza",
          options: [{ value: "1", label: "Solo in evidenza" }],
        },
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/contenuti/${item.slug}`,
        title: item.title,
        description: item.abstract,
        badges: [
          label(CONTENT_TYPES, item.type_code),
          ...(item.is_featured ? ["In evidenza"] : []),
        ],
        meta: item.published_at ? [formatItalianDate(item.published_at)] : undefined,
      })}
      emptyTitle="Nessuna analisi o ricerca trovata."
      emptyDescription="Nessun contenuto corrisponde ai filtri selezionati."
    />
  );
}
