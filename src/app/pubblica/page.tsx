import type { Metadata } from "next";
import { SectionPage } from "@/components/sections/SectionPage";
import { sections } from "@/data/sections";

const section = sections.pubblica;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

export default function PubblicaPage() {
  return <SectionPage {...section} />;
}
