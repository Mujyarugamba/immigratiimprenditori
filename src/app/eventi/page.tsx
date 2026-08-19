import type { Metadata } from "next";
import { PublicListLayout } from "@/components/public/PublicListLayout";
import { ErrorState } from "@/components/ui/states";
import { sections } from "@/data/sections";
import { listPublicEvents, type PublicEventEdition } from "@/lib/data/public/events";
import { param } from "@/lib/data/public/paging";
import {
  EVENT_DELIVERY_MODES,
  EVENT_TYPES,
  label,
  selectFilter,
  textFilter,
} from "@/lib/public/labels";

const section = sections.eventi;

const TEMPORAL_LABELS = {
  upcoming: "Futuro",
  ongoing: "In corso",
  past: "Passato",
} as const;

function formatEditionWhen(edition: PublicEventEdition): string {
  const dateFormatter = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeZone: edition.timezone,
  });
  const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: edition.timezone,
  });

  const start = new Date(edition.starts_at);
  const end = edition.ends_at ? new Date(edition.ends_at) : null;
  if (edition.all_day) {
    const startLabel = dateFormatter.format(start);
    const endLabel = end ? dateFormatter.format(end) : null;
    return endLabel && endLabel !== startLabel
      ? `${startLabel} – ${endLabel}`
      : startLabel;
  }

  const startLabel = dateTimeFormatter.format(start);
  const endLabel = end ? dateTimeFormatter.format(end) : null;
  return endLabel ? `${startLabel} – ${endLabel}` : startLabel;
}

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
          item.temporal_status ? TEMPORAL_LABELS[item.temporal_status] : null,
          label(EVENT_TYPES, item.type_code),
          label(EVENT_DELIVERY_MODES, item.delivery_mode),
        ].filter((value): value is string => Boolean(value)),
        meta: item.next_edition
          ? [
              formatEditionWhen(item.next_edition),
              item.next_edition.all_day ? undefined : item.next_edition.timezone,
              item.next_edition.city_text ??
                item.next_edition.venue_label ??
                (item.next_edition.delivery_mode === "online"
                  ? "Online"
                  : undefined),
              item.external_organization_label ?? undefined,
            ].filter(Boolean) as string[]
          : item.external_organization_label
            ? [item.external_organization_label]
            : undefined,
      })}
      emptyTitle="Nessun evento trovato."
      emptyDescription="Nessun evento corrisponde ai filtri selezionati."
    />
  );
}
