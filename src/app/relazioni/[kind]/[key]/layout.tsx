import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPublicKnowledgeNeighborhood } from "@/lib/data/public/knowledge";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ kind: string; key: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { kind, key } = await params;
  const neighborhood = await getPublicKnowledgeNeighborhood(kind, key).catch(() => null);
  if (!neighborhood) return {};

  const title = `${neighborhood.node.label} — Relazioni | Centro Studi`;
  const description = `Relazioni pubbliche e verificabili collegate a ${neighborhood.node.label} nel Knowledge Graph di Immigrati Imprenditori.`;
  return pageSocialMetadata({
    title,
    description,
    pathname: `/relazioni/${kind}/${encodeURIComponent(key)}`,
  });
}

export default function RelationalEntitySocialLayout({ children }: Props) {
  return children;
}
