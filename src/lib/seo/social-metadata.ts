import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/i18n/seo";

const SITE_NAME = "Immigrati Imprenditori";
const SOCIAL_IMAGE = "/logo-immigrati-imprenditori.png";

type PageSocialMetadataInput = {
  title: string;
  description: string;
  pathname: string;
};

export function pageSocialMetadata({
  title,
  description,
  pathname,
}: PageSocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      url: absoluteUrl(pathname),
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: SOCIAL_IMAGE,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}
