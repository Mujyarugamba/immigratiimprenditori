function asUtcDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid trend period: ${value}`);
  }
  return date;
}

function formatUtcPeriod(
  date: Date,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("it-IT", {
    ...options,
    timeZone: "UTC",
  }).format(date);
}

export function formatTrendPeriodBounds(
  firstValue: string,
  lastValue: string,
): [string, string] {
  const first = asUtcDate(firstValue);
  const last = asUtcDate(lastValue);
  const sameYear = first.getUTCFullYear() === last.getUTCFullYear();

  if (!sameYear) {
    return [
      String(first.getUTCFullYear()),
      String(last.getUTCFullYear()),
    ];
  }

  const sameMonth = first.getUTCMonth() === last.getUTCMonth();
  if (!sameMonth) {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      year: "numeric",
    };
    return [
      formatUtcPeriod(first, options),
      formatUtcPeriod(last, options),
    ];
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  const firstLabel = formatUtcPeriod(first, options);
  const lastLabel = formatUtcPeriod(last, options);

  return first.getUTCDate() === last.getUTCDate()
    ? [firstLabel, "stesso periodo"]
    : [firstLabel, lastLabel];
}
