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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="bg-surface text-ink min-h-screen antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
