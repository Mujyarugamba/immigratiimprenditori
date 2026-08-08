import { SectionIntro } from "@/components/ui/SectionIntro";

type PublicPageHeaderProps = {
  title: string;
  description: string;
};

export function PublicPageHeader({ title, description }: PublicPageHeaderProps) {
  return <SectionIntro title={title} description={description} />;
}
