import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTerritoryDetail } from "@/lib/data/public/territories";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getTerritoryDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) return {};

  const title = `${detail.territory.name} | Territori`;
  const description = `Dati, analisi, storie ed eventi disponibili per ${detail.territory.name} nel Centro Studi Immigrati Imprenditori.`;
  return pageSocialMetadata({
    title,
    description,
    pathname: `/territori/${detail.territory.slug}`,
  });
}

export default function TerritorySocialLayout({ children }: Props) {
  return children;
}
