import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: { canonical: "/chi-siamo" },
};

export default function ChiSiamoLayout({ children }: { children: ReactNode }) {
  return children;
}
