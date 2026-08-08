/**
 * Prevent open redirects: only allow relative in-app paths.
 */
export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback = "/app",
): string {
  if (!candidate) {
    return fallback;
  }
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }
  if (candidate.includes("://") || candidate.includes("\\")) {
    return fallback;
  }
  return candidate;
}
