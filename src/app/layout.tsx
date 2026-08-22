import type { Metadata } from "next";
import { centroStudiConfig } from "@immigrati/product-config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";
import "./responsive-overrides.css";

const SITE_URL = "https://immigratiimprenditori.it";
const SITE_DESCRIPTION = centroStudiConfig.description;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Immigrati Imprenditori",
  title: {
    default: centroStudiConfig.name,
    template: `%s | Centro Studi`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Immigrati Imprenditori" }],
  creator: "Immigrati Imprenditori",
  publisher: "AIPEL",
  category: "Ricerca e analisi sull'imprenditoria migrante",
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: "Immigrati Imprenditori",
    title: centroStudiConfig.name,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo-immigrati-imprenditori.png",
        alt: "Immigrati Imprenditori",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: centroStudiConfig.name,
    description: SITE_DESCRIPTION,
    images: ["/logo-immigrati-imprenditori.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Immigrati Imprenditori",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-immigrati-imprenditori.png`,
      parentOrganization: {
        "@type": "Organization",
        name: "AIPEL",
      },
      email: "info@immigratiimprenditori.it",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Immigrati Imprenditori",
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "it",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/cerca?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="bg-surface text-ink min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
