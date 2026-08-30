import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPublicAuthorProfile } from "@/lib/data/public/authors";
import { profileSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicAuthorProfile(slug).catch(() => null);
  if (!profile) return {};

  const description =
    profile.bio ??
    `Profilo autore di ${profile.display_name} nel Centro Studi Immigrati Imprenditori.`;
  const social = profileSocialMetadata({
    title: profile.display_name,
    description,
    pathname: `/autori/${profile.slug}`,
  });

  return { twitter: social.twitter };
}

export default function AuthorSocialLayout({ children }: Props) {
  return children;
}
