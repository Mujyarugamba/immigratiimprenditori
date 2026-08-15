import type { Metadata } from "next";
import { ponteImpreseConfig } from "@immigrati/product-config";
import "./globals.css";

export const metadata: Metadata = {
  title: ponteImpreseConfig.name,
  description: ponteImpreseConfig.description,
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
