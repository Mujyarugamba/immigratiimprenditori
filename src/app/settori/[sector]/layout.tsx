import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSectorDetail } from "@/lib/data/public/sectors";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ sector: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { sector: slug } = await params;
  const detail = await getSectorDetail(slug).catch(() => null);
  if (!detail?.hasEvidence) return {};

  const description = `Indicatori e dati verificati disponibili per il settore ${detail.sector.name} nel Centro Studi Immigrati Imprenditori.`;
  const social = pageSocialMetadata({
    title: `${detail.sector.name} | Immigrati Imprenditori`,
    description,
    pathname: `/settori/${detail.sector.slug}`,
  });

  return { twitter: social.twitter };
}

export default function SectorSocialLayout({ children }: Props) {
  return children;
}
