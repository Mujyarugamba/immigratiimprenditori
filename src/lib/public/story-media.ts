const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,32}$/;

export function youtubePrivacyEmbedUrl(externalId: string | null) {
  if (!externalId || !YOUTUBE_ID.test(externalId)) return null;
  return `https://www.youtube-nocookie.com/embed/${externalId}`;
}

export function safeHttpsUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
