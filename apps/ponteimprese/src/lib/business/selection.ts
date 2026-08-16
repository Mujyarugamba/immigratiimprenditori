/** Pure selection helpers (no Next.js runtime). */

export function resolveSelectedBusinessId(
  preferred: string | null,
  contextBusinessIds: string[],
): string | null {
  if (preferred && contextBusinessIds.includes(preferred)) {
    return preferred;
  }
  return contextBusinessIds[0] ?? null;
}
