import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/i18n/seo";

const SITE_NAME = "Immigrati Imprenditori";
const SOCIAL_IMAGE = "/logo-immigrati-imprenditori.png";

type PageSocialMetadataInput = {
  title: string;
  description: string;
  pathname: string;
};

type ProfileSocialMetadataInput = PageSocialMetadataInput & {
  image?: string | null;
  imageAlt?: string | null;
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

export function profileSocialMetadata({
  title,
  description,
  pathname,
  image,
  imageAlt,
}: ProfileSocialMetadataInput): Pick<Metadata, "openGraph" | "twitter"> {
  const resolvedImage = image?.trim() || SOCIAL_IMAGE;
  const resolvedAlt = imageAlt?.trim() || title;

  return {
    openGraph: {
      type: "profile",
      url: absoluteUrl(pathname),
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: resolvedImage,
          alt: resolvedAlt,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [resolvedImage],
    },
  };
}
