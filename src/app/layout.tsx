import type { Metadata } from "next";
import { centroStudiConfig } from "@immigrati/product-config";
import "./globals.css";

export const metadata: Metadata = {
  title: centroStudiConfig.name,
  description: centroStudiConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
