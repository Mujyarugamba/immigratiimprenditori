import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: { canonical: "/termini" },
};

export default function TerminiLayout({ children }: { children: ReactNode }) {
  return children;
}
