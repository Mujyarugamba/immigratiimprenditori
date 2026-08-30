import { getPublicEventById } from "@/lib/data/public/events";
import { absoluteUrl } from "@/lib/i18n/seo";

function icsEscape(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function icsDate(value: string) {
  const date = new Date(value);
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const event = await getPublicEventById(id).catch(() => null);
  if (!event || event.editions.length === 0) {
    return new Response("Evento non disponibile", { status: 404 });
  }

  const edition = event.editions.find((item) => item.occurrence_status === "scheduled" || item.occurrence_status === "ongoing") ?? event.editions[0];
  const location = [edition.venue_label, edition.city_text, edition.country_ref].filter(Boolean).join(", ");
  const url = event.source_url ?? edition.online_reference ?? absoluteUrl(`/eventi/${event.id}`);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Immigrati Imprenditori//Centro Studi//IT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}-${edition.id}@immigratiimprenditori.it`,
    `DTSTAMP:${icsDate(new Date().toISOString())}`,
    `DTSTART:${icsDate(edition.starts_at)}`,
    edition.ends_at ? `DTEND:${icsDate(edition.ends_at)}` : "",
    `SUMMARY:${icsEscape(event.title)}`,
    event.summary ? `DESCRIPTION:${icsEscape(event.summary)}` : "",
    location ? `LOCATION:${icsEscape(location)}` : "",
    `URL:${icsEscape(url)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="evento-${event.id}.ics"`,
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
    },
  });
}
