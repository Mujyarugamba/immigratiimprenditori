import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { listPublicOrganizations } from "@/lib/data/public/organizations";
import { param } from "@/lib/data/public/paging";
import {
  label,
  ORGANIZATION_TYPES,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const title = "Organizzazioni";
const description =
  "Enti, istituzioni e organizzazioni che operano a supporto dell'imprenditoria e delle reti territoriali.";

export const metadata: Metadata = {
  title,
  description,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganizzazioniPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    tipo: param(params, "tipo"),
  };

  let result;
  try {
    result = await listPublicOrganizations(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare le organizzazioni"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/organizzazioni"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title={title}
      description={description}
      basePath="/organizzazioni"
      filters={[
        textFilter("q", "Cerca", "Nome o sintesi…"),
        selectFilter("tipo", "Tipologia", ORGANIZATION_TYPES),
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/organizzazioni/${item.slug}`,
        title: item.name,
        description: item.summary,
        badges: [label(ORGANIZATION_TYPES, item.type_code)],
        meta: item.seat_city_label ? [item.seat_city_label] : undefined,
      })}
      emptyTitle="Nessuna organizzazione trovata."
      emptyDescription="Nessuna organizzazione corrisponde ai filtri selezionati."
    />
  );
}
