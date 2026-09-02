import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isPlatformLocale } from "@/lib/i18n/config";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

type Props = { params: Promise<{ locale: string }> };

export default async function LocalizedEditorialPolicyBridge({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  redirect("/politica-editoriale");
}
