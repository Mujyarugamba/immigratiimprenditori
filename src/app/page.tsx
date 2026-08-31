import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomeLightPreviewPage() {
  return (
    <>
      <link rel="stylesheet" href="/home-light-v1.css" />
      <HomePage />
    </>
  );
}
