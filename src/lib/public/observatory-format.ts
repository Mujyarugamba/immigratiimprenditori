export function formatObservatoryValue(
  value: number,
  unitCode: string,
  locale = "it-IT",
) {
  switch (unitCode) {
    case "percent":
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)}%`;
    case "eur":
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
      }).format(value);
    case "eur_thousands":
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} mila €`;
    case "ratio":
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(value);
    case "index_points":
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)} punti`;
    case "units":
    default:
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  }
}

export function formatObservatoryPeriod(
  start: string,
  end: string,
  periodicity: string,
  locale = "it-IT",
) {
  const startDate = new Date(`${start}T00:00:00Z`);
  const endDate = new Date(`${end}T00:00:00Z`);

  if (periodicity === "annual" && startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
    return String(startDate.getUTCFullYear());
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
}

export const OBSERVATORY_QUALITY_LABELS: Record<string, string> = {
  official: "Ufficiale",
  estimated: "Stimato",
  derived: "Derivato",
  self_reported: "Autodichiarato",
};

export const OBSERVATORY_VALUE_STATUS_LABELS: Record<string, string> = {
  provisional: "Provvisorio",
  final: "Definitivo",
  revised: "Revisionato",
  withdrawn: "Ritirato",
};
