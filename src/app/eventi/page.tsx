import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicEvents } from "@/lib/data/public/events";
import { param } from "@/lib/data/public/paging";
import {
  EVENT_DELIVERY_MODES,
  EVENT_TYPES,
  formatItalianDateTime,
  label,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const section = sections.eventi;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventiPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filterValues = {
    q: param(params, "q"),
    tipo: param(params, "tipo"),
    modalita: param(params, "modalita"),
  };

  let result;
  try {
    result = await listPublicEvents(params);
  } catch {
    return (
      <ErrorState
        title="Impossibile caricare gli eventi"
        description="Si è verificato un problema temporaneo. Riprova tra qualche istante."
        actionHref="/eventi"
        actionLabel="Riprova"
      />
    );
  }

  return (
    <PublicListLayout
      title={section.title}
      description={section.description}
      basePath="/eventi"
      filters={[
        textFilter("q", "Cerca", "Titolo o sintesi…"),
        selectFilter("tipo", "Tipo", EVENT_TYPES),
        selectFilter("modalita", "Modalità", EVENT_DELIVERY_MODES),
      ]}
      filterValues={filterValues}
      result={result}
      mapItem={(item) => ({
        href: `/eventi/${item.id}`,
        title: item.title,
        description: item.summary,
        badges: [
          label(EVENT_TYPES, item.type_code),
          label(EVENT_DELIVERY_MODES, item.delivery_mode),
        ],
        meta: item.next_edition
          ? [
              formatItalianDateTime(item.next_edition.starts_at),
              item.next_edition.city_text ?? undefined,
            ].filter(Boolean) as string[]
          : undefined,
      })}
      emptyTitle="Nessun evento trovato"
      emptyDescription="Non ci sono eventi pubblicati che corrispondono ai filtri selezionati."
    />
  );
}
