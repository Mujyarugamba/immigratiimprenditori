import Link from "next/link";
import { getPlatformLanguage, type PlatformLocale } from "@/lib/i18n/config";
import { aiTranslationMessages, sourceLanguageCodeFromId } from "@/lib/i18n/ai-translation/messages";

type EditorialTranslationNoticeProps = {
  locale: PlatformLocale;
  sourceLanguageId: number;
  displayLanguageCode: string;
  isAiTranslation: boolean;
  isViewingOriginal: boolean;
  originalHref: string;
  translationHref: string;
  compact?: boolean;
};

export function EditorialTranslationNotice({
  locale,
  sourceLanguageId,
  displayLanguageCode,
  isAiTranslation,
  isViewingOriginal,
  originalHref,
  translationHref,
  compact = false,
}: EditorialTranslationNoticeProps) {
  const sourceCode = sourceLanguageCodeFromId(sourceLanguageId);
  const messages = aiTranslationMessages(locale, sourceCode);
  const uiDirection = getPlatformLanguage(locale).direction;

  if (isViewingOriginal) {
    return (
      <aside
        className="mt-4 max-w-full break-words border border-black bg-neutral-50 p-4 text-sm leading-6 text-neutral-700"
        lang={locale}
        dir={uiDirection}
        data-content-version="original"
      >
        <p className="font-semibold text-black">{messages.originalVersion}</p>
        <Link href={translationHref} className="mt-3 inline-block font-semibold underline underline-offset-4">
          {messages.backToTranslation}
        </Link>
      </aside>
    );
  }

  if (isAiTranslation) {
    return (
      <aside
        className={
          compact
            ? "mt-3 max-w-full break-words text-xs leading-5 text-neutral-600"
            : "mt-4 max-w-full break-words border border-black bg-neutral-50 p-4 text-sm leading-6 text-neutral-700"
        }
        data-ai-translation="true"
        data-content-version="ai"
        data-display-language={displayLanguageCode}
        lang={locale}
        dir={uiDirection}
      >
        <p className="font-semibold text-black">{messages.aiTitle}</p>
        {compact ? null : <p className="mt-2">{messages.aiBody}</p>}
        <Link href={originalHref} className="mt-2 inline-block font-semibold underline underline-offset-4">
          {messages.viewOriginal}
        </Link>
      </aside>
    );
  }

  return (
    <p className="mt-3 max-w-full break-words text-sm leading-6 text-neutral-600" data-content-version="original-fallback">
      {messages.originalFallback}
    </p>
  );
}
