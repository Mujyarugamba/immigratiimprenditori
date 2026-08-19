import type { Metadata } from "next";
import { centroStudiConfig } from "@immigrati/product-config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${centroStudiConfig.name} — Osservatorio sull'imprenditoria migrante`,
    template: `%s | ${centroStudiConfig.name}`,
  },
  description:
    "Osservatorio e Centro Studi AIPEL sull'imprenditoria migrante: dati, rapporti, storie, interviste, territori, politiche ed eventi in Italia e nel mondo.",
  openGraph: {
    type: "website",
    siteName: centroStudiConfig.name,
    title: `${centroStudiConfig.name} — Osservatorio sull'imprenditoria migrante`,
    description:
      "Dati, analisi e voci sull'imprenditoria generata dalle migrazioni, in qualunque direzione geografica.",
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
