"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { htmlLang, localeNames, type Locale } from "@/i18n/routing";
import { localePath } from "@/lib/seo/metadata";

const KEY = "dw-lang-suggest-dismissed";

/** Dismissible suggestion based on the browser language. Never redirects automatically. */
export function LanguageSuggestion() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("langSuggest");
  const [suggest, setSuggest] = useState<Locale | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY) === "1" || document.cookie.includes("NEXT_LOCALE=")) return;
    } catch {
      return;
    }
    const pref = (navigator.languages ?? [navigator.language]).map((l) => l.slice(0, 2));
    const match = pref.find((l): l is Locale => l === "te" || l === "hi");
    if (match && match !== locale) setSuggest(match);
  }, [locale]);

  if (!suggest) return null;
  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setSuggest(null);
  };
  return (
    <div className="border-b border-sage-200 bg-sage-50" role="region" aria-label={localeNames[suggest]}>
      <div className="container-page flex flex-wrap items-center gap-3 py-2 text-sm">
        <p lang={htmlLang[suggest]}>{t("text", { language: localeNames[suggest] })}</p>
        <a href={localePath(suggest, pathname)} hrefLang={htmlLang[suggest]} className="font-semibold text-brand-700 underline" onClick={dismiss}>
          {t("switch")}
        </a>
        <button type="button" onClick={dismiss} className="text-sage-600 underline">
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
