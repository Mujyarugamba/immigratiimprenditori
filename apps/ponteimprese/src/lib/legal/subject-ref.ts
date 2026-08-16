/**
 * Opaque legal subject_ref for M2 archive inserts (M3 contract).
 * Server-only. Never import from Client Components.
 *
 * Algorithm: "ls_" + hex(HMAC-SHA256(accountId, LEGAL_SUBJECT_HMAC_SECRET))
 * Forbidden: SHA256(email), browser secrets, reversible PII encoding.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { getLegalSubjectHmacSecret } from "@/lib/env";

const PREFIX = "ls_";

/** Stable opaque subject_ref for a given accounts.id. */
export function subjectRefForAccountId(
  accountId: string,
  secret: string = getLegalSubjectHmacSecret(),
): string {
  if (!/^[0-9a-f-]{36}$/i.test(accountId)) {
    throw new Error("accountId must be a UUID");
  }
  const digest = createHmac("sha256", secret)
    .update(accountId.toLowerCase(), "utf8")
    .digest("hex");
  return `${PREFIX}${digest}`;
}

/** Constant-time compare of two subject_ref values. */
export function subjectRefsEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
