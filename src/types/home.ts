export type DemoMeta = {
  id: string;
  isDemo: true;
};

export type QuickAccessItem = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export type CollaborationRequest = DemoMeta & {
  type: string;
  title: string;
  sector: string;
  territory: string;
  languages?: string[];
  description: string;
  publishedAt: string;
  href: string;
};

export type OpportunityItem = DemoMeta & {
  type: string;
  title: string;
  territory: string;
  description: string;
  publishedAt: string;
  href: string;
};

export type EnterpriseItem = DemoMeta & {
  name: string;
  sector: string;
  territory: string;
  languages: string[];
  description: string;
  offers: string;
  seeks: string;
  href: string;
};

export type LanguageAccessItem = {
  id: string;
  label: string;
  href: string;
};

export type CategoryItem = {
  id: string;
  label: string;
  href: string;
};

export type EventItem = DemoMeta & {
  type: string;
  title: string;
  territory: string;
  dateLabel: string;
  description: string;
  href: string;
};

export type StoryItem = DemoMeta & {
  title: string;
  sector: string;
  introduction: string;
  href: string;
};

export type NewsItem = DemoMeta & {
  type: "Notizie" | "Normative" | "Guide pratiche" | "Approfondimenti";
  title: string;
  description: string;
  publishedAt: string;
  href: string;
};

export type ObservatoryItem = {
  id: string;
  label: string;
  status: string;
  description: string;
};
