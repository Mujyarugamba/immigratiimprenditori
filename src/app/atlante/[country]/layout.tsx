import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getAtlasCountryBySlug } from "@/lib/atlas/scope";
import { getAtlasCountryDetail } from "@/lib/data/public/atlas";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props = {
  children: ReactNode;
  params: Promise<{ country: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { country: slug } = await params;
  const country = getAtlasCountryBySlug(slug);
  if (!country) return {};
  const detail = await getAtlasCountryDetail(country).catch(() => null);
  if (!detail?.hasEvidence) return {};

  const description = `Dati, indicatori, rotte, analisi, storie ed eventi disponibili per ${country.name} nell'Atlante dell'imprenditoria migrante.`;
  const social = pageSocialMetadata({
    title: `${country.name} | Atlante dell'imprenditoria migrante`,
    description,
    pathname: `/atlante/${country.slug}`,
  });

  return { twitter: social.twitter };
}

export default function AtlasCountrySocialLayout({ children }: Props) {
  return children;
}
