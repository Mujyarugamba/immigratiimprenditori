import type { Metadata } from "next";
import { centroStudiConfig } from "@immigrati/product-config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: centroStudiConfig.name,
    template: `%s | Centro Studi`,
  },
  description: centroStudiConfig.description,
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
