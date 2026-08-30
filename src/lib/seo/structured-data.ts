import { absoluteUrl } from "@/lib/i18n/seo";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export function breadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function schemaEventStatus(occurrenceStatus: string) {
  if (occurrenceStatus === "postponed") {
    return "https://schema.org/EventPostponed";
  }
  if (occurrenceStatus === "cancelled") {
    return "https://schema.org/EventCancelled";
  }
  return "https://schema.org/EventScheduled";
}
