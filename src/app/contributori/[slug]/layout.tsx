import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { profileSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

async function getProfile(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name, slug, bio, avatar_url")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  if (!profile) return {};

  const description =
    profile.bio ??
    `Profilo di ${profile.display_name} nel Centro Studi Immigrati Imprenditori.`;
  const social = profileSocialMetadata({
    title: profile.display_name,
    description,
    pathname: `/contributori/${profile.slug}`,
    image: profile.avatar_url,
    imageAlt: profile.display_name,
  });

  return { twitter: social.twitter };
}

export default function ContributorSocialLayout({ children }: Props) {
  return children;
}
