import type { Metadata } from "next";
import { SectionPage } from "@/components/sections/SectionPage";
import { sections } from "@/data/sections";

const section = sections["notizie-e-guide"];

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

export default function NotizieEGuidePage() {
  return <SectionPage {...section} />;
}
