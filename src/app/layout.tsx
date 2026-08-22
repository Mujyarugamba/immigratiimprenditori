import type { Metadata } from "next";
import { headers } from "next/headers";
import { centroStudiConfig } from "@immigrati/product-config";
import { PrivacyFriendlyAnalytics } from "@/components/analytics/PrivacyFriendlyAnalytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { DEFAULT_LOCALE, getPlatformLanguage, isPlatformLocale } from "@/lib/i18n/config";
import { enabledInstitutionalSocialChannels } from "@/lib/social/channels";
import "./globals.css";
import "./responsive-overrides.css";
import "./editorial-identity.css";
import "./accessibility.css";

const SITE_URL = "https://immigratiimprenditori.it";
const SITE_DESCRIPTION = centroStudiConfig.description;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Immigrati Imprenditori",
  title: {
    default: centroStudiConfig.name,
    template: `%s | Centro Studi`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Immigrati Imprenditori" }],
  creator: "Immigrati Imprenditori",
  publisher: "AIPEL",
  category: "Ricerca e analisi sull'imprenditoria migrante",
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: "Immigrati Imprenditori",
    title: centroStudiConfig.name,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/logo-immigrati-imprenditori.png",
        alt: "Immigrati Imprenditori",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: centroStudiConfig.name,
    description: SITE_DESCRIPTION,
    images: ["/logo-immigrati-imprenditori.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

function structuredData(locale: string) {
  const searchPath = locale === DEFAULT_LOCALE ? "/cerca" : `/${locale}/cerca`;
  const verifiedSocialUrls = enabledInstitutionalSocialChannels().map(
    (channel) => channel.plannedUrl,
  );
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Immigrati Imprenditori",
        url: SITE_URL,
        logo: `${SITE_URL}/logo-immigrati-imprenditori.png`,
        parentOrganization: {
          "@type": "Organization",
          name: "AIPEL",
        },
        email: "info@immigratiimprenditori.it",
        sameAs: verifiedSocialUrls.length ? verifiedSocialUrls : undefined,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Immigrati Imprenditori",
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: locale,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}${searchPath}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const rawLocale = requestHeaders.get("x-platform-locale") ?? DEFAULT_LOCALE;
  const locale = isPlatformLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const language = getPlatformLanguage(locale);
  const schema = structuredData(locale);

  return (
    <html lang={locale} dir={language.direction}>
      <body className="bg-surface text-ink min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <SkipLink />
        <Header />
        <div id="contenuto-principale" tabIndex={-1}>
          {children}
        </div>
        <Footer />
        <PrivacyFriendlyAnalytics />
      </body>
    </html>
  );
}
