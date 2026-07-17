import type { Metadata } from "next";
import { SectionPage } from "@/components/sections/SectionPage";
import { sections } from "@/data/sections";

const section = sections.collaborazioni;

export const metadata: Metadata = {
  title: section.title,
  description: section.description,
};

export default function CollaborazioniPage() {
  return <SectionPage {...section} />;
}
