import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  alternates: { canonical: "/cookie" },
};

export default function CookieLayout({ children }: { children: ReactNode }) {
  return children;
}
