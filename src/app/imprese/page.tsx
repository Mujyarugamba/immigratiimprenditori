import type { Metadata } from "next";
import { SectionPage } from "@/components/sections/SectionPage";
import { sections } from "@/data/sections";

const section = sections.imprese;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

export default function ImpresePage() {
  return <SectionPage {...section} />;
}
