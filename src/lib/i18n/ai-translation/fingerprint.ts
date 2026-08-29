import { stripContentsAcquisitionTrailer } from "@/lib/contents/strip-acquisition-trailer";
import { checksumSha256 } from "@/lib/external-data/checksum";

export type EditorialFingerprintSource = {
  id: string;
  language_id: number;
  title: string;
  subtitle?: string | null;
  abstract?: string | null;
  body: string;
  body_format: string;
};

export function editorialContentFingerprint(source: EditorialFingerprintSource): string {
  return checksumSha256({
    content_id: source.id,
    language_id: source.language_id,
    title: source.title,
    subtitle: source.subtitle ?? null,
    abstract: source.abstract ?? null,
    body: stripContentsAcquisitionTrailer(source.body),
    body_format: source.body_format,
  });
}

export function fingerprintsMatch(left: string, right: string): boolean {
  return left === right && left.length > 0;
}
