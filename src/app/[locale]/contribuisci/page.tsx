import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { submitEditorialContributionAction } from "@/lib/editorial/submission-actions";
import { isPlatformLocale } from "@/lib/i18n/config";
import { CORE_MESSAGES } from "@/lib/i18n/pages";
import { languageAlternates } from "@/lib/i18n/seo";

const labels = {
  en: { type: "Type of proposal", story: "Entrepreneurial story", research: "Research contribution", publication: "Publication", event: "Event", interview: "Interview", other: "Other material", title: "Title or subject", proposal: "Proposal", name: "Full name", email: "Email", organization: "Organization / company", link: "Source, video or reference link", contact: "I acknowledge that the contact details I provide will be processed by the editorial team to receive, assess and, if necessary, follow up on this proposal. I have read the", privacy: "Privacy Policy", publicationConsent: "I authorize possible publication of the submitted material, subject to editorial review. Optional.", send: "Send to the editorial team", success: "Thank you. Your proposal has been delivered to the private editorial inbox and will be reviewed before any publication.", fieldsError: "Please check the required fields and the privacy notice acknowledgement.", sendError: "The proposal could not be delivered. Please try again or contact the editorial team." },
  fr: { type: "Type de proposition", story: "Histoire d'entreprise", research: "Contribution de recherche", publication: "Publication", event: "Événement", interview: "Entretien", other: "Autre matériel", title: "Titre ou objet", proposal: "Proposition", name: "Nom et prénom", email: "E-mail", organization: "Organisation / entreprise", link: "Lien source, vidéo ou référence", contact: "Je prends acte que les coordonnées que je fournis seront traitées par la rédaction pour recevoir, évaluer et, si nécessaire, approfondir cette proposition. J'ai lu la", privacy: "Politique de confidentialité", publicationConsent: "J'autorise une éventuelle publication du matériel envoyé, sous réserve de la révision éditoriale. Facultatif.", send: "Envoyer à la rédaction", success: "Merci. Votre proposition a été transmise à l'Inbox éditoriale privée et sera examinée avant toute publication.", fieldsError: "Vérifiez les champs obligatoires et la prise d'acte de l'information relative à la vie privée.", sendError: "La proposition n'a pas pu être transmise. Réessayez ou contactez la rédaction." },
  es: { type: "Tipo de propuesta", story: "Historia empresarial", research: "Contribución de investigación", publication: "Publicación", event: "Evento", interview: "Entrevista", other: "Otro material", title: "Título o asunto", proposal: "Propuesta", name: "Nombre y apellidos", email: "Correo electrónico", organization: "Organización / empresa", link: "Enlace de fuente, vídeo o referencia", contact: "Declaro conocer que los datos de contacto que facilite serán tratados por la redacción para recibir, evaluar y, si es necesario, profundizar esta propuesta. He leído la", privacy: "Política de privacidad", publicationConsent: "Autorizo la posible publicación del material enviado, sujeta a revisión editorial. Opcional.", send: "Enviar a la redacción", success: "Gracias. Tu propuesta ha sido enviada a la bandeja editorial privada y será revisada antes de cualquier publicación.", fieldsError: "Revisa los campos obligatorios y la confirmación de lectura de la información de privacidad.", sendError: "No se ha podido enviar la propuesta. Inténtalo de nuevo o contacta con la redacción." },
  de: { type: "Art des Vorschlags", story: "Unternehmensgeschichte", research: "Forschungsbeitrag", publication: "Publikation", event: "Veranstaltung", interview: "Interview", other: "Anderes Material", title: "Titel oder Betreff", proposal: "Vorschlag", name: "Vor- und Nachname", email: "E-Mail", organization: "Organisation / Unternehmen", link: "Quellen-, Video- oder Referenzlink", contact: "Ich nehme zur Kenntnis, dass meine angegebenen Kontaktdaten von der Redaktion verarbeitet werden, um diesen Vorschlag entgegenzunehmen, zu prüfen und bei Bedarf zu vertiefen. Ich habe die", privacy: "Datenschutzerklärung", publicationConsent: "Ich ermächtige eine mögliche Veröffentlichung des eingesandten Materials nach redaktioneller Prüfung. Optional.", send: "An die Redaktion senden", success: "Vielen Dank. Ihr Vorschlag wurde an die private redaktionelle Inbox übermittelt und wird vor einer Veröffentlichung geprüft.", fieldsError: "Bitte prüfen Sie die Pflichtfelder und die Kenntnisnahme der Datenschutzhinweise.", sendError: "Der Vorschlag konnte nicht übermittelt werden. Bitte versuchen Sie es erneut oder kontaktieren Sie die Redaktion." },
  ar: { type: "نوع المقترح", story: "قصة مشروع أو شركة", research: "مساهمة بحثية", publication: "منشور", event: "فعالية", interview: "مقابلة", other: "مواد أخرى", title: "العنوان أو الموضوع", proposal: "المقترح", name: "الاسم الكامل", email: "البريد الإلكتروني", organization: "المؤسسة / الشركة", link: "رابط المصدر أو الفيديو أو المرجع", contact: "أقر بأن بيانات الاتصال التي أقدمها ستعالجها هيئة التحرير لاستلام هذا المقترح وتقييمه، وعند الضرورة، متابعته لمزيد من التحقق. وقد اطلعت على", privacy: "سياسة الخصوصية", publicationConsent: "أوافق على إمكانية نشر المواد المرسلة بعد المراجعة التحريرية. اختياري.", send: "إرسال إلى هيئة التحرير", success: "شكراً لك. أُرسل مقترحك إلى صندوق التحرير الخاص وسيُراجع قبل أي نشر.", fieldsError: "يرجى التحقق من الحقول المطلوبة والإقرار بالاطلاع على معلومات الخصوصية.", sendError: "تعذر إرسال المقترح. يرجى المحاولة مرة أخرى أو التواصل مع هيئة التحرير." },
  zh: { type: "投稿类型", story: "创业故事", research: "研究贡献", publication: "出版物", event: "活动", interview: "访谈", other: "其他材料", title: "标题或主题", proposal: "投稿内容", name: "姓名", email: "电子邮件", organization: "机构 / 企业", link: "来源、视频或参考链接", contact: "我知悉，我提供的联系方式将由编辑团队用于接收、评估本投稿，并在必要时就核实或进一步了解投稿内容与我联系。我已阅读", privacy: "隐私政策", publicationConsent: "我同意在编辑审核后可能发布所提交的材料。此项为可选。", send: "提交给编辑团队", success: "谢谢。您的投稿已送达非公开编辑收件箱，并将在任何发布之前接受审核。", fieldsError: "请检查必填字段并确认已阅读隐私信息。", sendError: "投稿未能送达。请重试或联系编辑团队。" },
} as const;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ inviato?: string; errore?: string }>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const m = CORE_MESSAGES[locale];
  return { title: m.participateTitle, description: m.participateIntro, alternates: { canonical: `/${locale}/contribuisci`, languages: languageAlternates("/contribuisci") } };
}

export default async function LocalizedParticipatePage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const query = await searchParams;
  const m = CORE_MESSAGES[locale];
  const l = labels[locale];
  const sent = query.inviato === "1";
  const errorMessage = query.errore === "campi" ? l.fieldsError : query.errore === "invio" ? l.sendError : null;

  return (
    <main id="contenuto" className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-4xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Immigrati Imprenditori · Editorial participation</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{m.participateTitle}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{m.participateIntro}</p>
      </header>

      <section className="mt-8 grid gap-px border border-black bg-black md:grid-cols-3">
        <article className="bg-white p-6"><h2 className="text-lg font-semibold">{m.entrepreneur}</h2><p className="mt-3 text-sm leading-6 text-neutral-700">{m.entrepreneurText}</p></article>
        <article className="bg-white p-6"><h2 className="text-lg font-semibold">{m.researcher}</h2><p className="mt-3 text-sm leading-6 text-neutral-700">{m.researcherText}</p></article>
        <article className="bg-white p-6"><h2 className="text-lg font-semibold">{m.institution}</h2><p className="mt-3 text-sm leading-6 text-neutral-700">{m.institutionText}</p></article>
      </section>

      {sent ? (
        <div className="mt-8 border border-black p-6 text-sm leading-6" role="status">{l.success}</div>
      ) : (
        <form action={submitEditorialContributionAction} className="mt-10 space-y-7">
          <input type="hidden" name="return_path" value={`/${locale}/contribuisci`} />
          <div className="sr-only" aria-hidden="true"><label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>

          {errorMessage ? <div className="border border-black p-4 text-sm leading-6" role="alert">{errorMessage}</div> : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold">{l.type}<select name="submission_kind" required className="border border-neutral-400 bg-white px-3 py-2.5 font-normal"><option value="story">{l.story}</option><option value="research">{l.research}</option><option value="publication">{l.publication}</option><option value="event">{l.event}</option><option value="interview">{l.interview}</option><option value="other">{l.other}</option></select></label>
            <label className="flex flex-col gap-2 text-sm font-semibold">{l.title}<input name="title" maxLength={300} className="border border-neutral-400 px-3 py-2.5 font-normal" /></label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold">{l.proposal}<textarea name="contribution_text" required maxLength={20000} rows={9} className="border border-neutral-400 px-3 py-2.5 font-normal leading-6" /></label>
          <label className="flex flex-col gap-2 text-sm font-semibold">{l.link}<input name="original_url" type="url" maxLength={2048} className="border border-neutral-400 px-3 py-2.5 font-normal" /></label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold">{l.name}<input name="submitter_name" required maxLength={200} autoComplete="name" className="border border-neutral-400 px-3 py-2.5 font-normal" /></label>
            <label className="flex flex-col gap-2 text-sm font-semibold">{l.email}<input name="submitter_email" required type="email" maxLength={320} autoComplete="email" className="border border-neutral-400 px-3 py-2.5 font-normal" /></label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-semibold">{l.organization}<input name="organization_name" maxLength={300} autoComplete="organization" className="border border-neutral-400 px-3 py-2.5 font-normal" /></label>

          <div className="space-y-4 border-t border-black pt-6 text-sm leading-6 text-neutral-700">
            <label className="flex items-start gap-3">
              <input name="consent_contact" type="checkbox" required className="mt-1 size-4" />
              <span>{l.contact} {" "}<Link href="/privacy" className="font-semibold text-black underline underline-offset-4">{l.privacy}</Link>.</span>
            </label>
            <label className="flex items-start gap-3"><input name="consent_publication" type="checkbox" className="mt-1 size-4" /><span>{l.publicationConsent}</span></label>
          </div>

          <button type="submit" className="border border-black bg-black px-6 py-3 text-sm font-semibold text-white">{l.send}</button>
          <p className="text-xs text-neutral-500">redazione@immigratiimprenditori.it</p>
        </form>
      )}
    </main>
  );
}
