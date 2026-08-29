const inflight = new Map<string, Promise<unknown>>();

export function translationFlightKey(contentId: string, targetLocale: string): string {
  return `${contentId}:${targetLocale}`;
}

export async function singleFlight<T>(key: string, work: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const pending = work().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
}

export function resetTranslationFlightsForTests(): void {
  inflight.clear();
}
