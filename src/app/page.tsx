import { CollaborationsSection } from "@/components/home/CollaborationsSection";
import { DemoNotice } from "@/components/home/DemoNotice";
import { EnterprisesSection } from "@/components/home/EnterprisesSection";
import { EventsSection } from "@/components/home/EventsSection";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { InstitutionsSection } from "@/components/home/InstitutionsSection";
import { LanguagesSection } from "@/components/home/LanguagesSection";
import { NewsSection } from "@/components/home/NewsSection";
import { ObservatorySection } from "@/components/home/ObservatorySection";
import { OpportunitiesSection } from "@/components/home/OpportunitiesSection";
import { ProfessionalsSection } from "@/components/home/ProfessionalsSection";
import { QuickAccess } from "@/components/home/QuickAccess";
import { StoriesSection } from "@/components/home/StoriesSection";

export default function HomePage() {
  return (
    <>
      <DemoNotice />
      <Hero />
      <QuickAccess />
      <CollaborationsSection />
      <OpportunitiesSection />
      <EnterprisesSection />
      <LanguagesSection />
      <ProfessionalsSection />
      <InstitutionsSection />
      <EventsSection />
      <StoriesSection />
      <NewsSection />
      <ObservatorySection />
      <FinalCta />
    </>
  );
}
