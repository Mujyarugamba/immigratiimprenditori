import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: { canonical: "/politica-editoriale" },
};

export default function PoliticaEditorialeLayout({ children }: { children: ReactNode }) {
  return children;
}
