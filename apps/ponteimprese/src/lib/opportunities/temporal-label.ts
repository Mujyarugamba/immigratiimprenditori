/** Human temporal labels for opportunity access windows (derived, not persisted). */

export type TemporalLabelCode =
  | "scheduled"
  | "open"
  | "expiring"
  | "expired"
  | "open_ended"
  | "unknown";

export const TEMPORAL_LABELS_IT: Record<TemporalLabelCode, string> = {
  scheduled: "In apertura",
  open: "Aperta",
  expiring: "In scadenza",
  expired: "Scaduta",
  open_ended: "Senza scadenza",
  unknown: "Stato temporale non disponibile",
};

const EXPIRING_MS = 14 * 24 * 60 * 60 * 1000;

export function deriveTemporalLabel(input: {
  opensAt: string | null;
  closesAt: string | null;
  openEnded: boolean;
  now?: Date;
}): TemporalLabelCode {
  const now = (input.now ?? new Date()).getTime();
  if (input.openEnded || (input.opensAt == null && input.closesAt == null)) {
    if (input.openEnded) return "open_ended";
    return "unknown";
  }
  if (input.closesAt) {
    const close = Date.parse(input.closesAt);
    if (!Number.isNaN(close) && close < now) return "expired";
    if (!Number.isNaN(close) && close - now <= EXPIRING_MS) return "expiring";
  }
  if (input.opensAt) {
    const open = Date.parse(input.opensAt);
    if (!Number.isNaN(open) && open > now) return "scheduled";
  }
  return "open";
}

export function temporalLabelIt(code: TemporalLabelCode): string {
  return TEMPORAL_LABELS_IT[code];
}
