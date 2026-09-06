import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditorialTranslationNotice } from "@/components/i18n/EditorialTranslationNotice";
import { PublicEmpty } from "@/components/public/PublicEmpty";
import { PublicResultCard } from "@/components/public/PublicResultCard";
import { VOICE_CONTENT_TYPES } from "@/lib/data/public/collections";
import { listCultureContents, listUpcomingCulturalEvents } from "@/lib/data/public/culture";
import { presentLocalizedContentCards } from "@/lib/i18n/ai-translation/runtime";
import { contentTypeLabel, deliveryModeLabel } from "@/lib/i18n/archive-labels";
import { isPlatformLocale } from "@/lib/i18n/config";
import { localizedCtaArrow } from "@/lib/i18n/content-direction";
import { CULTURE_COPY } from "@/lib/i18n/culture-visual";
import { NAV_MESSAGES } from "@/lib/i18n/messages";
import { CREATIVE_FIELDS, eventTranslation } from "@/lib/i18n/public-entity-translations";
import { languageAlternates } from "@/lib/i18n/seo";
import { pageSocialMetadata } from "@/lib/seo/social-metadata";

type Props={params:Promise<{locale:string}>};

function isVoice(typeCode:string){return (VOICE_CONTENT_TYPES as readonly string[]).includes(typeCode);}

export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale}=await params;
 if(!isPlatformLocale(locale)||locale==="it")return {robots:{index:false,follow:false}};
 const m=CULTURE_COPY[locale];
 return {title:NAV_MESSAGES[locale].culture,description:m.description,alternates:{canonical:`/${locale}/cultura`,languages:languageAlternates("/cultura")},...pageSocialMetadata({title:NAV_MESSAGES[locale].culture,description:m.description,pathname:`/${locale}/cultura`})};
}

export default async function LocalizedCulturePage({params}:Props){
 const {locale}=await params;if(!isPlatformLocale(locale)||locale==="it")notFound();
 const m=CULTURE_COPY[locale];const nav=NAV_MESSAGES[locale];const arrow=localizedCtaArrow(locale);
 const [events,contents]=await Promise.all([listUpcomingCulturalEvents(6).catch(()=>[]),listCultureContents(18).catch(()=>[])]);
 const presented=await presentLocalizedContentCards(contents,locale);
 const stories=presented.filter((item)=>isVoice(item.type_code)).slice(0,6);
 const analysis=presented.filter((item)=>!isVoice(item.type_code)).slice(0,6);
 return <main id="contenuto" className="preview-culture-page">
   <section className="preview-culture-hero">
     <div className="preview-culture-motion" aria-hidden="true"><span>{m.motion}</span><span>{m.motion}</span></div>
     <div className="preview-culture-hero-inner"><p className="culture-kicker">{m.eyebrow}</p><h1>{nav.culture}</h1><p className="culture-intro">{m.intro}</p><nav aria-label={nav.culture} className="preview-culture-nav"><a href="#stories">{m.stories}</a><a href="#events">{m.events}</a><a href="#creative">{m.industries}</a><a href="#analysis">{m.analysis}</a></nav></div>
   </section>
   <section className="preview-culture-pillars">
     <article><h2>{m.stories}</h2><p>{m.storiesText}</p></article><article><h2>{m.industries}</h2><p>{m.industriesText}</p></article><article><h2>{m.events}</h2><p>{m.eventsText}</p></article>
   </section>

   <section id="stories" className="preview-culture-section"><div className="preview-culture-section-inner"><div className="preview-culture-section-head"><div><p className="eyebrow">{m.people}</p><h2>{m.stories}</h2></div><p>{m.storiesText}</p></div>{stories.length===0?<PublicEmpty title={m.emptyStories}/>:<div className="preview-culture-grid">{stories.map((item)=><PublicResultCard key={item.id} href={`/${locale}/contenuti/${item.slug}`} title={item.title} description={item.abstract} badges={[contentTypeLabel(locale,item.type_code)]} ctaLabel={m.stories} ctaArrow={arrow} notice={item.isAiTranslation?<EditorialTranslationNotice locale={locale} sourceLanguageId={item.language_id} displayLanguageCode={item.displayLanguageCode} isAiTranslation isViewingOriginal={false} originalHref={`/${locale}/contenuti/${item.slug}?original=1`} translationHref={`/${locale}/contenuti/${item.slug}`} compact/>:null}/>)}</div>}</div></section>

   <section id="events" className="preview-culture-section alt"><div className="preview-culture-section-inner"><div className="preview-culture-section-head"><div><p className="eyebrow">{m.agenda}</p><h2>{m.events}</h2></div><div><p>{m.eventsText}</p><Link href={`/${locale}/eventi`}>{m.allEvents} {arrow}</Link></div></div>{events.length===0?<PublicEmpty title={m.emptyEvents}/>:<div className="preview-culture-grid">{events.map((event)=>{const t=eventTranslation(locale,event.id);return <PublicResultCard key={event.id} href={`/${locale}/eventi/${event.id}`} title={t?.title??event.title} description={t?.summary??event.summary} badges={[deliveryModeLabel(locale,event.delivery_mode)]} meta={event.next_edition?[new Date(event.next_edition.starts_at).toLocaleString(locale),event.next_edition.city_text??undefined].filter(Boolean) as string[]:undefined} ctaLabel={nav.events} ctaArrow={arrow}/>;})}</div>}</div></section>

   <section id="creative" className="preview-culture-section"><div className="preview-culture-section-inner preview-creative-layout"><div className="preview-creative-copy"><p className="eyebrow">{m.economy}</p><h2>{m.industries}</h2><p>{m.industriesText}</p></div><div className="preview-creative-grid">{CREATIVE_FIELDS[locale].map((field)=><div key={field}>{field}</div>)}</div></div></section>

   <section id="analysis" className="preview-culture-section alt"><div className="preview-culture-section-inner"><div className="preview-culture-section-head"><div><p className="eyebrow">{m.research}</p><h2>{m.analysis}</h2></div><div><p>{m.analysisText}</p><Link href={`/${locale}/contenuti`}>{m.allAnalysis} {arrow}</Link></div></div>{analysis.length===0?<PublicEmpty title={m.emptyAnalysis}/>:<div className="preview-culture-grid">{analysis.map((item)=><PublicResultCard key={item.id} href={`/${locale}/contenuti/${item.slug}`} title={item.title} description={item.abstract} badges={[contentTypeLabel(locale,item.type_code)]} ctaLabel={nav.analysis} ctaArrow={arrow} notice={item.isAiTranslation?<EditorialTranslationNotice locale={locale} sourceLanguageId={item.language_id} displayLanguageCode={item.displayLanguageCode} isAiTranslation isViewingOriginal={false} originalHref={`/${locale}/contenuti/${item.slug}?original=1`} translationHref={`/${locale}/contenuti/${item.slug}`} compact/>:null}/>)}</div>}</div></section>

   <section className="preview-culture-section"><div className="preview-culture-section-inner"><div className="preview-culture-contribute"><h2>{m.contribute}</h2><p>{m.contributeText}</p><Link href={`/${locale}/contribuisci`}>{m.contributeCta} {arrow}</Link></div></div></section>
 </main>;
}
