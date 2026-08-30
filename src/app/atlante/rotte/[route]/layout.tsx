import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getRouteDetail } from "@/lib/data/public/routes";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ route: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { route: slug } = await params;
  const detail = await getRouteDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) return {};

  const title = `${detail.route.origin.name} → ${detail.route.destination.name} | Atlante`;
  const description = `Dati e contenuti verificati sulla rotta imprenditoriale ${detail.route.origin.name} → ${detail.route.destination.name}.`;
  const social = pageSocialMetadata({
    title,
    description,
    pathname: `/atlante/rotte/${detail.route.slug}`,
  });

  return { twitter: social.twitter };
}

export default function AtlasRouteSocialLayout({ children }: Props) {
  return children;
}
