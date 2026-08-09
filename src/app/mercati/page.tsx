import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicMarkets } from "@/lib/data/public/markets";
import { param } from "@/lib/data/public/paging";
import {
  label,
  MARKET_KINDS,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const section = sections["lingue-e-mercati"];

export const metadata: Metadata = {
  title: "Mercati internazionali",
  description: section.description,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MercatiPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    tipo: param(params, "tipo"),
  };

  let result;
  try {
    result = await listPublicMarkets(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare i mercati"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/mercati"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title="Mercati internazionali"
      description={section.description}
      basePath="/mercati"
      filters={[
        textFilter("q", "Cerca", "Nome o sintesi…"),
        selectFilter("tipo", "Tipo", MARKET_KINDS),
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/mercati/${item.code}`,
        title: item.name,
        description: item.summary,
        badges: [label(MARKET_KINDS, item.market_kind)],
      })}
      emptyTitle="Nessun mercato trovato"
      emptyDescription="Non ci sono mercati pubblicati che corrispondono ai filtri selezionati."
    />
  );
}
