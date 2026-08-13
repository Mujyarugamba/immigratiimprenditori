/**
 * P-D acquisition trailers are stored in `contents.body` (CASE A; no sidecar table).
 * Public surfaces must not expose `d1d_*` technical provenance lines.
 */

const TRAILER_MARKER = /\n---\n(?:[^\n]*\n)*?d1d_natural_key:\s*\S+/;

export function stripContentsAcquisitionTrailer(body: string): string {
  const match = TRAILER_MARKER.exec(body);
  if (!match || match.index === undefined) return body;
  return body.slice(0, match.index).trimEnd();
}

export function extractContentsAcquisitionTrailer(
  body: string,
): string | null {
  const match = TRAILER_MARKER.exec(body);
  if (!match || match.index === undefined) return null;
  return body.slice(match.index);
}
