import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: { canonical: "/sostieni" },
};

export default function SostieniLayout({ children }: { children: ReactNode }) {
  return children;
}
