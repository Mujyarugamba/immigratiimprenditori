import type { Metadata } from "next";
import { Suspense } from "react";
import HomeHeroShell from "@/components/home/HomeHeroShell";
import HomePage from "@/components/home/HomePage";
import "@/components/home/home-v2.css";
import "@/components/home/home-v2-performance.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Page() {
  return (
    <>
      <div className="home-v2 home-v2-static-shell">
        <HomeHeroShell />
      </div>
      <Suspense fallback={null}>
        <HomePage />
      </Suspense>
    </>
  );
}
