import type { Metadata } from "next";
import { centroStudiConfig } from "@immigrati/product-config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSiteUrl } from "@/lib/env";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${centroStudiConfig.name} — Osservatorio sull'imprenditoria migrante`,
    template: `%s | ${centroStudiConfig.name}`,
  },
  description:
    "Osservatorio e Centro Studi AIPEL sull'imprenditoria migrante: dati, rapporti, storie, interviste, territori, politiche ed eventi in Italia e nel mondo.",
  openGraph: {
    type: "website",
    siteName: centroStudiConfig.name,
    locale: "it_IT",
    title: `${centroStudiConfig.name} — Osservatorio sull'imprenditoria migrante`,
    description:
      "Dati, analisi e voci sull'imprenditoria generata dalle migrazioni, in qualunque direzione geografica.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "AIPEL — Associazione degli Imprenditori e Liberi Professionisti Extracomunitari in Lombardia",
  alternateName: "AIPEL",
  url: siteUrl,
  email: "info@immigratiimprenditori.it",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Viale Molise 54",
    postalCode: "20137",
    addressLocality: "Milano",
    addressRegion: "MI",
    addressCountry: "IT",
  },
  identifier: [
    {
      "@type": "PropertyValue",
      propertyID: "Codice fiscale",
      value: "97342380157",
    },
    {
      "@type": "PropertyValue",
      propertyID: "Partita IVA",
      value: "04222160964",
    },
  ],
  publishingPrinciples: `${siteUrl}/fonti`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="bg-surface text-ink min-h-screen antialiased">
        <JsonLd data={organizationJsonLd} />
        <a
          href="#contenuto"
          className="sr-only fixed left-4 top-4 z-50 bg-black px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        >
          Vai al contenuto
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
